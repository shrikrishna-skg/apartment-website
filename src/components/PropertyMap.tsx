"use client";

import { useState, useEffect, useRef } from "react";
import type { Property } from "@/data/site-data";

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
  const mapRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [activePopup, setActivePopup] = useState<string | null>(null);

  const allProperties = properties ?? (property ? [property] : []);

  const center: [number, number] =
    allProperties.length === 1
      ? [allProperties[0].lat, allProperties[0].lng]
      : [35.8512, -86.358]; // Murfreesboro center

  const zoom = allProperties.length === 1 ? 16 : 14;

  useEffect(() => {
    setLoaded(true);
  }, []);

  if (!loaded) {
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

  return <LeafletMap
    allProperties={allProperties}
    center={center}
    zoom={zoom}
    height={height}
    activePopup={activePopup}
    setActivePopup={setActivePopup}
  />;
}

/* ── Leaflet map (lazy-loaded to avoid SSR issues) ── */

import dynamic from "next/dynamic";

const LeafletMap = dynamic(() => import("./LeafletMapInner"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: "100%",
        height: 400,
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
  ),
});
