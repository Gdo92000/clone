import { Helmet, HelmetProvider } from 'react-helmet-async';
import type { ReactNode } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  children?: ReactNode;
}

const SITE_NAME = 'Flux Delivery';
const DEFAULT_DESCRIPTION = 'Plataforma completa de delivery multi-perfil. Peça, gerencie e acompanhe entregas em tempo real.';

export function SEOProvider({ children }: { children: ReactNode }) {
  return <HelmetProvider>{children}</HelmetProvider>;
}

export function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  ogTitle,
  ogDescription,
  ogImage = '/og-image.png',
}: SEOProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const og = ogTitle ?? fullTitle;
  const ogDesc = ogDescription ?? description;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={og} />
      <meta property="og:description" content={ogDesc} />
      <meta property="og:image" content={ogImage} />
      <meta name="twitter:title" content={og} />
      <meta name="twitter:description" content={ogDesc} />
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: SITE_NAME,
          url: 'https://fluxdelivery.app',
          description: DEFAULT_DESCRIPTION,
        })}
      </script>
    </Helmet>
  );
}
