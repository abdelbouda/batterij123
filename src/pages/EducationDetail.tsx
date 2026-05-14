import { ArrowLeft, Clock, User, Tag, CheckCircle2 } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { articles, getArticleBySlug } from '../data/articles';
import JsonLd from '../components/JsonLd';
import { usePageMeta, SITE_URL } from '../lib/seo';
import { articleSchema, breadcrumbSchema } from '../lib/structured-data';

export default function EducationDetail() {
  const { slug } = useParams<{ slug: string }>();
  const article = slug ? getArticleBySlug(slug) : undefined;

  usePageMeta({
    title: article
      ? `${article.title} | Batterij123 kennisbank`
      : 'Artikel niet gevonden | Batterij123',
    description: article ? article.excerpt : 'Het artikel dat u zoekt bestaat niet (meer).',
    canonicalPath: article ? `/educatie/${article.slug}` : '/educatie',
    ogImage: article ? `${SITE_URL}${article.image}` : undefined,
    ogType: 'article',
  });

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [slug]);

  if (!article) {
    return (
      <div className="bg-white py-24">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Artikel niet gevonden</h1>
          <p className="mt-4 text-gray-500">
            Het artikel dat u zoekt bestaat niet (meer) of is verplaatst.
          </p>
          <Link
            to="/educatie"
            className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-gray-900 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Terug naar de kennisbank
          </Link>
        </div>
      </div>
    );
  }

  const related = articles.filter((a) => a.slug !== article.slug).slice(0, 3);

  return (
    <article className="bg-white py-12">
      <JsonLd id={`article-${article.slug}`} data={articleSchema(article)} />
      <JsonLd
        id={`breadcrumb-article-${article.slug}`}
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Kennisbank', path: '/educatie' },
          { name: article.title, path: `/educatie/${article.slug}` },
        ])}
      />
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <Link
          to="/educatie"
          className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" /> Terug naar kennisbank
        </Link>

        <div className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
          <Tag className="h-3 w-3" />
          {article.category}
        </div>

        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          {article.title}
        </h1>

        <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            {article.author}
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {article.readTime} leestijd
          </div>
          <span>{article.date}</span>
        </div>

        <figure className="my-10 overflow-hidden rounded-3xl">
          <img
            src={article.image}
            alt={article.imageAlt}
            width="1280"
            height="720"
            fetchPriority="high"
            loading="eager"
            decoding="async"
            className="aspect-[16/9] w-full object-cover"
          />
          <figcaption className="mt-3 text-center text-xs text-gray-400">
            {article.imageCredit}
          </figcaption>
        </figure>

        <p className="text-xl leading-relaxed text-gray-700">{article.intro}</p>

        <div className="mt-16 space-y-12">
          {article.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">{section.heading}</h2>
              <div className="mt-4 space-y-4">
                {section.paragraphs.map((p, i) => (
                  <p key={i} className="text-base leading-relaxed text-gray-600">
                    {p}
                  </p>
                ))}
              </div>
              {section.bullets && (
                <ul className="mt-6 space-y-3 rounded-2xl bg-gray-50 p-6">
                  {section.bullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-gray-900" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        <aside className="mt-16 rounded-3xl border border-gray-200 bg-gray-50 p-8">
          <h2 className="text-lg font-bold uppercase tracking-wider text-gray-900">
            Belangrijkste punten
          </h2>
          <ul className="mt-6 space-y-3">
            {article.takeaways.map((t, i) => (
              <li key={i} className="flex items-start gap-3 text-base text-gray-700">
                <CheckCircle2 className="mt-1 h-4 w-4 flex-none text-gray-900" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </aside>

        <div className="mt-16 rounded-3xl bg-gray-900 p-8 text-white md:p-12">
          <h3 className="text-2xl font-bold sm:text-3xl">Klaar om te besparen?</h3>
          <p className="mt-3 text-gray-300">
            Bekijk onze plug & play thuisbatterijen en P1 Meter. Geen installateur nodig, gewoon
            inpluggen en besparen.
          </p>
          <Link
            to="/producten"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-gray-900 hover:opacity-90"
          >
            Bekijk thuisbatterijen
          </Link>
        </div>

        {related.length > 0 && (
          <section className="mt-24">
            <h2 className="text-2xl font-bold text-gray-900">Verder lezen</h2>
            <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-3">
              {related.map((r) => (
                <Link key={r.slug} to={`/educatie/${r.slug}`} className="group">
                  <div className="aspect-[16/10] overflow-hidden rounded-2xl bg-gray-100">
                    <img
                      src={r.image}
                      alt={r.imageAlt}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="mt-4">
                    <div className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      {r.category}
                    </div>
                    <h3 className="mt-1 text-base font-bold text-gray-900 group-hover:underline">
                      {r.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
