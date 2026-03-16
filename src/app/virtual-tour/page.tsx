"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Play,
  Maximize2,
  ChevronRight,
  Calendar,
  Eye,
  Building,
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

  return (
    <>
      <div className="bg-ambient" />
      <main className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
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
              Explore College Place Apartments virtually. Walk through our floor plans,
              check out the amenities, and experience the space from anywhere.
            </p>
          </motion.div>

          {/* Property Selector */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-wrap items-center justify-center gap-3 mb-10"
          >
            {PROPERTIES.map((property, idx) => (
              <button
                key={property.id}
                onClick={() => setSelectedProperty(idx)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                  selectedProperty === idx
                    ? "bg-[#1a73e8] text-white shadow-lg shadow-blue-200"
                    : "glass text-gray-500 hover:text-gray-900 hover:border-blue-200"
                }`}
              >
                <Building size={16} />
                {property.name.replace(" Apartments", "")}
              </button>
            ))}
          </motion.div>

          {/* 3D Tour Viewer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="glass overflow-hidden mb-12"
          >
            <div className="relative h-[500px] sm:h-[600px] bg-gradient-to-br from-blue-50/80 via-blue-50/60 to-cyan-50/80 flex items-center justify-center">
              {/* Background effects */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(99,102,241,0.15),transparent_50%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(6,182,212,0.1),transparent_50%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.08),transparent_60%)]" />

              {/* Grid pattern overlay */}
              <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
                  backgroundSize: "50px 50px",
                }}
              />

              {/* Center content */}
              <div className="text-center relative z-10">
                <motion.div
                  animate={{
                    boxShadow: [
                      "0 0 30px rgba(99,102,241,0.3)",
                      "0 0 60px rgba(139,92,246,0.4)",
                      "0 0 30px rgba(99,102,241,0.3)",
                    ],
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" as const }}
                  className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 via-blue-400 to-cyan-500 flex items-center justify-center mx-auto mb-6 cursor-pointer hover:scale-110 transition-transform duration-300"
                >
                  <Play size={40} className="text-white ml-1" />
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  3D Tour Viewer
                </h3>
                <p className="text-gray-500 mb-2">
                  {PROPERTIES[selectedProperty].name}
                </p>
                <p className="text-gray-400 text-sm mb-6">
                  {PROPERTIES[selectedProperty].sqft} sq ft |{" "}
                  {PROPERTIES[selectedProperty].beds} Bed /{" "}
                  {PROPERTIES[selectedProperty].baths} Bath
                </p>
                <button className="btn-glow inline-flex items-center gap-2">
                  <Maximize2 size={18} />
                  Explore in Full Screen
                </button>
              </div>

              {/* Corner labels */}
              <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-sm border border-gray-200 text-xs text-gray-700">
                <Eye size={12} />
                360° View
              </div>
              <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-sm border border-gray-200 text-xs text-gray-700">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Interactive
              </div>
            </div>
          </motion.div>

          {/* Property Details */}
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
              Available Floor Plans
            </motion.h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {PROPERTIES[selectedProperty].floorPlans.map((plan) => (
                <motion.div
                  key={plan.name}
                  variants={itemVariants}
                  className="glass p-5 group hover:border-blue-200 transition-all duration-500"
                >
                  <h3 className="text-sm font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-xs text-gray-400 mb-3">
                    {plan.beds} Bed / {plan.baths} Bath | {plan.sqft} sq ft
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-600 font-bold">
                      ${plan.price}/mo
                    </span>
                    {plan.has3DTour && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-teal-50 text-teal-600 border border-cyan-500/20">
                        3D Tour
                      </span>
                    )}
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
              Schedule an In-Person Tour
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto mb-8">
              Nothing beats seeing the space in person. Schedule a private tour with our
              leasing team and experience College Place Apartments firsthand.
            </p>
            <Link
              href="/schedule-tour"
              className="btn-glow inline-flex items-center gap-2"
            >
              Schedule a Tour
              <ChevronRight size={18} />
            </Link>
          </motion.section>
        </div>
      </main>
    </>
  );
}
