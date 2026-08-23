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
import math
import re
import sys
import time
import unicodedata
import urllib.parse
import urllib.request
import urllib.error
import xml.etree.ElementTree as ET
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass
from html.parser import HTMLParser
from pathlib import Path
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError


BACKEND_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BACKEND_DIR.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

# Keep SQLite paths stable even if the script is launched from backend.
import os

os.chdir(PROJECT_ROOT)

from backend.database import SessionLocal, engine  # noqa: E402
from backend.models import Base, Incident, Media, User  # noqa: E402
from sqlalchemy.exc import SQLAlchemyError  # noqa: E402


USER_AGENT = "SentinelLocalBot/1.0 (+local development; contact: localhost)"
MAX_ITEMS_PER_SOURCE = 25
MAX_ARTICLE_ENRICHMENTS_PER_SOURCE = 3
FEED_DOWNLOAD_WORKERS = 8
GEOCODE_DELAY_SECONDS = 1.1
MAX_NEWS_AGE = dt.timedelta(days=30)
try:
    ITALY_TIMEZONE = ZoneInfo("Europe/Rome")
except ZoneInfoNotFoundError:
    ITALY_TIMEZONE = dt.datetime.now().astimezone().tzinfo or dt.UTC
MUNICIPALITY_DATA_URL = (
    "https://cdn.jsdelivr.net/gh/RP92/comuni-italiani/data/comuni.json"
)
MUNICIPALITY_CACHE = PROJECT_ROOT / ".sentinel-cache" / "comuni-regionali.json"
ACTIVE_REGIONS = {
    "Lombardia": "lombardia",
    "Lazio": "lazio",
    "Campania": "campania",
    "Emilia-Romagna": "emilia-romagna",
}
FOCUS_METROPOLITAN_AREAS = {
    "Milano": "milano",
    "Roma": "roma",
    "Napoli": "napoli",
    "Bologna": "bologna",
}
MUNICIPALITIES_PER_QUERY = 18
FOCUS_MUNICIPALITIES_PER_QUERY = {
    # Smaller groups prevent Bologna city from crowding out the 54 surrounding towns.
    "Bologna": 6,
}

EMILIA_ROMAGNA_CITIES = {
    "bologna", "modena", "parma", "reggio emilia", "ferrara", "ravenna",
    "rimini", "forli", "cesena", "piacenza", "faenza", "cervia",
    "fiorenzuola", "nonantola", "imola", "carpi", "sassuolo", "formigine",
    "vignola", "mirandola", "castelfranco emilia", "fidenza",
    "salsomaggiore terme", "forlimpopoli", "cattolica", "riccione",
    "bellaria-igea marina", "comacchio", "cento", "argenta",
    "alfonsine", "bagnacavallo", "bagnara di romagna", "brisighella",
    "casola valsenio", "castel bolognese", "conselice", "cotignola",
    "fusignano", "lugo", "massa lombarda", "riolo terme", "russi",
    "sant'agata sul santerno", "solarolo", "marina di ravenna",
    "punta marina terme", "lido adriano", "lido di classe", "lido di dante",
    "classe", "porto corsini", "marina romea", "casalborsetti", "mezzano",
    "piangipane", "san pietro in vincoli", "sant'alberto", "savarna",
    "fosso ghiaia", "milano marittima", "fornace zarattini", "lavezzola",
    "voltana", "san bernardino",
    "castel san pietro", "castel san pietro terme",
    "pinarella", "lido di savio", "porto fuori",
}

# The active product areas are whole regions. Municipality names are also used
# as a gazetteer: known coordinates are used immediately, while smaller places
# are geocoded only when they are explicitly named in the article.
LOMBARDIA_CITIES = {
    "milano", "monza", "bergamo", "brescia", "como", "varese", "lecco",
    "sondrio", "pavia", "lodi", "cremona", "mantova", "legnano", "rho",
    "abbiategrasso", "magenta", "melzo", "gorgonzola", "melegnano",
    "sesto san giovanni", "cinisello balsamo", "cologno monzese", "bollate",
    "paderno dugnano", "segrate", "pioltello", "san donato milanese",
    "san giuliano milanese", "rozzano", "corsico", "busto arsizio",
    "gallarate", "saronno", "tradate", "luino", "laveno mombello", "desio",
    "seregno", "vimercate", "lissone", "limbiate", "brugherio", "cantu",
    "mariano comense", "erba", "lomazzo", "merate", "calolziocorte",
    "mandello del lario", "treviglio", "seriate", "dalmine",
    "romano di lombardia", "clusone", "desenzano del garda", "montichiari",
    "chiari", "palazzolo sull'oglio", "lumezzane", "salo",
    "gardone val trompia", "morbegno", "tirano", "chiavenna", "bormio",
    "vigevano", "voghera", "stradella", "mortara", "codogno",
    "casalpusterlengo", "sant'angelo lodigiano", "crema", "casalmaggiore",
    "soresina", "suzzara", "castiglione delle stiviere", "viadana", "asola",
    "castronno", "cairate", "rescaldina", "uboldo", "castelseprio", "malnate",
    "arcisate", "viggiu", "brezzo di bedero", "sesto calende", "somma lombardo",
    "cassano magnago", "lurate caccivio", "menaggio", "bellagio", "bellano",
    "colico", "oggiono", "albino", "alzano lombardo", "nembro",
    "ponte san pietro", "zogno", "sirmione", "rezzato", "ghedi", "rovato",
    "iseo", "darfo boario terme",
}

LAZIO_CITIES = {
    "roma", "ostia", "fiumicino", "ciampino", "pomezia", "ardea", "anzio",
    "nettuno", "civitavecchia", "ladispoli", "cerveteri", "tivoli",
    "guidonia", "guidonia montecelio", "monterotondo", "mentana", "fonte nuova",
    "frascati", "marino", "albano laziale", "ariccia", "genzano di roma",
    "velletri", "grottaferrata", "rocca di papa", "rocca priora", "colleferro",
    "valmontone", "palestrina", "bracciano", "anguillara sabazia",
    "santa marinella", "subiaco", "latina", "aprilia", "cisterna di latina",
    "terracina", "fondi", "formia", "gaeta", "sabaudia", "sezze", "priverno",
    "minturno", "pontinia", "frosinone", "cassino", "sora", "anagni", "alatri",
    "ferentino", "ceccano", "veroli", "fiuggi", "pontecorvo", "viterbo",
    "civita castellana", "tarquinia", "montefiascone", "vetralla", "orte",
    "montalto di castro", "ronciglione", "caprarola", "rieti", "fara in sabina",
    "poggio mirteto", "cittaducale", "amatrice", "accumoli", "leonessa",
    "moricone", "anticoli corrado", "capena", "san cesareo", "cave", "bellegra",
    "morlupo", "fiano romano", "san polo dei cavalieri", "arsoli", "montecelio",
    "monte livata", "tor di valle",
}

CAMPANIA_CITIES = {
    "napoli", "giugliano", "giugliano in campania", "pozzuoli", "bacoli",
    "monte di procida", "quarto", "marano di napoli", "mugnano di napoli",
    "melito di napoli", "villarricca", "qualiano", "frattamaggiore", "casoria",
    "afragola", "caivano", "acerra", "pomigliano d'arco", "casalnuovo di napoli",
    "nola", "somma vesuviana", "ottaviano", "san giuseppe vesuviano", "terzigno",
    "poggiomarino", "torre annunziata", "torre del greco", "ercolano", "portici",
    "san giorgio a cremano", "pompei", "castellammare di stabia", "gragnano",
    "sorrento", "vico equense", "massa lubrense", "ischia", "forio", "procida",
    "caserta", "aversa", "marcianise", "maddaloni", "santa maria capua vetere",
    "capua", "mondragone", "sessa aurunca", "teano", "piedimonte matese",
    "salerno", "cava de' tirreni", "vietri sul mare", "amalfi", "positano",
    "maiori", "minori", "nocera inferiore", "nocera superiore", "pagani",
    "scafati", "angri", "sarno", "battipaglia", "eboli", "pontecagnano faiano",
    "agropoli", "capaccio paestum", "castellabate", "sapri", "vallo della lucania",
    "avellino", "atripalda", "mercogliano", "solofra", "montoro", "ariano irpino",
    "grottaminarda", "cervinara", "montella", "sant'angelo dei lombardi",
    "benevento", "telese terme", "sant'agata de' goti", "san giorgio del sannio",
    "montesarchio", "airola", "pietrelcina", "cerreto sannita", "morcone",
    "san vitaliano", "paternopoli", "san mango sul calore", "paduli",
    "cassano irpino", "pietradefusi", "montemiletto", "santa lucia di serino",
    "bagnoli irpino",
}


@dataclass(frozen=True)
class Source:
    name: str
    url: str
    trust: str = "institutional"
    default_type: str = "other"
    display_name: str | None = None
    publisher_city: str | None = None
    enrich_article: bool = False


def google_news_url(query: str) -> str:
    encoded_query = urllib.parse.quote_plus(f"{query} when:30d")
    return f"https://news.google.com/rss/search?q={encoded_query}&hl=it&gl=IT&ceid=IT:it"


INCIDENT_NEWS_TERMS = (
    "incidente OR incendio OR rapina OR aggressione OR furto OR rissa OR arresto "
    "OR omicidio OR accoltellamento OR sparatoria OR maltempo OR allerta OR frana "
    "OR alluvione OR traffico OR strada chiusa"
)


def local_media_source(name: str, publishers: tuple[str, ...]) -> Source:
    publisher_query = " OR ".join(f'"{publisher}"' for publisher in publishers)
    return Source(
        name,
        google_news_url(f"({publisher_query}) ({INCIDENT_NEWS_TERMS})"),
        "news",
        "crime",
        enrich_article=True,
    )


def municipality_source(
    name: str,
    municipalities: tuple[str, ...],
    *,
    enrich_article: bool = False,
) -> Source:
    municipality_query = " OR ".join(f'"{city}"' for city in municipalities)
    return Source(
        name,
        google_news_url(f"({municipality_query}) ({INCIDENT_NEWS_TERMS})"),
        "city-keyword",
        "crime",
        enrich_article=enrich_article,
    )

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
    Source(
        "google-news-sicilia-cronaca",
        "https://news.google.com/rss/search?q=(PalermoToday%20OR%20CataniaToday%20OR%20MessinaToday%20OR%20RagusaNews%20OR%20SiracusaNews%20OR%20LiveSicilia%20OR%20Giornale%20di%20Sicilia%20OR%20La%20Sicilia)%20(incidente%20OR%20incendio%20OR%20rapina%20OR%20aggressione%20OR%20maltempo)%20when:30d&hl=it&gl=IT&ceid=IT:it",
        "news",
        "other",
    ),
    Source(
        "google-news-sardegna-cronaca",
        "https://news.google.com/rss/search?q=(CagliariToday%20OR%20SassariNotizie%20OR%20Unione%20Sarda%20OR%20La%20Nuova%20Sardegna%20OR%20SardegnaLive)%20(incidente%20OR%20incendio%20OR%20rapina%20OR%20aggressione%20OR%20maltempo)%20when:30d&hl=it&gl=IT&ceid=IT:it",
        "news",
        "other",
    ),
    Source(
        "google-news-sud-piccoli-comuni",
        "https://news.google.com/rss/search?q=(Calabria%20OR%20Basilicata%20OR%20Molise%20OR%20Abruzzo%20OR%20Puglia)%20(comune%20OR%20provincia)%20(incidente%20OR%20incendio%20OR%20rapina%20OR%20maltempo)%20when:30d&hl=it&gl=IT&ceid=IT:it",
        "news",
        "other",
    ),
    Source(
        "google-news-isole-incendi-meteo",
        "https://news.google.com/rss/search?q=(Sardegna%20OR%20Sicilia)%20(incendio%20boschivo%20OR%20allerta%20meteo%20OR%20frana%20OR%20alluvione%20OR%20protezione%20civile)%20when:30d&hl=it&gl=IT&ceid=IT:it",
        "aggregated",
        "weather",
    ),
    Source(
        "google-news-comuni-locali",
        "https://news.google.com/rss/search?q=(comune%20OR%20sindaco%20OR%20protezione%20civile%20comunale%20OR%20polizia%20locale)%20(incendio%20OR%20incidente%20OR%20allerta%20OR%20evacuazione)%20Italia%20when:30d&hl=it&gl=IT&ceid=IT:it",
        "institutional",
        "other",
    ),
])


# Fonti attive prioritarie: al momento il prodotto e' concentrato su
# Milano, Roma, Emilia-Romagna e Napoli. Le fonti nazionali/generiche sopra
# restano disponibili come base e per future aree "plus".
ACTIVE_AREA_SOURCES = [
    Source(
        "active-milano-cronaca-locali",
        "https://news.google.com/rss/search?q=(MilanoToday%20OR%20Il%20Giorno%20Milano%20OR%20Corriere%20Milano%20OR%20Repubblica%20Milano%20OR%20SkyTG24%20Milano%20OR%20TGCOM24%20Milano%20OR%20Prima%20Milano%20OR%20MiTomorrow)%20(incidente%20OR%20incendio%20OR%20rapina%20OR%20aggressione%20OR%20furto%20OR%20rissa%20OR%20omicidio%20OR%20maltempo)%20when:30d&hl=it&gl=IT&ceid=IT:it",
        "news",
        "crime",
    ),
    Source(
        "active-milano-istituzioni-sicurezza",
        "https://news.google.com/rss/search?q=(Questura%20Milano%20OR%20Prefettura%20Milano%20OR%20Carabinieri%20Milano%20OR%20Guardia%20di%20Finanza%20Milano%20OR%20Polizia%20Locale%20Milano%20OR%20Comune%20di%20Milano)%20(arresto%20OR%20denuncia%20OR%20comunicato%20OR%20sicurezza%20OR%20sequestro%20OR%20controlli)%20when:30d&hl=it&gl=IT&ceid=IT:it",
        "institutional",
        "crime",
    ),
    Source(
        "active-milano-emergenze-traffico-meteo",
        "https://news.google.com/rss/search?q=(Vigili%20del%20Fuoco%20Milano%20OR%20AREU%20118%20Milano%20OR%20ARPA%20Lombardia%20Milano%20OR%20ATM%20Milano%20OR%20ANAS%20Milano)%20(incendio%20OR%20emergenza%20OR%20incidente%20OR%20allerta%20OR%20traffico%20OR%20maltempo)%20when:30d&hl=it&gl=IT&ceid=IT:it",
        "institutional",
        "other",
    ),
    Source(
        "active-roma-cronaca-locali",
        "https://news.google.com/rss/search?q=(RomaToday%20OR%20Il%20Messaggero%20Roma%20OR%20Repubblica%20Roma%20OR%20Corriere%20Roma%20OR%20Fanpage%20Roma%20OR%20SkyTG24%20Roma%20OR%20TGCOM24%20Roma)%20(incidente%20OR%20incendio%20OR%20rapina%20OR%20aggressione%20OR%20furto%20OR%20rissa%20OR%20omicidio%20OR%20maltempo)%20when:30d&hl=it&gl=IT&ceid=IT:it",
        "news",
        "crime",
    ),
    Source(
        "active-roma-istituzioni-sicurezza",
        "https://news.google.com/rss/search?q=(Questura%20Roma%20OR%20Prefettura%20Roma%20OR%20Carabinieri%20Roma%20OR%20Guardia%20di%20Finanza%20Roma%20OR%20Polizia%20Locale%20Roma%20Capitale%20OR%20Roma%20Capitale)%20(arresto%20OR%20denuncia%20OR%20comunicato%20OR%20sicurezza%20OR%20sequestro%20OR%20controlli)%20when:30d&hl=it&gl=IT&ceid=IT:it",
        "institutional",
        "crime",
    ),
    Source(
        "active-roma-emergenze-traffico-meteo",
        "https://news.google.com/rss/search?q=(Vigili%20del%20Fuoco%20Roma%20OR%20118%20Roma%20OR%20ARES%20118%20Roma%20OR%20Protezione%20Civile%20Lazio%20OR%20Astral%20Infomobilita%20OR%20Atac%20Roma)%20(incendio%20OR%20emergenza%20OR%20incidente%20OR%20allerta%20OR%20traffico%20OR%20maltempo)%20when:30d&hl=it&gl=IT&ceid=IT:it",
        "institutional",
        "other",
    ),
    Source(
        "active-emilia-romagna-cronaca-locali",
        "https://news.google.com/rss/search?q=(BolognaToday%20OR%20ModenaToday%20OR%20ParmaToday%20OR%20RavennaToday%20OR%20CesenaToday%20OR%20RiminiToday%20OR%20Il%20Resto%20del%20Carlino%20OR%20Gazzetta%20di%20Parma%20OR%20Gazzetta%20di%20Modena%20OR%20ReggioOnline%20OR%20Bologna%20Repubblica%20OR%20Corriere%20Bologna)%20(incidente%20OR%20incendio%20OR%20rapina%20OR%20aggressione%20OR%20furto%20OR%20rissa%20OR%20omicidio%20OR%20maltempo)%20when:30d&hl=it&gl=IT&ceid=IT:it",
        "news",
        "crime",
    ),
    Source(
        "active-emilia-romagna-istituzioni-sicurezza",
        "https://news.google.com/rss/search?q=(Questura%20Bologna%20OR%20Questura%20Modena%20OR%20Questura%20Parma%20OR%20Questura%20Reggio%20Emilia%20OR%20Questura%20Ferrara%20OR%20Questura%20Ravenna%20OR%20Questura%20Rimini%20OR%20Carabinieri%20Bologna%20OR%20Carabinieri%20Modena%20OR%20Polizia%20Locale%20Bologna)%20(arresto%20OR%20denuncia%20OR%20comunicato%20OR%20sicurezza%20OR%20sequestro%20OR%20controlli)%20when:30d&hl=it&gl=IT&ceid=IT:it",
        "institutional",
        "crime",
    ),
    Source(
        "active-emilia-romagna-emergenze-traffico-meteo",
        "https://news.google.com/rss/search?q=(Vigili%20del%20Fuoco%20Bologna%20OR%20Vigili%20del%20Fuoco%20Modena%20OR%20ARPAE%20Emilia%20Romagna%20OR%20Protezione%20Civile%20Emilia%20Romagna%20OR%20Regione%20Emilia%20Romagna%20OR%20ANAS%20Emilia%20Romagna)%20(incendio%20OR%20emergenza%20OR%20incidente%20OR%20allerta%20OR%20traffico%20OR%20maltempo)%20when:30d&hl=it&gl=IT&ceid=IT:it",
        "institutional",
        "other",
    ),
    Source(
        "active-napoli-cronaca-locali",
        "https://news.google.com/rss/search?q=(NapoliToday%20OR%20Il%20Mattino%20Napoli%20OR%20Fanpage%20Napoli%20OR%20Repubblica%20Napoli%20OR%20Corriere%20del%20Mezzogiorno%20Napoli%20OR%20Napoli%20Village%20OR%20Cronache%20della%20Campania)%20(incidente%20OR%20incendio%20OR%20rapina%20OR%20aggressione%20OR%20furto%20OR%20rissa%20OR%20omicidio%20OR%20maltempo)%20when:30d&hl=it&gl=IT&ceid=IT:it",
        "news",
        "crime",
    ),
    Source(
        "active-napoli-istituzioni-sicurezza",
        "https://news.google.com/rss/search?q=(Questura%20Napoli%20OR%20Prefettura%20Napoli%20OR%20Carabinieri%20Napoli%20OR%20Guardia%20di%20Finanza%20Napoli%20OR%20Polizia%20Locale%20Napoli%20OR%20Comune%20di%20Napoli)%20(arresto%20OR%20denuncia%20OR%20comunicato%20OR%20sicurezza%20OR%20sequestro%20OR%20controlli)%20when:30d&hl=it&gl=IT&ceid=IT:it",
        "institutional",
        "crime",
    ),
    Source(
        "active-napoli-emergenze-traffico-meteo",
        "https://news.google.com/rss/search?q=(Vigili%20del%20Fuoco%20Napoli%20OR%20118%20Napoli%20OR%20Protezione%20Civile%20Campania%20OR%20ARPAC%20Napoli%20OR%20ANM%20Napoli%20OR%20Tangenziale%20Napoli)%20(incendio%20OR%20emergenza%20OR%20incidente%20OR%20allerta%20OR%20traffico%20OR%20maltempo)%20when:30d&hl=it&gl=IT&ceid=IT:it",
        "institutional",
        "other",
    ),
]

# Provincial catalogues keep each Google News result set small. This prevents
# large-city publishers from crowding out reports from towns and local outlets.
REGIONAL_LOCAL_MEDIA_SOURCES = [
    # Emilia-Romagna: one catalogue per province keeps small outlets visible.
    local_media_source("emilia-romagna-bologna-citta-locali", (
        "BolognaToday", "Bologna in Diretta", "Corriere Bologna",
        "Repubblica Bologna", "Il Resto del Carlino Bologna", "E-TV Bologna",
        "TRC Bologna",
    )),
    local_media_source("emilia-romagna-bologna-imola-santerno-locali", (
        "Sabato Sera Imola", "Nuovo Diario Messaggero Imola", "BolognaToday Imola",
        "Bologna2000 Imola", "Il Resto del Carlino Imola",
    )),
    local_media_source("emilia-romagna-bologna-reno-appennino-locali", (
        "RenoNews", "Bologna24ore", "Bologna2000", "EmiliaRomagnaNews24",
        "Il Resto del Carlino Appennino bolognese",
    )),
    local_media_source("emilia-romagna-bologna-pianura-persiceto-locali", (
        "Carta Bianca News", "Bologna24ore San Giovanni in Persiceto",
        "Bologna2000 San Giovanni in Persiceto", "EmiliaRomagnaNews24 Bologna",
        "Il Resto del Carlino Pianura bolognese",
    )),
    local_media_source("emilia-romagna-modena-locali", (
        "ModenaToday", "Modena in Diretta", "La Pressa", "SulPanaro",
        "Sassuolo2000", "Modena2000", "Carpi2000", "Gazzetta di Modena",
    )),
    local_media_source("emilia-romagna-parma-locali", (
        "ParmaToday", "ParmaOnline", "Gazzetta di Parma", "TV Parma",
        "Repubblica Parma", "Gazzetta dell'Emilia",
    )),
    local_media_source("emilia-romagna-reggio-locali", (
        "Reggionline", "ReggioSera", "Redacon", "24Emilia", "Stampa Reggiana",
        "Gazzetta di Reggio", "Telereggio", "Next Stop Reggio",
    )),
    local_media_source("emilia-romagna-piacenza-locali", (
        "IlPiacenza", "PiacenzaSera", "Liberta Piacenza", "Piacenza24",
        "Radio Sound Piacenza", "Il Nuovo Giornale Piacenza",
    )),
    local_media_source("emilia-romagna-ferrara-locali", (
        "Estense", "FerraraToday", "Ferrara24ore", "La Nuova Ferrara",
        "Telestense", "CronacaComune Ferrara",
    )),
    local_media_source("emilia-romagna-ravenna-faenza-lugo-locali", (
        "RavennaToday", "RavennaNotizie", "Ravenna24Ore", "La Cronaca di Ravenna",
        "Settesere", "FaenzaNotizie", "LugoNotizie", "Cervianotizie", "Piu Notizie",
    )),
    local_media_source("emilia-romagna-forli-cesena-locali", (
        "ForliToday", "CesenaToday", "Forli24ore", "Corriere Romagna",
        "Teleromagna", "LivingCesena", "CesenaNotizie",
    )),
    local_media_source("emilia-romagna-rimini-locali", (
        "RiminiToday", "NewsRimini", "RiminiNews24", "AltaRimini",
        "ChiamamiCitta", "Corriere Romagna", "Teleromagna",
    )),
    # Lombardia
    local_media_source("lombardia-milano-monza-locali", (
        "MilanoToday", "Prima Milano Ovest", "MiTomorrow", "LegnanoNews",
        "Ticino Notizie", "MonzaToday", "MBNews", "Prima Monza",
    )),
    local_media_source("lombardia-varese-como-locali", (
        "VareseNews", "VareseNoi", "La Prealpina", "Malpensa24", "Il Bustese",
        "SaronnoNews", "CiaoComo", "La Provincia di Como", "QuiComo",
    )),
    local_media_source("lombardia-bergamo-brescia-locali", (
        "BergamoNews", "L'Eco di Bergamo", "Prima Bergamo", "Giornale di Brescia",
        "BresciaToday", "Bresciaoggi", "QuiBrescia", "Valle Sabbia News",
    )),
    local_media_source("lombardia-lecco-sondrio-locali", (
        "LeccoNotizie", "LeccoToday", "MerateOnline", "Prima Lecco",
        "La Provincia di Lecco", "Valsassina News", "La Provincia di Sondrio",
        "SondrioToday",
    )),
    local_media_source("lombardia-pavia-lodi-locali", (
        "La Provincia Pavese", "PaviaToday", "Prima Pavia", "Oltrepo Pavese",
        "Il Cittadino di Lodi", "LodiNotizie", "Prima Lodi",
    )),
    local_media_source("lombardia-cremona-mantova-locali", (
        "CremonaOggi", "CremonaSera", "La Provincia di Cremona", "Prima Cremona",
        "Gazzetta di Mantova", "Voce di Mantova", "MantovaUno",
    )),
    # Lazio, including the entire metropolitan area of Roma.
    local_media_source("lazio-roma-provincia-locali", (
        "RomaToday", "RomaH24", "Abitare a Roma", "Canale Dieci", "Il Faro Online",
        "Fiumicino Online", "Castelli Notizie", "Tiburno", "Dentro Magazine",
    )),
    local_media_source("lazio-latina-locali", (
        "LatinaToday", "Latina Oggi", "Latina Quotidiano", "Latina24ore",
        "LatinaPress", "La Provincia Latina", "Studio93", "H24 Notizie", "Il Caffe",
    )),
    local_media_source("lazio-frosinone-locali", (
        "FrosinoneToday", "Ciociaria Oggi", "Casilina News", "Teleuniverso",
        "TuNews24", "Frosinone News", "La Provincia Frosinone",
    )),
    local_media_source("lazio-viterbo-locali", (
        "Tusciaweb", "NewTuscia", "TusciaTimes", "OnTuscia", "EtruriaNews",
        "ViterboToday", "TusciaUp",
    )),
    local_media_source("lazio-rieti-locali", (
        "RietiLife", "Rietinvetrina", "Frontiera Rieti", "RietiLife TV",
        "Il Messaggero Rieti",
    )),
    # Campania
    local_media_source("campania-napoli-locali", (
        "NapoliToday", "Fanpage Napoli", "Il Mattino Napoli", "Repubblica Napoli",
        "Corriere del Mezzogiorno", "Cronache della Campania", "NapoliVillage", "Stylo24",
    )),
    local_media_source("campania-napoli-nord-flegrea-locali", (
        "Internapoli", "TeleclubItalia", "Il Meridiano News", "NanoTV",
        "Pozzuoli News 24", "Cronaca Flegrea", "Campi Flegrei News",
    )),
    local_media_source("campania-vesuviano-penisola-locali", (
        "VesuvioLive", "Lo Strillone", "Metropolis", "TorreSette", "StabiaChannel",
        "Positanonews", "Il Vescovado", "SorrentoPress",
    )),
    local_media_source("campania-caserta-locali", (
        "CasertaNews", "Edizione Caserta", "BelvedereNews", "CasertaCE", "Pupia",
        "E Caserta", "Goldweb TV", "Paese News",
    )),
    local_media_source("campania-salerno-agro-locali", (
        "SalernoToday", "SalernoNotizie", "La Citta di Salerno", "Ottopagine Salerno",
        "TV Oggi", "LiraTV", "Zerottonove", "Agro24",
    )),
    local_media_source("campania-cilento-costiera-locali", (
        "InfoCilento", "Giornale del Cilento", "Cilento Notizie", "StileTV",
        "Positanonews", "AmalfiNotizie", "Il Vescovado",
    )),
    local_media_source("campania-avellino-locali", (
        "AvellinoToday", "IrpiniaNews", "Orticalab", "Ottopagine Avellino",
        "Prima Tivvu", "Irpinia Post", "Irpinia Oggi",
    )),
    local_media_source("campania-benevento-locali", (
        "NTR24", "Anteprima24", "Ottopagine Benevento", "TV7 Benevento", "LabTV",
        "Il Quaderno", "Realta Sannita",
    )),
]

REGIONAL_INSTITUTIONAL_SOURCES = [
    Source(
        "lombardia-istituzioni-province",
        google_news_url(
            "(Questura OR Prefettura OR Carabinieri OR Vigili del Fuoco OR AREU OR ARPA Lombardia OR Protezione Civile Lombardia) "
            "(Milano OR Monza OR Bergamo OR Brescia OR Como OR Varese OR Lecco OR Sondrio OR Pavia OR Lodi OR Cremona OR Mantova) "
            f"({INCIDENT_NEWS_TERMS})"
        ),
        "institutional",
        "other",
    ),
    Source(
        "lazio-istituzioni-province",
        google_news_url(
            "(Questura OR Prefettura OR Carabinieri OR Vigili del Fuoco OR ARES 118 OR ARPA Lazio OR Protezione Civile Lazio OR Astral Infomobilita) "
            "(Roma OR Latina OR Frosinone OR Viterbo OR Rieti) "
            f"({INCIDENT_NEWS_TERMS})"
        ),
        "institutional",
        "other",
    ),
    Source(
        "campania-istituzioni-province",
        google_news_url(
            "(Questura OR Prefettura OR Carabinieri OR Vigili del Fuoco OR 118 OR ARPAC OR Protezione Civile Campania OR ANAS) "
            "(Napoli OR Caserta OR Salerno OR Avellino OR Benevento) "
            f"({INCIDENT_NEWS_TERMS})"
        ),
        "institutional",
        "other",
    ),
]

REGIONAL_MUNICIPALITY_SOURCES = [
    # Lombardia
    municipality_source("lombardia-comuni-milano-monza", (
        "Legnano", "Rho", "Abbiategrasso", "Magenta", "Melzo", "Gorgonzola",
        "Melegnano", "Sesto San Giovanni", "Cinisello Balsamo", "Vimercate",
        "Desio", "Seregno", "Lissone", "Brugherio",
    )),
    municipality_source("lombardia-comuni-varese-como-lecco", (
        "Busto Arsizio", "Gallarate", "Saronno", "Tradate", "Luino",
        "Laveno Mombello", "Cantu", "Mariano Comense", "Erba", "Lomazzo",
        "Merate", "Calolziocorte", "Mandello del Lario",
    )),
    municipality_source("lombardia-comuni-bergamo-brescia", (
        "Treviglio", "Seriate", "Dalmine", "Romano di Lombardia", "Clusone",
        "Desenzano del Garda", "Montichiari", "Chiari", "Palazzolo sull'Oglio",
        "Lumezzane", "Salo", "Gardone Val Trompia",
    )),
    municipality_source("lombardia-comuni-pavia-lodi-cremona", (
        "Vigevano", "Voghera", "Stradella", "Mortara", "Codogno",
        "Casalpusterlengo", "Sant'Angelo Lodigiano", "Crema", "Casalmaggiore", "Soresina",
    )),
    municipality_source("lombardia-comuni-mantova-sondrio", (
        "Suzzara", "Castiglione delle Stiviere", "Viadana", "Asola", "Morbegno",
        "Tirano", "Chiavenna", "Bormio",
    )),
    # Lazio
    municipality_source("lazio-comuni-roma-litorale", (
        "Ostia", "Fiumicino", "Pomezia", "Ardea", "Anzio", "Nettuno",
        "Civitavecchia", "Ladispoli", "Cerveteri", "Santa Marinella", "Bracciano",
    )),
    municipality_source("lazio-comuni-roma-est-castelli", (
        "Tivoli", "Guidonia Montecelio", "Monterotondo", "Mentana", "Fonte Nuova",
        "Frascati", "Marino", "Albano Laziale", "Ariccia", "Genzano di Roma",
        "Velletri", "Grottaferrata", "Rocca di Papa", "Colleferro", "Palestrina",
    )),
    municipality_source("lazio-comuni-latina", (
        "Aprilia", "Cisterna di Latina", "Terracina", "Fondi", "Formia", "Gaeta",
        "Sabaudia", "Sezze", "Priverno", "Minturno", "Pontinia",
    )),
    municipality_source("lazio-comuni-frosinone", (
        "Cassino", "Sora", "Anagni", "Alatri", "Ferentino", "Ceccano", "Veroli",
        "Fiuggi", "Pontecorvo",
    )),
    municipality_source("lazio-comuni-viterbo-rieti", (
        "Civita Castellana", "Tarquinia", "Montefiascone", "Vetralla", "Orte",
        "Montalto di Castro", "Ronciglione", "Caprarola", "Fara in Sabina",
        "Poggio Mirteto", "Cittaducale", "Amatrice", "Accumoli", "Leonessa",
    )),
    # Campania
    municipality_source("campania-comuni-napoli-nord-flegrea", (
        "Giugliano in Campania", "Pozzuoli", "Bacoli", "Monte di Procida", "Quarto",
        "Marano di Napoli", "Mugnano di Napoli", "Melito di Napoli", "Villaricca",
        "Qualiano", "Frattamaggiore", "Caivano",
    )),
    municipality_source("campania-comuni-vesuviano-nolano", (
        "Acerra", "Pomigliano d'Arco", "Casalnuovo di Napoli", "Nola",
        "Somma Vesuviana", "Ottaviano", "San Giuseppe Vesuviano", "Terzigno",
        "Poggiomarino", "Torre Annunziata", "Torre del Greco", "Ercolano", "Portici",
    )),
    municipality_source("campania-comuni-stabiese-isole", (
        "Pompei", "Castellammare di Stabia", "Gragnano", "Sorrento", "Vico Equense",
        "Massa Lubrense", "Ischia", "Forio", "Procida",
    )),
    municipality_source("campania-comuni-caserta", (
        "Aversa", "Marcianise", "Maddaloni", "Santa Maria Capua Vetere", "Capua",
        "Mondragone", "Sessa Aurunca", "Teano", "Piedimonte Matese",
    )),
    municipality_source("campania-comuni-salerno-agro", (
        "Cava de' Tirreni", "Vietri sul Mare", "Nocera Inferiore", "Nocera Superiore",
        "Pagani", "Scafati", "Angri", "Sarno", "Battipaglia", "Eboli",
        "Pontecagnano Faiano",
    )),
    municipality_source("campania-comuni-costiera-cilento", (
        "Amalfi", "Positano", "Maiori", "Minori", "Agropoli", "Capaccio Paestum",
        "Castellabate", "Sapri", "Vallo della Lucania",
    )),
    municipality_source("campania-comuni-avellino", (
        "Atripalda", "Mercogliano", "Solofra", "Montoro", "Ariano Irpino",
        "Grottaminarda", "Cervinara", "Montella", "Sant'Angelo dei Lombardi",
    )),
    municipality_source("campania-comuni-benevento", (
        "Telese Terme", "Sant'Agata de' Goti", "San Giorgio del Sannio",
        "Montesarchio", "Airola", "Pietrelcina", "Cerreto Sannita", "Morcone",
    )),
    municipality_source("lombardia-comuni-iperlocali", (
        "Castronno", "Cairate", "Rescaldina", "Uboldo", "Castelseprio", "Malnate",
        "Arcisate", "Viggiu", "Brezzo di Bedero", "Sesto Calende", "Somma Lombardo",
        "Cassano Magnago", "Lurate Caccivio", "Bellano", "Oggiono", "Nembro", "Iseo",
    )),
    municipality_source("lazio-comuni-iperlocali", (
        "Moricone", "Anticoli Corrado", "Capena", "San Cesareo", "Cave", "Bellegra",
        "Morlupo", "Fiano Romano", "San Polo dei Cavalieri", "Arsoli", "Montecelio",
    )),
    municipality_source("campania-comuni-iperlocali", (
        "San Vitaliano", "Paternopoli", "San Mango sul Calore", "Paduli",
        "Cassano Irpino", "Pietradefusi", "Montemiletto", "Santa Lucia di Serino",
        "Bagnoli Irpino",
    )),
]

SOURCES.extend(REGIONAL_LOCAL_MEDIA_SOURCES)
SOURCES.extend(REGIONAL_INSTITUTIONAL_SOURCES)
SOURCES.extend(REGIONAL_MUNICIPALITY_SOURCES)

EXTRA_VERIFIED_MEDIA_SOURCES = [
    Source(
        "active-milano-media-social-locali",
        "https://news.google.com/rss/search?q=(MilanoToday%20OR%20Repubblica%20Milano%20OR%20Corriere%20Milano%20OR%20Il%20Giorno%20Milano%20OR%20Prima%20Milano%20OR%20MiTomorrow%20OR%20MonzaToday%20OR%20VareseNews%20OR%20MBNews%20OR%20BergamoNews%20OR%20Lombardia%20Notizie%20OR%20Comune%20di%20Milano%20OR%20Polizia%20Locale%20Milano%20OR%20ATM%20Milano%20OR%20Trenord%20OR%20allertaLOM%20OR%20%40DPCgov%20OR%20%40poliziadistato)%20(arresto%20OR%20rapina%20OR%20furto%20OR%20rissa%20OR%20aggressione%20OR%20incendio%20OR%20incidente%20OR%20allerta%20OR%20maltempo%20OR%20traffico)%20when:30d&hl=it&gl=IT&ceid=IT:it",
        "verified-media",
        "crime",
    ),
    Source(
        "active-roma-media-social-locali",
        "https://news.google.com/rss/search?q=(RomaToday%20OR%20Repubblica%20Roma%20OR%20Il%20Messaggero%20Roma%20OR%20Corriere%20Roma%20OR%20Fanpage%20Roma%20OR%20RomaH24%20OR%20Abitare%20a%20Roma%20OR%20Il%20Faro%20Online%20OR%20Castelli%20Notizie%20OR%20Tiburno%20OR%20Roma%20Capitale%20OR%20Polizia%20Locale%20Roma%20OR%20Astral%20Infomobilita%20OR%20InfoAtac%20OR%20%40InfoAtac%20OR%20%40DPCgov%20OR%20%40poliziadistato)%20(arresto%20OR%20rapina%20OR%20furto%20OR%20rissa%20OR%20aggressione%20OR%20incendio%20OR%20incidente%20OR%20allerta%20OR%20maltempo%20OR%20traffico)%20when:30d&hl=it&gl=IT&ceid=IT:it",
        "verified-media",
        "crime",
    ),
    Source(
        "active-emilia-romagna-media-social-locali",
        "https://news.google.com/rss/search?q=(La%20Voce%20di%20Cesenatico%20OR%20Teleromagna%20OR%20RiminiToday%20OR%20CesenaToday%20OR%20ForliToday%20OR%20RavennaToday%20OR%20RavennaNotizie%20OR%20BolognaToday%20OR%20ModenaToday%20OR%20ParmaToday%20OR%20PiacenzaSera%20OR%20ReggioOnline%20OR%20Estense%20OR%20FerraraToday%20OR%20Sassuolo2000%20OR%20Gazzetta%20di%20Parma%20OR%20Gazzetta%20di%20Modena%20OR%20Il%20Resto%20del%20Carlino%20OR%20Comune%20di%20Cesenatico%20OR%20ARPAE%20OR%20Protezione%20Civile%20Emilia%20Romagna%20OR%20%40DPCgov%20OR%20%40poliziadistato)%20(arresto%20OR%20rapina%20OR%20furto%20OR%20rissa%20OR%20aggressione%20OR%20incendio%20OR%20incidente%20OR%20allerta%20OR%20mareggiata%20OR%20maltempo%20OR%20traffico)%20when:30d&hl=it&gl=IT&ceid=IT:it",
        "verified-media",
        "crime",
    ),
    Source(
        "active-napoli-media-social-locali",
        "https://news.google.com/rss/search?q=(NapoliToday%20OR%20Il%20Mattino%20Napoli%20OR%20Fanpage%20Napoli%20OR%20Repubblica%20Napoli%20OR%20Corriere%20del%20Mezzogiorno%20OR%20Napoli%20Village%20OR%20Cronache%20della%20Campania%20OR%20Internapoli%20OR%20TeleclubItalia%20OR%20VesuvioLive%20OR%20Anteprima24%20OR%20CasertaNews%20OR%20SalernoToday%20OR%20Ottopagine%20OR%20IrpiniaNews%20OR%20Comune%20di%20Napoli%20OR%20ANM%20Napoli%20OR%20Tangenziale%20Napoli%20OR%20%40DPCgov%20OR%20%40poliziadistato)%20(arresto%20OR%20rapina%20OR%20furto%20OR%20rissa%20OR%20aggressione%20OR%20incendio%20OR%20incidente%20OR%20allerta%20OR%20maltempo%20OR%20traffico)%20when:30d&hl=it&gl=IT&ceid=IT:it",
        "verified-media",
        "crime",
    ),
]

SOURCES.extend(EXTRA_VERIFIED_MEDIA_SOURCES)

CITY_KEYWORD_SOURCES = [
    Source(
        "active-milano-city-keywords",
        google_news_url(
            "(Milano OR Sesto San Giovanni OR Cinisello Balsamo OR Rho OR Legnano OR Rozzano OR Corsico OR Segrate OR Pioltello OR San Donato Milanese OR San Giuliano Milanese OR Abbiategrasso OR Magenta OR Melegnano OR Paderno Dugnano OR Bollate OR Cologno Monzese OR Monza OR Vimercate OR Desio OR Seregno OR Lissone) "
            "(incidente OR incendio OR rapina OR aggressione OR furto OR rissa OR arresto OR omicidio OR accoltellamento OR sparatoria OR maltempo OR allerta OR traffico)"
        ),
        "city-keyword",
        "crime",
    ),
    Source(
        "active-roma-city-keywords",
        google_news_url(
            "(Roma OR Ostia OR Fiumicino OR Guidonia OR Tivoli OR Pomezia OR Anzio OR Nettuno OR Ardea OR Civitavecchia OR Velletri OR Frascati OR Albano Laziale OR Marino OR Ciampino OR Monterotondo OR Colleferro OR Ladispoli OR Cerveteri OR Palestrina OR Bracciano OR Valmontone OR Zagarolo) "
            "(incidente OR incendio OR rapina OR aggressione OR furto OR rissa OR arresto OR omicidio OR accoltellamento OR sparatoria OR maltempo OR allerta OR traffico)"
        ),
        "city-keyword",
        "crime",
    ),
    Source(
        "active-emilia-romagna-city-keywords",
        google_news_url(
            "(Bologna OR Modena OR Parma OR Reggio Emilia OR Ferrara OR Ravenna OR Rimini OR Forli OR Cesena OR Piacenza OR Imola OR Carpi OR Faenza OR Sassuolo OR Riccione OR Cesenatico OR Cervia OR Cattolica OR Bellaria Igea Marina OR Santarcangelo di Romagna OR Coriano OR Misano Adriatico OR Lugo OR Comacchio OR Cento OR Vignola OR Mirandola OR Fidenza OR Castel San Pietro Terme OR San Lazzaro di Savena OR Casalecchio di Reno) "
            "(incidente OR incendio OR rapina OR aggressione OR furto OR rissa OR arresto OR omicidio OR accoltellamento OR sparatoria OR maltempo OR allerta OR traffico OR mareggiata)"
        ),
        "city-keyword",
        "crime",
    ),
    Source(
        "active-napoli-city-keywords",
        google_news_url(
            "(Napoli OR Giugliano OR Torre del Greco OR Pozzuoli OR Casoria OR Afragola OR Castellammare di Stabia OR Portici OR Ercolano OR Marano di Napoli OR Acerra OR Casalnuovo di Napoli OR Quarto OR Caivano OR Nola OR Torre Annunziata OR Pompei OR San Giorgio a Cremano OR Frattamaggiore OR Caserta OR Salerno OR Avellino OR Benevento) "
            "(incidente OR incendio OR rapina OR aggressione OR furto OR rissa OR arresto OR omicidio OR accoltellamento OR sparatoria OR maltempo OR allerta OR traffico)"
        ),
        "city-keyword",
        "crime",
    ),
]

SOURCES.extend(CITY_KEYWORD_SOURCES)
SOURCES.extend(ACTIVE_AREA_SOURCES)

# Feed locali diretti: descrizioni e link arrivano dalla testata originale,
# evitando il rumore e i duplicati tipici delle sole ricerche aggregate.
RAVENNA_DIRECT_SOURCES = [
    Source(
        "ravenna-notizie-cronaca",
        "https://www.ravennanotizie.it/cronaca/feed/",
        "news",
        "crime",
        "Ravenna Notizie",
        "Ravenna",
        True,
    ),
    Source(
        "ravenna24ore-cronaca",
        "https://www.ravenna24ore.it/notizie/cronaca/feed/",
        "news",
        "crime",
        "Ravenna24ore",
        "Ravenna",
        False,
    ),
    Source(
        "ravennatoday-rss",
        "https://www.ravennatoday.it/rss",
        "news",
        "other",
        "RavennaToday",
        "Ravenna",
        False,
    ),
]
SOURCES.extend(RAVENNA_DIRECT_SOURCES)

# Direct Bologna-area feeds retain the article summary and municipality. Google
# News links often expose only an aggregator page, which is not enough evidence
# to place an event safely outside the publisher's city.
BOLOGNA_DIRECT_SOURCES = [
    Source(
        "bologna-sabato-sera-direct",
        "https://www.sabatosera.it/feed/",
        "news",
        "crime",
        display_name="Sabato Sera",
    ),
    Source(
        "bologna-renonews-direct",
        "https://www.renonews.it/feed/",
        "news",
        "crime",
        display_name="RenoNews",
    ),
    Source(
        "bologna-cartabianca-direct",
        "https://www.cartabiancanews.com/feed/",
        "news",
        "crime",
        display_name="Carta Bianca News",
    ),
    Source(
        "bologna24ore-direct",
        "https://www.bologna24ore.it/feed/",
        "news",
        "crime",
        display_name="Bologna24ore",
    ),
    Source(
        "bologna-istituzioni-verificate",
        google_news_url(
            "(site:carabinieri.it OR site:poliziadistato.it OR site:vigilfuoco.it) "
            "(Bologna OR Imola OR Casalecchio di Reno OR San Lazzaro di Savena OR Budrio) "
            "(arresto OR denuncia OR incendio OR incidente OR aggressione OR furto OR rapina)"
        ),
        "institutional",
        "crime",
    ),
]
SOURCES.extend(BOLOGNA_DIRECT_SOURCES)
SOURCE_BY_NAME = {source.name: source for source in SOURCES}


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
    "vasto": (42.1115, 14.7065),
    "francavilla al mare": (42.4217, 14.2913),
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
    "marsala": (37.7981, 12.4350),
    "mazara del vallo": (37.6551, 12.5898),
    "castelvetrano": (37.6808, 12.7928),
    "gela": (37.0667, 14.2500),
    "vittoria": (36.9515, 14.5279),
    "modica": (36.8587, 14.7600),
    "scicli": (36.7901, 14.7017),
    "noto": (36.8924, 15.0698),
    "augusta": (37.2306, 15.2190),
    "acireale": (37.6128, 15.1658),
    "paterno": (37.5667, 14.9023),
    "adrano": (37.6636, 14.8348),
    "enna": (37.5676, 14.2799),
    "licata": (37.1026, 13.9397),
    "sciacca": (37.5086, 13.0833),
    "termoli": (42.0005, 14.9950),
    "olbia": (40.9236, 9.4964),
    "alghero": (40.5579, 8.3193),
    "porto torres": (40.8346, 8.3976),
    "tempio pausania": (40.9007, 9.1043),
    "siniscola": (40.5731, 9.6922),
    "tortoli": (39.9260, 9.6572),
    "lanusei": (39.8794, 9.5417),
    "iglesias": (39.3104, 8.5357),
    "villacidro": (39.4577, 8.7417),
    "sanluri": (39.5618, 8.8998),
    "tempio": (40.9007, 9.1043),
}

CITY_COORDS.update({
    "riccione": (44.0058, 12.6561),
    "coriano": (43.9638, 12.6036),
    "cattolica": (43.9618, 12.7366),
    "misano adriatico": (43.9828, 12.6934),
    "bellaria-igea marina": (44.1429, 12.4713),
    "santarcangelo di romagna": (44.0633, 12.4476),
    "verucchio": (43.9847, 12.4211),
    "morciano di romagna": (43.9140, 12.6515),
    "novafeltria": (43.8946, 12.2892),
    "elmas": (39.2688, 9.0517),
    "olmedo": (40.6515, 8.3809),
    "san gavino monreale": (39.5504, 8.7906),
    "san gavino": (39.5504, 8.7906),
    "luras": (40.9364, 9.1756),
    "nulvi": (40.7847, 8.7440),
    "gonnosfanadiga": (39.4945, 8.6601),
    "mandas": (39.6555, 9.1294),
    "macomer": (40.2648, 8.7727),
    "capoterra": (39.1767, 8.9711),
    "nuraminis": (39.4416, 9.0135),
    "nuramis": (39.4416, 9.0135),
    "teulada": (38.9664, 8.7719),
    "tossilo": (40.2740, 8.7970),
    "selargius": (39.2578, 9.1632),
    "sant'antioco": (39.0703, 8.4523),
    "sant antioco": (39.0703, 8.4523),
    "arbus": (39.5260, 8.6008),
    "villacidro": (39.4577, 8.7417),
    "muravera": (39.4197, 9.5741),
    "san teodoro": (40.7720, 9.6690),
    "budoni": (40.7047, 9.7049),
    "bosa": (40.2993, 8.4983),
    "dorgali": (40.2922, 9.5880),
    "orosei": (40.3790, 9.6927),
    "posada": (40.6339, 9.7164),
    "arzachena": (41.0762, 9.3904),
    "la maddalena": (41.2142, 9.4083),
})

CITY_COORDS.update({
    "legnano": (45.5946, 8.9182),
    "sesto san giovanni": (45.5333, 9.2259),
    "cinisello balsamo": (45.5570, 9.2219),
    "cologno monzese": (45.5300, 9.2779),
    "rho": (45.5325, 9.0402),
    "bollate": (45.5465, 9.1205),
    "paderno dugnano": (45.5680, 9.1648),
    "segrate": (45.4919, 9.2936),
    "pioltello": (45.5015, 9.3315),
    "san donato milanese": (45.4105, 9.2684),
    "san giuliano milanese": (45.3940, 9.2911),
    "rozzano": (45.3819, 9.1559),
    "corsico": (45.4308, 9.1102),
    "abbiategrasso": (45.3982, 8.9168),
    "magenta": (45.4646, 8.8845),
    "trezzano sul naviglio": (45.4221, 9.0634),
    "cesano boscone": (45.4420, 9.0946),
    "gorgonzola": (45.5307, 9.4054),
    "melzo": (45.4981, 9.4208),
    "melegnano": (45.3588, 9.3230),
    "busto arsizio": (45.6113, 8.8491),
    "gallarate": (45.6602, 8.7916),
    "saronno": (45.6251, 9.0352),
    "desio": (45.6183, 9.2096),
    "limbiate": (45.5991, 9.1232),
    "lissone": (45.6120, 9.2398),
    "seregno": (45.6500, 9.2055),
    "vimercate": (45.6155, 9.3680),
    "treviglio": (45.5215, 9.5910),
    "chiari": (45.5376, 9.9309),
    "vigevano": (45.3170, 8.8586),
    "voghera": (44.9919, 9.0090),
    "stradella": (45.0746, 9.3015),
    "codogno": (45.1617, 9.7022),
    "senago": (45.5779, 9.1220),
    "cantu": (45.7395, 9.1291),
    "cantÃ¹": (45.7395, 9.1291),
    "alpago": (46.1307, 12.3549),
    "altamura": (40.8286, 16.5527),
    "arenzano": (44.4025, 8.6831),
    "barete": (42.4536, 13.2765),
    "bolognetta": (37.9647, 13.4561),
    "caianello": (41.3046, 14.0843),
    "caltagirone": (37.2372, 14.5132),
    "cassino": (41.4926, 13.8305),
    "ceriale": (44.0963, 8.2330),
    "cerignola": (41.2648, 15.8997),
    "cervia": (44.2610, 12.3495),
    "faenza": (44.2856, 11.8832),
    "fano": (43.8424, 13.0147),
    "fiorenzuola": (44.9288, 9.9174),
    "giulianova": (42.7536, 13.9668),
    "lampedusa": (35.5111, 12.5963),
    "milazzo": (38.2208, 15.2415),
    "modugno": (41.0826, 16.7806),
    "monrupino": (45.7178, 13.7974),
    "montalto": (43.4985, 11.6655),
    "monte san savino": (43.3435, 11.6994),
    "naro": (37.2962, 13.7916),
    "nonantola": (44.6776, 11.0436),
    "orte": (42.4606, 12.3856),
    "palmi": (38.3574, 15.8466),
    "perledo": (46.0128, 9.2963),
    "pozzuoli": (40.8226, 14.1219),
    "pradleves": (44.4124, 7.2732),
    "trebiciano": (45.6731, 13.8250),
    "san giorgio a liri": (41.4050, 13.7616),
})

CITY_COORDS.update({
    "cesenatico": (44.2008, 12.4057),
    "ostia": (41.7321, 12.2765),
    "fiumicino": (41.7709, 12.2366),
    "guidonia": (41.9923, 12.7227),
    "guidonia montecelio": (41.9923, 12.7227),
    "tivoli": (41.9636, 12.7985),
    "pomezia": (41.6693, 12.5012),
    "anzio": (41.4486, 12.6297),
    "nettuno": (41.4579, 12.6612),
    "ardea": (41.6124, 12.5146),
    "civitavecchia": (42.0933, 11.7967),
    "velletri": (41.6865, 12.7770),
    "frascati": (41.8091, 12.6794),
    "albano laziale": (41.7315, 12.6608),
    "marino": (41.7698, 12.6592),
    "ciampino": (41.8006, 12.6026),
    "monterotondo": (42.0510, 12.6166),
    "colleferro": (41.7287, 13.0048),
    "ladispoli": (41.9556, 12.0735),
    "cerveteri": (41.9920, 12.0922),
    "palestrina": (41.8398, 12.8890),
    "bracciano": (42.1025, 12.1760),
    "valmontone": (41.7778, 12.9182),
    "zagarolo": (41.8396, 12.8293),
    "giugliano": (40.9285, 14.2012),
    "giugliano in campania": (40.9285, 14.2012),
    "torre del greco": (40.7866, 14.3687),
    "casoria": (40.9078, 14.2930),
    "afragola": (40.9220, 14.3092),
    "castellammare di stabia": (40.6947, 14.4803),
    "portici": (40.8156, 14.3372),
    "ercolano": (40.8077, 14.3501),
    "marano di napoli": (40.8979, 14.1894),
    "acerra": (40.9448, 14.3714),
    "casalnuovo di napoli": (40.9094, 14.3467),
    "quarto": (40.8786, 14.1442),
    "caivano": (40.9580, 14.3031),
    "nola": (40.9260, 14.5275),
    "torre annunziata": (40.7537, 14.4526),
    "pompei": (40.7462, 14.4989),
    "san giorgio a cremano": (40.8326, 14.3418),
    "frattamaggiore": (40.9415, 14.2759),
})

CITY_COORDS.update({
    # Provincia di Ravenna e principali frazioni, verificate su OpenStreetMap.
    "alfonsine": (44.5055011, 12.0409852),
    "bagnacavallo": (44.4161484, 11.9765495),
    "bagnara di romagna": (44.3891411, 11.8264421),
    "brisighella": (44.2221996, 11.7733250),
    "casola valsenio": (44.2231871, 11.6231101),
    "castel bolognese": (44.3303030, 11.7999064),
    "conselice": (44.5127578, 11.8291743),
    "cotignola": (44.3846325, 11.9423791),
    "fusignano": (44.4675720, 11.9602140),
    "lugo": (44.4179627, 11.9195554),
    "massa lombarda": (44.4473860, 11.8260915),
    "riolo terme": (44.2767786, 11.7252583),
    "russi": (44.3843560, 12.0182326),
    "sant'agata sul santerno": (44.4421700, 11.8601240),
    "sant agata sul santerno": (44.4421700, 11.8601240),
    "solarolo": (44.3555197, 11.8357282),
    "marina di ravenna": (44.4851718, 12.2788139),
    "punta marina terme": (44.4387363, 12.2903779),
    "lido adriano": (44.4122541, 12.3085978),
    "lido di classe": (44.3261463, 12.3365448),
    "lido di dante": (44.3864965, 12.3158364),
    "classe": (44.3808671, 12.2370915),
    "porto corsini": (44.4937638, 12.2769112),
    "marina romea": (44.5139861, 12.2729458),
    "casalborsetti": (44.5519836, 12.2808705),
    "casal borsetti": (44.5519836, 12.2808705),
    "mezzano": (44.4687185, 12.0825268),
    "piangipane": (44.4205065, 12.0876408),
    "san pietro in vincoli": (44.3012905, 12.1454344),
    "sant'alberto": (44.5397799, 12.1596441),
    "sant alberto": (44.5397799, 12.1596441),
    "savarna": (44.5111310, 12.1058700),
    "fosso ghiaia": (44.3564905, 12.2555665),
    "milano marittima": (44.2774759, 12.3481763),
    "fornace zarattini": (44.4160013, 12.1375017),
    "lavezzola": (44.5595388, 11.8801638),
    "voltana": (44.5426061, 11.9364860),
    "san bernardino": (44.5149961, 11.8872699),
    "castel san pietro": (44.3985660, 11.5897400),
    "castel san pietro terme": (44.3985660, 11.5897400),
    "pinarella": (44.2442000, 12.3619000),
    "lido di savio": (44.3122000, 12.3456000),
    "porto fuori": (44.4050700, 12.2501900),
    "monte livata": (41.9388580, 13.1486640),
})

RECOGNIZED_CITIES = (
    set(CITY_COORDS)
    | EMILIA_ROMAGNA_CITIES
    | LOMBARDIA_CITIES
    | LAZIO_CITIES
    | CAMPANIA_CITIES
)
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
    "romagna faentina": "faenza",
    "bolognese": "bologna",
    "pilastro": "bologna",
    "borgo panigale": "bologna",
    "bolognina": "bologna",
    "quartiere navile": "bologna",
    "giardini margherita": "bologna",
    "arcoveggio": "bologna",
    "piazza maggiore": "bologna",
    "due torri": "bologna",
    "modenese": "modena",
    "parmense": "parma",
    "piacentino": "piacenza",
    "reggiano": "reggio emilia",
    "ferrarese": "ferrara",
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
    "ascolano": "ascoli piceno",
    # Umbria
    "perugino": "perugia",
    "ternano": "terni",
    # Lazio
    "romano": "roma",
    "viterbese": "viterbo",
    "reatino": "rieti",
    "frusinate": "frosinone",
    "ciociaria": "frosinone",
    "pontino": "latina",
    # Abruzzo / Molise
    "teatino": "chieti",
    "isernino": "isernia",
    # Campania
    "napoletano": "napoli",
    "irpinia": "avellino",
    "sannio": "benevento",
    # Puglia
    "bat": "andria",
    "barletta": "andria",
    "andriese": "andria",
    # Basilicata
    "basilicata": "potenza",
    "potentino": "potenza",
    # Calabria
    "catanzarese": "catanzaro",
    # Sicilia
    # Sardegna
    "cagliaritano": "cagliari",
    "sassarese": "sassari",
    "nuorese": "nuoro",
    "oristanese": "oristano",
    "sulcis": "carbonia",
    "gallura": "olbia",
    "ogliastra": "tortoli",
    "barbagia": "nuoro",
    "medio campidano": "sanluri",
    "sarrabus": "cagliari",
    "nuoro e provincia": "nuoro",
    "siracusano": "siracusa",
    "gelese": "gela",
    "modicano": "modica",
    "netino": "noto",
    "marsalese": "marsala",
    "mazarese": "mazara del vallo",
    "trapanese": "trapani",
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
    "chietitoday": "chieti",
    "pescaratoday": "pescara",
    "abruzzolive": "l'aquila",
    "cityrumors": "teramo",
    "cagliaritoday": "cagliari",
    "sassaritoday": "sassari",
    "olbiatoday": "olbia",
    "sassarinotizie": "sassari",
    "nuoronews": "nuoro",
    "livesicilia": "palermo",
    "palermotoday": "palermo",
    "messinatoday": "messina",
    "ragusanews": "ragusa",
    "siracusanews": "siracusa",
    "agrigentonotizie": "agrigento",
    "trapanioggi": "trapani",
    "blogsicilia": "palermo",
    "roma corriere": "roma",
    "lanazione": "firenze",
    "nazione firenze": "firenze",
    "corriere fiorentino": "firenze",
    "firenze repubblica": "firenze",
    "repubblica firenze": "firenze",
    "firenzepost": "firenze",
    "nove da firenze": "firenze",
    "novedafirenze": "firenze",
    "055firenze": "firenze",
    "quinewsfirenze": "firenze",
    "gonews": "firenze",
    "ilrestodelcarlino": "bologna",
    "corriere di bologna": "bologna",
    "corrieredibologna": "bologna",
    "corriere bologna": "bologna",
    "bologna repubblica": "bologna",
    "repubblica bologna": "bologna",
    "bolognaindiretta": "bologna",
    "bolognanews": "bologna",
    "gazzetta di parma": "parma",
    "gazzetta di modena": "modena",
    "la provincia pavese": "pavia",
    "padovaoggi": "padova",
    "trevisotoday": "treviso",
    "vicenzatoday": "vicenza",
    "venezia today": "venezia",
    "veneziatoday": "venezia",
    "verona sera": "verona",
    "veronasera": "verona",
    "bergamonews": "bergamo",
    "bergamo news": "bergamo",
    "ecodibergamo": "bergamo",
    "bresciaoggi": "brescia",
    "varesenews": "varese",
    "primamonza": "monza",
    "monza news": "monza",
    "forlitoday": "forli",
    "cesenatoday": "cesena",
    "ravennatoday": "ravenna",
    "riminitoday": "rimini",
    "modenatoday": "modena",
    "parmatoday": "parma",
    "reggioonline": "reggio emilia",
    "reggio emilia online": "reggio emilia",
    "pisatoday": "pisa",
    "luccaindiretta": "lucca",
    "livornotoday": "livorno",
    "pratosfera": "prato",
    "umbria24": "perugia",
    "perugiatoday": "perugia",
    "ternitoday": "terni",
}
PUBLISHER_CITY_ALIASES.update({
    "la voce di cesenatico": "cesenatico",
    "lavocedicesenatico": "cesenatico",
    "voce di cesenatico": "cesenatico",
    "ravenna notizie": "ravenna",
    "ravennanotizie": "ravenna",
    "piacenza sera": "piacenza",
    "piacenzasera": "piacenza",
    "estense": "ferrara",
    "ferraratoday": "ferrara",
    "sassuolo2000": "sassuolo",
    "bologna in diretta": "bologna",
    "bolognaindiretta": "bologna",
    "modena in diretta": "modena",
    "modenaindiretta": "modena",
    "parmapress24": "parma",
    "roma h24": "roma",
    "romah24": "roma",
    "abitare a roma": "roma",
    "abitarearoma": "roma",
    "il faro online": "fiumicino",
    "ilfaroonline": "fiumicino",
    "castelli notizie": "frascati",
    "castellinotizie": "frascati",
    "tiburno": "tivoli",
    "internapoli": "napoli",
    "teleclubitalia": "napoli",
    "vesuviolive": "napoli",
    "napoli village": "napoli",
    "napolivillage": "napoli",
    "anteprima24": "benevento",
    "casertanews": "caserta",
    "salernotoday": "salerno",
    "ottopagine": "benevento",
    "irpinianews": "avellino",
    "il meridiano news": "napoli",
    "ilmeridianonews": "napoli",
})

SOURCE_FALLBACK_CITY = {
    source.name: source.publisher_city
    for source in SOURCES
    if source.publisher_city
}

TYPE_KEYWORDS = [
    ("fire", ["incendio", "fiamme", "rogo", "esplosione", "vigili del fuoco", "incendio boschivo", "incendio doloso", "canadair", "fumo", "brucia"]),
    ("weather", ["allerta", "meteo", "temporale", "nubifragio", "alluvione", "frana", "neve", "vento", "mareggiata", "terremoto", "sisma", "scossa", "esondazione", "caldo estremo", "ondata di calore"]),
    ("crime", ["arresto", "arresti", "arrestato", "denuncia", "denunce", "denunciato", "rapina", "furto", "tentato furto", "aggressione", "aggredito", "picchiato", "pestaggio", "rissa", "omicidio", "tentato omicidio", "accoltellamento", "arma da taglio", "sparatoria", "sequestro", "sequestrato", "spaccio", "droga", "violenza domestica", "maltrattamenti", "truffa", "vandalismo", "evasione"]),
    ("accident", ["incidente", "scontro", "tamponamento", "ferito", "feriti", "autostrada", "strada chiusa", "cavalcavia", "ribaltato", "investito", "pedone travolto"]),
    ("medical", ["malore", "emergenza sanitaria", "118", "soccorso", "evacuato", "intossicato", "intossicazione", "ricoverato", "epidemia", "contagio", "croce rossa"]),
    ("traffic", ["traffico", "viabilita", "coda", "rallentamenti", "chiusa", "chiuso", "chiusura", "chiusure", "deviazioni", "anas", "autostrade", "cciss", "casello", "svincolo", "tangenziale"]),
    ("suspicious", ["scomparso", "ricercato", "segnalazione", "sospetto", "intrusione", "allarme", "ladri in azione", "movimenti sospetti"]),
]

INCIDENT_SIGNAL_FRAGMENTS = (
    "incend", "fiamme", "rogo", "esplosion", "evacua", "allerta", "temporale",
    "nubifragio", "alluvion", "esond", "frana", "mareggiat", "terremot", "sisma",
    "incidente", "scontro", "schiant", "tamponament", "investit", "travolt", "ribaltat",
    "ferito", "feriti", "morto", "morti", "muore", "decedut", "vittima", "malore",
    "intossicat", "ricoverat",
    "arrest", "denunc", "rapina", "furto", "aggress", "aggredit", "picchiat",
    "pestaggio", "rissa", "ladro", "rubare",
    "omicidio", "accoltell", "sparator", "sequestr", "spaccio", "droga",
    "maltrattament", "violenza domestica", "truffa", "vandal", "evasione",
    "ricercat", "scomparso", "intrusione", "allarme", "strada chiusa", "svincolo chius",
    "traffico", "viabilita", "coda", "rallentament", "deviazion", "emergenza",
    "crollo", "dispers", "controlli straordinari", "maxidispositivo di sicurezza",
)

INSTITUTIONAL_PUBLISHER_MARKERS = (
    "regione ", "comune di ", "provincia di ", "questure polizia di stato",
    "polizia di stato", "carabinieri", "guardia di finanza", "vigili del fuoco",
    "protezione civile", "arpae", "arpa ", "anas", "prefettura", "ministero ",
    "azienda sanitaria", "ausl ", "areu ", "ares 118",
)

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


def strip_sentinel_note(text: str) -> str:
    cleaned = re.split(r"\s+Verifica Sentinel:", text or "", maxsplit=1)[0]
    cleaned = re.split(r"\s+Fonte:\s+", cleaned, maxsplit=1)[0]
    return cleaned.strip()


SOURCE_LABEL_OVERRIDES = {
    "ansa-cronaca": "ANSA",
    "ansa-ambiente": "ANSA Ambiente",
    "protezione-civile": "Protezione Civile",
    "vigili-fuoco": "Vigili del Fuoco",
    "carabinieri": "Carabinieri",
    "polizia-stato": "Polizia di Stato",
}


def split_title_and_publisher(title: str, source_name: str | None = None) -> tuple[str, str]:
    cleaned = clean_text(title, 240)
    source = SOURCE_BY_NAME.get(source_name or "")
    publisher = source.display_name if source and source.display_name else ""
    is_google_news = bool(source and "news.google.com" in source.url)
    if is_google_news and " - " in cleaned:
        article_title, possible_publisher = cleaned.rsplit(" - ", 1)
        if 2 <= len(possible_publisher.strip()) <= 90:
            return article_title.strip(), possible_publisher.strip()
    return cleaned, publisher


def source_display_name(source: Source, publisher: str = "") -> str:
    return clean_text(
        publisher or source.display_name or SOURCE_LABEL_OVERRIDES.get(source.name) or source.name,
        100,
    )


def clean_feed_description(description: str, article_title: str = "") -> str:
    body = strip_sentinel_note(clean_text(description, 900))
    normalized = normalize(body)
    if re.match(r"^l['\u2019]articolo\b", body, flags=re.I) and " proviene da " in normalized:
        return ""
    if article_title:
        title_norm = normalize(article_title).strip(" .")
        body_norm = normalized.strip(" .")
        if body_norm == title_norm:
            return ""
        if body_norm.startswith(title_norm):
            remainder = body[len(article_title):].strip(" .:-")
            if len(remainder) < 45:
                return ""
    return body


def is_low_quality_description(description: str, article_title: str) -> bool:
    body = clean_feed_description(description, article_title)
    return len(body) < 70


def is_relevant_incident(title: str, description: str) -> bool:
    text = normalize(f"{title} {description}")
    text = text.replace("fuochi d'artificio", " ").replace("fuochi artificiali", " ")
    if any(fragment in text for fragment in INCIDENT_SIGNAL_FRAGMENTS):
        return True
    closure = any(word in text for word in ("chiusa", "chiuso", "chiusura", "chiusure"))
    transport = any(
        word in text
        for word in (
            "strada", "autostrada", "diramazione", "svincolo", "casello", "uscita",
            "tratto", "tangenziale", "stazione", "ferrovia", "metro", "linea tram",
        )
    )
    return closure and transport


class _MetaDescriptionParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.description = ""
        self.published_at = ""
        self._published_priority = 0
        self.paragraphs: list[str] = []
        self._paragraph_parts: list[str] | None = None
        self._json_ld_parts: list[str] | None = None

    def _set_published_at(self, value: str | None, priority: int) -> None:
        candidate = clean_text(value, 100)
        if priority <= self._published_priority or not parse_published_at(candidate):
            return
        self.published_at = candidate
        self._published_priority = priority

    def _read_json_ld_date(self, payload: str) -> None:
        try:
            data = json.loads(payload)
        except (TypeError, ValueError):
            return

        pending = [data]
        while pending:
            current = pending.pop()
            if isinstance(current, list):
                pending.extend(current)
                continue
            if not isinstance(current, dict):
                continue
            for key, value in current.items():
                if key.lower() == "datepublished" and isinstance(value, str):
                    self._set_published_at(value, 50)
                elif isinstance(value, (dict, list)):
                    pending.append(value)

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        tag_name = tag.lower()
        values = {key.lower(): (value or "") for key, value in attrs}
        if tag_name == "script" and "ld+json" in values.get("type", "").lower():
            self._json_ld_parts = []
            return
        if tag_name == "p":
            self._paragraph_parts = []
            return
        if tag_name == "time":
            marker = normalize(" ".join((values.get("itemprop", ""), values.get("class", ""))))
            priority = 35 if "datepublished" in marker or "published" in marker else 15
            self._set_published_at(values.get("datetime"), priority)
            return
        if tag_name != "meta":
            return
        field = (values.get("property") or values.get("name") or values.get("itemprop") or "").lower()
        if not self.description and field in {"og:description", "twitter:description", "description"}:
            self.description = clean_text(values.get("content"), 900)
        if field in {"article:published_time", "datepublished", "pubdate", "publish-date"}:
            self._set_published_at(values.get("content"), 45)
        elif field == "date":
            self._set_published_at(values.get("content"), 25)

    def handle_data(self, data: str) -> None:
        if self._json_ld_parts is not None:
            self._json_ld_parts.append(data)
        if self._paragraph_parts is not None and len(self.paragraphs) < 8:
            self._paragraph_parts.append(data)

    def handle_endtag(self, tag: str) -> None:
        if tag.lower() == "script" and self._json_ld_parts is not None:
            self._read_json_ld_date("".join(self._json_ld_parts))
            self._json_ld_parts = None
            return
        if tag.lower() != "p" or self._paragraph_parts is None:
            return
        paragraph = clean_text(" ".join(self._paragraph_parts), 500)
        if len(paragraph) >= 45 and paragraph not in self.paragraphs:
            self.paragraphs.append(paragraph)
        self._paragraph_parts = None

    def article_text(self) -> str:
        parts = [part for part in [self.description, *self.paragraphs] if part]
        return clean_text(" ".join(dict.fromkeys(parts)), 2200)


def fetch_article_context(url: str) -> tuple[str, str]:
    try:
        payload = fetch_url(url, timeout=12)
        parser = _MetaDescriptionParser()
        parser.feed(payload.decode("utf-8", errors="replace"))
        description = parser.article_text()
        normalized_description = normalize(description)
        if (
            "copertura giornalistica completa e aggiornata" in normalized_description
            and "google news" in normalized_description
        ):
            return "", ""
        return description, parser.published_at
    except Exception:
        return "", ""


def fetch_article_description(url: str) -> str:
    description, _published_at = fetch_article_context(url)
    return description


def enrich_item_description(source: Source, item: dict[str, str]) -> bool:
    article_title, _publisher = split_title_and_publisher(item.get("title", ""), source.name)
    if not source.enrich_article or not is_low_quality_description(item.get("description", ""), article_title):
        return False
    description, published_at = fetch_article_context(item.get("link", ""))
    if not description:
        return False
    item["description"] = description
    if parse_published_at(published_at):
        item["published"] = published_at
    return True


def effective_source_trust(source: Source, publisher: str) -> str:
    publisher_norm = normalize(publisher)
    if "news.google.com" in source.url:
        if any(marker in publisher_norm for marker in INSTITUTIONAL_PUBLISHER_MARKERS):
            return "institutional"
        if source.trust == "social-public":
            return "social-public"
        return "news"
    if source.trust in {"verified-media", "city-keyword"}:
        return "news"
    return source.trust


def utc_now() -> dt.datetime:
    return dt.datetime.now(dt.UTC).replace(tzinfo=None)


def parse_published_at(value: str) -> dt.datetime | None:
    if not value:
        return None
    raw_value = html.unescape(clean_text(value, 100)).strip()

    def as_utc_naive(parsed: dt.datetime) -> dt.datetime:
        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=ITALY_TIMEZONE)
        return parsed.astimezone(dt.UTC).replace(tzinfo=None)

    try:
        return as_utc_naive(email.utils.parsedate_to_datetime(raw_value))
    except (TypeError, ValueError):
        pass

    iso_value = raw_value.replace("Z", "+00:00")
    try:
        return as_utc_naive(dt.datetime.fromisoformat(iso_value))
    except ValueError:
        pass

    for date_format in (
        "%d/%m/%Y %H:%M:%S",
        "%d/%m/%Y %H:%M",
        "%d-%m-%Y %H:%M:%S",
        "%d-%m-%Y %H:%M",
        "%Y/%m/%d %H:%M:%S",
        "%Y/%m/%d %H:%M",
    ):
        try:
            return as_utc_naive(dt.datetime.strptime(raw_value, date_format))
        except ValueError:
            continue
    return None


def is_recent_enough(published_at: dt.datetime | None) -> bool:
    if published_at is None:
        return True
    return published_at >= utc_now() - MAX_NEWS_AGE


def fetch_url(url: str, timeout: int = 20) -> bytes:
    headers = {
        "User-Agent": USER_AGENT,
        "Accept": "application/rss+xml, application/xml, text/xml, text/html;q=0.8, */*;q=0.5",
        "Accept-Language": "it-IT,it;q=0.9,en;q=0.5",
    }
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as response:
            return response.read()
    except urllib.error.HTTPError as exc:
        if exc.code != 403:
            raise
        retry_headers = dict(headers)
        retry_headers["User-Agent"] = (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 Chrome/124.0 Safari/537.36 Sentinel/1.1"
        )
        retry = urllib.request.Request(url, headers=retry_headers)
        with urllib.request.urlopen(retry, timeout=timeout) as response:
            return response.read()


def _municipality_rows_from_payload(payload: bytes) -> list[dict]:
    rows = json.loads(payload.decode("utf-8"))
    if not isinstance(rows, list):
        raise ValueError("Formato anagrafica comuni non valido")
    return [
        row for row in rows
        if isinstance(row, dict)
        and (row.get("regione") or {}).get("nome") in ACTIVE_REGIONS
        and row.get("nome")
        and row.get("coordinate")
    ]


def load_active_region_municipalities() -> dict[str, int | str]:
    """Recognize all active-region towns and deeply scan the four metro areas."""
    rows = []
    origin = "fallback"
    try:
        rows = _municipality_rows_from_payload(fetch_url(MUNICIPALITY_DATA_URL, timeout=45))
        MUNICIPALITY_CACHE.parent.mkdir(parents=True, exist_ok=True)
        MUNICIPALITY_CACHE.write_text(
            json.dumps(rows, ensure_ascii=False, separators=(",", ":")),
            encoding="utf-8",
        )
        origin = "online"
    except Exception:
        try:
            rows = _municipality_rows_from_payload(MUNICIPALITY_CACHE.read_bytes())
            origin = "cache"
        except Exception:
            rows = []

    region_sets = {
        "Lombardia": LOMBARDIA_CITIES,
        "Lazio": LAZIO_CITIES,
        "Campania": CAMPANIA_CITIES,
        "Emilia-Romagna": EMILIA_ROMAGNA_CITIES,
    }
    municipalities_by_focus = {area: [] for area in FOCUS_METROPOLITAN_AREAS}
    recognized_municipalities = 0

    for row in rows:
        region = row["regione"]["nome"]
        name = clean_text(row["nome"])
        key = normalize(name)
        coordinates = row.get("coordinate") or {}
        try:
            coords = (float(coordinates["lat"]), float(coordinates["lng"]))
        except (KeyError, TypeError, ValueError):
            continue
        region_sets[region].add(key)
        RECOGNIZED_CITIES.add(key)
        CITY_COORDS[key] = coords
        recognized_municipalities += 1
        province = (row.get("provincia") or {}).get("nome")
        if province in municipalities_by_focus:
            municipalities_by_focus[province].append(name)

    SOURCES[:] = [source for source in SOURCES if not source.name.startswith("focus-")]
    for source_name in tuple(SOURCE_BY_NAME):
        if source_name.startswith("focus-"):
            del SOURCE_BY_NAME[source_name]

    dynamic_sources = []
    for area, municipalities in municipalities_by_focus.items():
        ordered = sorted(set(municipalities), key=normalize)
        slug = FOCUS_METROPOLITAN_AREAS[area]
        batch_size = FOCUS_MUNICIPALITIES_PER_QUERY.get(area, MUNICIPALITIES_PER_QUERY)
        for index in range(0, len(ordered), batch_size):
            batch = tuple(ordered[index:index + batch_size])
            source = municipality_source(
                f"focus-{slug}-comuni-{index // batch_size + 1:03d}",
                batch,
                enrich_article=True,
            )
            dynamic_sources.append(source)

    SOURCES.extend(dynamic_sources)
    SOURCE_BY_NAME.update({source.name: source for source in dynamic_sources})
    return {
        "municipalities": recognized_municipalities,
        "focus_municipalities": sum(len(items) for items in municipalities_by_focus.values()),
        "municipality_sources": len(dynamic_sources),
        "origin": origin,
    }


def xml_local_name(tag: str) -> str:
    return tag.rsplit("}", 1)[-1].lower()


def xml_child_text(element: ET.Element, *names: str) -> str:
    accepted = {name.lower() for name in names}
    for child in element:
        if xml_local_name(child.tag) in accepted:
            value = "".join(child.itertext())
            if value.strip():
                return clean_text(value)
    return ""


def xml_entry_link(element: ET.Element) -> str:
    for child in element:
        if xml_local_name(child.tag) != "link":
            continue
        href = clean_text(child.attrib.get("href"))
        relation = child.attrib.get("rel", "alternate").lower()
        if href and relation in {"", "alternate"}:
            return href
        text_link = clean_text("".join(child.itertext()))
        if text_link:
            return text_link
    return ""


def parse_rss(payload: bytes) -> list[dict[str, str]]:
    text = payload.decode("utf-8", errors="replace")
    text = re.sub(r"&(?!amp;|lt;|gt;|quot;|apos;|#[0-9]+;|#x[0-9a-fA-F]+;)", "&amp;", text)
    root = ET.fromstring(text.encode("utf-8"))
    items = []
    rss_items = [element for element in root.iter() if xml_local_name(element.tag) == "item"]
    for item in rss_items:
        title = xml_child_text(item, "title")
        link = xml_entry_link(item)
        description = clean_text(xml_child_text(item, "description", "summary", "content", "encoded"), 450)
        published = xml_child_text(item, "pubdate", "date", "published", "updated")
        guid = xml_child_text(item, "guid", "id") or link or title
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

    atom_entries = [element for element in root.iter() if xml_local_name(element.tag) == "entry"]
    for entry in atom_entries:
        title = xml_child_text(entry, "title")
        link = xml_entry_link(entry)
        description = clean_text(xml_child_text(entry, "summary", "content", "description"), 450)
        published = xml_child_text(entry, "published", "updated", "date")
        guid = xml_child_text(entry, "id", "guid") or link or title
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


def fetch_source_items(source: Source) -> list[dict[str, str]]:
    payload = fetch_url(source.url, timeout=12)
    return parse_feed(payload)[:MAX_ITEMS_PER_SOURCE]


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


def format_city_name(city: str) -> str:
    words = city.title().split()
    lowered = {"A", "Al", "Alla", "D'", "Da", "Dei", "Del", "Della", "Di", "In", "Sul"}
    return " ".join(word.lower() if index and word in lowered else word for index, word in enumerate(words))


def find_city_mentions(text: str) -> list[tuple[int, int, str]]:
    mentions = []
    for city in RECOGNIZED_CITIES:
        for match in re.finditer(rf"\b{re.escape(city)}\b", text):
            prefix = text[max(0, match.start() - 30) : match.start()]
            if re.search(
                r"\b(?:via|viale|corso|piazza|piazzale|largo|vicolo|strada)\s+$",
                prefix,
            ):
                continue
            mentions.append((match.start(), -len(city), city))
    return sorted(mentions)


def unique_city_mentions(text: str) -> list[str]:
    result = []
    mentions = find_city_mentions(text)
    for position, _negative_length, city in mentions:
        end = position + len(city)
        nested_in_longer_place = any(
            other_position <= position
            and end <= other_position + len(other_city)
            and len(other_city) > len(city)
            for other_position, _other_negative_length, other_city in mentions
        )
        if nested_in_longer_place:
            continue
        if city not in result:
            result.append(city)
    return result


def detect_event_city_from_context(text: str) -> str | None:
    event_patterns = [
        r"\b(?:svincolo(?:\s+di)?|casello(?:\s+di)?|uscita(?:\s+di)?|tratto(?:\s+di|\s+tra)?)\s+",
        r"\b(?:incendio|fiamme|rogo|nubifragio|temporale|allerta|scontro|incidente|rapina|aggressione|furto|omicidio|arresto|arresti|denuncia|rissa|terremoto|controlli)\s+(?:a|ad|in|nelle campagne di|vicino a|nei pressi di)\s+",
        r"\b(?:accade|avviene|divampa|scoppia|crolla|chiusa|bloccata)\s+(?:a|ad|in|vicino a|nei pressi di)\s+",
    ]
    for pattern in event_patterns:
        for prefix in re.finditer(pattern, text):
            window = text[prefix.end() : prefix.end() + 90]
            mentions = find_city_mentions(window)
            if mentions:
                return format_city_name(mentions[0][2])
    return None


def detect_city_evidence(
    title: str,
    description: str,
    source_name: str | None = None,
) -> tuple[str, str] | None:
    article_title, title_publisher = split_title_and_publisher(title, source_name)
    article_description = clean_feed_description(description, article_title)
    title_text = normalize(article_title)
    description_text = normalize(article_description)

    city_from_context = detect_event_city_from_context(title_text)
    if city_from_context:
        return city_from_context, "title-context"

    title_mentions = unique_city_mentions(title_text)
    if len(title_mentions) == 1:
        return format_city_name(title_mentions[0]), "title"
    if len(title_mentions) > 1:
        return None

    city_from_context = detect_event_city_from_context(description_text)
    if city_from_context:
        return city_from_context, "description-context"

    description_mentions = unique_city_mentions(description_text)
    if len(description_mentions) == 1:
        return format_city_name(description_mentions[0]), "description"
    if len(description_mentions) > 1:
        return None

    combined_text = f"{title_text} {description_text}".strip()
    for alias, city in sorted(LOCATION_ALIASES.items(), key=lambda item: len(item[0]), reverse=True):
        if re.search(rf"\b{re.escape(alias)}\b", combined_text):
            return format_city_name(city), "location-alias"

    publisher = title_publisher
    source = SOURCE_BY_NAME.get(source_name or "")
    if not publisher and source and source.display_name:
        publisher = source.display_name
    publisher_norm = normalize(publisher)
    publisher_compact = re.sub(r"[^a-z0-9]", "", publisher_norm)
    for alias, city in sorted(PUBLISHER_CITY_ALIASES.items(), key=lambda item: len(item[0]), reverse=True):
        compact_alias = re.sub(r"[^a-z0-9]", "", normalize(alias))
        if publisher_compact and compact_alias == publisher_compact:
            return format_city_name(city), "publisher"

    fallback_city = SOURCE_FALLBACK_CITY.get(source_name or "")
    if fallback_city:
        return format_city_name(fallback_city), "publisher"
    return None


def detect_city(title: str, description: str, source_name: str | None = None) -> str | None:
    evidence = detect_city_evidence(title, description, source_name)
    return evidence[0] if evidence else None


def explicit_recognized_city(
    title: str,
    description: str,
    source_name: str | None = None,
) -> str | None:
    evidence = detect_city_evidence(title, description, source_name)
    if not evidence or evidence[1] == "publisher":
        return None
    return evidence[0] if normalize(evidence[0]) in RECOGNIZED_CITIES else None


def geocode_place(place: str) -> tuple[float, float] | None:
    query = urllib.parse.urlencode({"q": f"{place}, Italia", "format": "json", "limit": "1", "addressdetails": "1"})
    url = f"https://nominatim.openstreetmap.org/search?{query}"
    try:
        data = json.loads(fetch_url(url).decode("utf-8"))
    except Exception:
        return None
    if not data:
        return None
    address = data[0].get("address") or {}
    if address.get("country_code") != "it":
        return None
    return float(data[0]["lat"]), float(data[0]["lon"])


BLOCKED_PLACE_WORDS = {
    "croce", "rossa", "guardia", "finanza", "polizia", "carabinieri", "vigili",
    "fuoco", "ministero", "ansa", "agi", "adnkronos", "google", "italia",
    "sardegna", "sardo", "sarda", "isola", "sicilia", "piemonte", "lombardia",
    "abruzzo", "molise", "veneto", "toscana", "lazio", "campania", "puglia",
    "calabria", "liguria", "umbria", "basilicata", "europa", "stato",
    "jrc", "oms", "unicef", "oxfam", "caracas", "cannes", "montreal", "stade",
    "venezuela", "spagna", "portogallo", "slovenia", "germania", "canada",
    "francia", "ucraina", "russia", "andorra", "austria", "svizzera",
    "croazia", "grecia", "turchia", "marocco", "tunisia", "libia", "egitto",
    "aurora", "elvo", "calore",
}

BLOCKED_PLACE_NAMES = {
    "case di comunita",
    "case di comunitÃ ",
    "san giorgio",
    "stato",
    "jrc",
    "oms",
    "europa",
    "venezuela",
    "spagna",
    "portogallo",
    "slovenia",
    "germania",
    "canada",
    "francia",
    "cannes",
    "montreal",
    "stade",
    "caracas",
    "aurora",
    "elvo",
    "calore",
}

BROAD_PUBLISHER_ALIASES = {
    "corriere della sera": "Milano",
    "il giorno": "Milano",
    "la stampa": "Torino",
    "il messaggero": "Roma",
    "il mattino": "Napoli",
    "la nazione": "Firenze",
    "il resto del carlino": "Bologna",
    "resto del carlino": "Bologna",
    "corriere adriatico": "Ancona",
    "gazzetta del sud": "Messina",
    "la sicilia": "Catania",
    "alto adige": "Bolzano",
    "trentino": "Trento",
    "il piccolo": "Trieste",
    "messaggero veneto": "Udine",
    "arena": "Verona",
    "il tirreno": "Livorno",
    "siciliano": "Palermo",
    "laziale": "Roma",
    "campano": "Napoli",
    "pugliese": "Bari",
    "calabrese": "Catanzaro",
    "abruzzese": "L'Aquila",
    "molisano": "Campobasso",
    "lucano": "Potenza",
    "marchigiano": "Ancona",
    "umbro": "Perugia",
    "valdostano": "Aosta",
}


def detect_named_place(title: str, description: str) -> str | None:
    text = f"{title}. {description}"
    pattern = re.compile(
        r"\b(?:a|ad|in|di|da|su|tra|fra|nel|nella|nelle|dalla|dalle|verso)\s+"
        r"([A-ZÃ€-Ã][A-Za-zÃ€-Ã¿']+(?:\s+(?:al|alla|del|della|di|sul|sulla|[A-ZÃ€-Ã][A-Za-zÃ€-Ã¿']+)){0,3})"
    )
    for match in pattern.finditer(text):
        candidate = clean_text(match.group(1), 80).strip(" .,:;-")
        candidate_norm = normalize(candidate)
        words = [normalize(word) for word in candidate.split()]
        if candidate_norm in BLOCKED_PLACE_WORDS:
            continue
        if candidate_norm in BLOCKED_PLACE_NAMES:
            continue
        if not candidate or any(word in BLOCKED_PLACE_WORDS for word in words):
            continue
        if len(words) == 1 and candidate_norm not in RECOGNIZED_CITIES:
            continue
        if len(candidate) < 3:
            continue
        return candidate
    return None



def detect_detailed_place(title: str, description: str, city: str) -> str | None:
    text = strip_sentinel_note(f"{title}. {description}")
    city_norm = normalize(city)
    place_types = (
        r"via|viale|corso|piazza|piazzale|lungomare|strada|statale|provinciale|"
        r"tangenziale|autostrada|zona|quartiere|porto|stazione|aeroporto|"
        r"ospedale|hotel|spiaggia|parco|giardini|localita|frazione|lido|marina|"
        r"centro commerciale|casello|svincolo|canale|darsena"
    )
    patterns = [
        rf"\b(?:in|a|ad|al|alla|su|presso|vicino a|nei pressi di|sulla|sul|nella|nel)\s+(({place_types})\s+[\w' .-]{{2,80}}?)(?=\s[-\u2013\u2014]\s|[,;:!?]|\.|$)",
        rf"\b(({place_types})\s+[\w' .-]{{2,80}}?)(?=\s[-\u2013\u2014]\s|[,;:!?]|\.|$)",
    ]
    for pattern in patterns:
        match = re.search(pattern, text, flags=re.I)
        if not match:
            continue
        candidate = clean_text(match.group(1), 110).strip(" .,:;-")
        candidate_norm = normalize(candidate)
        if not candidate or candidate_norm in BLOCKED_PLACE_NAMES:
            continue
        if any(word in BLOCKED_PLACE_WORDS for word in candidate_norm.split()):
            continue
        if city_norm not in candidate_norm:
            candidate = f"{candidate}, {city}"
        return candidate
    return None

def coordinates_for(
    title: str,
    description: str,
    source_name: str | None = None,
    allow_geocode: bool = True,
) -> tuple[float, float, str, str, bool] | None:
    city_evidence = detect_city_evidence(title, description, source_name)
    if not city_evidence:
        return None

    city, location_method = city_evidence
    key = city.lower()
    if allow_geocode:
        detailed_place = detect_detailed_place(title, description, city)
        if detailed_place:
            coords = geocode_place(detailed_place)
            time.sleep(GEOCODE_DELAY_SECONDS)
            city_center = CITY_COORDS.get(key)
            is_near_city = bool(coords) and (
                not city_center
                or distance_km(city_center[0], city_center[1], coords[0], coords[1]) <= 45
            )
            if coords and is_near_city:
                return coords[0], coords[1], city, detailed_place, True
    if location_method == "publisher":
        return None
    if key in CITY_COORDS:
        lat, lon = CITY_COORDS[key]
        return lat, lon, city, city, location_method != "publisher"
    if allow_geocode:
        coords = geocode_place(city)
        time.sleep(GEOCODE_DELAY_SECONDS)
        if coords:
            return coords[0], coords[1], city, city, True

    return None



def distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    radius = 6371.0
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    a = (
        math.sin(d_lat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(d_lon / 2) ** 2
    )
    return radius * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def allowed_area_for(city: str, lat: float, lon: float) -> str | None:
    key = normalize(city)
    if key in EMILIA_ROMAGNA_CITIES:
        return "Emilia-Romagna"
    if key in LOMBARDIA_CITIES:
        return "Lombardia"
    if key in LAZIO_CITIES:
        return "Lazio"
    if key in CAMPANIA_CITIES:
        return "Campania"
    return None


def is_allowed_area(city: str, lat: float, lon: float) -> bool:
    return allowed_area_for(city, lat, lon) is not None

def concise_event_description(title: str, description: str) -> str:
    body = clean_feed_description(description, title)
    if body:
        sentences = re.split(r"(?<=[.!?])\s+", body)
        selected = [sentences[0]]
        if len(sentences) > 1 and sentences[1].rstrip().endswith((".", "!", "?")):
            selected.append(sentences[1])
        concise = " ".join(selected).strip()
        if concise and not concise.endswith((".", "!", "?", "...")):
            concise = concise.rstrip(" ,;:") + "..."
        if len(concise) > 360:
            concise = concise[:357].rsplit(" ", 1)[0] + "..."
        return concise
    headline = clean_text(title, 300).rstrip(" .")
    return f"La fonte segnala: {headline}."


def make_description(
    title: str,
    description: str,
    publisher: str,
    city: str,
    address: str,
) -> str:
    body = concise_event_description(title, description)
    details = f"Fonte: {publisher}. Localizzazione: {address or city}."
    return clean_text(f"{body} {details}", 700)


def source_trust_value(trust: str, position_from_text: bool) -> str:
    if trust == "institutional" and position_from_text:
        return "institutional-geo"
    if trust == "institutional":
        return "institutional-reference"
    if trust == "social-public":
        return "social-unverified"
    if position_from_text:
        return f"{trust}-geo"
    return f"{trust}-reference"


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

    raw_title = clean_text(item["title"], 220)
    title, title_publisher = split_title_and_publisher(raw_title, source.name)
    title = clean_text(title, 160)
    description = clean_text(item["description"], 420)
    if not is_relevant_incident(title, description):
        return False

    publisher = source_display_name(source, title_publisher)
    trust = effective_source_trust(source, publisher)
    coords = coordinates_for(raw_title, description, source.name, allow_geocode=True)
    if coords is None:
        if existing:
            existing.last_seen_at = now
        return False
    lat, lon, city, address, position_from_text = coords
    if not is_allowed_area(city, lat, lon):
        return False
    description_with_reference = make_description(title, description, publisher, city, address)

    if existing:
        existing.title = title
        existing.description = description_with_reference
        existing.type = classify_type(title, description, source.default_type)
        existing.severity = classify_severity(title, description)
        existing.latitude = lat
        existing.longitude = lon
        existing.address = address
        existing.city = city
        existing.source_trust = source_trust_value(trust, position_from_text)
        if published_at is not None:
            existing.created_date = published_at
        existing.last_seen_at = now
        if item["link"] and not any(media.url == item["link"] for media in existing.media):
            db.add(Media(incident_id=existing.id, url=item["link"], type="document"))
        return False

    duplicate = db.query(Incident).filter(
        Incident.source.isnot(None),
        Incident.title == title,
    ).first()
    if duplicate:
        duplicate_date = duplicate.created_date or now
        item_date = published_at or now
        if abs((duplicate_date - item_date).total_seconds()) <= 48 * 60 * 60:
            duplicate.last_seen_at = now
            if item["link"] and not any(media.url == item["link"] for media in duplicate.media):
                db.add(Media(incident_id=duplicate.id, url=item["link"], type="document"))
            return False

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
        source_trust=source_trust_value(trust, position_from_text),
        last_seen_at=now,
        reported_by_id="sentinel-bot",
        reporter_karma=1000 if trust == "institutional" else 650,
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
                Incident.address.like("%sede istituzionale%")
                | Incident.address.like("%posizione generica%")
            ),
        )
        .all()
    )
    updated = 0
    removed = 0
    for incident in fallback_events:
        coords = coordinates_for(incident.title, incident.description, incident.source, allow_geocode=False)
        if coords is None:
            if "sede istituzionale" in (incident.address or "").lower() or "posizione generica" in (incident.address or "").lower():
                db.delete(incident)
                removed += 1
            continue
        lat, lon, city, address, _position_from_text = coords
        incident.latitude = lat
        incident.longitude = lon
        incident.city = city
        incident.address = address
        updated += 1
    return {"updated_generic_locations": updated, "removed_generic_locations": removed}


def cleanup_sardinia_regional_locations(db) -> dict[str, int]:
    regional_sources = [
        "google-news-sardegna-cronaca",
        "google-news-isole-incendi-meteo",
    ]
    regional_publishers = [
        "unione sarda",
        "l'unione sarda",
        "sardegnalive",
        "sardinia post",
        "sardiniapost",
        "la nuova sardegna",
    ]
    candidates = (
        db.query(Incident)
        .filter(
            Incident.source.in_(regional_sources),
            Incident.city.in_(["Cagliari", "Sardegna"]),
        )
        .all()
    )
    updated = 0
    removed = 0
    for incident in candidates:
        raw_description = strip_sentinel_note(incident.description)
        text = normalize(f"{incident.title} {raw_description}")
        is_regional_publisher = any(publisher in text for publisher in regional_publishers)
        explicit_cagliari = any(
            cue in text
            for cue in [
                "cagliari",
                "cagliaritano",
                "cagliaritoday",
                "comune di cagliari",
                "universita di cagliari",
                "universitÃ  di cagliari",
            ]
        )
        if explicit_cagliari and not is_regional_publisher:
            continue
        coords = coordinates_for(incident.title, raw_description, incident.source, allow_geocode=False)
        if coords is None:
            db.delete(incident)
            removed += 1
            continue
        lat, lon, city, address, _position_from_text = coords
        if city != incident.city or address != incident.address:
            incident.latitude = lat
            incident.longitude = lon
            incident.city = city
            incident.address = address
            updated += 1
    return {"updated_sardinia_locations": updated, "removed_sardinia_locations": removed}


def cleanup_region_locations(db) -> dict[str, int]:
    region_names = [
        "Sardegna",
        "Sicilia",
        "Piemonte",
        "Lombardia",
        "Abruzzo",
        "Molise",
        "Veneto",
        "Toscana",
        "Lazio",
        "Campania",
        "Puglia",
        "Calabria",
        "Liguria",
        "Umbria",
        "Basilicata",
        "Marche",
        "Emilia-Romagna",
        "Friuli Venezia Giulia",
        "Valle d'Aosta",
        "Trentino-Alto Adige",
    ]
    candidates = (
        db.query(Incident)
        .filter(
            Incident.source.isnot(None),
            Incident.city.in_(region_names),
        )
        .all()
    )
    updated = 0
    removed = 0
    for incident in candidates:
        raw_description = strip_sentinel_note(incident.description)
        coords = coordinates_for(incident.title, raw_description, incident.source, allow_geocode=False)
        if coords is None:
            db.delete(incident)
            removed += 1
            continue
        lat, lon, city, address, _position_from_text = coords
        incident.latitude = lat
        incident.longitude = lon
        incident.city = city
        incident.address = address
        updated += 1
    return {"updated_region_locations": updated, "removed_region_locations": removed}


def cleanup_invalid_locations(db) -> dict[str, int]:
    invalid_names = set(BLOCKED_PLACE_NAMES)
    invalid_names.update(name for name in BLOCKED_PLACE_WORDS if name not in CITY_COORDS)
    candidates = db.query(Incident).filter(Incident.source.isnot(None)).all()
    removed = 0
    for incident in candidates:
        if normalize(incident.city) in invalid_names:
            db.delete(incident)
            removed += 1
    return {"removed_invalid_locations": removed}


def remove_broad_publishers_from_text(text: str) -> str:
    cleaned = text or ""
    for publisher in BROAD_PUBLISHER_ALIASES:
        cleaned = re.sub(rf"\b{re.escape(publisher)}\b", " ", cleaned, flags=re.I)
    return cleaned


def cleanup_broad_publisher_locations(db) -> dict[str, int]:
    target_cities = sorted(set(BROAD_PUBLISHER_ALIASES.values()))
    candidates = (
        db.query(Incident)
        .filter(
            Incident.source.isnot(None),
            Incident.city.in_(target_cities),
        )
        .all()
    )
    updated = 0
    removed = 0
    for incident in candidates:
        raw_description = strip_sentinel_note(incident.description)
        full_text = normalize(f"{incident.title} {raw_description}")
        matching_publishers = [
            publisher
            for publisher, city in BROAD_PUBLISHER_ALIASES.items()
            if city == incident.city and publisher in full_text
        ]
        if not matching_publishers:
            continue

        title_without_publisher = remove_broad_publishers_from_text(incident.title)
        description_without_publisher = remove_broad_publishers_from_text(raw_description)
        coords = coordinates_for(
            title_without_publisher,
            description_without_publisher,
            incident.source,
            allow_geocode=False,
        )
        if coords is None:
            db.delete(incident)
            removed += 1
            continue
        lat, lon, city, address, _position_from_text = coords
        if city != incident.city or address != incident.address:
            incident.latitude = lat
            incident.longitude = lon
            incident.city = city
            incident.address = address
            updated += 1
    return {"updated_broad_publisher_locations": updated, "removed_broad_publisher_locations": removed}


def cleanup_location_evidence(db) -> dict[str, int]:
    candidates = (
        db.query(Incident)
        .filter(Incident.source.in_(list(SOURCE_BY_NAME)))
        .all()
    )
    updated = 0
    removed = 0
    for incident in candidates:
        raw_description = strip_sentinel_note(incident.description)
        if not is_relevant_incident(incident.title, raw_description):
            db.delete(incident)
            removed += 1
            continue

        coords = coordinates_for(
            incident.title,
            raw_description,
            incident.source,
            allow_geocode=False,
        )
        if coords is None:
            saved_city = explicit_recognized_city(
                incident.title,
                raw_description,
                incident.source,
            )
            has_saved_verified_municipality = bool(
                saved_city
                and is_allowed_area(
                    saved_city,
                    incident.latitude,
                    incident.longitude,
                )
            )
            if has_saved_verified_municipality:
                continue
            has_precise_saved_address = bool(
                incident.address
                and normalize(incident.address) != normalize(incident.city)
                and "generica" not in normalize(incident.address)
                and "istituzionale" not in normalize(incident.address)
            )
            if has_precise_saved_address:
                continue
            db.delete(incident)
            removed += 1
            continue

        lat, lon, city, address, _position_from_text = coords
        if city != incident.city or address != incident.address:
            incident.latitude = lat
            incident.longitude = lon
            incident.city = city
            incident.address = address
            updated += 1
    return {
        "updated_location_evidence": updated,
        "removed_without_location_evidence": removed,
    }


def cleanup_duplicate_incidents(db) -> int:
    candidates = (
        db.query(Incident)
        .filter(Incident.source.in_(list(SOURCE_BY_NAME)))
        .order_by(Incident.created_date.asc())
        .all()
    )
    seen_by_link: dict[str, Incident] = {}
    seen_by_title: dict[tuple[str, str], Incident] = {}
    seen_by_precise_event: dict[tuple[str, str], Incident] = {}
    removed = 0
    for incident in candidates:
        links = [media.url for media in incident.media if media.url]
        title, _publisher = split_title_and_publisher(incident.title, incident.source)
        normalized_title = re.sub(r"[^a-z0-9]+", " ", normalize(title)).strip()
        key = (normalized_title, normalize(incident.city))
        precise_address = bool(
            incident.address
            and normalize(incident.address) != normalize(incident.city)
        )
        event_key = (incident.type, normalize(incident.address))
        primary = next((seen_by_link[url] for url in links if url in seen_by_link), None)
        if primary is None:
            possible = seen_by_title.get(key)
            if possible and possible.created_date and incident.created_date:
                if abs((possible.created_date - incident.created_date).total_seconds()) <= 48 * 60 * 60:
                    primary = possible
        if primary is None and precise_address:
            possible = seen_by_precise_event.get(event_key)
            if possible and possible.created_date and incident.created_date:
                if abs((possible.created_date - incident.created_date).total_seconds()) <= 2 * 60 * 60:
                    primary = possible
        if primary is None:
            for url in links:
                seen_by_link[url] = incident
            seen_by_title[key] = incident
            if precise_address:
                seen_by_precise_event[event_key] = incident
            continue

        existing_urls = {media.url for media in primary.media}
        for media in incident.media:
            if media.url and media.url not in existing_urls:
                db.add(Media(incident_id=primary.id, url=media.url, type=media.type))
                existing_urls.add(media.url)
        primary.last_seen_at = max(
            primary.last_seen_at or primary.created_date,
            incident.last_seen_at or incident.created_date,
        )
        if len(incident.description or "") > len(primary.description or ""):
            primary.description = incident.description
        primary.source_trust = "corroborated-geo"
        primary.reporter_karma = max(primary.reporter_karma or 0, 900)
        db.delete(incident)
        removed += 1
    return removed


def cleanup_old_incidents(db) -> int:
    cutoff = utc_now() - MAX_NEWS_AGE
    old_incidents = (
        db.query(Incident)
        .filter(
            Incident.source.isnot(None),
            Incident.created_date < cutoff,
        )
        .all()
    )
    removed = len(old_incidents)
    for incident in old_incidents:
        db.delete(incident)
    return removed


def ensure_sentinel_bot(db) -> None:
    if db.get(User, "sentinel-bot") is None:
        db.add(User(id="sentinel-bot", name="Sentinel Bot", karma=1000))
        db.flush()


def main(*, perform_maintenance: bool = False) -> dict:
    municipality_catalog = load_active_region_municipalities()
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    added = 0
    seen = 0
    failed_items = 0
    failed_sources = []

    try:
        ensure_sentinel_bot(db)
        db.commit()
        removed_old = cleanup_old_incidents(db)
        db.commit()
        cleanup_result = {"updated_generic_locations": 0, "removed_generic_locations": 0}
        sardinia_cleanup_result = {"updated_sardinia_locations": 0, "removed_sardinia_locations": 0}
        region_cleanup_result = {"updated_region_locations": 0, "removed_region_locations": 0}
        invalid_cleanup_result = {"removed_invalid_locations": 0}
        broad_publisher_cleanup_result = {
            "updated_broad_publisher_locations": 0,
            "removed_broad_publisher_locations": 0,
        }
        evidence_cleanup_result = {
            "updated_location_evidence": 0,
            "removed_without_location_evidence": 0,
        }
        if perform_maintenance:
            cleanup_result = cleanup_generic_locations(db)
            sardinia_cleanup_result = cleanup_sardinia_regional_locations(db)
            region_cleanup_result = cleanup_region_locations(db)
            invalid_cleanup_result = cleanup_invalid_locations(db)
            broad_publisher_cleanup_result = cleanup_broad_publisher_locations(db)
            evidence_cleanup_result = cleanup_location_evidence(db)
            db.commit()
        with ThreadPoolExecutor(max_workers=FEED_DOWNLOAD_WORKERS) as executor:
            pending = {
                executor.submit(fetch_source_items, source): source
                for source in SOURCES
            }
            for completed_count, future in enumerate(as_completed(pending), start=1):
                source = pending[future]
                try:
                    items = future.result()
                except Exception as exc:
                    failed_sources.append(f"{source.name}: {exc}")
                    continue

                enriched_items = 0
                for item in items:
                    seen += 1
                    if (
                        enriched_items < MAX_ARTICLE_ENRICHMENTS_PER_SOURCE
                        and is_relevant_incident(item.get("title", ""), item.get("description", ""))
                    ):
                        enrich_item_description(source, item)
                        enriched_items += 1
                    try:
                        with db.begin_nested():
                            item_added = save_item(db, source, item)
                        if item_added:
                            added += 1
                    except SQLAlchemyError as exc:
                        failed_items += 1
                        print(f"Notizia saltata da {source.name}: {exc.__class__.__name__}")

                db.commit()

                if completed_count % 20 == 0 or completed_count == len(SOURCES):
                    print(f"Fonti elaborate: {completed_count}/{len(SOURCES)}")

        removed_duplicates = cleanup_duplicate_incidents(db)
        db.commit()
    finally:
        db.close()

    print(
        "Comuni attivi caricati: "
        f"{municipality_catalog['municipalities']} "
        f"({municipality_catalog['origin']}, "
        f"{municipality_catalog['focus_municipalities']} prioritari, "
        f"{municipality_catalog['municipality_sources']} gruppi di ricerca)"
    )
    print(f"Fonti lette: {len(SOURCES) - len(failed_sources)}/{len(SOURCES)}")
    print(f"Notizie analizzate: {seen}")
    print(f"Nuovi eventi aggiunti: {added}")
    print(f"Notizie non salvate per errore database: {failed_items}")
    print(f"Notizie oltre 30 giorni rimosse: {removed_old}")
    print(f"Posizioni generiche corrette: {cleanup_result['updated_generic_locations']}")
    print(f"Posizioni generiche rimosse: {cleanup_result['removed_generic_locations']}")
    print(f"Posizioni Sardegna corrette: {sardinia_cleanup_result['updated_sardinia_locations']}")
    print(f"Posizioni Sardegna rimosse: {sardinia_cleanup_result['removed_sardinia_locations']}")
    print(f"Posizioni regioni corrette: {region_cleanup_result['updated_region_locations']}")
    print(f"Posizioni regioni rimosse: {region_cleanup_result['removed_region_locations']}")
    print(f"Posizioni impossibili rimosse: {invalid_cleanup_result['removed_invalid_locations']}")
    print(f"Posizioni da testate ampie corrette: {broad_publisher_cleanup_result['updated_broad_publisher_locations']}")
    print(f"Posizioni da testate ampie rimosse: {broad_publisher_cleanup_result['removed_broad_publisher_locations']}")
    print(f"Posizioni corrette con nuova verifica: {evidence_cleanup_result['updated_location_evidence']}")
    print(f"Eventi senza luogo verificabile rimossi: {evidence_cleanup_result['removed_without_location_evidence']}")
    print(f"Duplicati uniti: {removed_duplicates}")
    if failed_sources:
        print("Fonti saltate:")
        for failed in failed_sources:
            print(f"- {failed}")

    return {
        "municipality_catalog": municipality_catalog,
        "sources_read": len(SOURCES) - len(failed_sources),
        "sources_total": len(SOURCES),
        "items_seen": seen,
        "added": added,
        "failed_items": failed_items,
        "removed_old": removed_old,
        **cleanup_result,
        **sardinia_cleanup_result,
        **region_cleanup_result,
        **invalid_cleanup_result,
        **broad_publisher_cleanup_result,
        **evidence_cleanup_result,
        "removed_duplicates": removed_duplicates,
        "failed_sources": failed_sources,
    }


if __name__ == "__main__":
    main(perform_maintenance=True)
