import { useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";
import * as Location from "expo-location";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../components/Text";
import { Pressable } from "../components/Pressable";
import { colors, fonts, radius, spacing } from "../theme/colors";

// Tasikmalaya — X-SHA's home base, and a sensible default center when the
// customer has no saved pin yet and location permission isn't granted.
const DEFAULT_LAT = -7.3274;
const DEFAULT_LNG = 108.2207;

type RouteParams = {
  initialLat?: number | null;
  initialLng?: number | null;
  onSelect: (lat: number, lng: number) => void;
};

// A free (OpenStreetMap/Leaflet, no API key) map picker rendered inside a
// WebView — works in Expo Go, unlike react-native-maps which needs a
// native Google Maps SDK and a custom dev-client build. The pin stays
// fixed at the screen's center; dragging the map itself is what moves the
// selected point, and Leaflet reports the new center back to us on every
// move via postMessage.
function buildHtml(lat: number, lng: number): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body, #map { height: 100%; margin: 0; padding: 0; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    const map = L.map('map', { zoomControl: false }).setView([${lat}, ${lng}], 16);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    function post(center) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ lat: center.lat, lng: center.lng }));
    }
    map.on('moveend', () => post(map.getCenter()));
    post(map.getCenter());

    window.addEventListener('message', (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === 'recenter') map.setView([data.lat, data.lng], 16);
      } catch {}
    });
    document.addEventListener('message', (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === 'recenter') map.setView([data.lat, data.lng], 16);
      } catch {}
    });
  </script>
</body>
</html>`;
}

export function MapPickerScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { initialLat, initialLng, onSelect } = route.params as RouteParams;

  const startLat = initialLat ?? DEFAULT_LAT;
  const startLng = initialLng ?? DEFAULT_LNG;

  const webviewRef = useRef<WebView>(null);
  const [center, setCenter] = useState({ lat: startLat, lng: startLng });
  const [locating, setLocating] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  const useMyLocation = async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      const pos = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = pos.coords;
      setCenter({ lat: latitude, lng: longitude });
      const message = JSON.stringify({ type: "recenter", lat: latitude, lng: longitude });
      webviewRef.current?.postMessage(message);
    } finally {
      setLocating(false);
    }
  };

  const confirm = () => {
    onSelect(center.lat, center.lng);
    navigation.goBack();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="close" size={24} color={colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Pilih Lokasi</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={{ flex: 1 }}>
        {!mapReady && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator color={colors.primary} />
          </View>
        )}
        <WebView
          ref={webviewRef}
          source={{ html: buildHtml(startLat, startLng) }}
          style={{ flex: 1 }}
          onLoadEnd={() => setMapReady(true)}
          onMessage={(event) => {
            try {
              const data = JSON.parse(event.nativeEvent.data) as { lat: number; lng: number };
              setCenter(data);
            } catch {
              // ignore malformed messages
            }
          }}
        />

        <View pointerEvents="none" style={styles.pinWrap}>
          <Ionicons name="location" size={40} color={colors.secondary} />
        </View>

        <Pressable style={styles.myLocationButton} onPress={useMyLocation} disabled={locating}>
          {locating ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Ionicons name="navigate-outline" size={20} color={colors.primary} />
          )}
        </Pressable>
      </View>

      <View style={styles.footer}>
        <Text style={styles.coordText}>
          {center.lat.toFixed(6)}, {center.lng.toFixed(6)}
        </Text>
        <Pressable style={styles.confirmButton} onPress={confirm}>
          <Text style={styles.confirmButtonText}>Gunakan Lokasi Ini</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surface,
  },
  headerTitle: { fontSize: 16, fontFamily: fonts.display.bold, color: colors.onSurface },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  pinWrap: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -20,
    marginTop: -40,
  },
  myLocationButton: {
    position: "absolute",
    right: spacing.md,
    bottom: spacing.md,
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.black,
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  footer: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  coordText: {
    textAlign: "center",
    fontSize: 12,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.sm,
  },
  confirmButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingVertical: 14,
    alignItems: "center",
  },
  confirmButtonText: { color: colors.onPrimary, fontFamily: fonts.body.bold, fontSize: 15 },
});
