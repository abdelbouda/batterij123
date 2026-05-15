import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { usePageMeta } from '../lib/seo';

const EMAIL_ADDRESS = 'info@batterij123.nl';
const PHONE_DISPLAY = '06-42008944';
const PHONE_URL = 'tel:+31642008944';
const WHATSAPP_URL = `https://wa.me/31642008944?text=${encodeURIComponent(
  'Hoi! Ik heb een vraag over een thuisbatterij van Batterij123.',
)}`;

export default function Contact() {
  usePageMeta({
    title: 'Contact | Batterij123',
    description:
      'Neem contact op met Batterij123 voor vragen over plug & play thuisbatterijen, levering en advies.',
    canonicalPath: '/contact',
  });

  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <header className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-wider text-gray-400">
            Contact
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            We helpen u graag verder
          </h1>
          <p className="mt-4 text-lg text-gray-500">
            Stel uw vraag over thuisbatterijen, levering of installatie. U kunt ons
            direct bereiken via e-mail, telefoon of WhatsApp.
          </p>
        </header>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <a
            href={`mailto:${EMAIL_ADDRESS}?subject=${encodeURIComponent(
              'Vraag over een thuisbatterij',
            )}`}
            className="rounded-3xl border border-gray-200 bg-white p-8 transition-shadow hover:shadow-md"
          >
            <Mail className="h-6 w-6 text-gray-900" aria-hidden="true" />
            <h2 className="mt-4 text-xl font-bold text-gray-900">E-mail</h2>
            <p className="mt-2 text-sm text-gray-500">
              Voor offertevragen, productadvies en algemene ondersteuning.
            </p>
            <p className="mt-4 text-sm font-bold text-gray-900">{EMAIL_ADDRESS}</p>
          </a>

          <a
            href={PHONE_URL}
            className="rounded-3xl border border-gray-200 bg-white p-8 transition-shadow hover:shadow-md"
          >
            <Phone className="h-6 w-6 text-gray-900" aria-hidden="true" />
            <h2 className="mt-4 text-xl font-bold text-gray-900">Telefoon</h2>
            <p className="mt-2 text-sm text-gray-500">
              Bel ons op werkdagen voor persoonlijk advies over uw situatie.
            </p>
            <p className="mt-4 text-sm font-bold text-gray-900">{PHONE_DISPLAY}</p>
          </a>

          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-3xl border border-gray-200 bg-white p-8 transition-shadow hover:shadow-md"
          >
            <MessageCircle className="h-6 w-6 text-gray-900" aria-hidden="true" />
            <h2 className="mt-4 text-xl font-bold text-gray-900">WhatsApp</h2>
            <p className="mt-2 text-sm text-gray-500">
              Snel even sparren over een product of levering? Stuur ons een bericht.
            </p>
            <p className="mt-4 text-sm font-bold text-gray-900">Start chat</p>
          </a>
        </div>

        <div className="mt-12 rounded-3xl border border-gray-200 bg-gray-50 p-8">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-white p-3 text-gray-900 shadow-sm">
              <MapPin className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Bezoekadres</h2>
              <p className="mt-3 text-sm leading-7 text-gray-500">
                Batterij123 B.V.
                <br />
                Amsterdam
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
