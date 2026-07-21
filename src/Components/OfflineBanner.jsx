import useOnlineStatus from "../Hooks/useOnlineStatus.js";

export default function OfflineBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) {
    return null;
  }

  return (
    <div
      className="offline-banner"
      role="status"
      aria-live="polite"
    >
      You are offline. Showing recently saved shelter information.
      New changes will sync when your connection returns.
    </div>
  );
}