"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { PROPERTIES, SITE } from "@/data/site-data";
import PropertyMap from "@/components/PropertyMap";
import type { FloorPlan, Property } from "@/data/site-data";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  DollarSign,
  Check,
  Phone,
  Mail,
  Clock,
  PawPrint,
  Share2,
  Copy,
  Facebook,
  Twitter,
  Linkedin,
  Camera,
  Box,
  CalendarDays,
  Shield,
  Zap,
  Star,
} from "lucide-react";

/* ── animation helpers ── */
const EASE_EMPHASIZED: [number, number, number, number] = [0.05, 0.7, 0.1, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.6, ease: EASE_EMPHASIZED },
  }),
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5, ease: EASE_EMPHASIZED },
  },
};

/* ── share helpers ── */
function shareUrl(platform: string) {
  const url = encodeURIComponent(window.location.href);
  const map: Record<string, string> = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
    twitter: `https://twitter.com/intent/tweet?url=${url}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
  };
  window.open(map[platform], "_blank", "noopener");
}

/* ── main page component ── */
export default function PropertyDetailPage() {
  const params = useParams<{ slug: string }>();
  const property = PROPERTIES.find((p) => p.slug === params.slug);
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const [selectedFloorPlan, setSelectedFloorPlan] = useState(0);
  const [copied, setCopied] = useState(false);

  /* ── not found ── */
  if (!property) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6">
        <div className="bg-ambient" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: EASE_EMPHASIZED }}
          className="glass p-12 text-center max-w-md"
        >
          <h1 className="text-4xl font-bold text-gradient mb-4">
            Property Not Found
          </h1>
          <p className="text-gray-500 mb-8">
            The property you are looking for does not exist or has been removed.
          </p>
          <Link href="/properties" className="btn-glow inline-block">
            View All Properties
          </Link>
        </motion.div>
      </div>
    );
  }

  const otherProperties = PROPERTIES.filter((p) => p.id !== property.id).slice(0, 3);

  /* ── Floor plan photo switching ── */
  const activeFloorPlan = property.floorPlans[selectedFloorPlan];
  const currentPhotos = activeFloorPlan?.photos?.length ? activeFloorPlan.photos : property.photos;
  const totalPhotos = currentPhotos.length;

  const handleFloorPlanSelect = (idx: number) => {
    setSelectedFloorPlan(idx);
    setSelectedPhoto(0); // Reset to first photo when switching floor plan
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrevPhoto = () => {
    setSelectedPhoto((prev) => (prev === 0 ? totalPhotos - 1 : prev - 1));
  };

  const handleNextPhoto = () => {
    setSelectedPhoto((prev) => (prev === totalPhotos - 1 ? 0 : prev + 1));
  };

  return (
    <div className="min-h-screen">
      <div className="bg-ambient" />

      {/* ── Section 1: Breadcrumb ── */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-2">
        <ol className="flex items-center gap-2 text-sm" style={{ color: "var(--on-surface-variant)" }}>
          <li>
            <Link href="/" className="hover:text-gray-900 transition-colors">
              Home
            </Link>
          </li>
          <li className="select-none">
            <ChevronRight className="w-3.5 h-3.5" />
          </li>
          <li>
            <Link href="/properties" className="hover:text-gray-900 transition-colors">
              Floor Plans
            </Link>
          </li>
          <li className="select-none">
            <ChevronRight className="w-3.5 h-3.5" />
          </li>
          <li className="text-blue-600 truncate max-w-[200px] sm:max-w-none font-medium">
            {property.name}
          </li>
        </ol>
      </nav>

      {/* ── Section 2: Image Gallery ── */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-6"
      >
        {/* Main Image */}
        <div className="relative w-full rounded-2xl overflow-hidden" style={{ height: "60vh", minHeight: 320, background: "var(--surface-container-low)" }}>
          <Image
            src={currentPhotos[selectedPhoto]}
            alt={`${property.name} - ${activeFloorPlan?.name || ''} Photo ${selectedPhoto + 1}`}
            fill
            unoptimized
            style={{ objectFit: "cover" }}
            priority
          />

          {/* Featured badge */}
          {property.featured && (
            <div className="absolute top-4 left-4 z-10">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg">
                <Star className="w-3.5 h-3.5" />
                Featured
              </span>
            </div>
          )}

          {/* Photo counter */}
          <div className="absolute bottom-4 right-4 z-10">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white backdrop-blur-md"
              style={{ background: "rgba(0,0,0,0.55)" }}
            >
              <Camera className="w-3.5 h-3.5" />
              {selectedPhoto + 1} / {totalPhotos}
            </span>
          </div>

          {/* Navigation arrows */}
          <button
            onClick={handlePrevPhoto}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all hover:scale-110"
            style={{ background: "rgba(0,0,0,0.45)", border: "1px solid rgba(255,255,255,0.1)" }}
            aria-label="Previous photo"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={handleNextPhoto}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all hover:scale-110"
            style={{ background: "rgba(0,0,0,0.45)", border: "1px solid rgba(255,255,255,0.1)" }}
            aria-label="Next photo"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Thumbnail strip */}
        <div className="mt-3 flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: "thin" }}>
          {currentPhotos.map((photo, i) => (
            <button
              key={i}
              onClick={() => setSelectedPhoto(i)}
              className={`relative shrink-0 rounded-lg overflow-hidden transition-all duration-200 ${
                selectedPhoto === i
                  ? "ring-2 ring-blue-500 ring-offset-2 scale-105 opacity-100"
                  : "opacity-60 hover:opacity-100"
              }`}
              style={{
                width: 80,
                height: 60,
              }}
            >
              <Image
                src={photo}
                alt={`Thumbnail ${i + 1}`}
                fill
                unoptimized
                style={{ objectFit: "cover" }}
              />
            </button>
          ))}
        </div>
      </motion.section>

      {/* ── Section 3: Property Info Header ── */}
      <motion.header
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={fadeUp}
        custom={0}
        className="max-w-7xl mx-auto px-4 sm:px-6 pb-6"
      >
        {/* Property name */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gradient mb-1">
          {property.name}
        </h1>
        <p className="text-base font-medium text-gray-500 mb-2">
          {activeFloorPlan?.name} – ${activeFloorPlan?.price}/month
        </p>

        {/* Address */}
        <div className="flex items-center gap-2 mb-5" style={{ color: "var(--on-surface-variant)" }}>
          <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
          <span className="text-base">{property.address}</span>
        </div>

        {/* Key stats row */}
        <div className="flex flex-wrap gap-3 mb-5">
          {[
            { icon: <Bed className="w-4 h-4" />, label: `${property.beds} Beds`, color: "rgba(26,115,232,0.08)", border: "rgba(26,115,232,0.2)", text: "#1a73e8" },
            { icon: <Bath className="w-4 h-4" />, label: `${property.baths} Baths`, color: "rgba(124,58,237,0.08)", border: "rgba(124,58,237,0.2)", text: "#7c3aed" },
            { icon: <Maximize2 className="w-4 h-4" />, label: `${property.sqft} sqft`, color: "rgba(13,148,136,0.08)", border: "rgba(13,148,136,0.2)", text: "#0d9488" },
            { icon: <DollarSign className="w-4 h-4" />, label: `From $${property.startingPrice}/mo`, color: "rgba(22,163,74,0.08)", border: "rgba(22,163,74,0.2)", text: "#16a34a" },
          ].map((badge) => (
            <span
              key={badge.label}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
              style={{
                background: badge.color,
                border: `1px solid ${badge.border}`,
                color: badge.text,
              }}
            >
              {badge.icon}
              {badge.label}
            </span>
          ))}
        </div>

        {/* Tags row */}
        <div className="flex flex-wrap gap-2">
          {property.tags.map((tag) => (
            <span
              key={tag}
              className="chip"
            >
              {tag}
            </span>
          ))}
        </div>
      </motion.header>

      {/* ── Section 4: Two-column layout ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Left Column ── */}
          <div className="lg:col-span-2 space-y-10">

            {/* About This Property */}
            <motion.section
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={fadeUp}
              custom={0}
              className="glass p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Property</h2>
              <p className="leading-relaxed" style={{ color: "var(--on-surface-variant)" }}>
                {property.description}
              </p>
            </motion.section>

            {/* Floor Plans */}
            <motion.section
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={fadeUp}
              custom={1}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Floor Plans</h2>
              <p className="text-sm mb-6" style={{ color: "var(--on-surface-variant)" }}>
                Currently viewing: <span className="font-semibold text-[#1a73e8]">{activeFloorPlan?.name}</span>
                {" · "}Click a floor plan to view its photos
              </p>
              <div className="space-y-4">
                {property.floorPlans.map((fp: FloorPlan, idx: number) => (
                  <motion.div
                    key={idx}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeUp}
                    custom={idx}
                    className={`glass p-6 cursor-pointer transition-all ${selectedFloorPlan === idx ? "!border-[#1a73e8] ring-1 ring-[#1a73e8]" : ""}`}
                    onClick={() => handleFloorPlanSelect(idx)}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">{fp.name}</h3>
                          {fp.has3DTour && (
                            <span
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                              style={{ background: "rgba(13,148,136,0.08)", border: "1px solid rgba(13,148,136,0.2)", color: "#0d9488" }}
                            >
                              <Box className="w-3 h-3" />
                              3D Tour
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm" style={{ color: "var(--on-surface-variant)" }}>
                          <span className="flex items-center gap-1.5">
                            <Bed className="w-4 h-4 text-blue-600" />
                            {fp.beds} Bed{fp.beds !== 1 ? "s" : ""}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Bath className="w-4 h-4 text-blue-600" />
                            {fp.baths} Bath{fp.baths !== 1 ? "s" : ""}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Maximize2 className="w-4 h-4 text-blue-600" />
                            {fp.sqft} sqft
                          </span>
                          <span className="flex items-center gap-1.5 font-semibold" style={{ color: "var(--tertiary)" }}>
                            <DollarSign className="w-4 h-4" />
                            ${fp.price}/mo
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Camera className="w-4 h-4 text-blue-600" />
                            {fp.photoCount} photos
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-3 shrink-0">
                        <Link href={`/schedule-tour?property=${property.slug}&floor_plan=${encodeURIComponent(fp.name)}`} className="btn-outline text-sm !px-5 !py-2">
                          Schedule Tour
                        </Link>
                        <Link href="/apply" className="btn-glow text-sm !px-5 !py-2">
                          Apply Now
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* Amenities */}
            <motion.section
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={fadeUp}
              custom={2}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Amenities</h2>
              <div className="glass p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {property.amenities.map((amenity) => (
                    <div
                      key={amenity}
                      className="flex items-center gap-3"
                      style={{ color: "var(--on-surface-variant)" }}
                    >
                      <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                      {amenity}
                    </div>
                  ))}
                </div>
              </div>
            </motion.section>

            {/* Pet Policy */}
            <motion.section
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={fadeUp}
              custom={3}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <PawPrint className="w-6 h-6 text-purple-600" />
                Pet Policy
              </h2>
              <div className="glass p-8 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="glass-subtle p-4">
                    <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--on-surface-variant)" }}>
                      Pet Deposit
                    </p>
                    <p className="text-xl font-bold text-gray-900">
                      ${property.petPolicy.deposit}
                      <span className="text-sm font-normal ml-1" style={{ color: "var(--on-surface-variant)" }}>
                        one-time
                      </span>
                    </p>
                  </div>
                  <div className="glass-subtle p-4">
                    <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--on-surface-variant)" }}>
                      Monthly Pet Rent
                    </p>
                    <p className="text-xl font-bold text-gray-900">
                      ${property.petPolicy.monthlyRent}
                      <span className="text-sm font-normal ml-1" style={{ color: "var(--on-surface-variant)" }}>
                        /month
                      </span>
                    </p>
                  </div>
                </div>
                <div className="glass-subtle p-4">
                  <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--on-surface-variant)" }}>
                    ESA Policy
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--on-surface-variant)" }}>
                    {property.petPolicy.esaPolicy}
                  </p>
                </div>
              </div>
            </motion.section>

            {/* Utilities */}
            <motion.section
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={fadeUp}
              custom={4}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Zap className="w-5 h-5 text-amber-400" />
                Utilities Included
              </h2>
              <div className="glass p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  {property.utilities.map((util) => (
                    <div
                      key={util}
                      className="flex items-center gap-3"
                      style={{ color: "var(--on-surface-variant)" }}
                    >
                      <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                      {util}
                    </div>
                  ))}
                </div>
                <p className="text-sm pt-4" style={{ borderTop: "1px solid var(--outline-variant)", color: "var(--on-surface-variant)" }}>
                  Utilities are $100 per month extra per person and include water, sewer, trash,
                  high-speed internet, and cable TV.
                </p>
              </div>
            </motion.section>

            {/* Lease Information */}
            <motion.section
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={fadeUp}
              custom={5}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <CalendarDays className="w-5 h-5 text-blue-600" />
                Lease Information
              </h2>
              <div className="glass p-8 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="glass-subtle p-4">
                    <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--on-surface-variant)" }}>
                      Minimum Lease
                    </p>
                    <p className="text-lg font-bold text-gray-900">6 Months</p>
                  </div>
                  <div className="glass-subtle p-4">
                    <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--on-surface-variant)" }}>
                      Security Deposit
                    </p>
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-blue-600" />
                      <p className="text-lg font-bold text-gray-900">1 Month&apos;s Rent</p>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider mb-3" style={{ color: "var(--on-surface-variant)" }}>
                    Available Lease Terms
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {property.leaseTerms.map((term) => (
                      <span
                        key={term}
                        className="px-4 py-1.5 rounded-full text-sm font-medium"
                        style={{
                          background: "rgba(26,115,232,0.08)",
                          border: "1px solid rgba(26,115,232,0.2)",
                          color: "#1a73e8",
                        }}
                      >
                        {term}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.section>
          </div>

          {/* ── Right Column (Sticky Sidebar) ── */}
          <aside className="space-y-6">
            <div className="lg:sticky lg:top-6 space-y-6">

              {/* Contact card */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={0}
                className="glass p-6"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-5">Contact Leasing Office</h3>
                <div className="space-y-4">
                  <a
                    href={`tel:${SITE.phone}`}
                    className="flex items-center gap-3 transition-colors hover:text-blue-600"
                    style={{ color: "var(--on-surface-variant)" }}
                  >
                    <Phone className="w-5 h-5 text-blue-600 shrink-0" />
                    {SITE.phone}
                  </a>
                  <a
                    href={`mailto:${SITE.email}`}
                    className="flex items-center gap-3 transition-colors hover:text-blue-600"
                    style={{ color: "var(--on-surface-variant)" }}
                  >
                    <Mail className="w-5 h-5 text-blue-600 shrink-0" />
                    {SITE.email}
                  </a>
                  <div className="flex items-start gap-3" style={{ color: "var(--on-surface-variant)" }}>
                    <Clock className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                    <div className="text-sm">
                      <p>{SITE.hours.weekday}</p>
                      <p>{SITE.hours.weekend}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <Link
                    href={`/schedule-tour?property=${property.slug}`}
                    className="btn-glow block text-center w-full !py-3"
                  >
                    Schedule a Tour
                  </Link>
                  <Link
                    href="/apply"
                    className="btn-outline block text-center w-full !py-3"
                  >
                    Apply Now
                  </Link>
                </div>
              </motion.div>

              {/* Share buttons */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={1}
                className="glass p-6"
              >
                <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-blue-600" />
                  Share This Property
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopyLink}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium transition-all"
                    style={{
                      background: copied ? "rgba(22,163,74,0.1)" : "var(--surface-container-lowest)",
                      border: `1px solid ${copied ? "rgba(22,163,74,0.3)" : "var(--outline-variant)"}`,
                      color: copied ? "#16a34a" : "var(--on-surface-variant)",
                    }}
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copied ? "Copied!" : "Copy"}
                  </button>
                  <button
                    onClick={() => shareUrl("facebook")}
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105"
                    style={{ background: "var(--surface-container-lowest)", border: "1px solid var(--outline-variant)" }}
                    aria-label="Share on Facebook"
                  >
                    <Facebook className="w-4 h-4" style={{ color: "var(--on-surface-variant)" }} />
                  </button>
                  <button
                    onClick={() => shareUrl("twitter")}
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105"
                    style={{ background: "var(--surface-container-lowest)", border: "1px solid var(--outline-variant)" }}
                    aria-label="Share on Twitter"
                  >
                    <Twitter className="w-4 h-4" style={{ color: "var(--on-surface-variant)" }} />
                  </button>
                  <button
                    onClick={() => shareUrl("linkedin")}
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105"
                    style={{ background: "var(--surface-container-lowest)", border: "1px solid var(--outline-variant)" }}
                    aria-label="Share on LinkedIn"
                  >
                    <Linkedin className="w-4 h-4" style={{ color: "var(--on-surface-variant)" }} />
                  </button>
                </div>
              </motion.div>
            </div>
          </aside>
        </div>
      </div>

      {/* ── Location Map ── */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={fadeUp}
        custom={0}
        className="max-w-7xl mx-auto px-4 sm:px-6 pb-12"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-600" />
          Location
        </h2>
        <p className="text-sm text-gray-500 mb-6">{property.address}</p>
        <PropertyMap property={property} height={420} />
      </motion.section>

      {/* ── Section 5: Other Properties ── */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={fadeUp}
        custom={0}
        className="max-w-7xl mx-auto px-4 sm:px-6 pb-32"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Other Properties</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {otherProperties.map((op: Property, idx: number) => (
            <motion.div
              key={op.id}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={idx}
            >
              <Link
                href={`/properties/${op.slug}`}
                className="glass block overflow-hidden hover:border-blue-300 transition-all group"
              >
                {/* Property image */}
                <div className="relative w-full aspect-[4/3] overflow-hidden">
                  <Image
                    src={op.photos[0] || op.image}
                    alt={op.name}
                    fill
                    unoptimized
                    style={{ objectFit: "cover" }}
                    className="transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-500 transition-colors mb-1">
                    {op.name}
                  </h3>
                  <p className="text-xs mb-2 flex items-center gap-1" style={{ color: "var(--on-surface-variant)" }}>
                    <MapPin className="w-3 h-3" />
                    {op.address}
                  </p>
                  <div className="flex items-center gap-3 text-xs" style={{ color: "var(--on-surface-variant)" }}>
                    <span className="flex items-center gap-1">
                      <Bed className="w-3 h-3" />
                      {op.beds} Bed
                    </span>
                    <span className="flex items-center gap-1">
                      <Bath className="w-3 h-3" />
                      {op.baths} Bath
                    </span>
                    <span className="font-semibold" style={{ color: "var(--tertiary)" }}>
                      From ${op.startingPrice}
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ── Section 6: Floating Bottom Bar (mobile only) ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
        <div
          className="backdrop-blur-xl px-4 py-3 flex gap-3"
          style={{
            background: "rgba(255, 255, 255, 0.92)",
            borderTop: "1px solid #e5e7eb",
            boxShadow: "0 -2px 10px rgba(0,0,0,0.08)",
          }}
        >
          <Link
            href={`/schedule-tour?property=${property.slug}`}
            className="btn-outline flex-1 text-center !py-3 text-sm"
          >
            Tour
          </Link>
          <Link
            href="/apply"
            className="btn-glow flex-1 text-center !py-3 text-sm"
          >
            Apply
          </Link>
        </div>
      </div>
    </div>
  );
}
