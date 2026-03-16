"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  MapPin,
  Home,
  GraduationCap,
  Phone,
  Clock,
  Navigation,
  Map,
  Bus,
  ShoppingBag,
  Star,
  ArrowRight,
  Mail,
  Shield,
  Wifi,
  Car,
  PawPrint,
  Dumbbell,
  BookOpen,
  CheckCircle,
} from "lucide-react";
import { SITE, PROPERTIES, type Property } from "@/data/site-data";
import PropertyCard from "@/components/PropertyCard";
import PropertyMap from "@/components/PropertyMap";

/* ──────────────────────────── animation helpers ──────────────────────────── */

const EASE: [number, number, number, number] = [0.05, 0.7, 0.1, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 36 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE },
  },
};

const stagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, ease: EASE },
  },
};

const AMENITIES = [
  { icon: Wifi, text: "High-Speed Internet Included" },
  { icon: Car, text: "Free Parking for All Residents" },
  { icon: PawPrint, text: "Pet-Friendly Community" },
  { icon: Shield, text: "24/7 Maintenance Support" },
  { icon: Dumbbell, text: "On-Site Fitness & Recreation" },
  { icon: BookOpen, text: "Quiet Study Lounges" },
  { icon: Home, text: "Modern Appliances & Finishes" },
  { icon: GraduationCap, text: "Individual Leasing Per Bedroom" },
];

/* ──────────────────────────── component ──────────────────────────── */

export default function HomePage() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--surface)",
        color: "var(--on-surface)",
        overflowX: "hidden",
      }}
    >
      {/* ━━━━━━━━━━━ HERO ━━━━━━━━━━━ */}
      <section
        className="relative flex items-center justify-center overflow-hidden"
        style={{ minHeight: "auto", background: "#fff" }}
      >
        {/* Subtle background pattern */}
        <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.4 }}>
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, #e5e7eb 1px, transparent 0)`,
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        {/* Soft gradient blobs */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: "-10%",
            right: "-5%",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(26,115,232,0.08), transparent 70%)",
            filter: "blur(80px)",
          }}
        />
        <div
          className="absolute pointer-events-none"
          style={{
            bottom: "-10%",
            left: "-5%",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(26,115,232,0.06), transparent 70%)",
            filter: "blur(80px)",
          }}
        />

        {/* Hero content */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center pt-10 pb-16">
          {/* Leasing badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium bg-blue-50 text-[#1a73e8] border border-blue-100">
              <span className="w-2 h-2 rounded-full bg-[#1a73e8] animate-pulse" />
              Now Leasing for 2025–2026
            </span>
          </motion.div>

          {/* Main heading */}
          <motion.h1
            className="mt-8 text-gray-900"
            style={{
              fontSize: "clamp(2.75rem, 7vw, 5rem)",
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
            }}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
          >
            Student Housing{" "}
            <span className="text-gradient">Near MTSU</span>
          </motion.h1>

          {/* Description */}
          <motion.p
            className="mt-7 mx-auto text-gray-500"
            style={{ maxWidth: "38rem", fontSize: "1.175rem", lineHeight: 1.75 }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25, ease: EASE }}
          >
            {SITE.description}
          </motion.p>

          {/* Location & contact info */}
          <motion.div
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-sm text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.35, ease: EASE }}
          >
            <span className="flex items-center gap-1.5">
              <MapPin size={15} className="text-[#1a73e8]" />
              {SITE.address.full}
            </span>
            <span className="hidden sm:block w-1 h-1 rounded-full bg-gray-300" />
            <span className="flex items-center gap-1.5">
              <Phone size={15} className="text-[#1a73e8]" />
              {SITE.phone}
            </span>
          </motion.div>

          {/* CTA buttons */}
          <motion.div
            className="mt-12 flex flex-wrap justify-center gap-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45, ease: EASE }}
          >
            <Link href="/properties" className="btn-glow" style={{ padding: "1rem 2.5rem", fontSize: "1rem" }}>
              View Floor Plans
              <ArrowRight size={18} />
            </Link>
            <Link href="/apply" className="btn-outline" style={{ padding: "1rem 2.5rem", fontSize: "1rem" }}>
              Student Application
            </Link>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            className="mt-10 flex flex-wrap justify-center gap-8 text-xs text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.55, ease: EASE }}
          >
            {[
              { icon: Shield, text: "Verified Properties" },
              { icon: Star, text: "4.8★ Student Reviews" },
              { icon: Clock, text: "Quick Application" },
            ].map(({ icon: TIcon, text }) => (
              <span key={text} className="flex items-center gap-1.5">
                <TIcon size={14} className="text-gray-400" />
                {text}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ━━━━━━━━━━━ AERIAL PROPERTY SHOWCASE ━━━━━━━━━━━ */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8" style={{ background: "#f8f9fa" }}>
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-8"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <h2 className="text-gray-900" style={{ fontSize: "clamp(1.75rem, 4vw, 2.25rem)", fontWeight: 700, marginBottom: "0.75rem" }}>
              Our{" "}
              <span className="text-gradient">Communities</span>
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto">
              Four premium student housing communities, all within minutes of
              Middle Tennessee State University.
            </p>
          </motion.div>

          {/* Main aerial image with property pins */}
          <motion.div
            className="relative rounded-2xl overflow-hidden shadow-xl"
            style={{ aspectRatio: "16 / 9" }}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <Image
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/c5954ec6f_CollegePlaceeagleeyeview.png"
              alt="Aerial view of College Place properties near MTSU campus"
              fill
              unoptimized
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1152px"
              style={{ objectFit: "cover" }}
            />
            {/* Slight overlay for pin readability */}
            <div className="absolute inset-0 bg-black/15" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

            {/* ── Property & Campus Pin Markers ── */}
            {[
              { name: "College Pointe", address: "916 Brown Dr", color: "#0d9488", top: "68%", left: "22%", distance: "0.5 mi" },
              { name: "College Place", address: "1002 Old Lascassas Rd", color: "#1a73e8", top: "66%", left: "48%", distance: "0.4 mi" },
              { name: "College Center", address: "1023 Old Lascassas Rd", color: "#7c3aed", top: "66%", left: "65%", distance: "0.3 mi" },
              { name: "University Center", address: "1030 Greenland Dr", color: "#ea580c", top: "52%", left: "93%", distance: "0.6 mi", labelLeft: true },
            ].map((pin, i) => (
              <motion.div
                key={pin.name}
                className="absolute z-20 group"
                style={{ top: pin.top, left: pin.left, transform: "translate(-50%, -100%)" }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.15, duration: 0.5 }}
              >
                {/* Tooltip label */}
                <div
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                  style={{ background: pin.color, boxShadow: `0 4px 12px ${pin.color}40` }}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-white text-xs font-semibold">{pin.name}</span>
                    <span className="text-white/60 text-xs">· {pin.distance}</span>
                  </div>
                  <div className="text-white/70 text-[10px] mt-0.5">{pin.address}</div>
                  {/* Arrow */}
                  <div
                    className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0"
                    style={{ borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderTop: `5px solid ${pin.color}` }}
                  />
                </div>
                {/* Pin icon */}
                <div className="relative flex flex-col items-center">
                  <div
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 border-white shadow-lg cursor-pointer transition-transform hover:scale-110"
                    style={{ background: pin.color }}
                  >
                    <MapPin size={16} className="text-white sm:w-5 sm:h-5" />
                  </div>
                  {/* Pin stem */}
                  <div className="w-0.5 h-3 bg-white/80 rounded-full" />
                  {/* Pulse ring */}
                  <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full animate-ping opacity-30"
                    style={{ background: pin.color }}
                  />
                </div>
                {/* Always-visible label on desktop */}
                <div
                  className={`hidden sm:block absolute top-0 px-2 py-0.5 rounded-md whitespace-nowrap ${
                    (pin as { labelLeft?: boolean }).labelLeft ? "right-full mr-3" : "left-full ml-3"
                  }`}
                  style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
                >
                  <span className="text-white text-xs font-medium">{pin.name}</span>
                </div>
              </motion.div>
            ))}

            {/* MTSU Campus marker */}
            <motion.div
              className="absolute z-20 group"
              style={{ top: "48%", left: "49%", transform: "translate(-50%, -100%)" }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.9, duration: 0.5 }}
            >
              <div
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                style={{ background: "#1f2937", boxShadow: "0 4px 12px rgba(0,0,0,0.3)" }}
              >
                <span className="text-white text-xs font-semibold">MTSU Campus</span>
                <span className="text-white/70 text-xs ml-1.5">· Middle Tennessee State University</span>
                <div
                  className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0"
                  style={{ borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderTop: "5px solid #1f2937" }}
                />
              </div>
              <div className="relative flex flex-col items-center">
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center border-2 border-white shadow-lg cursor-pointer bg-gray-900 transition-transform hover:scale-110">
                  <GraduationCap size={18} className="text-white sm:w-5 sm:h-5" />
                </div>
                <div className="w-0.5 h-3 bg-white/80 rounded-full" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full animate-ping opacity-20 bg-gray-900" />
              </div>
              <div
                className="hidden sm:block absolute top-0 left-full ml-3 px-2.5 py-1 rounded-md whitespace-nowrap"
                style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
              >
                <span className="text-white text-xs font-semibold">MTSU Campus</span>
              </div>
            </motion.div>

            {/* Bottom info bar */}
            <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-white/60 text-xs font-medium uppercase tracking-wider mb-1">Aerial Property Map</p>
                  <h3 className="text-white text-lg sm:text-xl font-bold">
                    All Properties Near MTSU
                  </h3>
                </div>
                <Link
                  href="/properties"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-gray-900 text-sm font-semibold hover:bg-gray-100 transition-colors"
                >
                  Explore Properties
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Property snapshot cards with horizontal scroll */}
          <motion.div
            className="relative mt-6"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
              {[
                {
                  name: "College Place",
                  slug: "college-place-apartments",
                  address: "1002 Old Lascassas Rd",
                  image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/a542d9281_CollegePlaceBirdeyeview1.png",
                  color: "#1a73e8",
                  distance: "0.4 mi",
                },
                {
                  name: "College Center",
                  slug: "college-center-apartments",
                  address: "1023 Old Lascassas Rd",
                  image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/0955675c5_CollegeCenter1.jpg",
                  color: "#7c3aed",
                  distance: "0.3 mi",
                },
                {
                  name: "College Pointe",
                  slug: "college-pointe-apartments",
                  address: "915 Brown Dr",
                  image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/556db2975_college-center-murfreesboro-tn-building-photo.jpg",
                  color: "#0d9488",
                  distance: "0.5 mi",
                },
                {
                  name: "University Center",
                  slug: "university-center-apartments",
                  address: "1030 Greenland Dr",
                  image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/3bef6ff09_Universitycenterapartments.jpg",
                  color: "#ea580c",
                  distance: "0.6 mi",
                },
              ].map((property) => (
                <motion.div
                  key={property.name}
                  variants={fadeUp}
                  role="link"
                  tabIndex={0}
                  onClick={() => router.push(`/properties/${property.slug}`)}
                  onKeyDown={(e: React.KeyboardEvent) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      router.push(`/properties/${property.slug}`);
                    }
                  }}
                  className="relative rounded-xl overflow-hidden group cursor-pointer flex-shrink-0 snap-start"
                  style={{ aspectRatio: "4 / 3", width: "calc(33.333% - 0.67rem)", minWidth: "280px" }}
                >
                  <Image
                    src={property.image}
                    alt={`${property.name} apartments`}
                    fill
                    unoptimized
                    sizes="(max-width: 640px) 100vw, 33vw"
                    style={{ objectFit: "cover" }}
                    className="transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ background: property.color }}
                      />
                      <h4 className="text-white font-semibold text-sm">{property.name}</h4>
                    </div>
                    <p className="text-white/70 text-xs">{property.address}</p>
                    <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs">
                      <Navigation size={10} />
                      {property.distance} from MTSU
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
            {/* Scroll hint indicator */}
            <div className="flex justify-center gap-1.5 mt-3 sm:hidden">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-gray-300" />
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ━━━━━━━━━━━ WHY CHOOSE US ━━━━━━━━━━━ */}
      <section className="section-padding">
        <div style={{ maxWidth: "72rem", margin: "0 auto" }}>
          <motion.h2
            style={{ textAlign: "center", fontSize: "clamp(1.75rem, 4vw, 2.25rem)", fontWeight: 700, marginBottom: "0.75rem" }}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            Why Choose{" "}
            <span className="text-gradient">College Place?</span>
          </motion.h2>
          <motion.p
            style={{ textAlign: "center", maxWidth: "32rem", margin: "0 auto 3rem", color: "var(--on-surface-variant)" }}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            Everything you need for the ultimate student living experience near
            Middle Tennessee State University.
          </motion.p>

          <motion.div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "1.5rem",
            }}
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {[
              {
                Icon: MapPin,
                title: "Prime Location",
                desc: "Just 0.4 miles from MTSU campus -- an 8-minute walk or 2-minute drive to classes. Close to shopping, dining, and public transit.",
              },
              {
                Icon: Home,
                title: "Modern Living",
                desc: "Newly constructed buildings with modern appliances, high-speed internet, on-site laundry, and pet-friendly policies.",
              },
              {
                Icon: GraduationCap,
                title: "Student-Focused",
                desc: "Individual leasing per bedroom, flexible lease terms from 6 to 18 months, and a community built around student success.",
              },
            ].map(({ Icon, title, desc }) => (
              <motion.div
                key={title}
                variants={fadeUp}
                className="glass"
                style={{ padding: "2rem", borderRadius: "var(--shape-xl)" }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "var(--shape-md)",
                    background: "var(--surface-container)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "1.25rem",
                    color: "var(--primary)",
                  }}
                >
                  <Icon size={24} />
                </div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.75rem" }}>
                  {title}
                </h3>
                <p style={{ lineHeight: 1.7, color: "var(--on-surface-variant)" }}>
                  {desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ━━━━━━━━━━━ OUR PROPERTIES ━━━━━━━━━━━ */}
      <section className="section-padding">
        <div style={{ maxWidth: "72rem", margin: "0 auto" }}>
          <motion.h2
            style={{ textAlign: "center", fontSize: "clamp(1.75rem, 4vw, 2.25rem)", fontWeight: 700, marginBottom: "0.75rem" }}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            Our{" "}
            <span className="text-gradient">Properties</span>
          </motion.h2>
          <motion.p
            style={{ textAlign: "center", maxWidth: "32rem", margin: "0 auto 3rem", color: "var(--on-surface-variant)" }}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            Explore our student housing options near MTSU. Each property offers
            modern amenities and flexible leasing.
          </motion.p>

          <motion.div
            style={{
              display: "grid",
              padding: "0.5rem 0",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "2rem",
            }}
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {PROPERTIES.map((property) => (
              <motion.div key={property.id} variants={fadeUp}>
                <PropertyCard property={property} />
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            style={{ marginTop: "3rem", textAlign: "center" }}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <Link href="/properties" className="btn-glow" style={{ padding: "0.75rem 2rem", fontSize: "0.9375rem" }}>
              View All Floor Plans
              <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ━━━━━━━━━━━ LOCATION ━━━━━━━━━━━ */}
      <section className="section-padding">
        <div style={{ maxWidth: "72rem", margin: "0 auto" }}>
          <motion.h2
            style={{ textAlign: "center", fontSize: "clamp(1.75rem, 4vw, 2.25rem)", fontWeight: 700, marginBottom: "0.75rem" }}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            Prime Location{" "}
            <span className="text-gradient">Near MTSU</span>
          </motion.h2>
          <motion.p
            style={{ textAlign: "center", maxWidth: "32rem", margin: "0 auto 3rem", color: "var(--on-surface-variant)" }}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            Located just minutes from Middle Tennessee State University with
            easy access to everything you need.
          </motion.p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: "2rem",
            }}
            className="lg-two-col"
          >
            {/* Info column */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
            >
              {/* Distance stat cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
                {[
                  { value: "0.4", unit: "miles", label: "To MTSU" },
                  { value: "2", unit: "min", label: "Drive" },
                  { value: "8", unit: "min", label: "Walk" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="glass"
                    style={{
                      padding: "1.25rem",
                      textAlign: "center",
                      borderRadius: "var(--shape-lg)",
                    }}
                  >
                    <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--primary)" }}>
                      {item.value}
                    </div>
                    <div
                      style={{
                        fontSize: "0.6875rem",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        color: "var(--outline)",
                      }}
                    >
                      {item.unit}
                    </div>
                    <div style={{ marginTop: "0.25rem", fontSize: "0.8125rem", color: "var(--on-surface-variant)" }}>
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Address & Hours */}
              <div
                className="glass"
                style={{ padding: "1.5rem", borderRadius: "var(--shape-xl)" }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", marginBottom: "1rem" }}>
                  <MapPin size={20} style={{ marginTop: 2, flexShrink: 0, color: "var(--primary)" }} />
                  <div>
                    <h4 style={{ fontWeight: 600, marginBottom: "0.25rem" }}>Office Address</h4>
                    <p style={{ fontSize: "0.875rem", color: "var(--on-surface-variant)" }}>
                      {SITE.address.full}
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                  <Clock size={20} style={{ marginTop: 2, flexShrink: 0, color: "var(--tertiary)" }} />
                  <div>
                    <h4 style={{ fontWeight: 600, marginBottom: "0.25rem" }}>Office Hours</h4>
                    <p style={{ fontSize: "0.875rem", color: "var(--on-surface-variant)" }}>
                      {SITE.hours.weekday}
                    </p>
                    <p style={{ fontSize: "0.875rem", color: "var(--on-surface-variant)" }}>
                      {SITE.hours.weekend}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
                <a
                  href={`tel:${SITE.phone}`}
                  className="btn-glow"
                  style={{ flex: "1 1 0", justifyContent: "center", padding: "0.75rem 1rem" }}
                >
                  <Phone size={16} />
                  Call Office
                </a>
                <a
                  href={SITE.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline"
                  style={{ flex: "1 1 0", justifyContent: "center", padding: "0.75rem 1rem" }}
                >
                  <Map size={16} />
                  Google Maps
                </a>
                <a
                  href={SITE.directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline"
                  style={{ flex: "1 1 0", justifyContent: "center", padding: "0.75rem 1rem" }}
                >
                  <Navigation size={16} />
                  Directions
                </a>
              </div>
            </motion.div>

            {/* Live Map — all properties */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              <PropertyMap properties={PROPERTIES} height={360} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━ WHAT'S NEAR ━━━━━━━━━━━ */}
      <section className="section-padding">
        <div style={{ maxWidth: "72rem", margin: "0 auto" }}>
          <motion.h2
            style={{ textAlign: "center", fontSize: "clamp(1.75rem, 4vw, 2.25rem)", fontWeight: 700, marginBottom: "0.75rem" }}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            What&apos;s{" "}
            <span className="text-gradient">Nearby</span>
          </motion.h2>
          <motion.p
            style={{ textAlign: "center", maxWidth: "32rem", margin: "0 auto 3rem", color: "var(--on-surface-variant)" }}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            Everything you need is just minutes away from your front door.
          </motion.p>

          <motion.div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "1.5rem",
            }}
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {[
              {
                Icon: GraduationCap,
                title: "MTSU Campus",
                detail: "1.5 miles away",
                sub: "5 min drive / 15 min bike",
              },
              {
                Icon: ShoppingBag,
                title: "Shopping",
                detail: "10+ stores nearby",
                sub: "Walmart, Kroger, Target & more",
              },
              {
                Icon: Bus,
                title: "Public Transit",
                detail: "Rover Bus System",
                sub: "Multiple routes near campus",
              },
            ].map(({ Icon, title, detail, sub }) => (
              <motion.div
                key={title}
                variants={fadeUp}
                className="glass"
                style={{ padding: "2rem", borderRadius: "var(--shape-xl)" }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "var(--shape-md)",
                    background: "var(--surface-container)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "1rem",
                    color: "var(--primary)",
                  }}
                >
                  <Icon size={24} />
                </div>
                <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "0.25rem" }}>
                  {title}
                </h3>
                <p style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--on-surface)" }}>
                  {detail}
                </p>
                <p style={{ marginTop: "0.25rem", fontSize: "0.75rem", color: "var(--outline)" }}>
                  {sub}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ━━━━━━━━━━━ STUDENT AMENITIES ━━━━━━━━━━━ */}
      <section className="section-padding">
        <div style={{ maxWidth: "72rem", margin: "0 auto" }}>
          <motion.h2
            style={{ textAlign: "center", fontSize: "clamp(1.75rem, 4vw, 2.25rem)", fontWeight: 700, marginBottom: "0.75rem" }}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            Student{" "}
            <span className="text-gradient">Amenities</span>
          </motion.h2>
          <motion.p
            style={{ textAlign: "center", maxWidth: "32rem", margin: "0 auto 3rem", color: "var(--on-surface-variant)" }}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            Everything you need to thrive during your college years.
          </motion.p>

          <motion.div
            style={{ maxWidth: "48rem", margin: "0 auto" }}
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "1rem",
              }}
            >
              {AMENITIES.map(({ icon: Icon, text }) => (
                <motion.div
                  key={text}
                  variants={fadeUp}
                  className="glass"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    padding: "1rem 1.25rem",
                    borderRadius: "var(--shape-lg)",
                  }}
                >
                  <CheckCircle size={20} style={{ flexShrink: 0, color: "var(--success)" }} />
                  <span style={{ fontSize: "0.875rem", color: "var(--on-surface)" }}>
                    {text}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTAs */}
          <motion.div
            style={{ marginTop: "3rem", textAlign: "center", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "1rem" }}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <Link href="/testimonials" className="btn-outline" style={{ padding: "0.75rem 2rem" }}>
              <Star size={16} style={{ color: "var(--warning)" }} />
              Read Student Reviews
            </Link>
          </motion.div>

          {/* Ready to Apply CTA */}
          <motion.div
            className="glass"
            style={{
              marginTop: "4rem",
              padding: "3rem 2rem",
              borderRadius: "var(--shape-xl)",
              textAlign: "center",
              background: "linear-gradient(135deg, rgba(26,115,232,0.04), rgba(26,115,232,0.02), rgba(6,182,212,0.04))",
            }}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <h3 style={{ fontSize: "clamp(1.5rem, 3vw, 1.875rem)", fontWeight: 700, marginBottom: "0.75rem" }}>
              Ready to{" "}
              <span className="text-gradient">Apply?</span>
            </h3>
            <p style={{ maxWidth: "28rem", margin: "0 auto 2rem", color: "var(--on-surface-variant)" }}>
              Secure your spot at College Place today. Applications are now open
              for the upcoming academic year.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "1rem" }}>
              <Link href="/properties" className="btn-glow" style={{ padding: "0.75rem 2rem" }}>
                View Available Units
                <ArrowRight size={16} />
              </Link>
              <Link href="/schedule-tour" className="btn-outline" style={{ padding: "0.75rem 2rem" }}>
                Schedule a Tour
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ━━━━━━━━━━━ NEWSLETTER ━━━━━━━━━━━ */}
      <section className="section-padding">
        <div style={{ maxWidth: "40rem", margin: "0 auto" }}>
          <motion.div
            className="glass"
            style={{
              padding: "2.5rem 2rem",
              borderRadius: "var(--shape-xl)",
              textAlign: "center",
            }}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <Mail size={40} style={{ margin: "0 auto 1rem", color: "var(--primary)" }} />
            <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 1.875rem)", fontWeight: 700, marginBottom: "0.75rem" }}>
              Get Student{" "}
              <span className="text-gradient">Housing Tips!</span>
            </h2>
            <p style={{ maxWidth: "26rem", margin: "0 auto 2rem", color: "var(--on-surface-variant)" }}>
              Join our newsletter for exclusive student housing tips, move-in
              guides, and special offers near MTSU.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setEmail("");
              }}
              style={{
                maxWidth: "28rem",
                margin: "0 auto",
                display: "flex",
                flexWrap: "wrap",
                gap: "0.75rem",
              }}
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="input-glass"
                style={{ flex: "1 1 200px", borderRadius: "var(--shape-full)", padding: "0.75rem 1.25rem" }}
              />
              <button
                type="submit"
                className="btn-glow"
                style={{ padding: "0.75rem 1.5rem", borderRadius: "var(--shape-full)" }}
              >
                Get Free Tips
              </button>
            </form>
            <p style={{ marginTop: "1rem", fontSize: "0.75rem", color: "var(--outline)" }}>
              We respect your privacy. Unsubscribe at any time. No spam, ever.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Responsive grid helper (inline style for lg:grid-cols-2) */}
      <style jsx>{`
        @media (min-width: 1024px) {
          .lg-two-col {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}</style>
    </main>
  );
}
