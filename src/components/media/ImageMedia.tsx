import { cn } from "@/lib/cn";
import { altText, ASPECT, frameClass, ImgFill, MissingMedia, mediaOf, type MediaProps } from "./shared";

export function ImageMedia({ post, variant }: MediaProps) {
  const image = mediaOf(post, "image");
  return (
    <div className={cn(frameClass(variant, ASPECT[post.aspect]), "overflow-hidden bg-black")}>
      {image ? (
        <ImgFill src={image.url} alt={altText(post)} width={image.width} height={image.height} fit={variant === "full" ? "contain" : "cover"} />
      ) : (
        <MissingMedia />
      )}
    </div>
  );
}
