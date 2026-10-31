export const getApiUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL;

  // When loaded on a phone or other device via local network IP (e.g. 192.168.x.x or 10.x.x.x)
  if (
    typeof window !== "undefined" &&
    window.location.hostname &&
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1"
  ) {
    // If an explicit remote production URL is provided (e.g. on Netlify), use it
    if (envUrl && !envUrl.includes("localhost") && !envUrl.includes("127.0.0.1")) {
      return envUrl.replace(/\/$/, "");
    }
    // Otherwise, dynamically target the computer's IP address on port 8000
    return `http://${window.location.hostname}:8000`;
  }

  return (envUrl || "http://localhost:8000").replace(/\/$/, "");
};

export const API_URL = getApiUrl();
