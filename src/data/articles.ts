/**
 * Source of truth for educatie-artikelen op batterij123.nl.
 *
 * Elk artikel wordt zowel op de overzichtspagina (/educatie) als op een
 * detailpagina (/educatie/:slug) getoond. Houd Dutch SEO-rich content,
 * relevante long-tail zoektermen (salderingsregeling, dynamisch tarief,
 * plug & play thuisbatterij, LFP, terugverdientijd, etc.) en concrete
 * voorbeelden voor lezers in Nederland.
 */

export type ArticleSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

export type Article = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  category: 'Subsidies' | 'Technologie' | 'Gidsen' | 'Infotainment' | 'Reviews';
  image: string;
  imageAlt: string;
  imageCredit: string;
  intro: string;
  sections: ArticleSection[];
  takeaways: string[];
};

export const articles: Article[] = [
  {
    id: 1,
    slug: 'afbouw-salderingsregeling-2027',
    title: 'Afbouw salderingsregeling 2027: waarom een thuisbatterij nu loont',
    excerpt:
      'De salderingsregeling verdwijnt per 1 januari 2027. Lees hoe een plug & play thuisbatterij uw zelfconsumptie verhoogt, dynamische tarieven benut en de terugverdientijd verkort.',
    author: 'Mark van Dijk',
    date: '12 mei 2026',
    readTime: '9 min',
    category: 'Subsidies',
    image: '/articles/afbouw-salderingsregeling-2027/cover.webp',
    imageAlt: 'Zonnepanelen op het dak van een Nederlandse rijtjeswoning',
    imageCredit: 'Foto: Unsplash – Truong Tuyet Ly',
    intro:
      'Op 1 januari 2027 verdwijnt de salderingsregeling definitief. Voor de ongeveer 2,7 miljoen Nederlandse huishoudens met zonnepanelen verandert het verdienmodel daardoor ingrijpend. In dit artikel leggen we uit wat de afbouw precies inhoudt, waarom energieleveranciers nu al een terugleverboete rekenen en hoe een plug & play thuisbatterij u helpt om uw zonnestroom maximaal zelf te gebruiken.',
    sections: [
      {
        heading: 'Wat verandert er precies in 2027?',
        paragraphs: [
          'Tot en met 31 december 2026 mag u alle teruggeleverde stroom nog gewoon salderen: kWh-in en kWh-uit worden tegen hetzelfde tarief verrekend. Vanaf 1 januari 2027 stopt dat in één keer. Wat u teruglevert krijgt u dan tegen een veel lagere terugleververgoeding, terwijl u voor de stroom die u inkoopt het volledige leveringstarief plus belastingen betaalt.',
          'Het verschil tussen die twee tarieven – al snel 25 tot 35 cent per kWh – is precies de waarde die u verliest zodra u terug levert in plaats van zelf gebruikt. Voor een gemiddeld gezin met 10 zonnepanelen kan dat oplopen tot enkele honderden euro\'s per jaar.',
        ],
      },
      {
        heading: 'Terugleverboete: waarom u nu al betaalt',
        paragraphs: [
          'Vrijwel alle grote energieleveranciers (Vattenfall, Eneco, Essent, Greenchoice, Budget Energie) hanteren inmiddels een terugleverboete of toeslag voor klanten die meer dan 500-1.000 kWh per jaar terug leveren. Die toeslag staat los van de salderingsregeling en is onder bepaalde voorwaarden door de ACM toegestaan.',
          'In de praktijk betekent dit dat het verstandig is om uw zonnestroom zoveel mogelijk zelf te verbruiken. Hoe hoger uw zelfconsumptie, hoe lager uw maandelijkse energierekening en hoe minder u kwijt bent aan die boete.',
        ],
      },
      {
        heading: 'Hoe een plug & play thuisbatterij rendeert',
        paragraphs: [
          'Een plug & play thuisbatterij zoals de Marstek Venus E, HomeWizard Plug-In, Zendure SolarFlow of EcoFlow STREAM slaat overdag uw overtollige zonnestroom op en levert die terug zodra uw verbruik stijgt. U verbruikt dus eigen zonnestroom in plaats van dure netstroom \'s avonds.',
          'Combineer dat met een dynamisch energiecontract (Tibber, Frank Energie, ANWB Energie of Energy Zero) en u verdient ook geld door uw batterij te laden tijdens negatieve of zeer lage uurtarieven en te ontladen op piekmomenten. Realistische extra opbrengst: 200 tot 500 euro per jaar bovenop uw zelfconsumptiewinst.',
        ],
        bullets: [
          'Zelfconsumptie zonnestroom van ~30% naar 70-85%',
          'Bespaar 25-35 cent per opgeslagen kWh',
          'Verdienen via dynamisch contract bij piekuren',
          'Geen terugleverboete over de opgeslagen kWh\'s',
        ],
      },
      {
        heading: 'Realistische terugverdientijd na 2027',
        paragraphs: [
          'Voor een complete plug & play set (batterij van 2,5 tot 5 kWh, P1 Meter en slimme stekker) van rond de 1.300 tot 1.800 euro is een terugverdientijd van 6 tot 9 jaar haalbaar. Dat is aanzienlijk korter dan de 10-12 jaar die nu nog vaak wordt genoemd, simpelweg omdat de waarde van zelfgebruikte stroom na 2027 fors hoger ligt dan de waarde van teruggeleverde stroom.',
          'Bovendien geldt er sinds 2023 een 0% btw-tarief op zonnepanelen en (in veel gemeentes) op de installatie van een hybride omvormer. Vraag uw installateur expliciet naar deze regeling, het scheelt 21% op de aanschaf.',
        ],
      },
    ],
    takeaways: [
      'De salderingsregeling verdwijnt op 1 januari 2027 in één keer.',
      'Energieleveranciers rekenen nu al een terugleverboete bij hoge terug levering.',
      'Een plug & play thuisbatterij verhoogt uw zelfconsumptie naar 70-85%.',
      'Met een dynamisch contract verdient u extra op piek- en daluren.',
      'Realistische terugverdientijd in 2027: 6 tot 9 jaar.',
    ],
  },
  {
    id: 2,
    slug: 'lithium-ion-vs-lfp-veiligheid',
    title: 'Lithium-ion vs LFP: welke batterijtechnologie is in 2026 het veiligst?',
    excerpt:
      'NMC, LFP, sodium-ion: de chemie achter uw thuisbatterij bepaalt veiligheid, levensduur en prijs. We vergelijken de drie populairste opties van 2026 helder en zonder marketingpraat.',
    author: 'Sarah de Vries',
    date: '8 mei 2026',
    readTime: '12 min',
    category: 'Technologie',
    image: '/articles/lithium-ion-vs-lfp-veiligheid/cover.webp',
    imageAlt: 'Close-up van lithium-cellen in een batterijmodule',
    imageCredit: 'Foto: Unsplash',
    intro:
      'Bij het kopen van een thuisbatterij struikelt u snel over termen als LFP, NMC, LiFePO4, sodium-ion en C-rate. Achter al die afkortingen schuilt de chemie van de batterijcel – en dáár zit het verschil tussen een veilige, langlevende batterij en een goedkoop maar risicovol pakket. In deze gids leggen we de drie technologieën uit die u in 2026 op de Nederlandse markt aantreft.',
    sections: [
      {
        heading: 'NMC: hoge energiedichtheid, hoger risico',
        paragraphs: [
          'NMC (Nikkel Mangaan Kobalt) was lange tijd de standaard voor lithium-ion batterijen, zowel in elektrische auto\'s als in thuisbatterijen van merken zoals Tesla Powerwall 2 en LG Chem RESU. NMC heeft een hoge energiedichtheid (~250 Wh/kg) waardoor de batterij compact kan blijven.',
          'Het nadeel: NMC raakt sneller in een thermal runaway bij beschadiging, te hoge laadstroom of brand. Daarom worden NMC-batterijen in Nederland steeds vaker geweerd uit binnenopstellingen en moeten ze in aparte technische ruimtes of buiten geïnstalleerd worden.',
        ],
      },
      {
        heading: 'LFP (LiFePO4): de nieuwe standaard voor thuisbatterijen',
        paragraphs: [
          'LFP (Lithium IJzerfosfaat) is in 2026 dé standaard voor plug & play thuisbatterijen. Vrijwel alle moderne modellen – Marstek Venus, HomeWizard Plug-In, Zendure SolarFlow, Anker SOLIX Solarbank, EcoFlow STREAM – draaien op LFP.',
          'LFP heeft een iets lagere energiedichtheid (~160 Wh/kg) dan NMC, maar is op vrijwel alle andere punten beter: veiliger, langere levensduur (6.000-10.000 cycli), geen kobalt en goedkoper te produceren. De cellen zijn thermisch stabiel tot ver boven de 200 graden Celsius en geven bij beschadiging geen brandbare gassen vrij.',
        ],
        bullets: [
          'Levensduur: 6.000-10.000 laadcycli (15-20 jaar bij dagelijks gebruik)',
          'Werktemperatuur: -10 tot +60 °C',
          'Geen kobalt of nikkel nodig (lagere milieu-impact)',
          'Goedkoper per kWh dan NMC (~150-200 €/kWh in 2026)',
        ],
      },
      {
        heading: 'Sodium-ion: opkomende technologie voor 2027+',
        paragraphs: [
          'Sodium-ion (Na-ion) gebruikt natrium in plaats van lithium en is een veelbelovende technologie die in 2026-2027 op de Nederlandse markt verschijnt. De eerste plug & play modellen zijn al aangekondigd door fabrikanten zoals CATL, BYD en Hithium.',
          'Voordeel: natrium is gigantisch ruim beschikbaar en goedkoop. Nadeel: de energiedichtheid is voorlopig nog 20-30% lager dan LFP, dus de batterijen zijn groter. Voor een statische thuisbatterij is dat geen probleem; voor een wandmontage wel.',
        ],
      },
      {
        heading: 'Wat moet u kopen in 2026?',
        paragraphs: [
          'Voor verreweg de meeste Nederlandse huishoudens is LFP de juiste keuze: veilig, lange levensduur, goede prijs-prestatieverhouding en geschikt voor binnen- én buitenopstelling. Let op het CE-keurmerk, een Battery Management System (BMS) met cel-balancering en kies fabrikanten die minimaal 10 jaar garantie geven op de capaciteit (bijvoorbeeld 70% restcapaciteit na 10 jaar).',
          'Wacht u op sodium-ion? Dat kan, maar de meerwaarde is op dit moment marginaal en LFP heeft inmiddels zo\'n gunstige prijs dat u zonder probleem nu kunt kopen.',
        ],
      },
    ],
    takeaways: [
      'LFP is in 2026 dé standaard voor plug & play thuisbatterijen.',
      'NMC heeft hogere energiedichtheid maar is brandgevoeliger.',
      'Sodium-ion komt eraan vanaf 2027 maar is voorlopig nog niet beter.',
      'Let op CE-keurmerk, BMS en minimaal 10 jaar garantie.',
      'Verwacht 6.000-10.000 laadcycli bij een goede LFP-batterij.',
    ],
  },
  {
    id: 3,
    slug: 'capaciteit-thuisbatterij-berekenen',
    title: 'Hoe groot moet uw thuisbatterij zijn? Stap-voor-stap capaciteit berekenen',
    excerpt:
      'Een te kleine batterij levert weinig op, een te grote betaalt zich nooit terug. Met deze methode berekent u in 5 minuten de ideale kWh-capaciteit voor uw eigen verbruik.',
    author: 'Jan de Boer',
    date: '4 mei 2026',
    readTime: '10 min',
    category: 'Gidsen',
    image: '/articles/capaciteit-thuisbatterij-berekenen/cover.webp',
    imageAlt: 'Modern Nederlands woonhuis met zonnepanelen op het dak',
    imageCredit: 'Foto: Unsplash',
    intro:
      'Een veelgemaakte fout bij de aanschaf van een thuisbatterij is een capaciteit kiezen die niet past bij uw werkelijke verbruik. Te klein en u mist veel zonneoverschot; te groot en u betaalt voor kWh\'s die u nooit zult gebruiken. In deze gids leiden we u stap voor stap door de berekening, zodat u zelf kunt bepalen of een 2,4 kWh-, 5 kWh- of 10 kWh-systeem het beste past.',
    sections: [
      {
        heading: 'Stap 1: bepaal uw avondverbruik (kWh per dag)',
        paragraphs: [
          'Open uw energiemeter-app of het portaal van uw netbeheerder (MijnLiander, Stedin, Enexis). Bekijk uw verbruik tussen 17:00 en 23:00 uur over een typische week in maart of september. Dat is de periode waarin uw zonnepanelen weinig opwekken maar u thuis bent.',
          'Gemiddeld Nederlands huishouden: 4 tot 8 kWh per avond. Een gezin met inductiekookplaat en EV in de oprit kan flink hoger uitkomen.',
        ],
      },
      {
        heading: 'Stap 2: kijk naar uw zonneoverschot midden op de dag',
        paragraphs: [
          'In dezelfde app ziet u hoeveel u rond 12:00-15:00 uur terug levert op een zonnige dag. Dat overschot is precies wat een batterij kan opslaan.',
          '8-10 panelen leveren in juni vaak 4-6 kWh terug per dag, 14-16 panelen al snel 8-12 kWh. Hier zit het plafond van de zinvolle batterijcapaciteit: meer kWh opslag dan u op een zonnige dag overheeft, gaat u nooit benutten.',
        ],
      },
      {
        heading: 'Stap 3: matchen op aansluitingen + omvormer',
        paragraphs: [
          'Plug & play modellen (HomeWizard, Marstek, Zendure, EcoFlow) hebben een AC-ingang en -uitgang van maximaal 800 W of 1.200 W. Dat betekent dat de batterij niet alle ineens kan ontladen, maar wel uw basislast (koelkast, vriezer, verlichting, modem) urenlang kan dekken.',
          'Heeft u veel piekverbruik (sauna, warmtepomp, inductiekookplaat van 7 kW), kies dan voor een gekoppeld systeem met een hybride omvormer en LFP-modules in het rek (zoals Sessy of een DIY-systeem met Victron en Pylontech).',
        ],
        bullets: [
          'Kleine huishouden / appartement: 1,5-2,5 kWh',
          'Gemiddeld gezin: 2,5-5 kWh',
          'Groot gezin + EV/warmtepomp: 5-10 kWh',
          'Off-grid / volledig autonoom: 10+ kWh + gekoppeld systeem',
        ],
      },
      {
        heading: 'Stap 4: ruimte voor groei',
        paragraphs: [
          'De meeste plug & play merken zijn modulair: u kunt later een tweede batterij naast de eerste hangen en de capaciteit verdubbelen. Begin daarom niet meteen te groot. Een Marstek Venus E 3.0 of Anker Solarbank 3 Pro is een goed startpunt; merkt u na een half jaar dat u nog vaak terug levert, dan koopt u een tweede.',
        ],
      },
    ],
    takeaways: [
      'Bepaal eerst uw avondverbruik in kWh (17:00-23:00 uur).',
      'Plafond = uw daggemiddelde zonneoverschot.',
      'Plug & play kan 800-1.200 W continu leveren – genoeg voor basislast.',
      'Voor warmtepomp/EV: kies een gekoppeld systeem met hybride omvormer.',
      'Begin niet meteen te groot; modulair uitbreiden kan altijd later.',
    ],
  },
  {
    id: 4,
    slug: 'smart-grid-energy-trading',
    title: 'Slimme energienetten: zo verdient uw thuisbatterij geld op de markt',
    excerpt:
      'Met dynamische tarieven, regelvermogen en virtual power plants verandert uw batterij in een actieve speler op de Nederlandse energiemarkt. Een praktische gids voor 2026.',
    author: 'Ellen Smit',
    date: '28 april 2026',
    readTime: '14 min',
    category: 'Infotainment',
    image: '/articles/smart-grid-energy-trading/cover.webp',
    imageAlt: 'Hoogspanningsmasten en het Nederlandse elektriciteitsnet bij zonsondergang',
    imageCredit: 'Foto: Unsplash',
    intro:
      'Een thuisbatterij is in 2026 veel meer dan een kale energieopslag. Door slimme software en open API\'s wordt uw batterij een actieve speler op de Nederlandse stroommarkt: hij koopt goedkope nachtstroom in, verkoopt op piekuren, levert regelvermogen aan TenneT en sluit zich aan bij een virtual power plant. In deze gids leggen we uit welke verdienmodellen praktisch beschikbaar zijn en welke nog in de experimentele fase zitten.',
    sections: [
      {
        heading: 'Dynamische tarieven: het lage-hangende fruit',
        paragraphs: [
          'De eenvoudigste manier om met uw batterij te verdienen is een dynamisch energiecontract bij Tibber, ANWB Energie, Frank Energie, Energy Zero of Eneco Dynamisch. Uw tarief volgt dan de EPEX-uurprijs: \'s nachts vaak 5-12 cent per kWh, op piekuren \'s avonds 30-45 cent.',
          'Slimme batterij-apps (HomeWizard Energy+, Marstek Cloud, Zendure App) laden de batterij automatisch op de goedkoopste uren en ontladen op de duurste uren. Verwachte extra opbrengst: 150 tot 400 euro per jaar bovenop uw normale zelfconsumptie-besparing.',
        ],
      },
      {
        heading: 'Onbalansmarkt en FCR: regelvermogen leveren',
        paragraphs: [
          'TenneT, de Nederlandse landelijk netbeheerder, koopt iedere 15 minuten regelvermogen in om vraag en aanbod in balans te houden. Sinds 2024 mogen ook particuliere thuisbatterijen, geaggregeerd via een dienstverlener, regelvermogen leveren.',
          'Aanbieders zoals Sympower, Next Kraftwerke en Jedlix bundelen duizenden thuisbatterijen tot één virtual power plant. U geeft hen een mandaat om uw batterij seconden tot minuten beschikbaar te stellen, en krijgt daarvoor een vergoeding per beschikbare kW per maand.',
        ],
        bullets: [
          'FCR (Frequency Containment Reserve): seconde-snelle regeling',
          'aFRR (automatic Frequency Restoration Reserve): minuten-regeling',
          'Onbalansmarkt: 15-minutenmarkt',
          'GOPACS: oplossing voor regionale congestie',
        ],
      },
      {
        heading: 'Virtual Power Plants: samen sterker',
        paragraphs: [
          'Een Virtual Power Plant (VPP) is een softwareplatform dat duizenden gedistribueerde batterijen en zonnepanelen aanstuurt alsof het één grote centrale is. In Nederland zijn dat onder andere Vandebron Stroomdelers, Sympower Aggregator en Next Kraftwerke.',
          'U behoudt altijd controle: de VPP mag uw batterij alleen sturen binnen de grenzen die u zelf instelt (bijvoorbeeld: ga nooit onder 30% laadtoestand, niet tussen 18:00 en 21:00). De vergoeding verschilt per platform, gemiddeld 50-150 euro per jaar voor een 5 kWh-systeem.',
        ],
      },
      {
        heading: 'Praktisch: wat heeft u nodig?',
        paragraphs: [
          'Voor dynamische tarieven heeft u een slimme meter, een digitaal contract bij een dynamische leverancier en bij voorkeur een P1 Meter (HomeWizard) voor lokale monitoring. Voor VPP- en regelvermogendiensten heeft u daarnaast een batterij met open API of officiële cloud-integratie.',
          'Bij Marstek, Sessy, Zendure en EcoFlow is dit standaard inbegrepen. Bij oudere systemen (Tesla Powerwall 2, oude LG Chem) moet u soms een aparte dongle of bridge plaatsen.',
        ],
      },
    ],
    takeaways: [
      'Dynamisch contract = makkelijkste extra opbrengst (€150-€400/jaar).',
      'Virtual Power Plants geven €50-€150/jaar voor 5 kWh aan beschikbaarheid.',
      'TenneT regelvermogen is sinds 2024 ook voor particuliere batterijen open.',
      'P1 Meter + slimme meter zijn voorwaarde voor optimale aansturing.',
      'U houdt altijd controle: zelf grenzen instellen in de app.',
    ],
  },
];

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}
