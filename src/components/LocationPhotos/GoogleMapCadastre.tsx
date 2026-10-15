// Source: Google Maps Platform Code Assist
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMapsLibrary,
  useMap,
} from '@vis.gl/react-google-maps';
import {
  Search,
  MapPin,
  Layers,
  ZoomIn,
  ZoomOut,
  Crosshair,
  Loader2,
  X,
  Sun,
  ShieldCheck,
} from 'lucide-react';
import { LocationPreset, BuildingConfig } from '../../types/solar';
import { useLanguage } from '../../i18n/LanguageContext';
import { DemoBadge } from '../Common/DemoBadge';

interface GoogleMapCadastreProps {
  currentLocation: LocationPreset;
  onUpdateCoords: (lat: number, lng: number, placeName?: string) => void;
  building: BuildingConfig;
}

// Sub-component for Autocomplete search input utilizing Places API (New)
const PlaceSearchInput: React.FC<{
  onSelectLocation: (lat: number, lng: number, name: string) => void;
}> = ({ onSelectLocation }) => {
  const { t } = useLanguage();
  const placesLib = useMapsLibrary('places');
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompleteSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch suggestions using modern Autocomplete Data API
  useEffect(() => {
    if (!placesLib || !query.trim() || query.length < 2) {
      setSuggestions([]);
      return;
    }

    const { AutocompleteSessionToken, AutocompleteSuggestion } = placesLib;
    if (!sessionTokenRef.current) {
      sessionTokenRef.current = new AutocompleteSessionToken();
    }

    const request: google.maps.places.AutocompleteRequest = {
      input: query,
      sessionToken: sessionTokenRef.current,
      region: 'th',
    };

    setIsLoading(true);
    let active = true;

    AutocompleteSuggestion.fetchAutocompleteSuggestions(request)
      .then((res) => {
        if (!active) return;
        setSuggestions(res.suggestions || []);
        setIsOpen(true);
      })
      .catch((err) => {
        console.error('Error fetching autocomplete suggestions:', err);
        const errMsg = String(err);
        if (errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('429') || errMsg.includes('QuotaExceeded')) {
          window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [placesLib, query]);

  const handleSelectSuggestion = async (suggestion: google.maps.places.AutocompleteSuggestion) => {
    if (!placesLib || !suggestion.placePrediction) return;

    try {
      setIsLoading(true);
      const place = suggestion.placePrediction.toPlace();
      await place.fetchFields({
        fields: ['displayName', 'formattedAddress', 'location'],
      });

      if (place.location) {
        const lat = place.location.lat();
        const lng = place.location.lng();
        const name = place.displayName || place.formattedAddress || suggestion.placePrediction.text.toString();
        onSelectLocation(lat, lng, name);
      }

      // Reset session token after successful detail fetch
      sessionTokenRef.current = null;
      setQuery('');
      setSuggestions([]);
      setIsOpen(false);
    } catch (err) {
      console.error('Error fetching place details:', err);
      const errMsg = String(err);
      if (errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('429') || errMsg.includes('QuotaExceeded')) {
        window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative flex items-center">
        <Search className="w-4 h-4 text-[#8FA3BF] absolute left-3 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('locSearchPlaceholder')}
          className="w-full bg-[#091526] border border-[#1B3252] rounded-lg pl-9 pr-9 py-2 text-xs text-white placeholder-[#64748B] focus:border-[#27D3BC] focus:outline-none focus:ring-1 focus:ring-[#27D3BC]"
        />
        {isLoading ? (
          <Loader2 className="w-4 h-4 text-[#27D3BC] absolute right-3 animate-spin" />
        ) : query ? (
          <button
            onClick={() => {
              setQuery('');
              setSuggestions([]);
              setIsOpen(false);
            }}
            className="text-[#8FA3BF] hover:text-white absolute right-3"
          >
            <X className="w-4 h-4" />
          </button>
        ) : null}
      </div>

      {/* Autocomplete Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-[#091526] border border-[#1B3252] rounded-lg shadow-2xl z-50 overflow-hidden max-h-60 overflow-y-auto">
          {suggestions.map((s, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectSuggestion(s)}
              className="w-full text-left px-3 py-2 text-xs hover:bg-[#112239] border-b border-[#1B3252]/50 last:border-0 flex items-start gap-2 text-[#CBD5E1] hover:text-white transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-[#27D3BC] shrink-0 mt-0.5" />
              <div className="flex-1 truncate">
                <p className="font-medium truncate text-white">
                  {s.placePrediction?.mainText?.toString() || s.placePrediction?.text.toString()}
                </p>
                {s.placePrediction?.secondaryText && (
                  <p className="text-[11px] text-[#8FA3BF] truncate">
                    {s.placePrediction.secondaryText.toString()}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Map Controller for Camera Pan & Zoom sync
const MapController: React.FC<{
  center: { lat: number; lng: number };
  zoom: number;
}> = ({ center, zoom }) => {
  const map = useMap();

  useEffect(() => {
    if (map) {
      map.panTo(center);
    }
  }, [map, center.lat, center.lng]);

  useEffect(() => {
    if (map) {
      map.setZoom(zoom);
    }
  }, [map, zoom]);

  return null;
};

export const GoogleMapCadastre: React.FC<GoogleMapCadastreProps> = ({
  currentLocation,
  onUpdateCoords,
  building,
}) => {
  const { t } = useLanguage();
  const [mapType, setMapType] = useState<'hybrid' | 'roadmap'>('hybrid');
  const [zoom, setZoom] = useState(18);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  const handleMapClick = useCallback(
    (e: { detail: { latLng: google.maps.LatLngLiteral | null } }) => {
      if (e.detail?.latLng) {
        onUpdateCoords(e.detail.latLng.lat, e.detail.latLng.lng);
      }
    },
    [onUpdateCoords]
  );

  const handleRecenter = () => {
    setZoom(19);
  };

  return (
    <div className="space-y-3">
      {/* Search and Cadastre Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex-1 max-w-md">
          {apiKey ? (
            <APIProvider apiKey={apiKey} libraries={['places']}>
              <PlaceSearchInput
                onSelectLocation={(lat, lng, name) => {
                  onUpdateCoords(lat, lng, name);
                  setZoom(19);
                }}
              />
            </APIProvider>
          ) : (
            <div className="text-xs text-[#8FA3BF] italic">
              {t('locGoogleMapsReady')}
            </div>
          )}
        </div>

        {/* Layer Toggle */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto bg-[#091526] p-1 rounded-lg border border-[#1B3252] text-[11px]">
          <button
            onClick={() => setMapType('hybrid')}
            className={`px-2.5 py-1 rounded font-medium transition-colors ${
              mapType === 'hybrid'
                ? 'bg-[#27D3BC] text-[#091526] font-bold shadow-sm'
                : 'text-[#8FA3BF] hover:text-white'
            }`}
          >
            {t('locLayerSatellite')}
          </button>
          <button
            onClick={() => setMapType('roadmap')}
            className={`px-2.5 py-1 rounded font-medium transition-colors ${
              mapType === 'roadmap'
                ? 'bg-[#27D3BC] text-[#091526] font-bold shadow-sm'
                : 'text-[#8FA3BF] hover:text-white'
            }`}
          >
            {t('locLayerRoadmap')}
          </button>
        </div>
      </div>

      {/* Main Map Canvas */}
      <div className="relative h-72 sm:h-96 w-full rounded-xl overflow-hidden border border-[#1B3252] bg-[#0A1628] shadow-inner">
        {apiKey ? (
          <APIProvider apiKey={apiKey} libraries={['marker', 'places']}>
            <Map
              mapId="DEMO_MAP_ID"
              style={{ width: '100%', height: '100%' }}
              center={{ lat: currentLocation.lat, lng: currentLocation.lng }}
              zoom={zoom}
              mapTypeId={mapType}
              gestureHandling="greedy"
              disableDefaultUI={true}
              onClick={handleMapClick}
              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            >
              <MapController
                center={{ lat: currentLocation.lat, lng: currentLocation.lng }}
                zoom={zoom}
              />

              {/* Advanced Marker for Rooftop Installation */}
              <AdvancedMarker
                position={{ lat: currentLocation.lat, lng: currentLocation.lng }}
                title={currentLocation.name}
              >
                <div className="relative flex flex-col items-center group cursor-pointer -translate-y-1/2">
                  {/* Floating Tooltip with Building Dimensions */}
                  <div className="mb-1 bg-[#091526]/95 border border-[#27D3BC] text-white px-2 py-0.5 rounded shadow-lg text-[10px] font-mono whitespace-nowrap flex items-center gap-1.5 backdrop-blur-sm pointer-events-none">
                    <Sun className="w-3 h-3 text-[#27D3BC]" />
                    <span className="font-semibold text-[#27D3BC]">
                      {building.width}m × {building.length}m
                    </span>
                    <span className="text-[#8FA3BF]">
                      ({building.width * building.length}m²)
                    </span>
                  </div>

                  {/* High-visibility Target Marker */}
                  <div className="relative w-8 h-8 rounded-full border-2 border-[#27D3BC] bg-[#091526]/90 flex items-center justify-center shadow-lg shadow-[#27D3BC]/40">
                    <div className="w-3 h-3 bg-[#27D3BC] rounded-full animate-ping absolute inset-0 m-auto opacity-75" />
                    <MapPin className="w-4 h-4 text-[#27D3BC] relative z-10" />
                  </div>
                </div>
              </AdvancedMarker>
            </Map>
          </APIProvider>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-[#091526]/80 backdrop-blur-sm">
            <MapPin className="w-8 h-8 text-[#27D3BC] mb-2" />
            <p className="text-sm font-semibold text-white">
              Google Maps Platform
            </p>
            <p className="text-xs text-[#8FA3BF] mt-1">
              {t('locGoogleMapsReady')}
            </p>
          </div>
        )}

        {/* Map Overlays: Hint Tip */}
        <div className="absolute top-3 left-3 bg-[#091526]/90 border border-[#1B3252] rounded-lg px-2.5 py-1 text-[11px] text-[#8FA3BF] flex items-center gap-2 backdrop-blur-md shadow-md pointer-events-none">
          <Crosshair className="w-3.5 h-3.5 text-[#27D3BC]" />
          <span>{t('locClickMapTip')}</span>
        </div>

        {/* Map Zoom & Recenter Controls */}
        <div className="absolute bottom-3 right-3 flex flex-col gap-1 bg-[#091526]/90 border border-[#1B3252] rounded-lg p-1 backdrop-blur-md shadow-lg z-10">
          <button
            onClick={() => setZoom((z) => Math.min(21, z + 1))}
            className="p-1.5 text-[#8FA3BF] hover:text-white transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="w-full h-px bg-[#1B3252]" />
          <button
            onClick={() => setZoom((z) => Math.max(12, z - 1))}
            className="p-1.5 text-[#8FA3BF] hover:text-white transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <div className="w-full h-px bg-[#1B3252]" />
          <button
            onClick={handleRecenter}
            className="p-1.5 text-[#8FA3BF] hover:text-[#27D3BC] transition-colors"
            title={t('locResetCenter')}
          >
            <Crosshair className="w-4 h-4" />
          </button>
        </div>

        {/* Status Badge in Lower Left */}
        <div className="absolute bottom-3 left-3 bg-[#091526]/90 border border-[#1B3252] rounded px-2 py-1 text-[10px] text-[#8FA3BF] flex items-center gap-1.5 backdrop-blur-md z-10">
          <ShieldCheck className="w-3 h-3 text-[#27D3BC]" />
          <span className="font-mono text-[#27D3BC]">
            {currentLocation.lat.toFixed(5)}°N, {currentLocation.lng.toFixed(5)}°E
          </span>
          <span className="text-[#64748B]">•</span>
          <span className="text-white font-medium truncate max-w-[140px] sm:max-w-xs">
            {currentLocation.name}
          </span>
        </div>
      </div>
    </div>
  );
};
