import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";
import { radius } from "../theme/colors";

type Props = { lat: number; lng: number; height?: number };

// A small, non-interactive Leaflet/OpenStreetMap preview (no API key, same
// free tile source as MapPickerScreen) — just shows where the pin landed,
// dragging/zooming disabled since this is read-only.
export function MapPreview({ lat, lng, height = 140 }: Props) {
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>html, body, #map { height: 100%; margin: 0; padding: 0; }</style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    const map = L.map('map', {
      zoomControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      touchZoom: false,
      boxZoom: false,
      keyboard: false,
    }).setView([${lat}, ${lng}], 16);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);
    L.marker([${lat}, ${lng}]).addTo(map);
  </script>
</body>
</html>`;

  return (
    <View style={[styles.wrap, { height }]}>
      <WebView source={{ html }} style={styles.webview} scrollEnabled={false} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: radius.lg, overflow: "hidden" },
  webview: { flex: 1 },
});
