import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { getMyPesanan } from "../lib/api/orders";
import { useAuth } from "../state/AuthContext";
import { countUnread, DISMISSED_KEY, loadKeys, SEEN_KEY } from "../lib/notificationState";

// How many order updates the customer hasn't looked at yet — drives the dot
// on the home screen's bell. Shares the ["my-pesanan"] query with Pesanan
// Saya and the Notifikasi list, so it adds no request of its own while those
// are fresh.
export function useUnreadNotifications(): number {
  const { isLoggedIn } = useAuth();
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [seen, setSeen] = useState<string[]>([]);

  // Re-read whenever the screen regains focus, i.e. right after coming back
  // from the Notifikasi list that just marked everything as seen.
  useFocusEffect(
    useCallback(() => {
      let active = true;
      Promise.all([loadKeys(DISMISSED_KEY), loadKeys(SEEN_KEY)]).then(([d, s]) => {
        if (!active) return;
        setDismissed(d);
        setSeen(s);
      });
      return () => {
        active = false;
      };
    }, []),
  );

  const { data } = useQuery({
    queryKey: ["my-pesanan"],
    queryFn: () => getMyPesanan(),
    enabled: isLoggedIn,
  });

  if (!isLoggedIn || !data) return 0;
  return countUnread(data, dismissed, seen);
}
