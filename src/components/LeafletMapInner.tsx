"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Property } from "@/data/site-data";

/* Fix default marker icon paths for Leaflet in bundled apps */
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface LeafletMapInnerProps {
  allProperties: Property[];
  center: [number, number];
  zoom: number;
  height: number;
  activePopup: string | null;
  setActivePopup: (id: string | null) => void;
}

export default function LeafletMapInner({
  allProperties,
  center,
  zoom,
  height,
}: LeafletMapInnerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapInstanceRef.current) return;

    const map = L.map(containerRef.current, {
      center,
      zoom,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    /* Add markers */
    const markers: L.Marker[] = [];
    allProperties.forEach((p) => {
      const marker = L.marker([p.lat, p.lng]).addTo(map);
      marker.bindPopup(
        `<div style="padding:4px;min-width:160px;">
          <p style="margin:0;font-weight:700;font-size:14px;color:#1f2937;">${p.name}</p>
          <p style="margin:4px 0 0;font-size:12px;color:#6b7280;">${p.address}</p>
          <p style="margin:6px 0 0;font-size:13px;font-weight:600;color:#2563eb;">From $${p.startingPrice}/mo</p>
        </div>`,
        { maxWidth: 260 }
      );
      markers.push(marker);
    });

    /* Fit bounds for multiple properties */
    if (allProperties.length > 1 && markers.length > 1) {
      const group = L.featureGroup(markers);
      map.fitBounds(group.getBounds().pad(0.15));
    }

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      style={{
        width: "100%",
        height,
        borderRadius: 12,
        overflow: "hidden",
        border: "1px solid #e5e7eb",
      }}
    >
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
