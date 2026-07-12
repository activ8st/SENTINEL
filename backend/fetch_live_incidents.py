"""
Fetch public Italian alert/news feeds and save relevant items as Sentinel incidents.

Run from the project root:
    python -m backend.fetch_live_incidents

Or from backend:
    python fetch_live_incidents.py
"""

from __future__ import annotations

import datetime as dt
import email.utils
import hashlib
import html
import json
import re
import sys
import time
import unicodedata
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from dataclasses import dataclass
from pathlib import Path


BACKEND_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BACKEND_DIR.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

# Keep SQLite paths stable even if the script is launched from backend.
import os

os.chdir(PROJECT_ROOT)

from backend.database import SessionLocal, engine  # noqa: E402
from backend.models import Base, Incident, Media  # noqa: E402


USER_AGENT = "SentinelLocalBot/1.0 (+local development; contact: localhost)"
MAX_ITEMS_PER_SOURCE = 15
GEOCODE_DELAY_SECONDS = 1.1
MAX_NEWS_AGE = dt.timedelta(days=30)


@dataclass(frozen=True)
class Source:
    name: str
    url: str
    trust: str = "institutional"
    default_type: str = "other"


SOURCES = [
    Source("ansa-cronaca", "https://www.ansa.it/sito/notizie/cronaca/cronaca_rss.xml", "news", "crime"),
    Source("ansa-ambiente", "https://www.ansa.it/canale_ambiente/notizie/ambiente_rss.xml", "news", "weather"),
    Source("protezione-civile", "https://www.protezionecivile.gov.it/it/rss.xml", "institutional", "weather"),
    Source("vigili-fuoco", "https://www.vigilfuoco.it/aspx/Rss.aspx", "institutional", "fire"),
    Source("carabinieri", "https://www.carabinieri.it/in-vostro-aiuto/informazioni/news/RSS", "institutional", "crime"),
    Source("polizia-stato", "https://www.poliziadistato.it/rss", "institutional", "crime"),
    Source(
        "google-news-carabinieri",
        "https://news.google.com/rss/search?q=(carabinieri%20OR%20polizia)%20arresto%20Italia%20when:30d&hl=it&gl=IT&ceid=IT:it",
        "news",
        "crime",
    ),
    Source(
        "google-news-meteo",
        "https://news.google.com/rss/search?q=allerta%20meteo%20Italia%20protezione%20civile%20when:30d&hl=it&gl=IT&ceid=IT:it",
        "news",
        "weather",
    ),
    Source(
        "google-news-vigili-fuoco",
        "https://news.google.com/rss/search?q=vigili%20del%20fuoco%20incendio%20Italia%20when:30d&hl=it&gl=IT&ceid=IT:it",
        "news",
        "fire",
    ),
    Source(
        "google-news-ministeri",
        "https://news.google.com/rss/search?q=ministero%20interno%20protezione%20civile%20sicurezza%20Italia%20when:30d&hl=it&gl=IT&ceid=IT:it",
        "news",
        "other",
    ),
    Source(
        "google-news-incidenti",
        "https://news.google.com/rss/search?q=incidente%20stradale%20feriti%20Italia%20when:30d&hl=it&gl=IT&ceid=IT:it",
        "news",
        "accident",
    ),
    Source(
        "google-news-incendi-boschivi",
        "https://news.google.com/rss/search?q=(incendio%20boschivo%20OR%20fiamme%20OR%20rogo)%20Italia%20vigili%20fuoco%20when:30d&hl=it&gl=IT&ceid=IT:it",
        "aggregated",
        "fire",
    ),
    Source(
        "google-news-copernicus-firms",
        "https://news.google.com/rss/search?q=(Copernicus%20OR%20NASA%20FIRMS%20OR%20EFFIS)%20incendi%20Italia%20when:30d&hl=it&gl=IT&ceid=IT:it",
        "aggregated",
        "fire",
    ),
    Source(
        "google-news-arpa-meteo",
        "https://news.google.com/rss/search?q=(ARPA%20OR%20MeteoAlarm%20OR%20Protezione%20Civile)%20allerta%20meteo%20Italia%20when:30d&hl=it&gl=IT&ceid=IT:it",
        "aggregated",
        "weather",
    ),
    Source(
        "google-news-traffico",
        "https://news.google.com/rss/search?q=(ANAS%20OR%20Autostrade%20OR%20CCISS%20OR%20Viaggiare%20Informati)%20traffico%20incidente%20Italia%20when:30d&hl=it&gl=IT&ceid=IT:it",
        "aggregated",
        "traffic",
    ),
    Source(
        "google-news-rapine-aggressioni",
        "https://news.google.com/rss/search?q=(rapina%20OR%20aggressione%20OR%20rissa%20OR%20accoltellamento%20OR%20sparatoria)%20Italia%20when:30d&hl=it&gl=IT&ceid=IT:it",
        "news",
        "crime",
    ),
    Source(
        "google-news-questure-prefetture",
        "https://news.google.com/rss/search?q=(questura%20OR%20prefettura%20OR%20guardia%20di%20finanza%20OR%20polizia%20locale)%20comunicato%20Italia%20when:30d&hl=it&gl=IT&ceid=IT:it",
        "institutional",
        "crime",
    ),
    Source(
        "google-news-medical",
        "https://news.google.com/rss/search?q=(118%20OR%20Croce%20Rossa%20OR%20ASL%20OR%20Ministero%20Salute)%20emergenza%20Italia%20when:30d&hl=it&gl=IT&ceid=IT:it",
        "aggregated",
        "medical",
    ),
    Source(
        "google-news-disastri",
        "https://news.google.com/rss/search?q=(INGV%20OR%20terremoto%20OR%20frana%20OR%20alluvione%20OR%20GDACS%20OR%20EMSC)%20Italia%20when:30d&hl=it&gl=IT&ceid=IT:it",
        "aggregated",
        "weather",
    ),
    Source(
        "google-news-social-public",
        "https://news.google.com/rss/search?q=(Telegram%20OR%20Facebook%20OR%20Instagram%20OR%20X)%20segnalazione%20incendio%20incidente%20Italia%20when:30d&hl=it&gl=IT&ceid=IT:it",
        "social-public",
        "suspicious",
    ),
]

SOURCES.extend([
    Source(
        "google-news-effis-copernicus-nasa",
        "https://news.google.com/rss/search?q=(EFFIS%20OR%20Copernicus%20Emergency%20OR%20NASA%20FIRMS%20OR%20Sentinel%20Hub%20OR%20NOAA)%20Italia%20incendio%20when:30d&hl=it&gl=IT&ceid=IT:it",
        "aggregated",
        "fire",
    ),
    Source(
        "google-news-meteo-europa",
        "https://news.google.com/rss/search?q=(MeteoAlarm%20OR%20Copernicus%20Atmosphere%20OR%20ECMWF%20OR%20Open-Meteo%20OR%20Meteostat)%20Italia%20allerta%20when:30d&hl=it&gl=IT&ceid=IT:it",
        "aggregated",
        "weather",
    ),
    Source(
        "google-news-arpa-regioni",
        "https://news.google.com/rss/search?q=(ARPA%20Lombardia%20OR%20ARPA%20Veneto%20OR%20ARPA%20Piemonte%20OR%20ARPA%20Emilia%20OR%20ARPA%20Toscana%20OR%20ARPA%20Liguria%20OR%20ARPA%20Lazio)%20allerta%20Italia%20when:30d&hl=it&gl=IT&ceid=IT:it",
        "institutional",
        "weather",
    ),
    Source(
        "google-news-traffico-provider",
        "https://news.google.com/rss/search?q=(TomTom%20OR%20HERE%20Traffic%20OR%20Waze%20OR%20DATEX%20II%20OR%20INRIX%20OR%20Bing%20Maps)%20traffico%20Italia%20when:30d&hl=it&gl=IT&ceid=IT:it",
        "aggregated",
        "traffic",
    ),
    Source(
        "google-news-strade-ufficiali",
        "https://news.google.com/rss/search?q=(ANAS%20OR%20Autostrade%20per%20l'Italia%20OR%20CCISS%20OR%20Viaggiare%20Informati)%20incidente%20traffico%20when:30d&hl=it&gl=IT&ceid=IT:it",
        "institutional",
        "traffic",
    ),
    Source(
        "google-news-giornali-nazionali-crimini",
        "https://news.google.com/rss/search?q=(ANSA%20OR%20AGI%20OR%20Adnkronos%20OR%20Repubblica%20OR%20Corriere%20OR%20Sole%2024%20Ore%20OR%20SkyTG24%20OR%20TGCOM24)%20(rapina%20OR%20furto%20OR%20aggressione%20OR%20omicidio%20OR%20sparatoria)%20Italia%20when:30d&hl=it&gl=IT&ceid=IT:it",
        "news",
        "crime",
    ),
    Source(
        "google-news-giornali-locali-crimini",
        "https://news.google.com/rss/search?q=(Messaggero%20OR%20Mattino%20OR%20Resto%20del%20Carlino%20OR%20Gazzetta%20di%20Parma%20OR%20Tirreno%20OR%20Nazione%20OR%20Today)%20(rapina%20OR%20furto%20OR%20rissa%20OR%20accoltellamento)%20when:30d&hl=it&gl=IT&ceid=IT:it",
        "news",
        "crime",
    ),
    Source(
        "google-news-forze-ordine-comunicati",
        "https://news.google.com/rss/search?q=(Questura%20OR%20Prefettura%20OR%20Carabinieri%20OR%20Guardia%20di%20Finanza%20OR%20Polizia%20Locale%20OR%20Ministero%20Interno)%20(comunicato%20OR%20arresto%20OR%20denuncia)%20Italia%20when:30d&hl=it&gl=IT&ceid=IT:it",
        "institutional",
        "crime",
    ),
    Source(
        "google-news-salute-emergenze",
        "https://news.google.com/rss/search?q=(Croce%20Rossa%20OR%20118%20OR%20ASL%20OR%20ATS%20OR%20Ministero%20Salute%20OR%20WHO%20OR%20ECDC)%20(emergenza%20OR%20allerta%20OR%20ricoverati)%20Italia%20when:30d&hl=it&gl=IT&ceid=IT:it",
        "aggregated",
        "medical",
    ),
    Source(
        "google-news-disastri-internazionali",
        "https://news.google.com/rss/search?q=(USGS%20OR%20EMSC%20OR%20INGV%20OR%20GDACS%20OR%20FloodHub%20OR%20Copernicus)%20(terremoto%20OR%20alluvione%20OR%20frana)%20Italia%20when:30d&hl=it&gl=IT&ceid=IT:it",
        "aggregated",
        "weather",
    ),
    Source(
        "google-news-webcam-infrastrutture",
        "https://news.google.com/rss/search?q=(webcam%20OR%20ANAS%20OR%20Autostrade%20OR%20webcam%20meteo%20OR%20webcam%20sciistiche)%20(incendio%20OR%20neve%20OR%20traffico%20OR%20maltempo)%20Italia%20when:30d&hl=it&gl=IT&ceid=IT:it",
        "aggregated",
        "traffic",
    ),
])


CITY_COORDS = {
    "roma": (41.9028, 12.4964),
    "milano": (45.4642, 9.1900),
    "napoli": (40.8518, 14.2681),
    "torino": (45.0703, 7.6869),
    "palermo": (38.1157, 13.3615),
    "genova": (44.4056, 8.9463),
    "bologna": (44.4949, 11.3426),
    "firenze": (43.7696, 11.2558),
    "bari": (41.1171, 16.8719),
    "catania": (37.5079, 15.0830),
    "venezia": (45.4408, 12.3155),
    "verona": (45.4384, 10.9916),
    "messina": (38.1938, 15.5540),
    "padova": (45.4064, 11.8768),
    "trieste": (45.6495, 13.7768),
    "taranto": (40.4644, 17.2470),
    "brescia": (45.5416, 10.2118),
    "prato": (43.8777, 11.1022),
    "parma": (44.8015, 10.3279),
    "modena": (44.6471, 10.9252),
    "reggio calabria": (38.1113, 15.6473),
    "perugia": (43.1107, 12.3908),
    "livorno": (43.5485, 10.3106),
    "ravenna": (44.4184, 12.2035),
    "cagliari": (39.2238, 9.1217),
    "foggia": (41.4622, 15.5446),
    "rimini": (44.0678, 12.5695),
    "salerno": (40.6824, 14.7681),
    "ferrara": (44.8381, 11.6198),
    "sassari": (40.7259, 8.5557),
    "latina": (41.4676, 12.9037),
    "monza": (45.5845, 9.2744),
    "bergamo": (45.6983, 9.6773),
    "siracusa": (37.0755, 15.2866),
    "pescara": (42.4618, 14.2161),
    "trento": (46.0748, 11.1217),
    "bolzano": (46.4983, 11.3548),
    "matera": (40.6664, 16.6043),
    "ascoli piceno": (42.8536, 13.5749),
    "ancona": (43.6158, 13.5189),
    "l'aquila": (42.3498, 13.3995),
    "campobasso": (41.5603, 14.6627),
    "potenza": (40.6404, 15.8056),
    "catanzaro": (38.9098, 16.5877),
    "aosta": (45.7370, 7.3201),
    "udine": (46.0711, 13.2346),
    "como": (45.8081, 9.0852),
    "varese": (45.8206, 8.8251),
    "lecce": (40.3515, 18.1750),
    "brindisi": (40.6327, 17.9418),
    "caserta": (41.0723, 14.3311),
    "benevento": (41.1298, 14.7826),
    "avellino": (40.9146, 14.7896),
    "pisa": (43.7228, 10.4017),
    "lucca": (43.8430, 10.5079),
    "siena": (43.3188, 11.3308),
    "arezzo": (43.4633, 11.8796),
    "grosseto": (42.7635, 11.1124),
    "massa": (44.0354, 10.1393),
    "la spezia": (44.1025, 9.8241),
    "savona": (44.3091, 8.4772),
    "imperia": (43.8897, 8.0397),
    "novara": (45.4459, 8.6222),
    "alessandria": (44.9073, 8.6117),
    "cuneo": (44.3845, 7.5427),
    "asti": (44.9008, 8.2060),
    "vercelli": (45.3231, 8.4234),
    "treviso": (45.6669, 12.2430),
    "vicenza": (45.5455, 11.5354),
    "belluno": (46.1425, 12.2167),
    "rovigo": (45.0698, 11.7902),
    "pordenone": (45.9569, 12.6605),
    "gorizia": (45.9415, 13.6221),
    "piacenza": (45.0526, 9.6929),
    "reggio emilia": (44.6983, 10.6312),
    "forli": (44.2227, 12.0407),
    "cesena": (44.1391, 12.2431),
    "pesaro": (43.9125, 12.9155),
    "urbino": (43.7262, 12.6363),
    "macerata": (43.2984, 13.4537),
    "fermo": (43.1607, 13.7184),
    "teramo": (42.6589, 13.7044),
    "chieti": (42.3479, 14.1636),
    "isernia": (41.5960, 14.2330),
    "cosenza": (39.2983, 16.2537),
    "crotone": (39.0808, 17.1271),
    "vibo valentia": (38.6758, 16.0980),
    "ragusa": (36.9269, 14.7255),
    "agrigento": (37.3111, 13.5765),
    "trapani": (38.0176, 12.5365),
    "caltanissetta": (37.4901, 14.0629),
    "enna": (37.5676, 14.2799),
    "nuoro": (40.3202, 9.3264),
    "oristano": (39.9062, 8.5884),
    "carbonia": (39.1672, 8.5222),
    "pavia": (45.1847, 9.1582),
    "lodi": (45.3097, 9.5037),
    "cremona": (45.1332, 10.0227),
    "mantova": (45.1564, 10.7914),
    "sondrio": (46.1699, 9.8788),
    "biella": (45.5629, 8.0583),
    "verbania": (45.9214, 8.5518),
    "lecco": (45.8566, 9.3977),
    "pistoia": (43.9303, 10.9079),
    "terni": (42.5636, 12.6427),
    "viterbo": (42.4207, 12.1077),
    "rieti": (42.4045, 12.8567),
    "frosinone": (41.6396, 13.3426),
    "andria": (41.2312, 16.2979),
}

LOCATION_ALIASES = {
    "catanese": "catania",
    "palermitano": "palermo",
    "messinese": "messina",
    "siracusano": "siracusa",
    "ragusano": "ragusa",
    "agrigentino": "agrigento",
    "trapanese": "trapani",
    "nisseno": "caltanissetta",
    "ennese": "enna",
    "materano": "matera",
    "piceno": "ascoli piceno",
    "trentino": "trento",
    "alto adige": "bolzano",
    "altoatesino": "bolzano",
    "salernitano": "salerno",
    "milanese": "milano",
    "monzese": "monza",
    "brianzolo": "monza",
    "brianza": "monza",
    "bergamasco": "bergamo",
    "bresciano": "brescia",
    "comasco": "como",
    "varesotto": "varese",
    "pavese": "pavia",
    "lodigiano": "lodi",
    "cremonese": "cremona",
    "mantovano": "mantova",
    "sondriese": "sondrio",
    "casertano": "caserta",
    "beneventano": "benevento",
    "avellinese": "avellino",
    "barese": "bari",
    "leccese": "lecce",
    "brindisino": "brindisi",
    "foggiano": "foggia",
    "tarantino": "taranto",
    "cosentino": "cosenza",
    "crotonese": "crotone",
    "reggino": "reggio calabria",
    "vibonese": "vibo valentia",
    "anconetano": "ancona",
    "maceratese": "macerata",
    "fermano": "fermo",
    "pesarese": "pesaro",
    "urbinate": "urbino",
    "teramano": "teramo",
    "aquilano": "l'aquila",
    "chietino": "chieti",
    "pescarese": "pescara",
    "molisano": "campobasso",
    "lucano": "potenza",
    "valdostano": "aosta",
}

LOCATION_ALIASES.update({
    # Valle d'Aosta
    "valle d'aosta": "aosta",
    # Piemonte
    "torinese": "torino",
    "cuneese": "cuneo",
    "astigiano": "asti",
    "alessandrino": "alessandria",
    "novarese": "novara",
    "vercellese": "vercelli",
    "biellese": "biella",
    "verbano": "verbania",
    "ossola": "verbania",
    # Liguria
    "genovese": "genova",
    "savonese": "savona",
    "imperiese": "imperia",
    "spezzino": "la spezia",
    # Lombardia
    "nel milanese": "milano",
    "area milanese": "milano",
    "hinterland milanese": "milano",
    "alto milanese": "milano",
    "lecchese": "lecco",
    "valtellina": "sondrio",
    # Trentino-Alto Adige
    "trentino alto adige": "trento",
    "sudtirolo": "bolzano",
    "sudtirolese": "bolzano",
    # Veneto
    "veneziano": "venezia",
    "veronese": "verona",
    "vicentino": "vicenza",
    "trevigiano": "treviso",
    "padovano": "padova",
    "bellunese": "belluno",
    "rodigino": "rovigo",
    # Friuli-Venezia Giulia
    "friuli": "udine",
    "friulano": "udine",
    "triestino": "trieste",
    "pordenonese": "pordenone",
    "goriziano": "gorizia",
    # Emilia-Romagna
    "emilia": "bologna",
    "romagna": "ravenna",
    "bolognese": "bologna",
    "modenese": "modena",
    "parmense": "parma",
    "piacentino": "piacenza",
    "reggiano": "reggio emilia",
    "ferrarese": "ferrara",
    "ravennate": "ravenna",
    "forlivese": "forli",
    "cesenate": "cesena",
    "riminese": "rimini",
    # Toscana
    "toscana": "firenze",
    "fiorentino": "firenze",
    "pisano": "pisa",
    "lucchese": "lucca",
    "senese": "siena",
    "aretino": "arezzo",
    "grossetano": "grosseto",
    "livornese": "livorno",
    "pratese": "prato",
    "pistoiese": "pistoia",
    "massese": "massa",
    "carrara": "massa",
    # Marche
    "marchigiano": "ancona",
    "ascolano": "ascoli piceno",
    # Umbria
    "umbro": "perugia",
    "perugino": "perugia",
    "ternano": "terni",
    # Lazio
    "laziale": "roma",
    "romano": "roma",
    "viterbese": "viterbo",
    "reatino": "rieti",
    "frusinate": "frosinone",
    "ciociaria": "frosinone",
    "pontino": "latina",
    # Abruzzo / Molise
    "abruzzese": "l'aquila",
    "teatino": "chieti",
    "molisano": "campobasso",
    "isernino": "isernia",
    # Campania
    "campano": "napoli",
    "napoletano": "napoli",
    "irpinia": "avellino",
    "sannio": "benevento",
    # Puglia
    "pugliese": "bari",
    "bat": "andria",
    "barletta": "andria",
    "andriese": "andria",
    # Basilicata
    "basilicata": "potenza",
    "potentino": "potenza",
    # Calabria
    "calabrese": "catanzaro",
    "catanzarese": "catanzaro",
    # Sicilia
    "siciliano": "palermo",
    # Sardegna
    "sardo": "cagliari",
    "cagliaritano": "cagliari",
    "sassarese": "sassari",
    "nuorese": "nuoro",
    "oristanese": "oristano",
    "sulcis": "carbonia",
})

PUBLISHER_CITY_ALIASES = {
    "romatoday": "roma",
    "milanotoday": "milano",
    "napolitoday": "napoli",
    "torinotoday": "torino",
    "palermotoday": "palermo",
    "genovatoday": "genova",
    "bolognatoday": "bologna",
    "firenzetoday": "firenze",
    "baritoday": "bari",
    "cataniatoday": "catania",
    "veneziatoday": "venezia",
    "veronasera": "verona",
    "bresciatoday": "brescia",
    "monzatoday": "monza",
    "latinatoday": "latina",
    "il messaggero": "roma",
    "roma corriere": "roma",
    "corriere della sera": "milano",
    "il giorno": "milano",
    "la stampa": "torino",
    "il mattino": "napoli",
    "la nazione": "firenze",
    "il resto del carlino": "bologna",
    "corriere adriatico": "ancona",
    "gazzetta del sud": "messina",
    "la sicilia": "catania",
    "l'unione sarda": "cagliari",
    "alto adige": "bolzano",
    "trentino": "trento",
    "il piccolo": "trieste",
    "messaggero veneto": "udine",
    "arena": "verona",
    "gazzetta di parma": "parma",
    "gazzetta di modena": "modena",
    "il tirreno": "livorno",
    "la provincia pavese": "pavia",
}

SOURCE_FALLBACK_CITY = {
    "ansa-cronaca": "roma",
    "ansa-ambiente": "roma",
    "protezione-civile": "roma",
    "vigili-fuoco": "roma",
    "carabinieri": "roma",
    "polizia-stato": "roma",
    "google-news-carabinieri": "roma",
    "google-news-meteo": "roma",
    "google-news-vigili-fuoco": "roma",
    "google-news-ministeri": "roma",
    "google-news-incidenti": "roma",
}

for source in SOURCES:
    SOURCE_FALLBACK_CITY.setdefault(source.name, "roma")

TYPE_KEYWORDS = [
    ("fire", ["incendio", "fiamme", "rogo", "esplosione", "vigili del fuoco", "incendio boschivo", "incendio doloso", "canadair", "fumo", "brucia"]),
    ("weather", ["allerta", "meteo", "temporale", "nubifragio", "alluvione", "frana", "neve", "vento", "mareggiata", "terremoto", "sisma", "scossa", "esondazione", "caldo estremo", "ondata di calore"]),
    ("accident", ["incidente", "scontro", "tamponamento", "feriti", "autostrada", "strada chiusa", "cavalcavia", "ribaltato", "investito", "pedone travolto"]),
    ("medical", ["malore", "sanitario", "ospedale", "118", "soccorso", "evacuato", "intossicazione", "ricoverato", "epidemia", "contagio", "croce rossa"]),
    ("traffic", ["traffico", "viabilita", "coda", "rallentamenti", "chiusura", "deviazioni", "anas", "autostrade", "cciss", "casello", "tangenziale"]),
    ("crime", ["arresto", "rapina", "furto", "tentato furto", "aggressione", "pestaggio", "rissa", "omicidio", "tentato omicidio", "accoltellamento", "sparatoria", "sequestro", "violenza domestica", "truffa", "vandalismo", "carabinieri", "polizia", "guardia di finanza"]),
    ("suspicious", ["scomparso", "ricercato", "segnalazione", "sospetto", "intrusione", "allarme", "ladri in azione", "movimenti sospetti"]),
]

SEVERITY_KEYWORDS = [
    ("critical", ["morto", "morti", "vittima", "vittime", "evacuazione", "disperso", "dispersi", "crollo", "emergenza", "omicidio", "sparatoria", "allerta rossa"]),
    ("high", ["ferito grave", "feriti gravi", "esplosione", "incendio", "arrestato", "evacuati", "accoltellamento", "rapina", "frana", "alluvione"]),
    ("medium", ["allerta arancione", "feriti", "chiusa", "chiuso", "maltempo", "incidente", "rallentamenti", "truffa", "furto"]),
]


def normalize(text: str) -> str:
    text = unicodedata.normalize("NFKD", text or "")
    text = "".join(c for c in text if not unicodedata.combining(c))
    return text.lower()


def clean_text(text: str, limit: int | None = None) -> str:
    text = html.unescape(text or "")
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    if limit and len(text) > limit:
        return text[: limit - 1].rstrip() + "..."
    return text


def utc_now() -> dt.datetime:
    return dt.datetime.now(dt.UTC).replace(tzinfo=None)


def parse_published_at(value: str) -> dt.datetime | None:
    if not value:
        return None
    try:
        parsed = email.utils.parsedate_to_datetime(value)
        if parsed.tzinfo:
            parsed = parsed.astimezone(dt.UTC).replace(tzinfo=None)
        return parsed
    except (TypeError, ValueError):
        return None


def is_recent_enough(published_at: dt.datetime | None) -> bool:
    if published_at is None:
        return True
    return published_at >= utc_now() - MAX_NEWS_AGE


def fetch_url(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=20) as response:
        return response.read()


def parse_rss(payload: bytes) -> list[dict[str, str]]:
    text = payload.decode("utf-8", errors="replace")
    text = re.sub(r"&(?!amp;|lt;|gt;|quot;|apos;|#[0-9]+;|#x[0-9a-fA-F]+;)", "&amp;", text)
    root = ET.fromstring(text.encode("utf-8"))
    items = []
    for item in root.findall(".//item"):
        title = clean_text(item.findtext("title"))
        link = clean_text(item.findtext("link"))
        description = clean_text(item.findtext("description"), 450)
        published = clean_text(item.findtext("pubDate") or item.findtext("date"))
        guid = clean_text(item.findtext("guid") or link or title)
        if title and link:
            items.append(
                {
                    "title": title,
                    "link": link,
                    "description": description or title,
                    "published": published,
                    "guid": guid,
                }
            )
    return items


def parse_feed(payload: bytes) -> list[dict[str, str]]:
    try:
        return parse_rss(payload)
    except ET.ParseError:
        text = payload.decode("utf-8", errors="replace")
        items = []
        for block in re.findall(r"<item\b.*?</item>", text, flags=re.I | re.S):
            def tag(name: str) -> str:
                match = re.search(rf"<{name}\b[^>]*>(.*?)</{name}>", block, flags=re.I | re.S)
                return clean_text(match.group(1)) if match else ""

            title = tag("title")
            link = tag("link")
            description = clean_text(tag("description"), 450)
            guid = tag("guid") or link or title
            if title and link:
                items.append(
                    {
                        "title": title,
                        "link": link,
                        "description": description or title,
                        "published": tag("pubDate"),
                        "guid": guid,
                    }
                )
        return items


def classify_type(title: str, description: str, default_type: str) -> str:
    text = normalize(f"{title} {description}")
    for incident_type, keywords in TYPE_KEYWORDS:
        if any(keyword in text for keyword in keywords):
            return incident_type
    return default_type


def classify_severity(title: str, description: str) -> str:
    text = normalize(f"{title} {description}")
    for severity, keywords in SEVERITY_KEYWORDS:
        if any(keyword in text for keyword in keywords):
            return severity
    return "low"


def detect_city(title: str, description: str) -> str | None:
    text = normalize(f"{title} {description}")
    for city in sorted(CITY_COORDS, key=len, reverse=True):
        if re.search(rf"\b{re.escape(city)}\b", text):
            return city.title()
    for alias, city in sorted(LOCATION_ALIASES.items(), key=lambda item: len(item[0]), reverse=True):
        if re.search(rf"\b{re.escape(alias)}\b", text):
            return city.title()
    for publisher, city in sorted(PUBLISHER_CITY_ALIASES.items(), key=lambda item: len(item[0]), reverse=True):
        if re.search(rf"\b{re.escape(publisher)}\b", text):
            return city.title()
    return None


def geocode_place(place: str) -> tuple[float, float] | None:
    query = urllib.parse.urlencode({"q": f"{place}, Italia", "format": "json", "limit": "1"})
    url = f"https://nominatim.openstreetmap.org/search?{query}"
    try:
        data = json.loads(fetch_url(url).decode("utf-8"))
    except Exception:
        return None
    if not data:
        return None
    return float(data[0]["lat"]), float(data[0]["lon"])


def coordinates_for(title: str, description: str, source_name: str | None = None) -> tuple[float, float, str, str, bool]:
    city = detect_city(title, description)
    inferred = True
    if not city:
        city = SOURCE_FALLBACK_CITY.get(source_name or "", "roma").title()
        inferred = False

    if city:
        key = city.lower()
        if key in CITY_COORDS:
            lat, lon = CITY_COORDS[key]
            address = city if inferred else f"{city} - sede istituzionale di riferimento"
            return lat, lon, city, address, inferred
        coords = geocode_place(city)
        time.sleep(GEOCODE_DELAY_SECONDS)
        if coords:
            address = city if inferred else f"{city} - sede istituzionale di riferimento"
            return coords[0], coords[1], city, address, inferred

    lat, lon = CITY_COORDS["roma"]
    return lat, lon, "Roma", "Roma - sede istituzionale di riferimento", False


def verification_label(source: Source, position_from_text: bool) -> str:
    if source.trust == "institutional":
        base = "fonte ufficiale/istituzionale"
    elif source.trust == "news":
        base = "fonte giornalistica"
    elif source.trust == "social-public":
        base = "fonte social pubblica da verificare"
    else:
        base = "fonte aggregata"

    position = "posizione ricavata da titolo/descrizione" if position_from_text else "posizione assegnata a sede cittadina di riferimento"
    return f"Verifica Sentinel: {base}; {position}; riferimento consultabile nel link documento."


def source_trust_value(source: Source, position_from_text: bool) -> str:
    if source.trust == "institutional" and position_from_text:
        return "institutional-geo"
    if source.trust == "institutional":
        return "institutional-reference"
    if source.trust == "social-public":
        return "social-unverified"
    if position_from_text:
        return f"{source.trust}-geo"
    return f"{source.trust}-reference"


def incident_id(source: Source, guid: str) -> str:
    digest = hashlib.sha1(f"{source.name}:{guid}".encode("utf-8")).hexdigest()[:16]
    return f"live-{digest}"


def save_item(db, source: Source, item: dict[str, str]) -> bool:
    published_at = parse_published_at(item.get("published", ""))
    if not is_recent_enough(published_at):
        return False

    source_event_id = item["guid"][:500]
    existing = (
        db.query(Incident)
        .filter(Incident.source == source.name, Incident.source_event_id == source_event_id)
        .first()
    )
    now = utc_now()
    if existing:
        existing.last_seen_at = now
        return False

    title = clean_text(item["title"], 140)
    description = clean_text(item["description"], 420)
    coords = coordinates_for(title, description, source.name)
    lat, lon, city, address, position_from_text = coords
    description_with_reference = clean_text(
        f"{description}\n\n{verification_label(source, position_from_text)}",
        650,
    )
    inc = Incident(
        id=incident_id(source, source_event_id),
        type=classify_type(title, description, source.default_type),
        title=title,
        description=description_with_reference,
        severity=classify_severity(title, description),
        latitude=lat,
        longitude=lon,
        address=address,
        city=city,
        status="active",
        created_date=published_at or now,
        source=source.name,
        source_event_id=source_event_id,
        source_trust=source_trust_value(source, position_from_text),
        last_seen_at=now,
        reported_by_id="sentinel-bot",
        reporter_karma=1000 if source.trust == "institutional" else 650,
    )
    db.add(inc)
    db.flush()
    db.add(Media(incident_id=inc.id, url=item["link"], type="document"))
    return True


def cleanup_generic_locations(db) -> dict[str, int]:
    fallback_events = (
        db.query(Incident)
        .filter(
            Incident.source.isnot(None),
            (
                (
                    (Incident.city == "Italia")
                    & (Incident.address == "Italia")
                    & (Incident.latitude == 42.5042)
                    & (Incident.longitude == 12.6464)
                )
                | Incident.address.like("%sede istituzionale%")
            ),
        )
        .all()
    )
    updated = 0
    removed = 0
    for incident in fallback_events:
        lat, lon, city, address, _position_from_text = coordinates_for(incident.title, incident.description, incident.source)
        incident.latitude = lat
        incident.longitude = lon
        incident.city = city
        incident.address = address
        updated += 1
    return {"updated_generic_locations": updated, "removed_generic_locations": removed}


def main() -> dict:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    added = 0
    seen = 0
    failed_sources = []

    try:
        cleanup_result = cleanup_generic_locations(db)
        for source in SOURCES:
            try:
                payload = fetch_url(source.url)
                items = parse_feed(payload)[:MAX_ITEMS_PER_SOURCE]
            except Exception as exc:
                failed_sources.append(f"{source.name}: {exc}")
                continue

            for item in items:
                seen += 1
                if save_item(db, source, item):
                    added += 1

        db.commit()
    finally:
        db.close()

    print(f"Fonti lette: {len(SOURCES) - len(failed_sources)}/{len(SOURCES)}")
    print(f"Notizie analizzate: {seen}")
    print(f"Nuovi eventi aggiunti: {added}")
    print(f"Posizioni generiche corrette: {cleanup_result['updated_generic_locations']}")
    print(f"Posizioni generiche rimosse: {cleanup_result['removed_generic_locations']}")
    if failed_sources:
        print("Fonti saltate:")
        for failed in failed_sources:
            print(f"- {failed}")

    return {
        "sources_read": len(SOURCES) - len(failed_sources),
        "sources_total": len(SOURCES),
        "items_seen": seen,
        "added": added,
        **cleanup_result,
        "failed_sources": failed_sources,
    }


if __name__ == "__main__":
    main()
