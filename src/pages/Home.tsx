import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, ArrowRight, Zap, Shield, TrendingUp, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import BatteryCard from '../components/BatteryCard';
import JsonLd from '../components/JsonLd';
import { fetchProducts, type Product } from '../lib/products';
import { usePageMeta } from '../lib/seo';
import {
  organizationSchema,
  websiteSchema,
  productListSchema,
} from '../lib/structured-data';

export default function Home() {
  const [batteries, setBatteries] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  usePageMeta({
    title: 'Thuisbatterij Kopen & Vergelijken Nederland | Batterij123',
    description:
      'Wilt u een thuisbatterij kopen? Vergelijk de beste plug & play thuisbatterijen van 2026. Bekijk de actuele thuisbatterij kosten, subsidies en besparingen in Nederland.',
    canonicalPath: '/',
  });

  useEffect(() => {
    fetchProducts()
      .then((products) => setBatteries(products.slice(0, 4)))
      .catch((err) => console.error('Failed to load products', err))
      .finally(() => setLoading(false));
  }, []);

  const listData = useMemo(
    () => (batteries.length > 0 ? productListSchema(batteries) : null),
    [batteries],
  );
  return (
    <div className="flex flex-col">
      <JsonLd id="organization" data={organizationSchema()} />
      <JsonLd id="website" data={websiteSchema()} />
      {listData && <JsonLd id="itemlist" data={listData} />}
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white pb-16 pt-8 lg:pb-20 lg:pt-10">
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
              className="mt-6 max-w-3xl text-5xl font-bold tracking-tight text-gray-900 sm:text-7xl"
            >
              De beste thuisbatterij voor <span className="text-gray-400">uw woning</span>
            </motion.h1>
            
            <motion.p
              className="mt-8 max-w-2xl text-lg leading-relaxed text-gray-500"
            >
              Vergelijk de populairste plug & play thuisbatterijen van 2026. Onafhankelijk advies, reviews en de laagste <strong>thuisbatterij kosten</strong> voor energieopslag in Nederland — ideaal na de afbouw van de salderingsregeling.
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

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-16 w-full lg:mt-20"
            >
              <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                    Populaire Thuisbatterijen
                  </h2>
                  <p className="mt-3 text-base text-gray-500">
                    De best geteste modellen van dit moment.
                  </p>
                </div>
                <Link
                  to="/producten"
                  className="inline-flex items-center gap-2 text-sm font-bold text-gray-900 hover:underline"
                >
                  Bekijk alle modellen <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {loading ? (
                  <div className="col-span-full rounded-3xl border border-dashed border-gray-200 bg-gray-50 py-12 text-center text-gray-500">
                    Producten laden...
                  </div>
                ) : (
                  batteries.map((battery, idx) => (
                    <BatteryCard 
                      key={battery.id} 
                      battery={battery} 
                      eager={idx < 4}
                    />
                  ))
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Background Decorative Element */}
        <div className="absolute right-0 top-0 -z-10 hidden h-full w-1/3 bg-gray-50/50 blur-3xl lg:block"></div>
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
                    <h4 className="font-bold">Salderingsregeling 2027</h4>
                    <p className="text-sm text-gray-400">Hoe verandert uw verdienmodel na de afbouw van saldering?</p>
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
                src="/articles/afbouw-salderingsregeling-2027/cover.webp"
                alt="Zonnepanelen op een Nederlandse rijtjeswoning"
                width="1000"
                height="1000"
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover opacity-80"
              />
            </div>
          </div>
        </div>
      </section>

      {/* SEO Content Section */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="prose prose-gray max-w-none">
            <h2 className="text-3xl font-bold text-gray-900">Thuisbatterij kopen in Nederland: alles wat u moet weten</h2>
            <p className="mt-6 text-gray-500 leading-relaxed">
              Bent u van plan een <strong>thuisbatterij te kopen</strong>? Met de afbouw van de salderingsregeling in het vooruitzicht wordt een <strong>thuisbatterij in Nederland</strong> steeds interessanter voor huishoudens met zonnepanelen. Een thuisbatterij stelt u in staat om de overdag opgewekte zonne-energie op te slaan en 's avonds te gebruiken wanneer de zon niet schijnt.
            </p>
            
            <h3 className="mt-10 text-2xl font-bold text-gray-900">Thuisbatterij vergelijken: waar moet u op letten?</h3>
            <p className="mt-4 text-gray-500 leading-relaxed">
              Bij het <strong>thuisbatterij vergelijken</strong> zijn er drie belangrijke factoren: de capaciteit (kWh), het vermogen (kW) en de levensduur. Voor de meeste Nederlandse woningen is een <strong>thuisbatterij met stekker</strong> (plug & play) de eenvoudigste oplossing. Deze systemen, zoals van HomeWizard of EcoFlow, installeert u zelf binnen 10 minuten zonder tussenkomst van een dure installateur.
            </p>

            <h3 className="mt-10 text-2xl font-bold text-gray-900">Wat zijn de thuisbatterij kosten en is er subsidie?</h3>
            <p className="mt-4 text-gray-500 leading-relaxed">
              De <strong>thuisbatterij kosten</strong> zijn de afgelopen jaren fors gedaald. Voor een instapmodel betaalt u tegenwoordig tussen de €1.000 en €2.000. Hoewel er momenteel geen landelijke <strong>thuisbatterij subsidie</strong> is voor particulieren, kunt u de btw (21%) in veel gevallen terugvragen via de Belastingdienst als u een dynamisch energiecontract heeft en de batterij gebruikt voor energiehandel.
            </p>

            <h3 className="mt-10 text-2xl font-bold text-gray-900">De voordelen van Batterij123.nl</h3>
            <ul className="mt-6 space-y-4 text-gray-500">
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-gray-900" />
                <span>Onafhankelijke vergelijking van alle topmerken in Nederland.</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-gray-900" />
                <span>Focus op plug & play systemen: bespaar op installatiekosten.</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-gray-900" />
                <span>Altijd de meest actuele prijzen en voorraadstatus.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
