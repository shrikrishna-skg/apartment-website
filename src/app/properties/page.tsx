"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  Search,
  MapPin,
  Bed,
  Bath,
  Ruler,
  SlidersHorizontal,
  ChevronRight,
  ArrowRight,
  LayoutGrid,
  List,
  Tag,
  X,
} from "lucide-react";
import { PROPERTIES } from "@/data/site-data";

/* ──────────────────────────── helpers ──────────────────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
};


const LOCATIONS = [
  "All Locations",
  ...Array.from(new Set(PROPERTIES.map((p) => p.address.split(",")[1]?.trim() || "Murfreesboro"))),
];

const BEDROOM_OPTIONS = [
  { label: "Any Bedrooms", value: "" },
  { label: "Studio", value: "studio" },
  { label: "1 Bedroom", value: "1" },
  { label: "2 Bedrooms", value: "2" },
  { label: "3 Bedrooms", value: "3" },
  { label: "4 Bedrooms", value: "4" },
];

const PRICE_OPTIONS = [
  { label: "Any Price", value: "" },
  { label: "Under $600", value: "under600" },
  { label: "$600 - $800", value: "600to800" },
  { label: "$800+", value: "800plus" },
];

/* ──────────────────────────── component ──────────────────────────── */

export default function PropertiesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [selectedBedrooms, setSelectedBedrooms] = useState("");
  const [selectedPrice, setSelectedPrice] = useState("");
  const [viewMode, setViewMode] = useState<"properties" | "floorplans">("properties");
  const router = useRouter();

  const filteredProperties = useMemo(() => {
    return PROPERTIES.filter((property) => {
      /* search query */
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          property.name.toLowerCase().includes(q) ||
          property.address.toLowerCase().includes(q) ||
          property.description.toLowerCase().includes(q) ||
          property.tags.some((t) => t.toLowerCase().includes(q));
        if (!match) return false;
      }

      /* location */
      if (selectedLocation !== "All Locations") {
        if (!property.address.includes(selectedLocation)) return false;
      }

      /* bedrooms */
      if (selectedBedrooms) {
        if (selectedBedrooms === "studio") {
          const hasStudio = property.floorPlans.some(
            (fp) => fp.name.toLowerCase().includes("studio")
          );
          if (!hasStudio) return false;
        } else {
          const bed = parseInt(selectedBedrooms, 10);
          const hasBed =
            property.beds === bed ||
            property.floorPlans.some((fp) => fp.beds === bed);
          if (!hasBed) return false;
        }
      }

      /* price — check if ANY floor plan matches the price range */
      if (selectedPrice) {
        const prices = [property.startingPrice, ...property.floorPlans.map((fp) => fp.price)];
        if (selectedPrice === "under600" && !prices.some((p) => p < 600)) return false;
        if (selectedPrice === "600to800" && !prices.some((p) => p >= 600 && p <= 800)) return false;
        if (selectedPrice === "800plus" && !prices.some((p) => p >= 800)) return false;
      }

      return true;
    });
  }, [searchQuery, selectedLocation, selectedBedrooms, selectedPrice]);

  const allFloorPlans = useMemo(() => {
    return filteredProperties.flatMap((property) =>
      property.floorPlans.map((fp) => ({ ...fp, propertyName: property.name, propertySlug: property.slug }))
    );
  }, [filteredProperties]);

  const hasActiveFilters =
    searchQuery.trim() ||
    selectedLocation !== "All Locations" ||
    selectedBedrooms ||
    selectedPrice;

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedLocation("All Locations");
    setSelectedBedrooms("");
    setSelectedPrice("");
  };

  return (
    <main className="min-h-screen">
      <div className="bg-ambient" />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
        {/* ━━━━━━━━━━━ BREADCRUMB ━━━━━━━━━━━ */}
        <motion.nav
          className="mb-8 flex items-center gap-2 text-sm text-gray-500"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link
            href="/"
            className="hover:text-blue-600 transition-colors"
          >
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-gray-800">Floor Plans</span>
        </motion.nav>

        {/* ━━━━━━━━━━━ HEADING ━━━━━━━━━━━ */}
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl md:text-4xl lg:text-5xl">
            MTSU Off-Campus Housing &{" "}
            <span className="text-gradient">Floor Plans</span>
          </h1>
          <p className="mt-4 max-w-2xl text-gray-600">
            Browse our available apartments near Middle Tennessee State
            University. Filter by location, bedrooms, or price to find your
            perfect home.
          </p>
        </motion.div>

        {/* ━━━━━━━━━━━ SEARCH & FILTERS ━━━━━━━━━━━ */}
        <motion.div
          className="mb-8 space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by property name, address, or features..."
              className="input-glass w-full"
              style={{ paddingLeft: "2.75rem", paddingRight: "2.5rem" }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 transition-colors hover:text-gray-900"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filter row */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <SlidersHorizontal className="h-4 w-4" />
              <span>Filters:</span>
            </div>

            {/* Location */}
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="input-glass text-sm py-2.5"
            >
              {LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>

            {/* Bedrooms */}
            <select
              value={selectedBedrooms}
              onChange={(e) => setSelectedBedrooms(e.target.value)}
              className="input-glass text-sm py-2.5"
            >
              {BEDROOM_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {/* Price */}
            <select
              value={selectedPrice}
              onChange={(e) => setSelectedPrice(e.target.value)}
              className="input-glass text-sm py-2.5"
            >
              {PRICE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-600 transition-all hover:border-red-500/50 hover:bg-red-500/20"
              >
                <X className="h-3.5 w-3.5" />
                Clear Filters
              </button>
            )}
          </div>
        </motion.div>

        {/* ━━━━━━━━━━━ VIEW TOGGLE & RESULT COUNT ━━━━━━━━━━━ */}
        <motion.div
          className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          {/* Toggle */}
          <div className="flex overflow-hidden rounded-xl glass-subtle p-1">
            <button
              onClick={() => setViewMode("properties")}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                viewMode === "properties"
                  ? "bg-[#1a73e8] text-white shadow-lg"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
              Properties
            </button>
            <button
              onClick={() => setViewMode("floorplans")}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                viewMode === "floorplans"
                  ? "bg-[#1a73e8] text-white shadow-lg"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <List className="h-4 w-4" />
              Floor Plans
            </button>
          </div>

          {/* Result count */}
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-gray-900">
              {viewMode === "properties"
                ? filteredProperties.length
                : allFloorPlans.length}
            </span>{" "}
            {viewMode === "properties" ? "Properties" : "Floor Plans"} Found
          </p>
        </motion.div>

        {/* ━━━━━━━━━━━ PROPERTIES VIEW ━━━━━━━━━━━ */}
        {viewMode === "properties" && (
          <motion.div
            className="grid gap-8 sm:grid-cols-2"
            variants={stagger}
            initial="hidden"
            animate="visible"
            key="properties-view"
          >
            {filteredProperties.length === 0 ? (
              <motion.div
                variants={fadeUp}
                transition={{ duration: 0.5 }}
                className="col-span-full glass flex flex-col items-center justify-center py-20"
              >
                <Search className="mb-4 h-12 w-12 text-gray-400" />
                <h3 className="mb-2 text-lg font-semibold text-gray-800">
                  No properties found
                </h3>
                <p className="mb-6 text-sm text-gray-600">
                  Try adjusting your search or filter criteria.
                </p>
                <button
                  onClick={clearFilters}
                  className="btn-glow"
                >
                  Clear All Filters
                </button>
              </motion.div>
            ) : (
              filteredProperties.map((property) => {
                return (
                  <motion.div
                    key={property.id}
                    variants={fadeUp}
                    transition={{ duration: 0.5 }}
                    role="link"
                    tabIndex={0}
                    onClick={() => router.push(`/properties/${property.slug}`)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        router.push(`/properties/${property.slug}`);
                      }
                    }}
                    className="glass group overflow-hidden cursor-pointer hover:border-blue-300 transition-all"
                  >
                    {/* Real property image */}
                    <div className="img-container relative" style={{ aspectRatio: "16/10" }}>
                      <Image
                        src={property.image}
                        alt={property.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover"
                      />
                      {property.featured && (
                        <span className="absolute left-4 top-4 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-lg">
                          Popular
                        </span>
                      )}
                      <div className="absolute bottom-4 right-4 rounded-lg bg-black/50 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
                        {property.floorPlans.length} Floor Plan
                        {property.floorPlans.length !== 1 ? "s" : ""}
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="mb-1 text-xl font-bold">{property.name}</h3>
                      <p className="mb-3 flex items-center gap-1.5 text-sm text-gray-600">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        {property.address}
                      </p>

                      <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-gray-600">
                        {property.description}
                      </p>

                      {/* Tags */}
                      <div className="mb-4 flex flex-wrap gap-2">
                        {property.tags.map((tag) => (
                          <span
                            key={tag}
                            className="chip"
                          >
                            <Tag className="h-3 w-3" />
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Stats */}
                      <div className="mb-4 flex flex-wrap gap-4 text-sm text-gray-700">
                        <span className="flex items-center gap-1.5">
                          <Bed className="h-4 w-4 text-blue-600" />
                          {property.beds} Beds
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Bath className="h-4 w-4 text-purple-600" />
                          {property.baths} Baths
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Ruler className="h-4 w-4 text-teal-600" />
                          {property.sqft} sqft
                        </span>
                      </div>

                      {/* Price */}
                      <div className="mb-5 flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-blue-600">
                          ${property.startingPrice}
                        </span>
                        <span className="text-sm text-gray-600">/mo starting</span>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3">
                        <Link
                          href={`/schedule-tour?property=${property.slug}`}
                          onClick={(e) => e.stopPropagation()}
                          className="btn-outline flex-1 justify-center text-center"
                        >
                          Schedule Tour
                        </Link>
                        <Link
                          href={`/properties/${property.slug}`}
                          onClick={(e) => e.stopPropagation()}
                          className="btn-glow flex-1 justify-center text-center"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        )}

        {/* ━━━━━━━━━━━ FLOOR PLANS VIEW ━━━━━━━━━━━ */}
        {viewMode === "floorplans" && (
          <motion.div
            className="space-y-4"
            variants={stagger}
            initial="hidden"
            animate="visible"
            key="floorplans-view"
          >
            {allFloorPlans.length === 0 ? (
              <motion.div
                variants={fadeUp}
                transition={{ duration: 0.5 }}
                className="glass flex flex-col items-center justify-center py-20"
              >
                <Search className="mb-4 h-12 w-12 text-gray-400" />
                <h3 className="mb-2 text-lg font-semibold text-gray-800">
                  No floor plans found
                </h3>
                <p className="mb-6 text-sm text-gray-600">
                  Try adjusting your search or filter criteria.
                </p>
                <button
                  onClick={clearFilters}
                  className="btn-glow"
                >
                  Clear All Filters
                </button>
              </motion.div>
            ) : (
              allFloorPlans.map((fp, i) => (
                <motion.div
                  key={`${fp.propertySlug}-${fp.name}-${i}`}
                  variants={fadeUp}
                  transition={{ duration: 0.5 }}
                  role="link"
                  tabIndex={0}
                  onClick={() => router.push(`/properties/${fp.propertySlug}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      router.push(`/properties/${fp.propertySlug}`);
                    }
                  }}
                  className="glass flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between cursor-pointer hover:border-blue-300 transition-all"
                >
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-3">
                      <h3 className="text-lg font-bold">{fp.name}</h3>
                      {fp.has3DTour && (
                        <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-600">
                          3D Tour
                        </span>
                      )}
                    </div>
                    <p className="mb-3 text-sm text-gray-600">
                      {fp.propertyName}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-700">
                      <span className="flex items-center gap-1.5">
                        <Bed className="h-4 w-4 text-blue-600" />
                        {fp.beds} Bed{fp.beds !== 1 ? "s" : ""}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Bath className="h-4 w-4 text-purple-600" />
                        {fp.baths} Bath{fp.baths !== 1 ? "s" : ""}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Ruler className="h-4 w-4 text-teal-600" />
                        {fp.sqft} sqft
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-5">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">
                        ${fp.price}
                      </div>
                      <div className="text-xs text-gray-600">/mo</div>
                    </div>
                    <div className="flex gap-3">
                      <Link href={`/schedule-tour?property=${fp.propertySlug}`} onClick={(e) => e.stopPropagation()} className="btn-outline">
                        Tour
                      </Link>
                      <Link href={`/properties/${fp.propertySlug}`} onClick={(e) => e.stopPropagation()} className="btn-glow">
                        Details
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}

        {/* ━━━━━━━━━━━ CTA BOTTOM ━━━━━━━━━━━ */}
        <motion.div
          className="mt-12 sm:mt-16 glass p-6 sm:p-10 text-center"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="mb-3 text-2xl font-bold">
            Can&apos;t decide?{" "}
            <span className="text-gradient">Schedule a Tour</span>
          </h3>
          <p className="mx-auto mb-6 max-w-lg text-gray-600">
            Visit our properties in person to find the perfect fit. Our team
            will walk you through every floor plan and answer all your questions.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/schedule-tour"
              className="btn-glow group"
            >
              Schedule a Tour
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/apply"
              className="btn-outline"
            >
              Apply Online
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
