"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ChevronRight,
  Calendar,
  Building,
  Bed,
  Bath,
  Maximize2,
  DollarSign,
  Camera,
  Box,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { PROPERTIES } from "@/data/site-data";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
} as const;

export default function VirtualTourPage() {
  const [selectedProperty, setSelectedProperty] = useState(0);
  const router = useRouter();

  const property = PROPERTIES[selectedProperty];
  const hasTour = !!property.matterportId;

  /* Properties that have tours come first */
  const sortedProperties = [...PROPERTIES].sort((a, b) => {
    if (a.matterportId && !b.matterportId) return -1;
    if (!a.matterportId && b.matterportId) return 1;
    return 0;
  });

  /* Find the current property in sorted list for display */
  const currentProperty = PROPERTIES[selectedProperty];

  return (
    <>
      <div className="bg-ambient" />
      <main className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <motion.nav
            className="mb-8 flex items-center gap-2 text-sm text-gray-500"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/" className="hover:text-blue-600 transition-colors">
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-gray-800">3D Virtual Tour</span>
          </motion.nav>

          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-5">
              <span className="text-gradient">3D Virtual Tour</span>
            </h1>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Walk through our apartments virtually. Explore every room, check
              out the layout, and experience the space — all from your device.
            </p>
          </motion.div>

          {/* Property Selector */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-wrap items-center justify-center gap-3 mb-10"
          >
            {PROPERTIES.map((p, idx) => (
              <button
                key={p.id}
                onClick={() => setSelectedProperty(idx)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                  selectedProperty === idx
                    ? "bg-[#1a73e8] text-white shadow-lg shadow-blue-200"
                    : "glass text-gray-500 hover:text-gray-900 hover:border-blue-200"
                }`}
              >
                <Building size={16} />
                {p.name.replace(" Apartments", "")}
                {p.matterportId && (
                  <span
                    className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      selectedProperty === idx
                        ? "bg-white/20 text-white"
                        : "bg-teal-50 text-teal-600"
                    }`}
                  >
                    3D
                  </span>
                )}
              </button>
            ))}
          </motion.div>

          {/* 3D Tour Viewer */}
          <motion.div
            key={currentProperty.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass overflow-hidden mb-8"
          >
            {hasTour ? (
              /* Live Matterport 3D Tour Embed */
              <div className="relative w-full" style={{ height: "min(70vh, 600px)" }}>
                <iframe
                  src={`https://my.matterport.com/show/?m=${currentProperty.matterportId}&play=1&qs=1`}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  allow="fullscreen; xr-spatial-tracking"
                  allowFullScreen
                  style={{ border: 0 }}
                  title={`${currentProperty.name} 3D Tour`}
                />
                {/* Overlay label */}
                <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm text-xs text-white font-medium">
                  <Box size={12} />
                  Matterport 3D Tour
                </div>
                <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm text-xs text-white font-medium">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  Interactive
                </div>
              </div>
            ) : (
              /* No tour — show placeholder with CTA */
              <div
                className="relative flex flex-col items-center justify-center text-center px-6"
                style={{
                  height: "min(70vh, 600px)",
                  background:
                    "linear-gradient(135deg, rgba(99,102,241,0.06), rgba(6,182,212,0.06), rgba(139,92,246,0.06))",
                }}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(99,102,241,0.1),transparent_50%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(6,182,212,0.08),transparent_50%)]" />

                <div className="relative z-10">
                  <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
                    <Camera size={36} className="text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    3D Tour Coming Soon
                  </h3>
                  <p className="text-gray-500 max-w-md mx-auto mb-6">
                    A virtual 3D tour for {currentProperty.name} is not yet
                    available. Schedule an in-person tour to see this property!
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                      href={`/schedule-tour?property=${currentProperty.slug}`}
                      className="btn-glow inline-flex items-center gap-2"
                    >
                      <Calendar size={16} />
                      Schedule In-Person Tour
                    </Link>
                    <Link
                      href={`/properties/${currentProperty.slug}`}
                      className="btn-outline inline-flex items-center gap-2"
                    >
                      View Photos
                      <ChevronRight size={16} />
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Property Info Bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="glass p-5 mb-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {currentProperty.name}
              </h3>
              <p className="text-sm text-gray-500 flex items-center gap-1.5">
                <MapPin size={14} className="text-blue-600" />
                {currentProperty.address}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <span className="chip">
                <Bed size={14} className="text-blue-600" />
                {currentProperty.beds} Beds
              </span>
              <span className="chip">
                <Bath size={14} className="text-purple-600" />
                {currentProperty.baths} Baths
              </span>
              <span className="chip">
                <Maximize2 size={14} className="text-teal-600" />
                {currentProperty.sqft} sqft
              </span>
              <span className="chip">
                <DollarSign size={14} className="text-green-600" />
                From ${currentProperty.startingPrice}/mo
              </span>
            </div>
          </motion.div>

          {/* Floor Plans Section */}
          <motion.section
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="mb-12"
          >
            <motion.h2
              variants={itemVariants}
              className="text-2xl font-bold text-gray-900 text-center mb-2"
            >
              Available Floor Plans
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="text-center text-gray-500 text-sm mb-8"
            >
              Click a floor plan to view the property details
            </motion.p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {currentProperty.floorPlans.map((plan) => (
                <motion.div
                  key={plan.name}
                  variants={itemVariants}
                  role="link"
                  tabIndex={0}
                  onClick={() =>
                    router.push(`/properties/${currentProperty.slug}`)
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      router.push(`/properties/${currentProperty.slug}`);
                    }
                  }}
                  className="glass p-5 group hover:border-blue-200 transition-all duration-300 cursor-pointer"
                >
                  <h3 className="text-sm font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {plan.name}
                  </h3>
                  <p className="text-xs text-gray-400 mb-3">
                    {plan.beds} Bed / {plan.baths} Bath | {plan.sqft} sq ft
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-600 font-bold">
                      ${plan.price}/mo
                    </span>
                    <div className="flex items-center gap-2">
                      {plan.has3DTour && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-teal-50 text-teal-600 border border-cyan-500/20">
                          3D Tour
                        </span>
                      )}
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Camera size={11} />
                        {plan.photoCount}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* All Properties Quick Tour Access */}
          <motion.section
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="mb-12"
          >
            <motion.h2
              variants={itemVariants}
              className="text-2xl font-bold text-gray-900 text-center mb-8"
            >
              Tour All Properties
            </motion.h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {PROPERTIES.map((p, idx) => (
                <motion.div
                  key={p.id}
                  variants={itemVariants}
                  role="link"
                  tabIndex={0}
                  onClick={() => setSelectedProperty(idx)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedProperty(idx);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }
                  }}
                  className={`glass p-6 cursor-pointer transition-all duration-300 hover:border-blue-200 ${
                    selectedProperty === idx
                      ? "!border-[#1a73e8] ring-1 ring-[#1a73e8]"
                      : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-gray-900">{p.name}</h3>
                        {p.matterportId ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-50 text-teal-600 border border-teal-200 font-bold">
                            3D TOUR
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-400 border border-gray-200 font-bold">
                            COMING SOON
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mb-2">
                        <MapPin size={12} />
                        {p.address}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Bed size={12} className="text-blue-600" />
                          {p.beds} Beds
                        </span>
                        <span className="flex items-center gap-1">
                          <Bath size={12} className="text-purple-600" />
                          {p.baths} Baths
                        </span>
                        <span className="font-semibold text-blue-600">
                          From ${p.startingPrice}/mo
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProperty(idx);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        p.matterportId
                          ? "bg-[#1a73e8] text-white hover:bg-blue-700"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      {p.matterportId ? "View Tour" : "View Info"}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Schedule In-Person Tour CTA */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className="glass p-8 sm:p-12 text-center"
          >
            <div className="w-14 h-14 rounded-xl bg-[#1a73e8] flex items-center justify-center mx-auto mb-5">
              <Calendar size={28} className="text-white" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Prefer to See It In Person?
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto mb-8">
              Nothing beats walking through the space yourself. Schedule a
              private tour with our leasing team and experience our apartments
              firsthand.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/schedule-tour"
                className="btn-glow inline-flex items-center gap-2"
              >
                Schedule a Tour
                <ChevronRight size={18} />
              </Link>
              <Link
                href="/properties"
                className="btn-outline inline-flex items-center gap-2"
              >
                Browse All Properties
                <ExternalLink size={16} />
              </Link>
            </div>
          </motion.section>
        </div>
      </main>
    </>
  );
}
