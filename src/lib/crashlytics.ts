import { getApp, getUtils } from "@react-native-firebase/app";
import {
  checkForUnsentReports,
  didCrashOnPreviousExecution,
  getCrashlytics,
  log as crashlyticsLog,
  recordError as crashlyticsRecordError,
  sendUnsentReports,
  setCrashlyticsCollectionEnabled,
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

export type CrashlyticsDiagnostics = {
  moduleLinked: boolean;
  appId: string | null;
  projectId: string | null;
  crashedLastRun: boolean;
  // null when collection is enabled (the default, and what we set at
  // startup) — checkForUnsentReports only answers this when collection is
  // manually disabled, per the SDK's own docs, and throws otherwise.
  hasUnsentReports: boolean | null;
  playServicesAvailable: boolean;
  playServicesError: string | null;
};

// Real verification, independent of Firebase Console (which depends on a
// background upload that can be delayed or silently killed — MIUI devices
// especially). `recordError`/`log` swallow a missing native module on
// purpose so normal call sites never crash the app over telemetry; this is
// the one place that surfaces the truth instead of hiding it.
export async function getDiagnostics(): Promise<CrashlyticsDiagnostics> {
  const inst = instance();
  if (!inst) {
    return {
      moduleLinked: false,
      appId: null,
      projectId: null,
      crashedLastRun: false,
      hasUnsentReports: null,
      playServicesAvailable: false,
      playServicesError: null,
    };
  }

  const crashedLastRun = await didCrashOnPreviousExecution(inst);

  let hasUnsentReports: boolean | null = null;
  try {
    hasUnsentReports = await checkForUnsentReports(inst);
  } catch {
    // Expected when collection is enabled — not a real failure.
  }

  const playServices = await getUtils(inst.app).getPlayServicesStatus();

  return {
    moduleLinked: true,
    appId: inst.app.options.appId ?? null,
    projectId: inst.app.options.projectId ?? null,
    crashedLastRun,
    hasUnsentReports,
    playServicesAvailable: playServices.isAvailable,
    playServicesError: playServices.error ?? null,
  };
}

// Catches uncaught JS errors and unhandled promise rejections app-wide —
// otherwise only native crashes reach Crashlytics, and the far more common
// "red screen" JS error/unhandled rejection goes unreported.
export function installGlobalErrorHandlers(): void {
  // Explicit rather than relying on the SDK's own default — and forces any
  // report already queued on disk from a previous session to upload right
  // away instead of waiting for the next cold start after that.
  const inst = instance();
  if (inst) {
    setCrashlyticsCollectionEnabled(inst, true);
    sendUnsentReports(inst);
  }

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
