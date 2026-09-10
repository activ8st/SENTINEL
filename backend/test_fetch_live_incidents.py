import datetime as dt
import email.utils
import json
import unittest
from unittest.mock import patch

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.models import Base, Incident, Media, User
from backend.schemas import Incident as IncidentSchema

from backend.fetch_live_incidents import (
    _MetaDescriptionParser,
    ACTIVE_DIRECT_NEWS_SOURCES,
    BOLOGNA_DIRECT_SOURCES,
    FOCUS_MUNICIPALITIES_PER_QUERY,
    FOCUS_METROPOLITAN_AREAS,
    REGIONAL_LOCAL_MEDIA_SOURCES,
    REGIONAL_MUNICIPALITY_SOURCES,
    SOURCE_BY_NAME,
    SOURCES,
    allowed_area_for,
    classify_type,
    clean_feed_description,
    cleanup_location_evidence,
    cleanup_duplicate_incidents,
    concise_event_description,
    coordinates_for,
    detect_city,
    detect_city_evidence,
    detect_detailed_place,
    effective_source_trust,
    ensure_sentinel_bot,
    explicit_recognized_city,
    fetch_article_context,
    is_relevant_incident,
    likely_same_report,
    load_active_region_municipalities,
    municipality_source,
    parse_published_at,
    parse_rss,
    revalidate_ambiguous_locations,
    save_item,
    select_enrichment_jobs,
)


class IncidentImportQualityTests(unittest.TestCase):
    def test_api_serializes_database_datetimes_as_utc(self):
        incident = IncidentSchema(
            id="test-time",
            type="crime",
            title="Test",
            description="Test",
            severity="low",
            latitude=45.46,
            longitude=9.19,
            address="Milano",
            city="Milano",
            created_date=dt.datetime(2026, 8, 23, 10, 15, 48),
            last_seen_at=dt.datetime(2026, 8, 23, 10, 20),
        )
        payload = json.loads(incident.model_dump_json())
        self.assertEqual(payload["created_date"], "2026-08-23T10:15:48Z")
        self.assertEqual(payload["last_seen_at"], "2026-08-23T10:20:00Z")

    def test_iso_publication_date_is_converted_from_italian_time_to_utc(self):
        self.assertEqual(
            parse_published_at("2026-08-23T10:30:00+02:00"),
            dt.datetime(2026, 8, 23, 8, 30),
        )

    def test_json_ld_date_published_wins_over_generic_time_element(self):
        parser = _MetaDescriptionParser()
        parser.feed(
            '<time datetime="2026-08-24T09:00:00+02:00"></time>'
            '<script type="application/ld+json">'
            '{"@type":"NewsArticle","datePublished":"2026-08-23T10:30:00+02:00"}'
            '</script>'
        )
        self.assertEqual(parser.published_at, "2026-08-23T10:30:00+02:00")

    def test_namespaced_rss_date_is_preserved(self):
        items = parse_rss(
            b'<rss xmlns:dc="http://purl.org/dc/elements/1.1/"><channel><item>'
            b'<title>Incendio a Bologna</title><link>https://example.test/news</link>'
            b'<description>Intervento dei vigili del fuoco</description>'
            b'<dc:date>2026-08-23T10:30:00+02:00</dc:date>'
            b'</item></channel></rss>'
        )
        self.assertEqual(items[0]["published"], "2026-08-23T10:30:00+02:00")

    def test_sentinel_bot_is_created_once(self):
        test_engine = create_engine("sqlite:///:memory:")
        Base.metadata.create_all(test_engine)
        session = sessionmaker(bind=test_engine)()
        try:
            ensure_sentinel_bot(session)
            ensure_sentinel_bot(session)
            session.commit()
            self.assertEqual(session.query(User).filter(User.id == "sentinel-bot").count(), 1)
        finally:
            session.close()

    def test_article_parser_collects_where_when_and_body_context(self):
        parser = _MetaDescriptionParser()
        parser.feed(
            '<meta property="article:published_time" content="2026-08-20T11:30:00+02:00">'
            '<meta property="og:description" content="Incendio nel quartiere Navile.">'
            '<p>I vigili del fuoco sono intervenuti in via Stalingrado a Bologna.</p>'
        )
        self.assertEqual(parser.published_at, "2026-08-20T11:30:00+02:00")
        self.assertIn("quartiere Navile", parser.article_text())
        self.assertIn("via Stalingrado", parser.article_text())

    def test_google_news_boilerplate_is_not_used_as_article_context(self):
        payload = (
            '<meta name="description" content="Copertura giornalistica completa e aggiornata '
            'ottenuta combinando fonti attraverso Google News.">'
        ).encode("utf-8")
        with patch("backend.fetch_live_incidents.fetch_url", return_value=payload):
            self.assertEqual(fetch_article_context("https://news.google.com/example"), ("", ""))

    def test_generic_region_is_not_placed_in_ravenna(self):
        self.assertIsNone(
            detect_city(
                "Maltempo in Emilia-Romagna, quasi mille interventi",
                "Interventi diffusi in tutta la regione",
                "active-emilia-romagna-emergenze-traffico-meteo",
            )
        )

    def test_romagna_faentina_maps_to_faenza(self):
        self.assertEqual(
            detect_city(
                "Rischio incendi nei comuni della Romagna Faentina",
                "Preallarme arancione",
                "active-emilia-romagna-emergenze-traffico-meteo",
            ),
            "Faenza",
        )

    def test_multi_city_road_event_is_not_given_an_invented_point(self):
        self.assertIsNone(
            detect_city(
                "Incidente A14 tra Castel San Pietro e Ravenna",
                "Sette chilometri di coda",
                "google-news-traffico",
            )
        )

    def test_road_feature_context_selects_the_specific_locality(self):
        self.assertEqual(
            detect_city(
                "D14 per Ravenna, chiusa l'uscita dello svincolo di Fornace Zarattini",
                "Chiusura notturna",
                "ravenna-notizie-cronaca",
            ),
            "Fornace Zarattini",
        )
        self.assertEqual(
            detect_city(
                "D14, chiusure notturne del tratto Lugo-allacciamento A14",
                "Lavori in autostrada",
                "ravenna-notizie-cronaca",
            ),
            "Lugo",
        )

    def test_explicit_ravenna_and_local_towns_are_detected(self):
        self.assertEqual(
            detect_city("Ravenna. Incendio al Parco Cesarea", "", "ravenna-notizie-cronaca"),
            "Ravenna",
        )
        self.assertEqual(
            detect_city("Polizia di Ravenna: arresto a Lugo", "", "polizia-stato"),
            "Lugo",
        )
        self.assertEqual(
            detect_city("Controlli a Milano Marittima", "", "ravenna24ore-cronaca"),
            "Milano Marittima",
        )
        self.assertEqual(
            detect_city("Aggredito un uomo a Pinarella", "", "ravennatoday-rss"),
            "Pinarella",
        )
        self.assertEqual(
            detect_city("Incidente a Marina di Ravenna", "", "ravennatoday-rss"),
            "Marina di Ravenna",
        )

    def test_publisher_city_is_never_used_as_location_evidence(self):
        self.assertIsNone(
            detect_city_evidence(
                "Paura al Parco Cesarea: incendio vicino alle case",
                "",
                "ravenna24ore-cronaca",
            )
        )
        self.assertIsNone(
            coordinates_for(
                "Controlli sul litorale ravennate",
                "",
                "ravenna24ore-cronaca",
                allow_geocode=False,
            )
        )

    def test_detailed_place_is_extracted(self):
        self.assertEqual(
            detect_detailed_place(
                "Paura al Parco Cesarea: incendio vicino alle case",
                "",
                "Ravenna",
            ),
            "Parco Cesarea, Ravenna",
        )

    def test_non_incident_local_news_is_filtered(self):
        self.assertFalse(
            is_relevant_incident(
                "Grande successo per la festa del mare",
                "Concerto e premiazioni nel centro cittadino",
            )
        )
        self.assertTrue(
            is_relevant_incident(
                "Incendio al Parco Cesarea",
                "Intervento dei Vigili del Fuoco vicino alle abitazioni",
            )
        )
        self.assertTrue(
            is_relevant_incident(
                "D14 Diramazione per Ravenna, chiusa l'uscita dello svincolo",
                "Chiusura notturna per lavori",
            )
        )
        self.assertTrue(is_relevant_incident("Schianto tra auto nel Bolognese", "Due feriti"))
        self.assertTrue(is_relevant_incident("Perde il controllo della moto e muore", "",))

    def test_bologna_neighborhoods_supply_explicit_city_evidence(self):
        examples = (
            ("Incendio al Pilastro, famiglie evacuate", "Bologna"),
            ("Arrestato dopo un furto a Borgo Panigale", "Bologna"),
            ("Scontro davanti ai Giardini Margherita", "Bologna"),
        )
        for title, expected in examples:
            with self.subTest(title=title):
                self.assertEqual(detect_city(title, "", "google-news-incidenti"), expected)

    def test_feed_boilerplate_becomes_a_short_explanation(self):
        title = "Ravenna. Incendio al Parco Cesarea"
        boilerplate = "L'articolo Ravenna. Incendio al Parco Cesarea proviene da Ravenna Notizie."
        self.assertEqual(clean_feed_description(boilerplate, title), "")
        self.assertEqual(
            concise_event_description(title, boilerplate),
            "La fonte segnala: Ravenna. Incendio al Parco Cesarea.",
        )

    def test_google_query_does_not_make_a_newspaper_institutional(self):
        source = SOURCE_BY_NAME["active-emilia-romagna-emergenze-traffico-meteo"]
        self.assertEqual(effective_source_trust(source, "Il Resto del Carlino"), "news")
        self.assertEqual(effective_source_trust(source, "Regione Emilia-Romagna"), "institutional")

    def test_category_prefers_crime_and_road_closure_signals(self):
        self.assertEqual(
            classify_type(
                "Aggredito e ferito con un'arma da taglio",
                "La vittima e' stata soccorsa",
                "accident",
            ),
            "crime",
        )
        self.assertEqual(
            classify_type(
                "D14, chiusa l'uscita dello svincolo",
                "Chiusura notturna",
                "crime",
            ),
            "traffic",
        )

    def test_small_municipalities_are_recognized_without_capital_fallback(self):
        examples = (
            ("Incendio in un capannone a Morbegno", "Morbegno"),
            ("Rapina in un negozio a Caprarola", "Caprarola"),
            ("Scontro stradale a Pontecorvo", "Pontecorvo"),
            ("Allerta per una frana a Piedimonte Matese", "Piedimonte Matese"),
            ("Auto ribaltata a Sapri", "Sapri"),
        )
        for title, expected_city in examples:
            with self.subTest(title=title):
                self.assertEqual(detect_city(title, "", "google-news-incidenti"), expected_city)

    def test_street_name_is_not_confused_with_another_city(self):
        self.assertEqual(
            detect_city(
                "Manifestazione in Piazza Venezia verso il Colosseo",
                "Deviazioni attive nel centro di Roma",
                "active-roma-cronaca-locali",
            ),
            "Roma",
        )

    def test_article_body_location_outranks_a_different_city_in_title(self):
        self.assertEqual(
            detect_city_evidence(
                "Feriti trasportati all'ospedale di Cesena",
                "L'incidente e avvenuto nel comune di Sant'Agata Feltria.",
                "riminitoday-diretto",
            ),
            ("Sant'Agata Feltria", "event-municipality"),
        )

    def test_common_words_are_not_mistaken_for_municipalities(self):
        examples = (
            ("Allerta per piene e corsi minori", "Miglioramento nel pomeriggio"),
            ("Raccolta fondi dopo l'incendio", "Donazioni aperte per la ricostruzione"),
            ("Cento uomini impegnati contro le fiamme", "Incendio sul monte Morrone"),
            ("Incidente, due minori feriti", "Lo scontro e avvenuto ad Aci Sant'Antonio"),
            ("Vandalizzato il Ponte dei Martiri", "Il monumento e stato danneggiato"),
            ("Emergenza sangue: senza donazioni non si opera", "Appello nazionale"),
        )
        for title, description in examples:
            with self.subTest(title=title):
                detected = detect_city(title, description, "google-news-incidenti")
                self.assertNotIn(detected, {"Minori", "Fondi", "Cento", "Ponte", "Opera"})

        self.assertIsNone(
            detect_city(
                "Intervento sullo storico canale",
                "Potenziata la funzionalita dello storico manufatto",
                "google-news-incidenti",
            )
        )

    def test_ambiguous_municipality_is_accepted_with_explicit_context(self):
        examples = (
            ("Incidente a Medicina, due feriti", "Medicina"),
            ("Russi, arrestato un uomo", "Russi"),
            ("Incendio a Marino: evacuata una palazzina", "Marino"),
            ("Nel comune di Minori scatta l'allerta", "Minori"),
            ("Canale di Medicina: lavori di sicurezza", "Medicina"),
            ("Tentato omicidio di Medicina: arrestato un uomo", "Medicina"),
            ("Svolta nel caso di Medicina: fermato l'aggressore", "Medicina"),
        )
        for title, expected in examples:
            with self.subTest(title=title):
                self.assertEqual(detect_city(title, "", "google-news-incidenti"), expected)

    def test_san_marino_is_not_confused_with_marino(self):
        self.assertIsNone(
            detect_city(
                "San Marino, incidente in aeroporto",
                "Aereo danneggiato ma piloti illesi",
                "google-news-incidenti",
            )
        )

    def test_monte_livata_is_not_placed_in_roma_center(self):
        self.assertEqual(
            detect_city(
                "Fulmine colpisce sedicenne sul Monte Livata",
                "",
                "active-roma-emergenze-traffico-meteo",
            ),
            "Monte Livata",
        )
        coords = coordinates_for(
            "Fulmine colpisce sedicenne sul Monte Livata",
            "",
            "active-roma-emergenze-traffico-meteo",
            allow_geocode=False,
        )
        self.assertEqual(coords[:4], (41.938858, 13.148664, "Monte Livata", "Monte Livata"))

    def test_active_areas_cover_the_three_whole_regions(self):
        self.assertEqual(allowed_area_for("Bormio", 46.47, 10.37), "Lombardia")
        self.assertEqual(allowed_area_for("Gaeta", 41.21, 13.57), "Lazio")
        self.assertEqual(allowed_area_for("Pietrelcina", 41.20, 14.85), "Campania")
        self.assertIsNone(allowed_area_for("Palermo", 38.11, 13.36))

    def test_regional_sources_are_split_into_manageable_local_groups(self):
        source_names = {source.name for source in REGIONAL_LOCAL_MEDIA_SOURCES}
        self.assertIn("emilia-romagna-bologna-imola-santerno-locali", source_names)
        self.assertIn("emilia-romagna-bologna-reno-appennino-locali", source_names)
        self.assertIn("emilia-romagna-bologna-pianura-persiceto-locali", source_names)
        self.assertIn("emilia-romagna-ravenna-faenza-lugo-locali", source_names)
        self.assertIn("emilia-romagna-piacenza-locali", source_names)
        self.assertIn("lombardia-varese-como-locali", source_names)
        self.assertIn("lazio-viterbo-locali", source_names)
        self.assertIn("campania-benevento-locali", source_names)
        self.assertGreaterEqual(len(REGIONAL_LOCAL_MEDIA_SOURCES), 31)
        self.assertGreaterEqual(len(REGIONAL_MUNICIPALITY_SOURCES), 18)
        self.assertTrue(all("when%3A30d" in source.url for source in REGIONAL_LOCAL_MEDIA_SOURCES))
        self.assertTrue(all(source.enrich_article for source in REGIONAL_LOCAL_MEDIA_SOURCES))

    def test_bologna_direct_feeds_keep_original_article_context(self):
        source_names = {source.name for source in BOLOGNA_DIRECT_SOURCES}
        self.assertEqual(
            {
                "bologna-sabato-sera-direct",
                "bologna-renonews-direct",
                "bologna-cartabianca-direct",
                "bologna24ore-direct",
                "bologna-istituzioni-verificate",
            },
            source_names,
        )
        direct_feeds = [source for source in BOLOGNA_DIRECT_SOURCES if "news.google.com" not in source.url]
        self.assertTrue(all(source.publisher_city is None for source in direct_feeds))
        self.assertTrue(all(source.url.endswith("/feed/") for source in direct_feeds))

    def test_active_territories_have_direct_local_feeds(self):
        source_names = {source.name for source in ACTIVE_DIRECT_NEWS_SOURCES}
        self.assertEqual(
            {
                "milanotoday-direct", "romatoday-direct", "napolitoday-direct",
                "bolognatoday-direct", "modenatoday-direct", "parmatoday-direct",
                "ilpiacenza-direct", "ferraratoday-direct", "forlitoday-direct",
                "cesenatoday-direct",
            },
            source_names,
        )
        self.assertTrue(all(source.enrich_article for source in ACTIVE_DIRECT_NEWS_SOURCES))
        self.assertTrue(all(source.publisher_city is None for source in ACTIVE_DIRECT_NEWS_SOURCES))

    def test_similar_reports_in_same_city_and_time_are_duplicates(self):
        when = dt.datetime(2026, 9, 6, 8, 0)
        first = Incident(
            type="accident",
            title="Scontro frontale a Romagnano, due giovani feriti",
            description="Incidente sulla provinciale 146 a Romagnano. Due ragazzi sono stati soccorsi.",
            city="Sant'Agata Feltria",
            address="Romagnano, Sant'Agata Feltria",
            created_date=when,
            source="riminitoday-diretto",
        )
        second = Incident(
            type="accident",
            title="Frontale sulla provinciale a Romagnano: feriti due ragazzi",
            description="Lo schianto e avvenuto lungo la SP146 nella localita Romagnano.",
            city="Sant'Agata Feltria",
            address="SP146, Romagnano, Sant'Agata Feltria",
            created_date=when + dt.timedelta(hours=1),
            source="cesenatoday-direct",
        )
        self.assertTrue(likely_same_report(first, second))

    def test_different_events_in_same_city_are_not_duplicates(self):
        when = dt.datetime(2026, 9, 6, 8, 0)
        first = Incident(
            type="crime",
            title="Rapina in farmacia, arrestato un uomo",
            description="Il colpo e avvenuto in via Garibaldi.",
            city="Milano",
            address="Via Garibaldi, Milano",
            created_date=when,
            source="milanotoday-direct",
        )
        second = Incident(
            type="crime",
            title="Furto di biciclette in stazione, due denunce",
            description="La polizia ha recuperato tre biciclette in Centrale.",
            city="Milano",
            address="Stazione Centrale, Milano",
            created_date=when + dt.timedelta(hours=1),
            source="milanotoday-direct",
        )
        self.assertFalse(likely_same_report(first, second))

    def test_duplicate_cleanup_preserves_links_from_both_publishers(self):
        engine = create_engine("sqlite:///:memory:")
        Base.metadata.create_all(engine)
        session = sessionmaker(bind=engine)()
        when = dt.datetime(2026, 9, 6, 8, 0)
        try:
            first = Incident(
                id="event-a", type="accident", title="Scontro frontale a Romagnano, due giovani feriti",
                description="Incidente sulla provinciale 146 a Romagnano. Due ragazzi sono stati soccorsi.",
                severity="medium", latitude=43.9, longitude=12.2,
                city="Sant'Agata Feltria", address="Romagnano, Sant'Agata Feltria",
                created_date=when, last_seen_at=when, source="riminitoday-diretto",
                source_event_id="a", media=[Media(url="https://example.test/a", type="live")],
            )
            second = Incident(
                id="event-b", type="accident", title="Frontale a Romagnano: feriti due ragazzi",
                description="Schianto sulla SP146 a Romagnano con due giovani trasportati in ospedale.",
                severity="medium", latitude=43.9, longitude=12.2,
                city="Sant'Agata Feltria", address="SP146, Romagnano, Sant'Agata Feltria",
                created_date=when + dt.timedelta(hours=1), last_seen_at=when + dt.timedelta(hours=1),
                source="cesenatoday-direct", source_event_id="b",
                media=[Media(url="https://example.test/b", type="live")],
            )
            session.add_all([first, second])
            session.flush()
            self.assertEqual(cleanup_duplicate_incidents(session), 1)
            session.flush()
            remaining = session.query(Incident).one()
            self.assertEqual({media.url for media in remaining.media}, {"https://example.test/a", "https://example.test/b"})
        finally:
            session.close()

    def test_duplicate_cleanup_includes_dynamic_news_sources(self):
        engine = create_engine("sqlite:///:memory:")
        Base.metadata.create_all(engine)
        session = sessionmaker(bind=engine)()
        when = dt.datetime(2026, 9, 10, 8, 0)
        try:
            shared_url = "https://example.test/shared-article"
            events = [
                Incident(
                    id=f"dynamic-{index}", type="fire", title=title,
                    description=title, severity="medium", latitude=45.46,
                    longitude=9.19, city="Milano", address="Milano",
                    status="active", created_date=when, last_seen_at=when,
                    source=f"dynamic-source-{index}", source_event_id=f"dynamic-{index}",
                    media=[Media(url=shared_url, type="document")],
                )
                for index, title in enumerate((
                    "Incendio in un deposito a Milano",
                    "Fiamme in un magazzino nel capoluogo lombardo",
                ))
            ]
            session.add_all(events)
            session.flush()

            self.assertEqual(cleanup_duplicate_incidents(session), 1)
            self.assertEqual(session.query(Incident).count(), 1)
        finally:
            session.close()

    def test_ambiguous_location_is_retained_but_hidden_until_verified(self):
        engine = create_engine("sqlite:///:memory:")
        Base.metadata.create_all(engine)
        session = sessionmaker(bind=engine)()
        try:
            false_location = Incident(
                id="ambiguous-minori", type="weather",
                title="Allerta per piene e corsi minori",
                description="Previsto un miglioramento nel pomeriggio. Fonte: BolognaToday. Localizzazione: Minori.",
                severity="low", latitude=40.65, longitude=14.62,
                city="Minori", address="Minori", status="active",
                created_date=dt.datetime.now(), source="bolognatoday-direct",
                source_event_id="ambiguous-minori",
            )
            correctable = Incident(
                id="ambiguous-ponte", type="crime",
                title="Vandalizzato il monumento del Ponte dei Martiri",
                description="Il monumento nel centro di Ravenna e stato danneggiato. Fonte: RavennaToday. Localizzazione: Ponte.",
                severity="low", latitude=41.21, longitude=14.69,
                city="Ponte", address="Ponte", status="active",
                created_date=dt.datetime.now(), source="ravennatoday-rss",
                source_event_id="ambiguous-ponte",
            )
            session.add_all([false_location, correctable])
            session.flush()

            result = revalidate_ambiguous_locations(session)
            self.assertEqual(result, {"corrected_ambiguous_locations": 1, "pending_locations": 1})
            self.assertEqual(false_location.status, "location_pending")
            self.assertEqual(correctable.city, "Ravenna")
            self.assertEqual(correctable.status, "active")
        finally:
            session.close()

    def test_duplicate_cleanup_resolves_connected_link_chains(self):
        engine = create_engine("sqlite:///:memory:")
        Base.metadata.create_all(engine)
        session = sessionmaker(bind=engine)()
        when = dt.datetime(2026, 9, 6, 8, 0)
        try:
            events = [
                Incident(
                    id=f"chain-{index}", type="fire", title=title,
                    description=title, severity="medium", latitude=45.46,
                    longitude=9.19, city="Milano", address="Milano",
                    status="active", created_date=when + dt.timedelta(minutes=index),
                    last_seen_at=when, source="milanotoday-direct",
                    source_event_id=f"chain-{index}",
                    media=[Media(url=url, type="document") for url in urls],
                )
                for index, (title, urls) in enumerate((
                    ("Incendio in un deposito a Milano", ("https://example.test/one",)),
                    ("Fiamme in un magazzino milanese", ("https://example.test/two",)),
                    ("Rogo nel deposito, vigili al lavoro", ("https://example.test/one", "https://example.test/two")),
                ))
            ]
            session.add_all(events)
            session.flush()
            removed = 0
            while True:
                current = cleanup_duplicate_incidents(session)
                removed += current
                session.flush()
                if current == 0:
                    break
            self.assertEqual(removed, 2)
            self.assertEqual(session.query(Incident).count(), 1)
        finally:
            session.close()

    def test_enrichment_jobs_skip_existing_articles_without_using_the_limit(self):
        source = SOURCE_BY_NAME["milanotoday-direct"]
        items = [
            {
                "guid": f"event-{index}",
                "title": f"Incendio a Milano in via Test {index}",
                "description": "Intervento dei vigili del fuoco per un incendio.",
                "published": "",
                "link": f"https://example.test/{index}",
            }
            for index in range(10)
        ]
        jobs, skipped = select_enrichment_jobs(
            [(source, items)],
            {(source.name, "event-0"), (source.name, "event-1")},
        )
        self.assertEqual(skipped, 2)
        self.assertEqual(len(jobs), 8)
        self.assertEqual(jobs[0][1]["guid"], "event-2")

    def test_short_feed_summary_does_not_replace_richer_saved_description(self):
        engine = create_engine("sqlite:///:memory:")
        Base.metadata.create_all(engine)
        session = sessionmaker(bind=engine)()
        source = SOURCE_BY_NAME["milanotoday-direct"]
        published = email.utils.format_datetime(dt.datetime.now(dt.timezone.utc))
        base_item = {
            "guid": "rich-description-event",
            "title": "Incendio a Milano in via Torino",
            "published": published,
            "link": "https://example.test/rich-description-event",
        }
        try:
            ensure_sentinel_bot(session)
            rich_item = {
                **base_item,
                "description": (
                    "Un incendio ha coinvolto un appartamento in via Torino a Milano. "
                    "I vigili del fuoco hanno evacuato il palazzo e messo in sicurezza la zona."
                ),
            }
            self.assertTrue(save_item(session, source, rich_item))
            session.commit()
            rich_description = session.query(Incident).one().description

            short_item = {**base_item, "description": "Incendio a Milano."}
            self.assertFalse(save_item(session, source, short_item))
            session.commit()
            self.assertEqual(session.query(Incident).one().description, rich_description)
        finally:
            session.close()

    def test_focus_areas_are_the_four_metropolitan_territories(self):
        self.assertEqual(
            FOCUS_METROPOLITAN_AREAS,
            {"Milano": "milano", "Roma": "roma", "Napoli": "napoli", "Bologna": "bologna", "Verona": "verona"},
        )
        self.assertEqual(FOCUS_MUNICIPALITIES_PER_QUERY["Bologna"], 6)
        source = municipality_source(
            "focus-test",
            ("Abbiategrasso", "Tivoli", "Acerra", "Imola"),
            enrich_article=True,
        )
        self.assertTrue(source.enrich_article)
        self.assertIn("Abbiategrasso", source.url)

    def test_bologna_focus_sources_use_small_batches_and_reload_cleanly(self):
        names = (
            "Bologna", "Imola", "Casalecchio di Reno", "San Lazzaro di Savena",
            "San Giovanni in Persiceto", "Budrio", "Medicina",
        )
        rows = [
            {
                "nome": name,
                "regione": {"nome": "Emilia-Romagna"},
                "provincia": {"nome": "Bologna"},
                "coordinate": {"lat": 44.5 + index / 100, "lng": 11.3 + index / 100},
            }
            for index, name in enumerate(names)
        ]
        payload = json.dumps(rows).encode("utf-8")

        with patch("backend.fetch_live_incidents.fetch_url", return_value=payload):
            first = load_active_region_municipalities()
            second = load_active_region_municipalities()

        focus_sources = [source for source in SOURCES if source.name.startswith("focus-bologna-")]
        self.assertEqual(first["municipality_sources"], 27)
        self.assertEqual(second["municipality_sources"], 27)
        self.assertEqual(len(focus_sources), 2)
        self.assertEqual(len({source.name for source in focus_sources}), 2)

    def test_saved_small_town_can_be_revalidated_without_a_new_geocode(self):
        self.assertEqual(
            explicit_recognized_city(
                "Atripalda, arrestato dopo una rapina",
                "",
                "campania-comuni-avellino",
            ),
            "Atripalda",
        )
        self.assertIsNone(
            explicit_recognized_city(
                "Arrestato dopo una rapina",
                "",
                "ravenna-notizie-cronaca",
            )
        )

    def test_small_town_survives_import_and_next_cleanup(self):
        engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
        Base.metadata.create_all(bind=engine)
        session = sessionmaker(bind=engine)()
        item = {
            "guid": "test-morbegno-fire",
            "title": "Morbegno, incendio in un capannone",
            "description": "I vigili del fuoco sono intervenuti e non risultano feriti.",
            "published": email.utils.format_datetime(dt.datetime.now(dt.timezone.utc)),
            "link": "https://example.test/morbegno-fire",
            "publisher": "La Provincia di Sondrio",
        }
        try:
            with patch(
                "backend.fetch_live_incidents.geocode_place",
                return_value=(46.1371, 9.5742),
            ), patch("backend.fetch_live_incidents.time.sleep"):
                self.assertTrue(
                    save_item(session, SOURCE_BY_NAME["lombardia-lecco-sondrio-locali"], item)
                )
            session.commit()
            incident = session.query(Incident).one()
            self.assertEqual(incident.city, "Morbegno")
            self.assertEqual(cleanup_location_evidence(session)["removed_without_location_evidence"], 0)
            self.assertEqual(session.query(Incident).count(), 1)
        finally:
            session.close()


if __name__ == "__main__":
    unittest.main()
