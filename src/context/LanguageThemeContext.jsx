import React, { createContext, useContext, useState, useEffect } from 'react';

export const translations = {
  it: {
    // Navbar
    nav_home: "Home",
    nav_features: "Funzionalità",
    nav_manifesto: "Manifesto Etico",
    nav_contact: "Contatti",
    nav_download: "Richiedi Accesso",

    // Hero
    hero_eyebrow: "Sicurezza verificata, non allarmismo",
    hero_title_1: "Sai se è sicuro,",
    hero_title_2: "prima di uscirci.",
    hero_subtitle: "Sentinel ti mostra esattamente cosa c'è sulla tua strada prima che tu esca di casa — dati ufficiali, segnalazioni verificate dalla community, mai stereotipi. Per farti muovere sempre con più serenità.",
    hero_cta_primary: "Richiedi Accesso Prioritario",
    hero_cta_secondary: "Guarda come funziona",
    hero_trust_badge: "Gratuito · Zero profilazione dati · Fonti ufficiali verificate",
    hero_live_badge: "Allerte Live Attive",
    hero_alert_title: "Lavori in Corso & Deviazione",
    hero_alert_sub: "Fonte Ufficiale · A 250m dal tuo percorso",
    hero_alert_verified: "VERIFICATO",

    // Stat Bar
    stat_1_val: "< 15 sec",
    stat_1_lbl: "Tempo Elaborazione Alert",
    stat_2_val: "100%",
    stat_2_lbl: "Dati, Non Pregiudizi",
    stat_3_val: "Verificata",
    stat_3_lbl: "Moderazione Preventiva",
    stat_4_val: "30+",
    stat_4_lbl: "Fonti Ufficiali Istituzionali",

    // Persona Section
    persona_tag: "Casi d'Uso Reali /",
    persona_title: "Pensato per la tua serenità quando ti sposti",
    persona_sub: "Sentinel risolve il dubbio prima che si trasformi in preoccupazione.",
    persona_1_badge: "In viaggio in Italia?",
    persona_1_title: "Non conosci la zona e non sai di chi fidarti?",
    persona_1_text: "Sentinel ti mostra gli allarmi reali sul tuo percorso nella tua lingua: quali strade evitare, cosa sta succedendo intorno a te — dati verificati dalle autorità e dai cittadini, zero voci di corridoio.",
    persona_1_cta: "Scopri la protezione per chi viaggia →",
    persona_2_badge: "Torni a casa tardi?",
    persona_2_title: "Vuoi sapere com'è la situazione sulla tua strada prima di metterti in cammino?",
    persona_2_text: "Guarda cosa è accaduto davvero sulla tua rotta prima di uscire: orari, frequenza ed eventi reali per scegliere il percorso migliore senza ansia e senza basarti su supposizioni.",
    persona_2_cta: "Scopri la funzione Rientro Sicuro →",

    // Principles
    princ_tag: "I Nostri Principi /",
    princ_title: "La tua tranquillità, protetta da dati reali e zero allarmismo",
    princ_sub: "Abbiamo progettato Sentinel ponendo l'etica e la veridicità al primo posto per eliminare il sensazionalismo e l'odio in rete.",
    princ_1_title: "Moderazione prima, non dopo",
    princ_1_text: "Ogni segnalazione passa un controllo prima di diventare pubblica. Nessun contenuto non verificato finisce sulla tua mappa.",
    princ_2_title: "Dati reali, zero pregiudizi",
    princ_2_text: "Nessuna generalizzazione su zone o gruppi. Pubblichiamo solo fatti verificabili: cosa, quando e dove — mai opinioni o stereotipi.",
    princ_3_title: "Fonti ufficiali, sempre citate",
    princ_3_text: "Terremoti, allerte meteo, viabilità — direttamente dalle fonti istituzionali (INGV, Protezione Civile) sul tuo schermo.",

    // Product Demo
    demo_tag: "Dimostrazione Prodotto /",
    demo_title_1: "La tecnologia al servizio",
    demo_title_2: "dei tuoi spostamenti",
    demo_cta: "Esplora la Mappa 3D Live",
    demo_infra_badge: "Infrastruttura di Monitoraggio Live",
    card_1_title: "La Mappa Viva 3D",
    card_1_text: "Mappe 3D dettagliate a zero latenza con visualizzazione tridimensionale dei fabbricati sul tuo tragitto.",
    card_2_title: "Allerte Preventive",
    card_2_text: "Radar intelligente geolocalizzato. Ricevi notifiche esclusive solo per le minacce sui tuoi percorsi quotidiani.",
    card_3_title: "Karma & Reputazione Founder",
    card_3_text: "Il Karma misura l'autorevolezza del segnalatore. Le segnalazioni degli utenti con alto Karma (come i membri Founder con +100 Punti) vengono validate al volo con massima priorità sulla mappa.",
    card_learn_more: "Scopri di più →",

    // Platform Page
    platform_hero_title: "Ingegnerizzata per l'emergenza.",
    platform_hero_sub: "Un'architettura vettoriale progettata per latenza zero. Mappa vettoriale 3D ad alta definizione per navigare la città in tempo reale con totale consapevolezza.",
    platform_map_title: "Live Radar",
    platform_map_sub: "Dati vettoriali ad alta definizione con rilevamento preventivo degli incidenti urbani.",
    platform_map_badge: "● Live Feed Milano",

    // Manifesto Page
    manifesto_hero_title: "La Verità, Senza Filtri.",
    manifesto_hero_sub: "I media arrivano quando è già successo. Noi ci siamo mentre accade.",
    manifesto_stat_1_val: "+24%",
    manifesto_stat_1_txt: "Aumento della criminalità urbana non documentata dai canali ufficiali nell'ultimo anno.",
    manifesto_stat_2_val: "4.2 Min",
    manifesto_stat_2_txt: "Tempo medio di risposta di Sentinel rispetto ai 15 minuti dei bollettini tradizionali sugli incidenti.",
    manifesto_stat_3_val: "Imprevedibile",
    manifesto_stat_3_txt: "Eventi climatici estremi locali sfuggono ai radar nazionali. Solo chi è sul posto sa cosa sta succedendo.",
    manifesto_quote: "\"La sicurezza non è uno scudo concesso dall'alto. È una rete tessuta dal basso.\"",

    // Contact Page
    contact_hero_title: "Entra nel Network.",
    contact_hero_sub: "Investitori, partner tecnologici o pionieri urbani. Il futuro della sicurezza si costruisce insieme.",
    contact_form_title: "Inizia la conversazione",
    contact_label_name: "Nome Completo",
    contact_label_email: "Indirizzo Email",
    contact_label_msg: "Messaggio",
    contact_btn_send: "Invia Messaggio",
    contact_sending: "Invio in corso...",
    contact_direct_access: "Accesso Diretto",
    contact_official_email: "Email Ufficiale",
    contact_phone: "Telefono Headquarters",
    contact_hq: "Sede Principale",

    // How it Works
    how_tag: "Semplicità d'Uso /",
    how_title: "Come funziona Sentinel",
    step_1_title: "Apri la Mappa",
    step_1_text: "Apri l'app in un istante. Vedi subito gli allarmi reali sulla tua strada e controlla se il tuo percorso è libero da pericoli.",
    step_2_title: "Ricevi Alert Chirurgici",
    step_2_text: "Anticipa ingorghi, deviazioni o eventi critici solo quando un pericolo incrocia direttamente i tuoi spostamenti.",
    step_3_title: "Segnala in 1-Tap",
    step_3_text: "Vedi un ostacolo? Segnalalo o rassicura chi ti aspetta con un solo tap. Il filtro verificherà il contenuto prima della pubblicazione.",

    // FAQ
    faq_tag: "Trasparenza Totale /",
    faq_title: "Domande frequenti",
    faq_sub: "Risposte chiare ed oneste a tutti i tuoi dubbi.",
    faq_q1: "Sentinel sostituisce il 112 o i numeri di emergenza?",
    faq_a1: "No. Sentinel è uno strumento di informazione preventiva e consapevolezza del territorio. In caso di emergenza immediata o pericolo imminente per la vita, devi sempre contattare tempestivamente il 112 o le forze dell'ordine.",
    faq_q2: "Come viene garantito che non ci sia allarmismo o fake news?",
    faq_a2: "Ogni segnalazione passa attraverso il nostro algoritmo di moderazione preventiva e viene incrociata con i dati ufficiali prima della pubblicazione sulla mappa globale. Inoltre, il Karma degli utenti limita l'impatto di segnalazioni isolate o non verificate.",
    faq_q3: "La mia posizione viene tracciata o venduta a terzi?",
    faq_a3: "Assolutamente no. Sentinel opera nel pieno rispetto del GDPR europeo. I dati di geolocalizzazione vengono elaborati in locale sul tuo dispositivo e servono esclusivamente a calcolare le allerte sul tuo raggio d'azione. Zero profilazione a fini pubblicitari.",
    faq_q4: "L'applicazione è gratuita?",
    faq_a4: "Sì, le funzionalità fondamentali di monitoraggio del territorio, ricezione delle allerte live e consultazione delle fonti ufficiali sono e rimarranno sempre gratuite per tutti i cittadini.",
    faq_q5: "Funziona anche nelle zone più piccole o solo nei grandi centri?",
    faq_a5: "Le allerte istituzionali (come INGV per i terremoti, allerte meteo della Protezione Civile e viabilità) coprono l'intero territorio nazionale. Nelle zone più frequentate si aggiunge la rete di segnalazione capillare degli utenti.",
    faq_q6: "Le segnalazioni possono discriminare persone o quartieri?",
    faq_a6: "No. Sentinel integra un filtro rigido anti-discriminazione che blocca all'origine qualsiasi generalizzazione su gruppi etnici, nazionalità o religioni. Pubblichiamo esclusivamente fatti oggettivi e verificabili: cosa, dove e quando.",

    // Final CTA
    final_title: "Pronto a uscire di casa sapendo cosa ti aspetta?",
    final_sub: "Unisciti alla prima rete partecipata di sicurezza e informazione verificata in Italia.",
    final_cta: "Scarica Sentinel",

    // Footer
    footer_desc: "La prima rete partecipata di sicurezza urbana in Italia. Dati ufficiali verificati, moderazione preventiva e zero pregiudizi.",
    footer_col_platform: "Piattaforma",
    footer_col_legal: "Note Legali & Privacy",
    footer_privacy: "Privacy Policy (GDPR)",
    footer_terms: "Termini di Servizio",
    footer_moderation: "Politica di Moderazione",
    footer_institutional: "Dati Istituzionali & Fonti",
    footer_rights: "© 2026 Sentinel Inc. Tutti i diritti riservati. Made with integrity in Italy.",
    footer_badge_1: "Server Sicuri in UE",
    footer_badge_2: "Zero Tracking Profilante",
    footer_lang_label: "Lingua / Language",
    footer_theme_label: "Tema / Theme",
    theme_dark: "Modalità Scura (Dark)",
    theme_light: "Modalità Chiara (Clear)"
  },
  en: {
    // Navbar
    nav_home: "Home",
    nav_features: "Features",
    nav_manifesto: "Ethical Manifesto",
    nav_contact: "Contact Us",
    nav_download: "Request Access",

    // Hero
    hero_eyebrow: "Verified Safety, Zero Alarmism",
    hero_title_1: "Know if it's safe,",
    hero_title_2: "before stepping outside.",
    hero_subtitle: "Sentinel shows you exactly what is happening along your route before you leave home — official verified data, community-moderated alerts, zero stereotypes. Navigate your city with complete peace of mind.",
    hero_cta_primary: "Request Priority Access",
    hero_cta_secondary: "See How It Works",
    hero_trust_badge: "Free · Zero Data Profiling · Verified Official Sources",
    hero_live_badge: "Live Alerts Active",
    hero_alert_title: "Roadworks & Detour Ahead",
    hero_alert_sub: "Official Source · 250m from your route",
    hero_alert_verified: "VERIFIED",

    // Stat Bar
    stat_1_val: "< 15 sec",
    stat_1_lbl: "Alert Processing Time",
    stat_2_val: "100%",
    stat_2_lbl: "Real Data, Zero Bias",
    stat_3_val: "Verified",
    stat_3_lbl: "Preventive Moderation",
    stat_4_val: "30+",
    stat_4_lbl: "Official Institutional Sources",

    // Persona Section
    persona_tag: "Real Use Cases /",
    persona_title: "Engineered for your peace of mind on the move",
    persona_sub: "Sentinel resolves uncertainty before it turns into anxiety.",
    persona_1_badge: "Traveling in Italy?",
    persona_1_title: "Unfamiliar with the area and don't know who to trust?",
    persona_1_text: "Sentinel displays verified local alerts along your route in your native language: which streets to avoid, active emergency events nearby — official data verified by authorities and local residents, zero rumors.",
    persona_1_cta: "Discover Traveler Safety Features →",
    persona_2_badge: "Heading Home Late?",
    persona_2_title: "Want to check route safety before stepping outside?",
    persona_2_text: "Check real incident history along your travel route before leaving: timestamps, event frequency, and verified alerts to pick the safest route home with total confidence.",
    persona_2_cta: "Discover Safe Return Mode →",

    // Principles
    princ_tag: "Our Principles /",
    princ_title: "Your peace of mind, backed by verified facts and zero alarmism",
    princ_sub: "We designed Sentinel putting ethics and truthfulness first to eliminate sensationalism and online hate from urban safety.",
    princ_1_title: "Moderation First, Not After",
    princ_1_text: "Every incident report undergoes automated verification before going public. No unverified rumors ever reach your map.",
    princ_2_title: "Real Data, Zero Bias",
    princ_2_text: "No generalizations about neighborhoods or demographics. We publish verified facts only: what, when, and where — never opinions.",
    princ_3_title: "Official Sources, Always Cited",
    princ_3_text: "Earthquakes, severe weather alerts, road conditions — directly streamed from official government institutions (INGV, Civil Protection) to your screen.",

    // Product Demo
    demo_tag: "Product Demo /",
    demo_title_1: "Technology engineered for",
    demo_title_2: "your daily movement",
    demo_cta: "Explore 3D Live Map",
    demo_infra_badge: "Live Infrastructure Monitoring",
    card_1_title: "Live 3D Map Engine",
    card_1_text: "Zero-latency 3D vector maps with realistic 3D building rendering along your travel route.",
    card_2_title: "Preventive Precision Radar",
    card_2_text: "Smart geofenced safety radar. Receive targeted alerts exclusively for threats crossing your personal path.",
    card_3_title: "Karma & Founder Reputation",
    card_3_text: "Karma measures contributor trust. Incident reports from high-Karma users (such as Founder members with +100 Points) are validated instantly with top priority on the map.",
    card_learn_more: "Learn More →",

    // Platform Page
    platform_hero_title: "Engineered for Crisis Response.",
    platform_hero_sub: "A zero-latency vector architecture designed for situational awareness. High-definition 3D vector map to navigate your city in real time with total confidence.",
    platform_map_title: "Live Safety Radar",
    platform_map_sub: "High-definition vector pipeline with preventive incident detection.",
    platform_map_badge: "● Live Feed Milan",

    // Manifesto Page
    manifesto_hero_title: "The Truth, Unfiltered.",
    manifesto_hero_sub: "Traditional media arrives after it happens. Sentinel is there while it occurs.",
    manifesto_stat_1_val: "+24%",
    manifesto_stat_1_txt: "Increase in undocumented local urban incidents over the past year.",
    manifesto_stat_2_val: "4.2 Min",
    manifesto_stat_2_txt: "Sentinel average alert speed vs 15 minutes for traditional incident bulletins.",
    manifesto_stat_3_val: "Unpredictable",
    manifesto_stat_3_txt: "Local extreme weather events escape national radar. Only those on the ground know what is happening.",
    manifesto_quote: "\"Safety is not a shield granted from above. It is a network woven from below.\"",

    // Contact Page
    contact_hero_title: "Join the Network.",
    contact_hero_sub: "Investors, technology partners, or urban pioneers. Building the future of safety together.",
    contact_form_title: "Start the Conversation",
    contact_label_name: "Full Name",
    contact_label_email: "Email Address",
    contact_label_msg: "Message",
    contact_btn_send: "Send Message",
    contact_sending: "Sending...",
    contact_direct_access: "Direct Contact",
    contact_official_email: "Official Email",
    contact_phone: "Headquarters Phone",
    contact_hq: "Global Headquarters",

    // How it Works
    how_tag: "Seamless Design /",
    how_title: "How Sentinel Works",
    step_1_title: "Open the Map",
    step_1_text: "Launch the app instantly. See live verified alerts on your street and check if your path is clear.",
    step_2_title: "Receive Targeted Alerts",
    step_2_text: "Anticipate traffic jams, detours, or hazard alerts only when a danger directly crosses your travel route.",
    step_3_title: "Report in 1-Tap",
    step_3_text: "Spot an obstacle? Report it or reassure loved ones with a single tap. The moderation filter verifies content before publishing.",

    // FAQ
    faq_tag: "Total Transparency /",
    faq_title: "Frequently Asked Questions",
    faq_sub: "Clear, honest answers to all your questions.",
    faq_q1: "Does Sentinel replace 112 or emergency services?",
    faq_a1: "No. Sentinel is a preventive awareness tool. In case of an immediate emergency or life-threatening situation, always dial 112 or contact law enforcement directly.",
    faq_q2: "How do you prevent alarmism or fake news?",
    faq_a2: "Every user report passes through our preventive moderation algorithm and is cross-referenced with official data before appearing on the map. Additionally, user Karma scores limit the impact of unverified reports.",
    faq_q3: "Is my location tracked or sold to third parties?",
    faq_a3: "Absolutely not. Sentinel operates in strict compliance with European GDPR laws. Location data is processed locally on your device solely to calculate alerts within your radius. Zero profiling for advertising.",
    faq_q4: "Is the application free to use?",
    faq_a4: "Yes, core features for urban monitoring, live alerts, and official source consultation are and will always remain 100% free for all citizens.",
    faq_q5: "Does it work in smaller towns or only major cities?",
    faq_a5: "Institutional alerts (such as INGV earthquake data, Civil Protection storm warnings, and highway traffic) cover the entire national territory. Major urban centers benefit from denser community reporting.",
    faq_q6: "Can reports discriminate against specific groups or areas?",
    faq_a6: "No. Sentinel enforces a strict anti-discrimination filter that blocks generalizations about ethnicity, nationality, or religion at the source. We publish objective, verifiable facts only: what, where, and when.",

    // Final CTA
    final_title: "Ready to leave home knowing what lies ahead?",
    final_sub: "Join Italy's first crowd-verified safety and awareness network.",
    final_cta: "Download Sentinel",

    // Footer
    footer_desc: "Italy's premier crowd-verified urban safety platform. Official data, preventive moderation, and zero bias.",
    footer_col_platform: "Platform",
    footer_col_legal: "Legal & Privacy",
    footer_privacy: "Privacy Policy (GDPR)",
    footer_terms: "Terms of Service",
    footer_moderation: "Moderation Policy",
    footer_institutional: "Official Data Sources",
    footer_rights: "© 2026 Sentinel Inc. All rights reserved. Made with integrity in Italy.",
    footer_badge_1: "EU Secured Servers",
    footer_badge_2: "Zero Tracking Profiling",
    footer_lang_label: "Language",
    footer_theme_label: "Theme",
    theme_dark: "Dark Mode",
    theme_light: "Light Mode"
  }
};

const LanguageThemeContext = createContext();

export function LanguageThemeProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('sentinel_lang') || 'it');
  const [theme, setTheme] = useState(() => localStorage.getItem('sentinel_theme') || 'dark');

  useEffect(() => {
    localStorage.setItem('sentinel_lang', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('sentinel_theme', theme);
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }
  }, [theme]);

  const t = (key) => {
    return translations[lang]?.[key] || translations['it']?.[key] || key;
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const changeLang = (newLang) => {
    setLang(newLang);
  };

  return (
    <LanguageThemeContext.Provider value={{ lang, changeLang, theme, toggleTheme, t }}>
      {children}
    </LanguageThemeContext.Provider>
  );
}

export function useLanguageTheme() {
  const context = useContext(LanguageThemeContext);
  if (!context) {
    throw new Error('useLanguageTheme must be used within a LanguageThemeProvider');
  }
  return context;
}
