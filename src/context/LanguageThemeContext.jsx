import React, { createContext, useContext, useState, useEffect } from 'react';

export const translations = {
  it: {
    // Navbar
    nav_home: "Home",
    nav_features: "Funzionalità",
    nav_manifesto: "Trasparenza & Etica",
    nav_contact: "Contatti",
    nav_download: "Apri la mappa",

    // Hero
    hero_eyebrow: "Informazione locale trasparente",
    hero_title_1: "Capisci cosa succede",
    hero_title_2: "intorno a te.",
    hero_subtitle: "Sentinel riunisce informazioni locali, aggiornamenti pubblici e segnalazioni della community in una mappa chiara, con fonti e stato di verifica visibili.",
    hero_cta_primary: "Apri la mappa",
    hero_cta_secondary: "Scopri come funziona",
    hero_transparency_note: "Sentinel è uno strumento informativo. Non è un servizio di emergenza e non sostituisce il 112, le forze dell’ordine o le comunicazioni ufficiali.",
    hero_trust_badge: "Strumento informativo · Fonti pubbliche consultabili · Trasparenza dello stato",
    hero_live_badge: "Aggiornamenti Locali",
    hero_alert_title: "Lavori in Corso & Viabilità",
    hero_alert_sub: "Fonte Pubblica Consultabile · Zona Cesena",
    hero_alert_verified: "DA VERIFICARE",

    // Sezione Problema
    problem_tag: "Contesto & Trasparenza /",
    problem_title: "Quando succede qualcosa in città, le informazioni arrivano da molti posti diversi.",
    problem_text: "Un comunicato, una notizia, una segnalazione dal quartiere e un post sui social non hanno lo stesso livello di attendibilità. Sentinel ti aiuta a consultarli in un unico contesto e a capire da dove provengono, quando sono stati pubblicati e se sono ancora da verificare. L’obiettivo non è aumentare la preoccupazione, ma rendere le informazioni locali più comprensibili.",

    // Sezione Destinatari
    dest_tag: "Per Chi è Pensata /",
    dest_title: "Informazioni utili per diverse esigenze quotidiane",
    dest_1_title: "Per chi si sposta ogni giorno",
    dest_1_text: "Controlla aggiornamenti su viabilità, trasporto, lavori, eventi e altri cambiamenti che possono incidere sul tuo percorso.",
    dest_2_title: "Per studenti e pendolari",
    dest_2_text: "Consulta le informazioni disponibili nella zona in cui ti muovi e verifica la fonte prima di prendere decisioni sul percorso.",
    dest_3_title: "Per residenti e comunità locali",
    dest_3_text: "Invia una segnalazione strutturata quando noti un problema o un cambiamento nel territorio. La segnalazione non viene considerata automaticamente un fatto accertato.",
    dest_4_title: "Per organizzazioni e amministrazioni",
    dest_4_text: "Un possibile spazio per raccogliere, organizzare e comunicare aggiornamenti territoriali, con fonti consultabili e livelli di verifica espliciti.",

    // Sezione Cosa Mostra
    shows_tag: "Struttura dei Dati /",
    shows_title: "Informazioni locali, con il loro contesto.",
    shows_card_1_title: "Fonti pubbliche",
    shows_card_1_text: "Notizie e aggiornamenti provenienti da fonti consultabili, con data e riferimento quando disponibili.",
    shows_card_2_title: "Segnalazioni della community",
    shows_card_2_text: "Contenuti inviati dagli utenti e contrassegnati come segnalazioni, non come fatti già confermati.",
    shows_card_3_title: "Stato di verifica",
    shows_card_3_text: "Ogni contenuto indica se è da verificare, in revisione, confermato, risolto o archiviato.",
    shows_card_4_title: "Aggiornamenti territoriali",
    shows_card_4_text: "Una mappa per orientarsi tra eventi, viabilità, lavori, disagi e comunicazioni locali.",

    // Sezione Funzionamento
    how_tag: "Metodo di Lettura /",
    how_title: "Tre passaggi per leggere meglio ciò che accade nella tua zona.",
    step_1_title: "1. Consulta la mappa",
    step_1_text: "Visualizza gli aggiornamenti disponibili nell’area selezionata.",
    step_2_title: "2. Controlla la fonte",
    step_2_text: "Apri la scheda per vedere data, origine dell’informazione e stato di verifica.",
    step_3_title: "3. Contribuisci con responsabilità",
    step_3_text: "Invia una segnalazione descrivendo cosa hai osservato, senza pubblicare accuse, dati personali non necessari o contenuti lesivi.",

    // Sezione Moderazione
    mod_tag: "Revisione & Trasparenza /",
    mod_title: "La chiarezza viene prima della velocità.",
    mod_text: "Le segnalazioni degli utenti non diventano automaticamente comunicazioni ufficiali. Prima della pubblicazione devono essere sottoposte alle regole di moderazione previste dal progetto. I contenuti possono essere rifiutati, limitati, modificati nella visibilità o mantenuti in revisione. Quando un’informazione non è stata verificata, deve essere indicato chiaramente.",
    mod_tech_note: "I contenuti possono essere controllati tramite regole automatiche e revisione umana. Nessun sistema automatico può garantire da solo la correttezza assoluta di una segnalazione.",

    // Sezione Privacy e Responsabilità
    privacy_sec_tag: "Etica & Privacy /",
    privacy_sec_title: "Progettata per informare senza trasformare le persone in bersagli.",
    privacy_p1: "Sentinel non identifica automaticamente persone coinvolte in un evento.",
    privacy_p2: "Non pubblicare volti, targhe, nomi o altri dati personali se non strettamente necessari e legittimi.",
    privacy_p3: "Le segnalazioni non devono contenere accuse verso singoli individui o gruppi.",
    privacy_p4: "Una posizione precisa deve essere utilizzata solo quando necessaria e con adeguate garanzie.",
    privacy_p5: "I contenuti possono essere rimossi o limitati se violano le regole della piattaforma o la legge.",
    privacy_p6: "Sentinel non è un servizio di emergenza: in caso di pericolo immediato chiama il 112.",

    // Sezione Tecnologia
    tech_tag: "Architettura Informativa /",
    tech_title: "Tecnologia utile, spiegata senza promesse assolute.",
    tech_1_title: "Mappa territoriale",
    tech_1_text: "Una mappa interattiva per consultare gli aggiornamenti locali e il loro contesto geografico.",
    tech_2_title: "Aggiornamenti pertinenti",
    tech_2_text: "Possibilità di ricevere notifiche relative a un’area o a un percorso scelto, in base alle funzionalità effettivamente disponibili.",
    tech_3_title: "Provenienza delle informazioni",
    tech_3_text: "Ogni informazione mantiene metadati di origine, data e stato di verifica, così puoi valutarla con maggiore consapevolezza.",
    tech_4_title: "Community moderata",
    tech_4_text: "Un sistema di segnalazioni con regole di partecipazione, controlli e possibilità di revisione.",

    // Sezione Cosa Sentinel non è
    isnot_tag: "Limiti del Progetto /",
    isnot_title: "Cosa Sentinel non promette",
    isnot_p1: "Non garantisce che un percorso sia sicuro.",
    isnot_p2: "Non prevede reati o situazioni di pericolo.",
    isnot_p3: "Non sostituisce il 112, le forze dell’ordine o la Protezione Civile.",
    isnot_p4: "Non certifica automaticamente la verità di ogni segnalazione.",
    isnot_p5: "Non attribuisce responsabilità a persone o gruppi.",
    isnot_p6: "Non è una piattaforma per pubblicare contenuti senza moderazione.",

    // FAQ
    faq_tag: "Domande Frequenti /",
    faq_title: "Domande frequenti",
    faq_sub: "Risposte trasparenti sul posizionamento e le funzionalità di Sentinel.",
    faq_q1: "Sentinel dà informazioni ufficiali?",
    faq_a1: "Solo i contenuti provenienti da canali istituzionali possono essere presentati come comunicazioni ufficiali. Le segnalazioni della community e le notizie di terzi devono rimanere distinte e indicare il proprio livello di verifica.",
    faq_q2: "Posso usare Sentinel durante un’emergenza?",
    faq_a2: "Puoi consultarlo come strumento informativo aggiuntivo, ma non devi usarlo al posto dei numeri di emergenza o delle istruzioni delle autorità. In caso di pericolo immediato chiama il 112.",
    faq_q3: "Le segnalazioni degli utenti sono vere?",
    faq_a3: "Una segnalazione è un’informazione da valutare, non una prova automatica. Sentinel mostra fonte, data e stato di verifica senza trasformare ogni contenuto in un’allerta.",
    faq_q4: "Sentinel controlla la mia posizione?",
    faq_a4: "La raccolta della posizione avviene solo per funzionalità esplicitamente richieste, con informativa chiara e impostazioni coerenti con il consenso dell’utente.",
    faq_q5: "Posso inviare foto o video?",
    faq_a5: "Solo se questa funzione è effettivamente disponibile e accompagnata da regole chiare su persone riprese, dati personali, copyright, conservazione, moderazione e rimozione dei contenuti.",

    // Final CTA & Footer
    final_title: "Informati meglio sul luogo in cui vivi e ti muovi.",
    final_sub: "Consulta le informazioni locali, verifica le fonti e contribuisci alla tua comunità con segnalazioni responsabili.",
    final_cta: "Esplora Sentinel",
    final_disclaimer: "Sentinel è un prototipo/piattaforma informativa in fase di validazione. Le informazioni possono essere incomplete, ritardate o non verificate. Per emergenze e comunicazioni operative fai sempre riferimento ai canali ufficiali.",
    sticky_verified_badge: "Strumento Informativo Locale",

    footer_desc: "Piattaforma di consultazione informativa locale. Fonti pubbliche, segnalazioni comunitarie e stato di verifica trasparente.",
    footer_col_platform: "Piattaforma",
    footer_col_legal: "Note Legali & Privacy",
    footer_privacy: "Privacy Policy (GDPR)",
    footer_terms: "Termini di Servizio",
    footer_moderation: "Politica di Moderazione",
    footer_institutional: "Dati Istituzionali & Fonti",
    footer_rights: "© 2026 Sentinel. Tutti i diritti riservati.",
    footer_badge_1: "Server Sicuri in UE",
    footer_badge_2: "Zero Profilazione Utente",
    footer_lang_label: "Lingua / Language",
    footer_theme_label: "Tema / Theme",
    theme_dark: "Modalità Scura",
    theme_light: "Modalità Chiara",

    // Platform & Manifesto & Contact
    platform_hero_title: "Piattaforma di Consultazione Locale",
    platform_hero_sub: "Mappa interattiva per consultare notizie pubbliche, viabilità ed eventi della community con fonti e stato di verifica.",
    platform_map_title: "Mappa Territoriale Live",
    platform_map_sub: "Dati vettoriali locali con stato di verifica chiaro e fonti tracciabili.",
    platform_map_badge: "● Pilota Forlì-Cesena",
    manifesto_hero_title: "Informazione Chiara, Senza Sensazionalismo.",
    manifesto_hero_sub: " Sentinel aiuta a consultare notizie e segnalazioni locali distinguendo fonti ufficiali e verifiche in corso.",
    manifesto_quote: "\"L'informazione utile è quella che contestualizza i fatti con fonti trasparenti e responsabilità.\""
  },
  en: {
    // Navbar
    nav_home: "Home",
    nav_features: "Features",
    nav_manifesto: "Transparency & Ethics",
    nav_contact: "Contact",
    nav_download: "Open Map",

    // Hero
    hero_eyebrow: "Transparent Local Information",
    hero_title_1: "Understand what happens",
    hero_title_2: "around you.",
    hero_subtitle: "Sentinel gathers local information, public updates, and community reports in a clear map with visible sources and verification status.",
    hero_cta_primary: "Open Map",
    hero_cta_secondary: "See How It Works",
    hero_transparency_note: "Sentinel is an information tool. It is not an emergency service and does not replace 112, law enforcement, or official communications.",
    hero_trust_badge: "Informational Tool · Consultable Public Sources · Transparent Status",
    hero_live_badge: "Local Updates",
    hero_alert_title: "Roadworks & Traffic Detour",
    hero_alert_sub: "Public Source · Cesena Area",
    hero_alert_verified: "PENDING VERIFICATION",

    // Problem Section
    problem_tag: "Context & Transparency /",
    problem_title: "When something happens in town, information comes from many different places.",
    problem_text: "An official announcement, news report, neighborhood notification, or social media post do not carry the same level of reliability. Sentinel helps you view them in a single context and understand where they come from, when they were published, and if they still need verification. The goal is not to raise concern, but to make local information easier to understand.",

    // Target Audience Section
    dest_tag: "Who It Is For /",
    dest_title: "Useful information for everyday needs",
    dest_1_title: "For daily commuters",
    dest_1_text: "Check updates on traffic, transit, roadworks, events, and other changes that could affect your route.",
    dest_2_title: "For students & commuters",
    dest_2_text: "Consult available information in your area and check the source before making route decisions.",
    dest_3_title: "For residents & local communities",
    dest_3_text: "Submit a structured report when you notice an issue or change in your neighborhood. Reports are not automatically considered verified facts.",
    dest_4_title: "For organizations & local authorities",
    dest_4_text: "A space to gather, organize, and communicate local updates with consultable sources and explicit verification levels.",

    // What It Shows
    shows_tag: "Data Structure /",
    shows_title: "Local information, with its context.",
    shows_card_1_title: "Public Sources",
    shows_card_1_text: "News and updates from consultable sources, with date and reference when available.",
    shows_card_2_title: "Community Reports",
    shows_card_2_text: "User-submitted content tagged as user reports, not confirmed facts.",
    shows_card_3_title: "Verification Status",
    shows_card_3_text: "Every item indicates whether it is pending verification, in review, confirmed, resolved, or archived.",
    shows_card_4_title: "Local Updates",
    shows_card_4_text: "An interactive map to navigate events, traffic, roadworks, and local communications.",

    // How It Works
    how_tag: "Reading Method /",
    how_title: "Three steps to better understand what happens in your area.",
    step_1_title: "1. Consult the Map",
    step_1_text: "View available updates in the selected area.",
    step_2_title: "2. Check the Source",
    step_2_text: "Open the card to check the date, origin, and verification status.",
    step_3_title: "3. Contribute Responsibly",
    step_3_text: "Submit a report describing what you observed, without posting accusations, unnecessary personal data, or harmful content.",

    // Moderation Section
    mod_tag: "Review & Moderation /",
    mod_title: "Clarity comes before speed.",
    mod_text: "User reports do not automatically become official communications. Before publication, they are subject to moderation rules. Content may be rejected, limited, restricted in visibility, or kept in review. Unverified information must be clearly marked.",
    mod_tech_note: "Content may be checked via automated rules and human review. No automated system alone can guarantee absolute accuracy.",

    // Privacy & Responsibility
    privacy_sec_tag: "Ethics & Privacy /",
    privacy_sec_title: "Designed to inform without targeting individuals.",
    privacy_p1: "Sentinel does not automatically identify people involved in an event.",
    privacy_p2: "Do not post faces, license plates, names, or other personal data unless strictly necessary and lawful.",
    privacy_p3: "Reports must not contain accusations toward specific individuals or groups.",
    privacy_p4: "Precise location should only be used when necessary and with adequate safeguards.",
    privacy_p5: "Content may be removed or restricted if it violates platform rules or the law.",
    privacy_p6: "Sentinel is not an emergency service: for immediate danger call 112.",

    // Technology
    tech_tag: "Information Architecture /",
    tech_title: "Useful technology, explained without absolute promises.",
    tech_1_title: "Local Map",
    tech_1_text: "An interactive map to consult local updates and their geographic context.",
    tech_2_title: "Relevant Updates",
    tech_2_text: "Ability to receive notifications for chosen areas or routes, based on available features.",
    tech_3_title: "Information Provenance",
    tech_3_text: "Every piece of information retains origin metadata, timestamp, and verification status.",
    tech_4_title: "Moderated Community",
    tech_4_text: "A reporting system with participation rules, checks, and review workflows.",

    // What Sentinel IS NOT
    isnot_tag: "Project Limits /",
    isnot_title: "What Sentinel does not promise",
    isnot_p1: "Does not guarantee that a route is safe.",
    isnot_p2: "Does not predict crime or hazardous situations.",
    isnot_p3: "Does not replace 112, law enforcement, or Civil Protection.",
    isnot_p4: "Does not automatically certify the truth of every report.",
    isnot_p5: "Does not attribute blame to individuals or groups.",
    isnot_p6: "Is not an unmoderated publishing platform.",

    // FAQ
    faq_tag: "Essential FAQ /",
    faq_title: "Frequently Asked Questions",
    faq_sub: "Transparent answers about Sentinel's positioning and features.",
    faq_q1: "Does Sentinel provide official information?",
    faq_a1: "Only content from official institutional channels is presented as official. Community reports and third-party news remain distinct with explicit verification status.",
    faq_q2: "Can I use Sentinel during an emergency?",
    faq_a2: "You can consult it as an additional information tool, but do not use it in place of emergency numbers. In case of immediate danger call 112.",
    faq_q3: "Are user reports true?",
    faq_a3: "A report is information to be evaluated, not automatic proof. Sentinel displays source, date, and status without turning every item into an alert.",
    faq_q4: "Does Sentinel track my location?",
    faq_a4: "Location collection occurs only for explicitly requested features, with clear disclosure and consent settings.",
    faq_q5: "Can I upload photos or videos?",
    faq_a5: "Only if this feature is enabled and accompanied by clear rules on privacy, copyright, moderation, and content removal.",

    // Final CTA & Footer
    final_title: "Get better informed about where you live and travel.",
    final_sub: "Consult local information, verify sources, and contribute to your community with responsible reporting.",
    final_cta: "Explore Sentinel",
    final_disclaimer: "Sentinel is an information platform/prototype currently in validation. Information may be incomplete, delayed, or unverified. For emergencies always refer to official channels.",
    sticky_verified_badge: "Local Information Tool",

    footer_desc: "Local information consultation platform. Public sources, community reports, and transparent verification status.",
    footer_col_platform: "Platform",
    footer_col_legal: "Legal & Privacy",
    footer_privacy: "Privacy Policy (GDPR)",
    footer_terms: "Terms of Service",
    footer_moderation: "Moderation Policy",
    footer_institutional: "Official Sources & Data",
    footer_rights: "© 2026 Sentinel. All rights reserved.",
    footer_badge_1: "EU Secured Servers",
    footer_badge_2: "Zero User Profiling",
    footer_lang_label: "Language",
    footer_theme_label: "Theme",
    theme_dark: "Dark Mode",
    theme_light: "Light Mode",

    // Platform & Manifesto & Contact
    platform_hero_title: "Local Consultation Platform",
    platform_hero_sub: "Interactive map to consult public news, traffic, and community events with transparent verification status.",
    platform_map_title: "Live Local Map",
    platform_map_sub: "High-definition local data with clear status and traceable sources.",
    platform_map_badge: "● Forlì-Cesena Pilot",
    manifesto_hero_title: "Clear Information, Without Sensationalism.",
    manifesto_hero_sub: "Sentinel helps consult local news and reports, distinguishing official sources from unverified submissions.",
    manifesto_quote: "\"Useful information contextualizes facts with transparent sources and responsibility.\""
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
