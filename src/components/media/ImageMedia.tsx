import { Artwork } from "@/components/art/Artwork";
import { cn } from "@/lib/cn";
import { altText, ASPECT, frameClass, type MediaProps } from "./shared";

export function ImageMedia({ post, variant }: MediaProps) {
  return (
    <div className={cn(frameClass(variant, ASPECT[post.aspect]), "overflow-hidden bg-black")}>
      <Artwork visual={post.visuals[0]} label={altText(post)} fit={variant === "full" ? "contain" : "cover"} />
    </div>
  );
}
