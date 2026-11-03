import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Search, MapPin, Plane, Hotel, Anchor, Map, Loader2, X, Clock } from 'lucide-react';
import { loadGooglePlaces, type GooglePlace, type GoogleSuggestion } from '@/lib/google-places';

interface Location {
  id: string;
  name: string;
  type: string;
  city: string;
  display_name: string;
  operational_name: string;
  formatted_address?: string;
  latitude?: number;
  longitude?: number;
  provider: 'google';
  provider_place_id?: string;
  googleSuggestion?: GoogleSuggestion;
}

interface ManualLocation {
  raw_input: string;
  is_manual_input: boolean;
}

interface LocationAutocompleteProps {
  label: string;
  placeholder: string;
  value: string;
  context: 'pickup' | 'dropoff';
  onChange: (value: string) => void;
  onSelect: (location: Location | ManualLocation) => void;
  icon?: React.ReactNode;
  required?: boolean;
  disabled?: boolean;
}

const getSessionId = () => {
  let sid = sessionStorage.getItem('ibb_search_session');
  if (!sid) {
    sid = Math.random().toString(36).substring(2, 15);
    sessionStorage.setItem('ibb_search_session', sid);
  }
  return sid;
};

const getLanguage = () => document.documentElement.lang?.split('-')[0] || 'en';

const toLocation = (suggestion: GoogleSuggestion, place?: GooglePlace): Location | null => {
  const prediction = suggestion.placePrediction;
  if (!prediction) return null;

  const displayName = place?.displayName?.text || prediction.mainText?.text || prediction.text?.text || '';
  const address = place?.formattedAddress || prediction.secondaryText?.text || '';
  const id = place?.id || prediction.placeId || displayName;
  const latitude = place?.location?.lat?.();
  const longitude = place?.location?.lng?.();
  const type = place?.types?.[0]?.replace(/_/g, ' ') || 'place';
  const city = prediction.secondaryText?.text || address;

  if (!displayName) return null;

  return {
    id,
    name: displayName,
    type,
    city,
    display_name: address ? `${displayName}, ${address}` : displayName,
    operational_name: displayName,
    formatted_address: address,
    latitude,
    longitude,
    provider: 'google',
    provider_place_id: id,
    googleSuggestion: suggestion,
  };
};

const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  label,
  placeholder,
  value,
  context,
  onChange,
  onSelect,
  icon,
  required = false,
  disabled = false,
}) => {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<Location[]>([]);
  const [recentSearches, setRecentSearches] = useState<Location[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [requestError, setRequestError] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [showSpinner, setShowSpinner] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const sessionTokenRef = useRef<unknown | null>(null);
  const requestIdRef = useRef(0);
  const sessionId = useMemo(() => getSessionId(), []);
  const storageKey = `recent_${context}_locations`;

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (!saved) return;
    try {
      setRecentSearches(JSON.parse(saved).slice(0, 5));
    } catch {
      localStorage.removeItem(storageKey);
    }
  }, [storageKey]);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  const saveToRecent = (location: Location) => {
    const updated = [location, ...recentSearches.filter((item) => item.id !== location.id)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  const logSelection = useCallback(async (
    location?: Location,
    position?: number,
    isManualInput = false,
    rawInput?: string,
    noSelectionReason?: 'no_results' | 'abandoned' | 'cleared' | 'manual_override' | 'timeout',
  ) => {
    try {
      await fetch('https://ibb-booking-api.ibb-service2006.workers.dev/locations/log-selection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          query,
          location_id: location?.id,
          position,
          provider: 'google',
          is_manual_input: isManualInput,
          raw_input: rawInput || query,
          no_selection_reason: noSelectionReason,
        }),
      });
    } catch {
      // Logging must never block booking or autocomplete.
    }
  }, [query, sessionId]);

  const fetchResults = useCallback(async (searchQuery: string) => {
    const requestId = ++requestIdRef.current;
    abortControllerRef.current?.abort();

    if (searchQuery.trim().length < 1) {
      setResults([]);
      setRequestError(false);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    setIsLoading(true);
    setRequestError(false);
    const spinnerTimer = window.setTimeout(() => setShowSpinner(true), 150);

    try {
      const google = await loadGooglePlaces();
      if (requestId !== requestIdRef.current || controller.signal.aborted) return;

      if (!sessionTokenRef.current) {
        sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken();
      }

      const response = await google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
        input: searchQuery,
        language: getLanguage(),
        region: 'th',
        includedRegionCodes: ['th'],
        sessionToken: sessionTokenRef.current,
      });

      if (requestId !== requestIdRef.current || controller.signal.aborted) return;

      const locations = (response.suggestions || [])
        .map((suggestion) => toLocation(suggestion))
        .filter((location): location is Location => Boolean(location));
      setResults(locations);
      setHighlightedIndex(-1);
    } catch (error) {
      if (controller.signal.aborted || requestId !== requestIdRef.current) return;
      setResults([]);
      setRequestError(true);
      console.error('Google Places autocomplete error:', error);
    } finally {
      window.clearTimeout(spinnerTimer);
      if (requestId === requestIdRef.current) {
        setIsLoading(false);
        setShowSpinner(false);
      }
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => fetchResults(query), 300);
    return () => window.clearTimeout(timer);
  }, [fetchResults, query]);

  useEffect(() => () => abortControllerRef.current?.abort(), []);

  const handleSelect = async (location: Location, position: number) => {
    const selected = results[position] || location;
    let finalLocation = location;

    try {
      const google = await loadGooglePlaces();
      const prediction = selected.googleSuggestion?.placePrediction;
      const place = prediction?.toPlace?.();
      if (place) {
        await place.fetchFields({ fields: ['id', 'displayName', 'formattedAddress', 'location', 'types'] });
        finalLocation = {
          ...finalLocation,
          name: place.displayName?.text || finalLocation.name,
          display_name: place.formattedAddress
            ? `${place.displayName?.text || finalLocation.name}, ${place.formattedAddress}`
            : finalLocation.display_name,
          formatted_address: place.formattedAddress || finalLocation.formatted_address,
          latitude: place.location?.lat?.() ?? finalLocation.latitude,
          longitude: place.location?.lng?.() ?? finalLocation.longitude,
          type: place.types?.[0]?.replace(/_/g, ' ') || finalLocation.type,
        };
      }
    } catch {
      // Keep the prediction available if Place Details cannot be loaded.
    }

    onSelect(finalLocation);
    setQuery(finalLocation.display_name);
    saveToRecent(finalLocation);
    logSelection(finalLocation, position);
    setIsOpen(false);
    setHighlightedIndex(-1);
    sessionTokenRef.current = null;
  };

  const handleManualInput = () => {
    if (!query.trim()) return;
    onSelect({ raw_input: query, is_manual_input: true });
    logSelection(undefined, undefined, true, query, 'manual_override');
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    const items = query.length < 1 ? recentSearches : results;
    if (!isOpen) {
      if (event.key === 'Enter') handleManualInput();
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlightedIndex((previous) => (previous < items.length - 1 ? previous + 1 : 0));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlightedIndex((previous) => (previous > 0 ? previous - 1 : items.length - 1));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (highlightedIndex >= 0 && items[highlightedIndex]) handleSelect(items[highlightedIndex], highlightedIndex);
      else handleManualInput();
    } else if (event.key === 'Escape') {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getTypeIcon = (type: string, isRecent?: boolean) => {
    if (isRecent) return <Clock className="w-4 h-4 text-gray-400" />;
    switch (type.toLowerCase()) {
      case 'airport': return <Plane className="w-4 h-4 text-blue-500" />;
      case 'hotel': return <Hotel className="w-4 h-4 text-amber-500" />;
      case 'port':
      case 'pier': return <Anchor className="w-4 h-4 text-cyan-500" />;
      case 'attraction': return <Map className="w-4 h-4 text-green-500" />;
      default: return <MapPin className="w-4 h-4 text-gray-400" />;
    }
  };

  const displayItems = query.length < 1 ? recentSearches : results;

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <label className="block text-sm font-semibold text-gray-600 mb-1.5 flex items-center gap-2">
        {icon} {label}
      </label>
      <div className="relative group">
        <input
          ref={inputRef}
          type="text"
          value={query}
          required={required}
          disabled={disabled}
          autoComplete="off"
          onKeyDown={handleKeyDown}
          onChange={(event) => {
            setQuery(event.target.value);
            onChange(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => window.setTimeout(() => {
            if (!dropdownRef.current?.contains(document.activeElement)) setIsOpen(false);
          }, 100)}
          placeholder={placeholder}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm text-gray-800 placeholder:text-muted-foreground outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 group-hover:border-gray-300"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {showSpinner ? <Loader2 className="w-4 h-4 text-gold animate-spin" /> : query ? (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                onChange('');
                setResults([]);
                setIsOpen(true);
                inputRef.current?.focus();
                sessionTokenRef.current = null;
              }}
              disabled={disabled}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Clear input"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          ) : <Search className="w-4 h-4 text-gray-300" />}
        </div>
      </div>

      {isOpen && (displayItems.length > 0 || (query.length >= 1 && !isLoading)) && (
        <div className="absolute z-[100] w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl max-h-[50vh] overflow-y-auto overflow-x-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {query.length < 1 && recentSearches.length > 0 && (
            <div className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em] bg-gray-50/50 border-b border-gray-50">
              Recent {context} locations
            </div>
          )}

          {displayItems.map((location, index) => (
            <button
              type="button"
              key={`${location.id}-${index}`}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => handleSelect(location, index)}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={`w-full flex items-center gap-4 px-5 py-4 transition-all border-b border-gray-50 last:border-0 text-left ${highlightedIndex === index ? 'bg-gold/[0.03]' : 'hover:bg-gray-50/50'}`}
            >
              <div className={`p-2.5 rounded-xl transition-colors ${highlightedIndex === index ? 'bg-white shadow-sm' : 'bg-gray-50'}`}>
                {getTypeIcon(location.type, query.length < 1)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-gray-900 truncate text-[15px]">{location.name}</div>
                <div className="text-[11px] font-bold text-gray-400 mt-0.5 tracking-wider flex items-center gap-2">
                  <span className="text-gold capitalize">{location.type}</span>
                  <span className="text-gray-200">•</span>
                  <span className="truncate">{location.city}</span>
                </div>
              </div>
            </button>
          ))}

          {query.length >= 1 && results.length === 0 && !isLoading && (
            <div className="p-4 text-center">
              <div className="inline-flex p-2.5 bg-gray-50 rounded-full mb-2"><Search className="w-5 h-5 text-gray-200" /></div>
              <p className="text-sm text-gray-600 font-bold">{requestError ? 'Suggestions are temporarily unavailable' : `No results for "${query}"`}</p>
              <p className="text-xs text-gray-400 mt-1">{requestError ? 'You can still enter this location manually' : 'Check spelling or try a city name'}</p>
              <button type="button" onClick={handleManualInput} className="mt-3 px-3 py-1.5 text-sm bg-gold text-white rounded-lg hover:bg-gold-dark transition-colors">
                Use "{query}" as manual input
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LocationAutocomplete;
