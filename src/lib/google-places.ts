type GooglePlaces = {
  maps: {
    places: {
      AutocompleteSuggestion: {
        fetchAutocompleteSuggestions: (request: Record<string, unknown>) => Promise<{ suggestions?: GoogleSuggestion[] }>;
      };
      AutocompleteSessionToken: new () => unknown;
    };
  };
};

type GoogleSuggestion = {
  placePrediction?: {
    placeId?: string;
    text?: { text?: string };
    mainText?: { text?: string };
    secondaryText?: { text?: string };
    toPlace?: () => GooglePlace;
  };
};

type GooglePlace = {
  id?: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  location?: { lat?: () => number; lng?: () => number };
  types?: string[];
  fetchFields: (request: { fields: string[] }) => Promise<void>;
};

declare global {
  interface Window {
    google?: GooglePlaces;
    __ibbGooglePlacesPromise?: Promise<GooglePlaces>;
  }
}

const getApiKey = () => import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

export const loadGooglePlaces = (): Promise<GooglePlaces> => {
  if (window.__ibbGooglePlacesPromise) return window.__ibbGooglePlacesPromise;

  const apiKey = getApiKey();
  if (!apiKey) {
    return Promise.reject(new Error("VITE_GOOGLE_MAPS_API_KEY is not configured"));
  }

  window.__ibbGooglePlacesPromise = new Promise<GooglePlaces>((resolve, reject) => {
    if (window.google?.maps?.places?.AutocompleteSuggestion) {
      resolve(window.google);
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>('script[data-ibb-google-places="true"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(window.google as GooglePlaces), { once: true });
      existing.addEventListener("error", () => reject(new Error("Google Maps JavaScript API failed to load")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places&v=weekly`;
    script.async = true;
    script.defer = true;
    script.dataset.ibbGooglePlaces = "true";
    script.onload = () => {
      if (window.google?.maps?.places?.AutocompleteSuggestion) {
        resolve(window.google);
      } else {
        reject(new Error("Google Places library is unavailable"));
      }
    };
    script.onerror = () => reject(new Error("Google Maps JavaScript API failed to load"));
    document.head.appendChild(script);
  });

  return window.__ibbGooglePlacesPromise;
};

export type { GooglePlace, GoogleSuggestion };
