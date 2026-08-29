import Image from "next/image";

import type { ListingPhotoProps } from "./type";

function isOptimizableUrl(src: string): boolean {
  return src.startsWith("https://");
}

export function ListingPhoto({
  src,
  alt = "",
  className,
  sizes = "(max-width: 768px) 100vw, 33vw",
  priority = false,
  fill = true,
  width,
  height,
}: ListingPhotoProps) {
  if (!isOptimizableUrl(src)) {
    if (fill) {
      return <img src={src} alt={alt} className={className} />;
    }
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        width={width}
        height={height}
      />
    );
  }

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className={className}
        sizes={sizes}
        priority={priority}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width ?? 400}
      height={height ?? 300}
      className={className}
      sizes={sizes}
      priority={priority}
    />
  );
}
