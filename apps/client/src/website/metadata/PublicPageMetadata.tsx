const productionOrigin = "https://adambelton.com";

type PublicPageMetadataProps = {
  description: string;
  path: `/${string}` | "/";
  title: string;
};

export function PublicPageMetadata({
  description,
  path,
  title,
}: PublicPageMetadataProps) {
  const canonicalUrl = new URL(path, productionOrigin).toString();

  return (
    <>
      <title>{title}</title>
      <meta content={description} name="description" />
      <link href={canonicalUrl} rel="canonical" />
    </>
  );
}
