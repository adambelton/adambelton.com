type WritingCoverImageProps = {
  alt?: string;
  coverImage: string;
  coverImageSmall?: string;
};

export function WritingCoverImage({
  alt = "",
  coverImage,
  coverImageSmall,
}: WritingCoverImageProps) {
  const isCard = Boolean(coverImageSmall);

  return (
    <img
      alt={alt}
      className="aspect-[50/21] w-full rounded-sm border border-[var(--line-subtle)] object-cover"
      decoding="async"
      height={isCard ? 420 : 840}
      loading={isCard ? "lazy" : undefined}
      src={coverImageSmall ?? coverImage}
      srcSet={coverImageSmall ? `${coverImageSmall} 1000w, ${coverImage} 2000w` : undefined}
      width={isCard ? 1000 : 2000}
    />
  );
}
