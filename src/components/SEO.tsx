import { useEffect } from 'react';

export interface SEOProps {
    title: string;
    description: string;
    canonical: string;
    ogImage?: string;
    ogType?: 'website' | 'article' | 'product';
    schema?: Record<string, unknown> | Array<Record<string, unknown>>;
}

export default function SEO({
    title,
    description,
    canonical,
    ogImage = 'https://marinhoponci.com/marinho%20principal.webp',
    ogType = 'website',
    schema,
}: SEOProps) {
    useEffect(() => {
        const previousTitle = document.title;
        document.title = title;

        const setMetaTag = (attrName: string, attrVal: string, content: string) => {
            let el = document.head.querySelector(`meta[${attrName}="${attrVal}"]`) as HTMLMetaElement | null;
            if (!el) {
                el = document.createElement('meta');
                el.setAttribute(attrName, attrVal);
                document.head.appendChild(el);
            }
            el.setAttribute('content', content);
        };

        // Description
        setMetaTag('name', 'description', description);

        // Open Graph
        setMetaTag('property', 'og:title', title);
        setMetaTag('property', 'og:description', description);
        setMetaTag('property', 'og:url', canonical);
        setMetaTag('property', 'og:type', ogType);
        setMetaTag('property', 'og:image', ogImage);

        // Twitter Card
        setMetaTag('name', 'twitter:title', title);
        setMetaTag('name', 'twitter:description', description);
        setMetaTag('name', 'twitter:image', ogImage);
        setMetaTag('name', 'twitter:card', 'summary_large_image');

        // Canonical
        let canonicalEl = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
        if (!canonicalEl) {
            canonicalEl = document.createElement('link');
            canonicalEl.setAttribute('rel', 'canonical');
            document.head.appendChild(canonicalEl);
        }
        canonicalEl.setAttribute('href', canonical);

        // Dynamic Page Schema
        let scriptEl: HTMLScriptElement | null = null;
        if (schema) {
            scriptEl = document.createElement('script');
            scriptEl.type = 'application/ld+json';
            scriptEl.setAttribute('data-seo-page', 'true');
            scriptEl.textContent = JSON.stringify(schema);
            document.head.appendChild(scriptEl);
        }

        return () => {
            document.title = previousTitle;
            if (scriptEl && scriptEl.parentNode) {
                scriptEl.parentNode.removeChild(scriptEl);
            }
        };
    }, [title, description, canonical, ogImage, ogType, schema]);

    return null;
}
