declare module "promise/setimmediate/rejection-tracking" {
  type RejectionTrackingOptions = {
    allRejections?: boolean;
    onUnhandled?: (id: number, error: unknown) => void;
    onHandled?: (id: number) => void;
  };
  const rejectionTracking: {
    enable: (options?: RejectionTrackingOptions) => void;
    disable: () => void;
  };
  export default rejectionTracking;
}
