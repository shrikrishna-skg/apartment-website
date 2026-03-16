"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Bed, Bath, Maximize, MapPin } from "lucide-react";
import type { Property } from "@/data/site-data";

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      whileHover={{ boxShadow: "0 8px 30px rgba(0,0,0,0.12)" }}
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 12,
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
        transition: "box-shadow 300ms ease",
      }}
    >
      {/* Image Container - 16:10 aspect ratio */}
      <Link
        href={`/properties/${property.slug}`}
        style={{
          display: "block",
          position: "relative",
          aspectRatio: "16 / 10",
          overflow: "hidden",
        }}
      >
        <Image
          src={property.image}
          alt={property.name}
          fill
          unoptimized
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          style={{
            objectFit: "cover",
            transition: "transform 300ms ease",
          }}
          className="group-hover:scale-[1.03]"
        />

        {/* Price Badge - top right */}
        <span
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            padding: "6px 12px",
            fontSize: 13,
            fontWeight: 600,
            borderRadius: 6,
            background: "rgba(17, 24, 39, 0.85)",
            color: "#ffffff",
            backdropFilter: "blur(4px)",
            letterSpacing: "0.01em",
          }}
        >
          Starting at ${property.startingPrice}/mo
        </span>

        {/* Popular Badge - top left */}
        {property.featured && (
          <span
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              padding: "5px 12px",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.03em",
              textTransform: "uppercase",
              borderRadius: 6,
              background: "#f59e0b",
              color: "#ffffff",
              boxShadow: "0 1px 4px rgba(245,158,11,0.4)",
            }}
          >
            Popular
          </span>
        )}
      </Link>

      {/* Content - clickable area */}
      <Link
        href={`/properties/${property.slug}`}
        style={{ textDecoration: "none", display: "block", padding: "16px 18px 12px" }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {/* Property Name */}
          <span
            style={{
              fontSize: 19,
              fontWeight: 700,
              color: "#1f2937",
              letterSpacing: "-0.01em",
              lineHeight: 1.3,
            }}
          >
            {property.name}
          </span>

          {/* Address */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <MapPin
              size={14}
              style={{ color: "#6b7280", flexShrink: 0 }}
            />
            <span
              style={{
                fontSize: 13,
                color: "#6b7280",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {property.address}
            </span>
          </div>

          {/* Stats Row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              paddingTop: 4,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                fontSize: 13,
                color: "#374151",
              }}
            >
              <Bed size={15} style={{ color: "#3b82f6" }} />
              <span>{property.beds} Beds</span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                fontSize: 13,
                color: "#374151",
              }}
            >
              <Bath size={15} style={{ color: "#3b82f6" }} />
              <span>{property.baths} Baths</span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                fontSize: 13,
                color: "#374151",
              }}
            >
              <Maximize size={15} style={{ color: "#3b82f6" }} />
              <span>{property.sqft} sqft</span>
            </div>
          </div>

          {/* Amenity Tags */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 6,
              paddingTop: 4,
            }}
          >
            {property.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  padding: "4px 10px",
                  fontSize: 11,
                  fontWeight: 500,
                  borderRadius: 9999,
                  background: "#f3f4f6",
                  color: "#4b5563",
                  letterSpacing: "0.01em",
                  border: "1px solid #e5e7eb",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </Link>

      {/* Divider */}
      <div
        style={{
          height: 1,
          background: "#e5e7eb",
          margin: "0 18px",
        }}
      />

      {/* Action Row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 18px 18px",
        }}
      >
        <Link
          href={`/schedule-tour?property=${property.slug}`}
          style={{
            flex: 1,
            display: "block",
            textAlign: "center",
            padding: "10px 16px",
            fontSize: 13,
            fontWeight: 600,
            borderRadius: 8,
            border: "1px solid #d1d5db",
            background: "#ffffff",
            color: "#374151",
            textDecoration: "none",
            transition: "background 200ms ease, border-color 200ms ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#f9fafb";
            e.currentTarget.style.borderColor = "#9ca3af";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#ffffff";
            e.currentTarget.style.borderColor = "#d1d5db";
          }}
        >
          Schedule Tour
        </Link>
        <Link
          href="/apply"
          style={{
            flex: 1,
            display: "block",
            textAlign: "center",
            padding: "10px 16px",
            fontSize: 13,
            fontWeight: 600,
            borderRadius: 8,
            background: "#2563eb",
            color: "#ffffff",
            textDecoration: "none",
            boxShadow: "0 1px 2px rgba(37,99,235,0.2)",
            transition: "background 200ms ease, box-shadow 200ms ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#1d4ed8";
            e.currentTarget.style.boxShadow =
              "0 4px 12px rgba(37,99,235,0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#2563eb";
            e.currentTarget.style.boxShadow =
              "0 1px 2px rgba(37,99,235,0.2)";
          }}
        >
          Apply Now
        </Link>
      </div>
    </motion.div>
  );
}
