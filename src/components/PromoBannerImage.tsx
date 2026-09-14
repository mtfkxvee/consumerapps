import { useState } from "react";
import { Image, StyleSheet } from "react-native";
import { radius } from "../theme/colors";

type Props = { uri: string; width: number };

// Sized to the image's own aspect ratio (learned from onLoad) instead of a
// fixed box — promo banners come in varying ratios, and cropping them to a
// fixed box cuts off text/products designers placed near the edges.
export function PromoBannerImage({ uri, width }: Props) {
  const [ratio, setRatio] = useState(2); // sensible fallback until onLoad fires

  return (
    <Image
      source={{ uri }}
      style={[styles.image, { width, height: width / ratio }]}
      resizeMode="cover"
      onLoad={(e) => {
        const { width: w, height: h } = e.nativeEvent.source;
        if (w > 0 && h > 0) setRatio(w / h);
      }}
    />
  );
}

const styles = StyleSheet.create({
  image: { borderRadius: radius.lg },
});
