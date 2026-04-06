import { BookOpen, Clock, User, ArrowRight, Search, Tag, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

const articles = [
  {
    id: 1,
    title: 'De Afbouw van de Salderingsregeling: Wat betekent dit voor u?',
    excerpt: 'Vanaf 2025 wordt de salderingsregeling stapsgewijs afgebouwd. Ontdek waarom een thuisbatterij nu interessanter is dan ooit.',
    author: 'Mark van Dijk',
    date: '15 Maart 2024',
    readTime: '8 min',
    category: 'Subsidies',
    image: 'https://images.unsplash.com/photo-1509391366360-fe5bb58583bb?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 2,
    title: 'Lithium-ion vs. LFP: Welke technologie is het veiligst?',
    excerpt: 'Er zijn verschillende soorten batterijtechnologieën op de markt. We vergelijken de voor- en nadelen van de populairste opties.',
    author: 'Sarah de Vries',
    date: '10 Maart 2024',
    readTime: '12 min',
    category: 'Technologie',
    image: 'https://images.unsplash.com/photo-1548333341-97d4160eeacb?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 3,
    title: 'Hoe groot moet mijn thuisbatterij zijn? Een handige gids.',
    excerpt: 'De juiste capaciteit kiezen is essentieel voor een goede terugverdientijd. Leer hoe u uw ideale batterijgrootte berekent.',
    author: 'Jan de Boer',
    date: '5 Maart 2024',
    readTime: '10 min',
    category: 'Gidsen',
    image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 4,
    title: 'Infotainment: De toekomst van slimme energienetwerken.',
    excerpt: 'Hoe uw thuisbatterij kan bijdragen aan een stabieler elektriciteitsnet en hoe u daar geld mee kunt verdienen.',
    author: 'Ellen Smit',
    date: '1 Maart 2024',
    readTime: '15 min',
    category: 'Infotainment',
    image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80&w=800'
  }
];

const faqs = [
  {
    question: 'Wat is een thuisbatterij precies?',
    answer: 'Een thuisbatterij is een systeem dat elektrische energie opslaat, meestal afkomstig van uw zonnepanelen. Hiermee kunt u de overdag opgewekte stroom gebruiken wanneer u die echt nodig heeft, bijvoorbeeld \'s avonds of \'s nachts.'
  },
  {
    question: 'Is een thuisbatterij rendabel in Nederland?',
    answer: 'Met de huidige salderingsregeling is de terugverdientijd nog relatief lang (10-12 jaar). Echter, met de geplande afbouw van het salderen vanaf 2025 en de stijgende energieprijzen, wordt de business case voor een thuisbatterij elk jaar sterker.'
  },
  {
    question: 'Hoe lang gaat een thuisbatterij mee?',
    answer: 'De meeste moderne thuisbatterijen (zoals LFP-batterijen) gaan tussen de 10 en 15 jaar mee, of ongeveer 6.000 tot 10.000 laadcycli. Fabrikanten geven vaak 10 jaar garantie op de capaciteit.'
  },
  {
    question: 'Heb ik een speciale omvormer nodig?',
    answer: 'Ja, voor een thuisbatterij heeft u een hybride omvormer nodig die zowel met de zonnepanelen als met de batterij kan communiceren, of een aparte batterij-omvormer als u al een bestaand systeem heeft.'
  },
  {
    question: 'Zijn er subsidies voor thuisbatterijen?',
    answer: 'Op dit moment is er geen landelijke subsidie voor particulieren in Nederland. Wel kunt u de BTW op de aanschaf en installatie vaak terugvragen als u de batterij gebruikt voor handelen op de energiemarkt (bijv. via een dynamisch contract).'
  }
];

function FAQItem({ question, answer }: { question: string; answer: string; key?: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 py-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex w-full items-center justify-between text-left focus:outline-none"
      >
        <span className={cn(
          "text-lg font-bold transition-colors duration-300",
          isOpen ? "text-gray-900" : "text-gray-700 group-hover:text-gray-900"
        )}>
          {question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="text-gray-400 group-hover:text-gray-600"
        >
          <ChevronDown className="h-5 w-5" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ 
              height: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
              opacity: { duration: 0.25, delay: 0.1 }
            }}
            className="overflow-hidden"
          >
            <div className="pb-2">
              <p className="mt-4 text-gray-500 leading-relaxed">
                {answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Education() {
  return (
    <div className="bg-white py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">Kennisbank & Infotainment</h1>
            <p className="mt-4 text-lg text-gray-500">
              Alles over thuisbatterijen, energieopslag en de energietransitie in Nederland.
            </p>
          </div>
          
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Zoek in artikelen..."
              className="w-full rounded-full border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="mb-12 flex flex-wrap gap-3">
          {['Alle', 'Technologie', 'Subsidies', 'Gidsen', 'Infotainment', 'Reviews'].map((cat) => (
            <button
              key={cat}
              className="rounded-full border border-gray-200 bg-white px-5 py-2 text-sm font-bold text-gray-900 hover:bg-gray-50 transition-colors"
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Featured Article */}
        <div className="mb-20 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="relative aspect-video lg:aspect-auto">
              <img
                src={articles[0].image}
                alt={articles[0].title}
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex flex-col justify-center p-8 md:p-12">
              <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                <Tag className="h-3 w-3" />
                {articles[0].category}
              </div>
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">{articles[0].title}</h2>
              <p className="mt-6 text-lg text-gray-500 leading-relaxed">
                {articles[0].excerpt}
              </p>
              <div className="mt-8 flex items-center gap-6 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {articles[0].author}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {articles[0].readTime}
                </div>
              </div>
              <Link
                to={`/educatie/${articles[0].id}`}
                className="mt-10 inline-flex items-center gap-2 text-sm font-bold text-gray-900 hover:underline"
              >
                Lees meer <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Article Grid */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-3">
          {articles.slice(1).map((article) => (
            <div key={article.id} className="group flex flex-col gap-6">
              <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-gray-100">
                <img
                  src={article.image}
                  alt={article.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                  <Tag className="h-3 w-3" />
                  {article.category}
                </div>
                <h3 className="text-xl font-bold text-gray-900 group-hover:underline">{article.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">
                  {article.excerpt}
                </p>
                <div className="mt-4 flex items-center gap-4 text-xs text-gray-400">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {article.readTime}
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {article.author}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-32">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Veelgestelde Vragen</h2>
            <p className="mt-4 text-lg text-gray-500">Alles wat u moet weten over thuisbatterijen in één overzicht.</p>
          </div>
          <div className="mx-auto max-w-3xl">
            {faqs.map((faq, index) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>
        
        {/* Newsletter Section */}
        <div className="mt-32 rounded-3xl bg-gray-900 p-8 md:p-16 text-center text-white">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-3xl font-bold sm:text-4xl">Blijf op de hoogte</h2>
            <p className="mt-4 text-lg text-gray-400">
              Ontvang maandelijks de nieuwste trends, subsidies en reviews direct in uw inbox.
            </p>
            <form className="mt-10 flex flex-col gap-4 sm:flex-row">
              <input
                type="email"
                placeholder="Uw emailadres"
                className="flex-1 rounded-full border-none bg-white/10 px-6 py-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-white"
              />
              <button className="rounded-full bg-white px-8 py-4 text-base font-bold text-gray-900 transition-opacity hover:opacity-90">
                Inschrijven
              </button>
            </form>
            <p className="mt-4 text-xs text-gray-500">
              U kunt zich op elk moment weer uitschrijven. Bekijk ons privacybeleid.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
