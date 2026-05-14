import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Mail, Package } from 'lucide-react';
import { usePageMeta } from '../lib/seo';

/**
 * Bedankt-pagina waar Stripe Checkout naartoe redirect na een geslaagde
 * betaling. Stripe geeft optioneel `?session_id=...` en/of een
 * `?payment_intent=...` mee — we tonen de laatste 8 tekens als referentie.
 */
export default function Success() {
  usePageMeta({
    title: 'Bedankt voor uw bestelling | Batterij123',
    description: 'Uw betaling is succesvol verwerkt. U ontvangt binnen enkele minuten een bevestiging per e-mail.',
    canonicalPath: '/success',
  });

  const [params] = useSearchParams();
  const ref =
    params.get('session_id') ??
    params.get('payment_intent') ??
    params.get('checkout_session_id');
  const refShort = ref ? ref.slice(-8) : null;

  return (
    <section className="mx-auto max-w-2xl px-6 py-24 text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
        <CheckCircle2 size={40} strokeWidth={1.5} />
      </div>

      <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
        Bedankt voor uw bestelling!
      </h1>

      <p className="mt-4 text-base text-gray-600">
        Uw betaling is succesvol verwerkt door Stripe. U ontvangt binnen enkele
        minuten een bevestiging per e-mail met de details van uw bestelling.
      </p>

      {refShort && (
        <p className="mt-3 text-sm text-gray-500">
          Referentie: <code className="font-mono">…{refShort}</code>
        </p>
      )}

      <div className="mt-10 grid gap-4 text-left sm:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <Mail size={20} className="text-gray-700" />
          <h2 className="mt-3 text-sm font-semibold text-gray-900">
            Bevestigingsmail
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Check ook uw spam-folder als de mail niet binnen 5 minuten in uw
            inbox staat.
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <Package size={20} className="text-gray-700" />
          <h2 className="mt-3 text-sm font-semibold text-gray-900">
            Levering
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            We nemen binnen één werkdag contact op om de bezorging in te
            plannen — meestal binnen 3–5 werkdagen op uw adres.
          </p>
        </div>
      </div>

      <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link
          to="/producten"
          className="inline-flex items-center justify-center rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white hover:bg-gray-800"
        >
          Verder winkelen
        </Link>
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-full border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50"
        >
          Naar de homepage
        </Link>
      </div>
    </section>
  );
}
