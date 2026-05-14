import { Clock, User, ArrowRight, Search, Tag, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { articles } from '../data/articles';
import JsonLd from '../components/JsonLd';
import { usePageMeta } from '../lib/seo';
import { breadcrumbSchema, faqSchema } from '../lib/structured-data';

const faqs = [
  {
    question: 'Wat is een thuisbatterij precies?',
    answer:
      "Een thuisbatterij is een systeem dat elektrische energie opslaat, meestal afkomstig van uw zonnepanelen. Hiermee kunt u de overdag opgewekte stroom gebruiken wanneer u die echt nodig heeft, bijvoorbeeld 's avonds of 's nachts.",
  },
  {
    question: 'Is een thuisbatterij rendabel in Nederland?',
    answer:
      'Vanaf 1 januari 2027 verdwijnt de salderingsregeling. Daardoor wordt zelf gebruikte zonnestroom veel meer waard dan teruggeleverde stroom en daalt de terugverdientijd van een plug & play batterij naar 6-9 jaar.',
  },
  {
    question: 'Hoe lang gaat een thuisbatterij mee?',
    answer:
      'Moderne LFP-batterijen (Marstek, HomeWizard, Zendure, EcoFlow, Anker) gaan 15-20 jaar mee, oftewel 6.000 tot 10.000 laadcycli. Fabrikanten geven doorgaans 10 jaar garantie op minimaal 70% restcapaciteit.',
  },
  {
    question: 'Heb ik een speciale omvormer nodig?',
    answer:
      'Voor plug & play batterijen (HomeWizard Plug-In, Marstek Venus, Zendure SolarFlow, EcoFlow STREAM) niet: u steekt ze gewoon in een geaarde stekker. Voor gekoppelde systemen heeft u wel een hybride omvormer nodig.',
  },
  {
    question: 'Zijn er subsidies voor thuisbatterijen?',
    answer:
      'Er is geen landelijke subsidie voor particulieren. Wel kunt u btw (21%) terugvragen als u de batterij gebruikt voor handel op de dynamische energiemarkt. Veel installateurs leveren plug & play sets bovendien onder het 0% btw-tarief.',
  },
];

const categories = ['Alle', 'Subsidies', 'Technologie', 'Gidsen', 'Infotainment'] as const;

function FAQItem({ question, answer }: { question: string; answer: string; key?: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 py-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex w-full items-center justify-between text-left focus:outline-none"
      >
        <span
          className={cn(
            'text-lg font-bold transition-colors duration-300',
            isOpen ? 'text-gray-900' : 'text-gray-700 group-hover:text-gray-900',
          )}
        >
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
              opacity: { duration: 0.25, delay: 0.1 },
            }}
            className="overflow-hidden"
          >
            <div className="pb-2">
              <p className="mt-4 text-gray-500 leading-relaxed">{answer}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Education() {
  const [activeCategory, setActiveCategory] = useState<(typeof categories)[number]>('Alle');
  const [query, setQuery] = useState('');

  usePageMeta({
    title: 'Kennisbank thuisbatterijen | Salderingsregeling 2027 | Batterij123',
    description:
      'Onafhankelijke artikelen over thuisbatterijen, de afbouw van de salderingsregeling in 2027, dynamische energietarieven, LFP-veiligheid en smart grid trading.',
    canonicalPath: '/educatie',
  });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return articles.filter((a) => {
      const matchCategory = activeCategory === 'Alle' || a.category === activeCategory;
      const matchQuery =
        !q ||
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        a.intro.toLowerCase().includes(q);
      return matchCategory && matchQuery;
    });
  }, [activeCategory, query]);

  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <div className="bg-white py-12">
      <JsonLd
        id="breadcrumb-educatie"
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Kennisbank', path: '/educatie' },
        ])}
      />
      <JsonLd id="faq-educatie" data={faqSchema(faqs)} />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Kennisbank & Infotainment
            </h1>
            <p className="mt-4 text-lg text-gray-500">
              Onafhankelijke artikelen over thuisbatterijen, salderingsregeling, dynamische tarieven
              en de energietransitie in Nederland.
            </p>
          </div>

          <div className="relative w-full max-w-xs">
            <label htmlFor="education-search" className="sr-only">
              Zoek in artikelen
            </label>
            <Search aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              id="education-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Zoek in artikelen..."
              aria-label="Zoek in artikelen"
              className="w-full rounded-full border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="mb-12 flex flex-wrap gap-3">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                'rounded-full border px-5 py-2 text-sm font-bold transition-colors',
                activeCategory === cat
                  ? 'border-gray-900 bg-gray-900 text-white'
                  : 'border-gray-200 bg-white text-gray-900 hover:bg-gray-50',
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-200 p-16 text-center text-gray-500">
            Geen artikelen gevonden voor deze filter.
          </div>
        ) : (
          <>
            {/* Featured Article */}
            {featured && (
              <Link
                to={`/educatie/${featured.slug}`}
                className="mb-20 block overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-lg"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  <div className="relative aspect-video lg:aspect-auto">
                    <img
                      src={featured.image}
                      alt={featured.imageAlt}
                      width="800"
                      height="450"
                      fetchPriority="high"
                      loading="eager"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col justify-center p-8 md:p-12">
                    <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                      <Tag className="h-3 w-3" />
                      {featured.category}
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                      {featured.title}
                    </h2>
                    <p className="mt-6 text-lg text-gray-500 leading-relaxed">{featured.excerpt}</p>
                    <div className="mt-8 flex items-center gap-6 text-sm text-gray-400">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {featured.author}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {featured.readTime}
                      </div>
                    </div>
                    <span className="mt-10 inline-flex items-center gap-2 text-sm font-bold text-gray-900">
                      Lees het volledige artikel <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </Link>
            )}

            {/* Article Grid */}
            {rest.length > 0 && (
              <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-3">
                {rest.map((article) => (
                  <Link
                    key={article.id}
                    to={`/educatie/${article.slug}`}
                    className="group flex flex-col gap-6"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-gray-100">
                      <img
                        src={article.image}
                        alt={article.imageAlt}
                        width="640"
                        height="400"
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                        <Tag className="h-3 w-3" />
                        {article.category}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 group-hover:underline">
                        {article.title}
                      </h3>
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
                  </Link>
                ))}
              </div>
            )}
          </>
        )}

        {/* FAQ Section */}
        <div className="mt-32">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Veelgestelde vragen</h2>
            <p className="mt-4 text-lg text-gray-500">
              Alles wat u moet weten over thuisbatterijen in één overzicht.
            </p>
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
