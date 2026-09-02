import { useState, useCallback } from 'react';

export interface UserCoordinates {
  lat: number;
  lng: number;
}

export interface CenterCoordinates {
  lat: number;
  lng: number;
}

export const CENTER_COORDS: Record<string, CenterCoordinates> = {
  vij: { lat: 16.5062, lng: 80.6480 }, // Vijayawada
  gun: { lat: 16.3067, lng: 80.4365 }, // Guntur
  viz: { lat: 17.6868, lng: 83.2185 }, // Visakhapatnam
  tir: { lat: 13.6288, lng: 79.4192 }, // Tirupati
  war: { lat: 17.9689, lng: 79.5941 }, // Warangal
  kak: { lat: 16.9891, lng: 82.2475 }, // Kakinada
  nlg: { lat: 17.0577, lng: 79.2684 }, // Nalgonda
  kurn: { lat: 15.8281, lng: 78.0373 }, // Kurnool
};

// Haversine formula to compute distance in KM
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export function openGoogleMapsNavigation(
  destName: string,
  userCoords?: UserCoordinates | null,
  destCoords?: CenterCoordinates | null
) {
  let url = `https://www.google.com/maps/dir/?api=1`;
  if (userCoords) {
    url += `&origin=${userCoords.lat},${userCoords.lng}`;
  }
  if (destCoords) {
    url += `&destination=${destCoords.lat},${destCoords.lng}`;
  } else {
    url += `&destination=${encodeURIComponent(destName)}`;
  }
  window.open(url, '_blank');
}

export function useUserLocation() {
  const [coords, setCoords] = useState<UserCoordinates | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = useCallback(() => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      const fallback: UserCoordinates = { lat: 16.5062, lng: 80.6480 };
      setCoords(fallback);
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userPos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setCoords(userPos);
        setLoading(false);
      },
      (err) => {
        console.warn('Geolocation permission error or blocked, using default location:', err.message);
        const fallback: UserCoordinates = { lat: 16.5062, lng: 80.6480 };
        setCoords(fallback);
        setError('Location access limited. Using default region (Vijayawada).');
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }, []);

  return { coords, loading, error, requestLocation };
}
