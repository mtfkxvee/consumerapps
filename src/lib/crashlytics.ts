import { getApp } from "@react-native-firebase/app";
import {
  getCrashlytics,
  log as crashlyticsLog,
  recordError as crashlyticsRecordError,
  setUserId as crashlyticsSetUserId,
} from "@react-native-firebase/crashlytics";
// React Native's own Promise polyfill (bundled as a transitive dependency,
// not something this project installs directly) ships this tracker — the
// standard way to catch unhandled rejections in RN, since there's no
// browser-style `window.onunhandledrejection` here.
import rejectionTracking from "promise/setimmediate/rejection-tracking";

// Native module — unavailable when this ever runs somewhere without the
// Firebase config (e.g. `expo start --web`), so every call here is
// best-effort and never throws.
function instance() {
  try {
    return getCrashlytics(getApp());
  } catch {
    return null;
  }
}

export function recordError(error: unknown, context?: string): void {
  const inst = instance();
  if (!inst) return;
  const err = error instanceof Error ? error : new Error(String(error));
  if (context) crashlyticsLog(inst, context);
  crashlyticsRecordError(inst, err);
}

export function log(message: string): void {
  const inst = instance();
  if (inst) crashlyticsLog(inst, message);
}

// Tags crashes with which customer hit them — set on login, cleared on
// logout. Crashlytics' own id is unrelated to X-SHA's own customer id, so
// this is purely for us to cross-reference a report back to an account.
export function setCrashUser(customerId: string | null): void {
  const inst = instance();
  if (inst) crashlyticsSetUserId(inst, customerId ?? "");
}

// Catches uncaught JS errors and unhandled promise rejections app-wide —
// otherwise only native crashes reach Crashlytics, and the far more common
// "red screen" JS error/unhandled rejection goes unreported.
export function installGlobalErrorHandlers(): void {
  const previousHandler = ErrorUtils.getGlobalHandler();
  ErrorUtils.setGlobalHandler((error, isFatal) => {
    recordError(error, isFatal ? "Unhandled fatal JS error" : "Unhandled JS error");
    previousHandler(error, isFatal);
  });

  rejectionTracking.enable({
    allRejections: true,
    onUnhandled: (_id: number, error: unknown) => recordError(error, "Unhandled promise rejection"),
    onHandled: () => {},
  });
}
