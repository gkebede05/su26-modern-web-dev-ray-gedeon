import { useEffect, useState } from "react";

export default function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);

  useEffect(() => {
    function updateStatus() {
      setIsOnline(navigator.onLine);
    }

    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);
    window.addEventListener("focus", updateStatus);

    // Helps Chrome DevTools reflect throttling changes reliably.
    const statusCheck = window.setInterval(updateStatus, 500);

    updateStatus();

    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
      window.removeEventListener("focus", updateStatus);
      window.clearInterval(statusCheck);
    };
  }, []);

  return isOnline;
}