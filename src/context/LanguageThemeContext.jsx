import React, { createContext, useContext, useState, useEffect } from 'react';

export const translations = {
  it: {
    // Navbar
    nav_home: "Home",
    nav_features: "Funzionalità",
    nav_manifesto: "Manifesto",
    nav_contact: "Contatti",
    nav_download: "Scarica Sentinel",

    // Hero
    hero_eyebrow: "Sicurezza verificata, non allarmismo",
    hero_title_1: "Sai se è sicuro,",
    hero_title_2: "prima di uscirci.",
    hero_subtitle: "Sentinel ti mostra esattamente cosa c'è sulla tua strada prima che tu esca di casa — dati ufficiali, segnalazioni verificate dalla community, mai stereotipi. Per farti muovere sempre con più serenità.",
    hero_cta_primary: "Scarica Sentinel",
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
    card_3_title: "Karma & Reputazione",
    card_3_text: "Sistema di validazione incrociata. La community vota e attribuisce punti Karma ai segnalatori autorevoli.",
    card_learn_more: "Scopri di più →",

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
    nav_download: "Download Sentinel",

    // Hero
    hero_eyebrow: "Verified Safety, Never Alarmism",
    hero_title_1: "Know if it's safe,",
    hero_title_2: "before stepping outside.",
    hero_subtitle: "Sentinel shows you exactly what is happening on your route before you leave home — official verified data, community-moderated alerts, zero stereotypes. Move everywhere with peace of mind.",
    hero_cta_primary: "Download Sentinel",
    hero_cta_secondary: "See How it Works",
    hero_trust_badge: "Free · Zero Data Profiling · Verified Official Sources",
    hero_live_badge: "Live Alerts Active",
    hero_alert_title: "Roadworks & Detour",
    hero_alert_sub: "Official Source · 250m from your route",
    hero_alert_verified: "VERIFIED",

    // Stat Bar
    stat_1_val: "< 15 sec",
    stat_1_lbl: "Alert Processing Time",
    stat_2_val: "100%",
    stat_2_lbl: "Real Data, No Bias",
    stat_3_val: "Verified",
    stat_3_lbl: "Preventive Moderation",
    stat_4_val: "30+",
    stat_4_lbl: "Official Government Sources",

    // Persona Section
    persona_tag: "Real Use Cases /",
    persona_title: "Designed for your peace of mind while traveling",
    persona_sub: "Sentinel resolves uncertainty before it turns into worry.",
    persona_1_badge: "Traveling in Italy?",
    persona_1_title: "Unfamiliar with the area and don't know who to trust?",
    persona_1_text: "Sentinel displays verified local alerts along your route in your native language: which streets to avoid, what is occurring nearby — official data verified by authorities and locals, zero rumors.",
    persona_1_cta: "Discover Protection for Travelers →",
    persona_2_badge: "Heading Home Late?",
    persona_2_title: "Want to check route safety before heading out?",
    persona_2_text: "Check what actually happened on your route tonight: timestamps, frequency, and verified events to pick the safest path home with zero anxiety.",
    persona_2_cta: "Discover Safe Return Feature →",

    // Principles
    princ_tag: "Our Principles /",
    princ_title: "Your peace of mind, backed by real data and zero alarmism",
    princ_sub: "We built Sentinel putting ethics and truthfulness first, eliminating sensationalism and hate from neighborhood safety.",
    princ_1_title: "Moderation First, Not After",
    princ_1_text: "Every report passes automated checks before going public. No unverified content ever lands on your map.",
    princ_2_title: "Real Data, Zero Bias",
    princ_2_text: "No generalizations about areas or demographics. We publish verified facts only: what, when, and where — never opinions.",
    princ_3_title: "Official Sources, Always Cited",
    princ_3_text: "Earthquakes, severe weather, and traffic incidents — directly from official institutions (INGV, Civil Protection) to your screen.",

    // Product Demo
    demo_tag: "Product Demonstration /",
    demo_title_1: "Technology built around",
    demo_title_2: "your daily movement",
    demo_cta: "Explore 3D Live Map",
    demo_infra_badge: "Live Monitoring Infrastructure",
    card_1_title: "Live 3D Map",
    card_1_text: "Detailed zero-latency 3D maps with building elevation along your actual travel route.",
    card_2_title: "Preventive Alerts",
    card_2_text: "Smart geofenced radar. Receive notifications only for threats that cross your personal daily path.",
    card_3_title: "Karma & Reputation",
    card_3_text: "Cross-validation score. The community votes and grants Karma points to authoritative local contributors.",
    card_learn_more: "Learn More →",

    // How it Works
    how_tag: "Ease of Use /",
    how_title: "How Sentinel Works",
    step_1_title: "Open the Map",
    step_1_text: "Launch the app instantly. See real live alerts on your street and verify if your path is clear.",
    step_2_title: "Receive Targeted Alerts",
    step_2_text: "Anticipate traffic jams, detours, or weather alerts only when they directly cross your travel route.",
    step_3_title: "Report in 1-Tap",
    step_3_text: "Spot an obstacle? Report it or reassure your family in one tap. The filter verifies content before publishing.",

    // FAQ
    faq_tag: "Total Transparency /",
    faq_title: "Frequently Asked Questions",
    faq_sub: "Clear, honest answers to all your questions.",

    // Final CTA
    final_title: "Ready to leave home knowing what lies ahead?",
    final_sub: "Join Italy's first participatory safety and verified news network.",
    final_cta: "Download Sentinel",

    // Footer
    footer_desc: "Italy's premier crowd-verified urban safety platform. Official data, preventive moderation, and zero bias.",
    footer_col_platform: "Platform",
    footer_col_legal: "Legal Notes & Privacy",
    footer_privacy: "Privacy Policy (GDPR)",
    footer_terms: "Terms of Service",
    footer_moderation: "Moderation Policy",
    footer_institutional: "Official Sources & Data",
    footer_rights: "© 2026 Sentinel Inc. All rights reserved. Made with integrity in Italy.",
    footer_badge_1: "EU Secured Servers",
    footer_badge_2: "Zero Profiling Tracking",
    footer_lang_label: "Language",
    footer_theme_label: "Theme",
    theme_dark: "Dark Mode",
    theme_light: "Clear / Light Mode"
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
    if (theme === 'light') {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }
  }, [theme]);

  const t = (key) => {
    return translations[lang]?.[key] || translations['it']?.[key] || key;
  };

  const toggleTheme = (newTheme) => {
    setTheme(newTheme);
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
