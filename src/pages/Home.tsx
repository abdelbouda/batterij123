import { motion } from 'motion/react';
import { Battery, CheckCircle2, ArrowRight, Zap, Shield, TrendingUp, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import BatteryCard from '../components/BatteryCard';
import { batteries } from '../data/batteries';

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white py-20 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-1.5 text-sm font-bold text-gray-900"
            >
              <Zap className="h-4 w-4" />
              <span>Bespaar tot 70% op uw energierekening</span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-6 max-w-3xl text-5xl font-bold tracking-tight text-gray-900 sm:text-7xl"
            >
              De beste thuisbatterij voor <span className="text-gray-400">uw woning</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-8 max-w-2xl text-lg leading-relaxed text-gray-500"
            >
              Vergelijk de populairste thuisbatterijen van 2024. Onafhankelijk advies, reviews en de scherpste prijzen voor energieopslag in Nederland.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-10 flex flex-wrap gap-4"
            >
              <Link
                to="/producten"
                className="rounded-full bg-gray-900 px-8 py-4 text-base font-bold text-white transition-opacity hover:opacity-90"
              >
                Bekijk alle batterijen
              </Link>
              <Link
                to="/educatie"
                className="rounded-full border border-gray-200 bg-white px-8 py-4 text-base font-bold text-gray-900 transition-colors hover:bg-gray-50"
              >
                Hoe werkt het?
              </Link>
            </motion.div>
          </div>
        </div>
        
        {/* Background Decorative Element */}
        <div className="absolute top-0 right-0 -z-10 h-full w-1/3 bg-gray-50/50 blur-3xl lg:block hidden"></div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
            <div className="flex flex-col gap-4 rounded-2xl bg-white p-8 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-900 text-white">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Onafhankelijk Advies</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Wij zijn niet gebonden aan fabrikanten. U krijgt eerlijk advies gebaseerd op uw persoonlijke situatie.
              </p>
            </div>
            <div className="flex flex-col gap-4 rounded-2xl bg-white p-8 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-900 text-white">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Maximale Besparing</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Optimaliseer uw eigenverbruik van zonne-energie en verlaag uw afhankelijkheid van het stroomnet.
              </p>
            </div>
            <div className="flex flex-col gap-4 rounded-2xl bg-white p-8 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-900 text-white">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Gecertificeerde Installateurs</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Wij werken alleen met de beste installateurs in Nederland voor een veilige en professionele installatie.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Batteries Section */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 flex flex-col items-center text-center lg:flex-row lg:justify-between lg:text-left">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Populaire Thuisbatterijen</h2>
              <p className="mt-4 text-lg text-gray-500">De best geteste modellen van dit moment.</p>
            </div>
            <Link to="/producten" className="mt-8 flex items-center gap-2 text-sm font-bold text-gray-900 hover:underline lg:mt-0">
              Bekijk alle modellen <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {batteries.map((battery) => (
              <BatteryCard key={battery.id} battery={battery} />
            ))}
          </div>
        </div>
      </section>

      {/* Education Teaser Section */}
      <section className="bg-gray-900 py-24 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-bold text-white backdrop-blur-sm">
                <Info className="h-4 w-4" />
                <span>Educatie & Infotainment</span>
              </div>
              <h2 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">Alles wat u moet weten over energieopslag</h2>
              <p className="mt-6 text-lg text-gray-400 leading-relaxed">
                Van de werking van lithium-batterijen tot de nieuwste subsidies in Nederland. Onze experts delen hun kennis om u te helpen navigeren in de wereld van duurzame energie.
              </p>
              <div className="mt-10 flex flex-col gap-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10">
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold">Subsidies 2024</h4>
                    <p className="text-sm text-gray-400">Ontdek welke financiële voordelen er momenteel zijn.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10">
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold">Terugverdientijd</h4>
                    <p className="text-sm text-gray-400">Bereken hoe snel u uw investering terugverdient.</p>
                  </div>
                </div>
              </div>
              <Link
                to="/educatie"
                className="mt-12 inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-base font-bold text-gray-900 transition-opacity hover:opacity-90"
              >
                Naar de kennisbank <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="relative aspect-square overflow-hidden rounded-3xl bg-gray-800">
              <img
                src="https://images.unsplash.com/photo-1509391366360-fe5bb58583bb?auto=format&fit=crop&q=80&w=1000"
                alt="Zonnepanelen en energie"
                className="h-full w-full object-cover opacity-80"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </section>

      {/* SEO Content Section */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="prose prose-gray max-w-none">
            <h2 className="text-3xl font-bold text-gray-900">Waarom kiezen voor een thuisbatterij in Nederland?</h2>
            <p className="mt-6 text-gray-500 leading-relaxed">
              Met de afbouw van de salderingsregeling in het vooruitzicht wordt een thuisbatterij steeds interessanter voor Nederlandse huishoudens. Een thuisbatterij stelt u in staat om de overdag opgewekte zonne-energie op te slaan en 's avonds te gebruiken wanneer de zon niet schijnt.
            </p>
            <p className="mt-4 text-gray-500 leading-relaxed">
              Bij Batterij123.nl helpen we u bij het vinden van de juiste batterij. Of u nu op zoek bent naar een Tesla Powerwall, een LG RESU of een modulaire BYD oplossing, wij bieden de meest actuele informatie en prijzen. Onze vergelijker houdt rekening met capaciteit, ontlaadvermogen, garantie en natuurlijk de prijs-kwaliteitverhouding.
            </p>
            <h3 className="mt-10 text-2xl font-bold text-gray-900">De voordelen van Batterij123.nl</h3>
            <ul className="mt-6 space-y-4 text-gray-500">
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-gray-900" />
                <span>Altijd de scherpste offertes van lokale installateurs.</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-gray-900" />
                <span>Onafhankelijke reviews van duizenden gebruikers.</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-gray-900" />
                <span>Expert-artikelen over de nieuwste technologieën.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
