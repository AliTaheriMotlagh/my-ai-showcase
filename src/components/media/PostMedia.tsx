import { AudioMedia } from "./AudioMedia";
import { ChartMedia } from "./ChartMedia";
import { ChatMedia } from "./ChatMedia";
import { CodeMedia } from "./CodeMedia";
import { GalleryMedia } from "./GalleryMedia";
import { ImageMedia } from "./ImageMedia";
import type { MediaProps } from "./shared";
import { TextMedia } from "./TextMedia";
import { ThreeDMedia } from "./ThreeDMedia";
import { VideoMedia } from "./VideoMedia";

export function PostMedia(props: MediaProps) {
  switch (props.post.kind) {
    case "image":
      return <ImageMedia {...props} />;
    case "gallery":
      return <GalleryMedia {...props} />;
    case "video":
      return <VideoMedia {...props} />;
    case "audio":
      return <AudioMedia {...props} />;
    case "text":
      return <TextMedia {...props} />;
    case "code":
      return <CodeMedia {...props} />;
    case "chat":
      return <ChatMedia {...props} />;
    case "chart":
      return <ChartMedia {...props} />;
    case "3d":
      return <ThreeDMedia {...props} />;
  }
}
