"use client";

import { useCallback, useState, useEffect, useRef } from "react";
import { GoogleMap, useJsApiLoader, InfoWindow } from "@react-google-maps/api";
import type { Property } from "@/data/site-data";

const containerStyle = {
  width: "100%",
  height: "100%",
  borderRadius: 12,
};

const mapOptions: google.maps.MapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
  mapTypeId: "hybrid",
  mapId: "college-place-map",
};

interface PropertyMapProps {
  property?: Property;
  properties?: Property[];
  height?: number;
}

function AdvancedMarker({
  map,
  position,
  title,
  onClick,
}: {
  map: google.maps.Map | null;
  position: { lat: number; lng: number };
  title: string;
  onClick?: () => void;
}) {
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);

  useEffect(() => {
    if (!map) return;

    const initMarker = async () => {
      const { AdvancedMarkerElement } = (await google.maps.importLibrary("marker")) as google.maps.MarkerLibrary;

      if (markerRef.current) {
        markerRef.current.map = null;
      }

      const marker = new AdvancedMarkerElement({
        map,
        position,
        title,
      });

      if (onClick) {
        marker.addListener("click", onClick);
      }

      markerRef.current = marker;
    };

    initMarker();

    return () => {
      if (markerRef.current) {
        markerRef.current.map = null;
        markerRef.current = null;
      }
    };
  }, [map, position.lat, position.lng, title, onClick]);

  return null;
}

export default function PropertyMap({
  property,
  properties,
  height = 400,
}: PropertyMapProps) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
  });

  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [activeMarker, setActiveMarker] = useState<string | null>(null);

  const allProperties = properties ?? (property ? [property] : []);

  const center =
    allProperties.length === 1
      ? { lat: allProperties[0].lat, lng: allProperties[0].lng }
      : { lat: 35.8512, lng: -86.358 };

  const zoom = allProperties.length === 1 ? 16 : 14;

  const onLoad = useCallback(
    (map: google.maps.Map) => {
      setMapInstance(map);
      if (allProperties.length > 1) {
        const bounds = new google.maps.LatLngBounds();
        allProperties.forEach((p) => bounds.extend({ lat: p.lat, lng: p.lng }));
        map.fitBounds(bounds, 60);
      }
    },
    [allProperties],
  );

  if (!isLoaded) {
    return (
      <div
        style={{
          width: "100%",
          height,
          borderRadius: 12,
          background: "#f3f4f6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#9ca3af",
          fontSize: 14,
        }}
      >
        Loading map...
      </div>
    );
  }

  const activeProperty = allProperties.find((p) => p.id === activeMarker);

  return (
    <div style={{ width: "100%", height, borderRadius: 12, overflow: "hidden" }}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={zoom}
        onLoad={onLoad}
        options={mapOptions}
      >
        {allProperties.map((p) => (
          <AdvancedMarker
            key={p.id}
            map={mapInstance}
            position={{ lat: p.lat, lng: p.lng }}
            title={p.name}
            onClick={() => setActiveMarker(p.id)}
          />
        ))}
        {activeProperty && (
          <InfoWindow
            position={{ lat: activeProperty.lat, lng: activeProperty.lng }}
            onCloseClick={() => setActiveMarker(null)}
          >
            <div style={{ padding: 4, minWidth: 160 }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: "#1f2937" }}>
                {activeProperty.name}
              </p>
              <p style={{ margin: "4px 0 0", fontSize: 12, color: "#6b7280" }}>
                {activeProperty.address}
              </p>
              <p style={{ margin: "6px 0 0", fontSize: 13, fontWeight: 600, color: "#2563eb" }}>
                From ${activeProperty.startingPrice}/mo
              </p>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}
