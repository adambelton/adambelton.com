const productionOrigin = "https://adambelton.com";

type PublicPageMetadataProps = {
  article?: {
    publishedTime: string;
    tags: string[];
  };
  description: string;
  image?: string;
  imageHeight?: number;
  imageWidth?: number;
  path: `/${string}` | "/";
  title: string;
};

export function PublicPageMetadata({
  article,
  description,
  image,
  imageHeight = 627,
  imageWidth = 1200,
  path,
  title,
}: PublicPageMetadataProps) {
  const canonicalUrl = new URL(path, productionOrigin).toString();
  const imageUrl = image ? new URL(image, productionOrigin).toString() : undefined;
  const structuredData = article && imageUrl ? JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    author: { "@type": "Person", name: "Adam Belton" },
    datePublished: article.publishedTime,
    description,
    headline: title.replace(/ — Adam Belton$/, ""),
    image: imageUrl,
    mainEntityOfPage: canonicalUrl,
  }).replace(/</g, "\\u003c") : undefined;

  useEffect(() => {
    document.title = title;
    document.head
      .querySelectorAll(
        [
          '[data-public-metadata]',
          'meta[name="description"]',
          'link[rel="canonical"]',
          'meta[property^="og:"]',
          'meta[property^="article:"]',
          'meta[name^="twitter:"]',
          'script[type="application/ld+json"]',
        ].join(","),
      )
      .forEach((element) => element.remove());
    const append = (tag: "link" | "meta" | "script", attributes: Record<string, string>) => {
      const element = document.createElement(tag);
      element.setAttribute("data-public-metadata", "");
      for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, value);
      document.head.append(element);
      return element;
    };
    append("meta", { content: description, name: "description" });
    append("link", { href: canonicalUrl, rel: "canonical" });
    const openGraph: Array<[string, string]> = [
      ["og:type", article ? "article" : "website"], ["og:title", title],
      ["og:description", description], ["og:url", canonicalUrl],
    ];
    if (imageUrl) openGraph.push(["og:image", imageUrl], ["og:image:width", String(imageWidth)], ["og:image:height", String(imageHeight)]);
    if (article) openGraph.push(["article:published_time", article.publishedTime], ...article.tags.map((tag): [string, string] => ["article:tag", tag]));
    for (const [property, content] of openGraph) append("meta", { content, property });
    const twitter: Array<[string, string]> = imageUrl ? [["twitter:card", "summary_large_image"], ["twitter:title", title], ["twitter:description", description], ["twitter:image", imageUrl]] : [];
    for (const [name, content] of twitter) append("meta", { content, name });
    if (structuredData) {
      const script = append("script", { type: "application/ld+json" });
      script.textContent = structuredData;
    }
  }, [article, canonicalUrl, description, imageHeight, imageUrl, imageWidth, structuredData, title]);

  if (typeof document !== "undefined") return null;

  return (
    <>
      <title>{title}</title>
      <meta content={description} name="description" />
      <link href={canonicalUrl} rel="canonical" />
      <meta content={article ? "article" : "website"} property="og:type" />
      <meta content={title} property="og:title" />
      <meta content={description} property="og:description" />
      <meta content={canonicalUrl} property="og:url" />
      {imageUrl ? <meta content={imageUrl} property="og:image" /> : null}
      {imageUrl ? <meta content={String(imageWidth)} property="og:image:width" /> : null}
      {imageUrl ? <meta content={String(imageHeight)} property="og:image:height" /> : null}
      {article ? <meta content={article.publishedTime} property="article:published_time" /> : null}
      {article?.tags.map((tag) => <meta content={tag} key={tag} property="article:tag" />)}
      {imageUrl ? <meta content="summary_large_image" name="twitter:card" /> : null}
      {imageUrl ? <meta content={title} name="twitter:title" /> : null}
      {imageUrl ? <meta content={description} name="twitter:description" /> : null}
      {imageUrl ? <meta content={imageUrl} name="twitter:image" /> : null}
      {article && imageUrl ? (
        <script
          dangerouslySetInnerHTML={{
            __html: structuredData ?? "",
          }}
          type="application/ld+json"
        />
      ) : null}
    </>
  );
}
import { useEffect } from "react";
