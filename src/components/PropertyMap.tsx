"use client";

import { useCallback, useState } from "react";
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from "@react-google-maps/api";
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
  styles: [
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "transit",
      elementType: "labels",
      stylers: [{ visibility: "off" }],
    },
  ],
};

interface PropertyMapProps {
  /** Single property view */
  property?: Property;
  /** Multiple properties view */
  properties?: Property[];
  /** Map height — defaults to 400px */
  height?: number;
}

export default function PropertyMap({
  property,
  properties,
  height = 400,
}: PropertyMapProps) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
  });

  const [activeMarker, setActiveMarker] = useState<string | null>(null);

  const allProperties = properties ?? (property ? [property] : []);

  const center =
    allProperties.length === 1
      ? { lat: allProperties[0].lat, lng: allProperties[0].lng }
      : { lat: 35.8512, lng: -86.358 }; // Murfreesboro center

  const zoom = allProperties.length === 1 ? 16 : 14;

  const onLoad = useCallback(
    (map: google.maps.Map) => {
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
          <Marker
            key={p.id}
            position={{ lat: p.lat, lng: p.lng }}
            title={p.name}
            onClick={() => setActiveMarker(p.id)}
          >
            {activeMarker === p.id && (
              <InfoWindow onCloseClick={() => setActiveMarker(null)}>
                <div style={{ padding: 4, minWidth: 160 }}>
                  <p
                    style={{
                      margin: 0,
                      fontWeight: 700,
                      fontSize: 14,
                      color: "#1f2937",
                    }}
                  >
                    {p.name}
                  </p>
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: 12,
                      color: "#6b7280",
                    }}
                  >
                    {p.address}
                  </p>
                  <p
                    style={{
                      margin: "6px 0 0",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#2563eb",
                    }}
                  >
                    From ${p.startingPrice}/mo
                  </p>
                </div>
              </InfoWindow>
            )}
          </Marker>
        ))}
      </GoogleMap>
    </div>
  );
}
