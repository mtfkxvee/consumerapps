import { Image, type ImageStyle } from "expo-image";
import type { StyleProp } from "react-native";

// A neutral, light-grey blurhash: while a picture downloads the slot shows
// a soft grey that fades into the photo instead of popping in.
const PLACEHOLDER = { blurhash: "LEHV6nWB2yk8pyo0adR*.7kCMdnj" };

type Props = {
  uri: string;
  style?: StyleProp<ImageStyle>;
  contentFit?: "cover" | "contain";
  // Describes the picture for screen readers; omit for purely decorative ones.
  label?: string;
};

// The app's one product-picture component: cached on disk and in memory
// (so lists scroll without re-downloading), with a placeholder and a short
// fade. Replaces React Native's bare <Image> for remote photos.
export function RemoteImage({ uri, style, contentFit = "cover", label }: Props) {
  return (
    <Image
      source={{ uri }}
      style={style}
      contentFit={contentFit}
      placeholder={PLACEHOLDER}
      placeholderContentFit={contentFit}
      transition={180}
      cachePolicy="memory-disk"
      accessible={Boolean(label)}
      accessibilityLabel={label}
    />
  );
}
