"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  MapPin,
  Clock,
  Car,
  Bus,
  Bike,
  GraduationCap,
  ShoppingBag,
  Coffee,
  Dumbbell,
  Heart,
  ChevronRight,
  Navigation,
  DollarSign,
  Star,
} from "lucide-react";
import { NEARBY_PLACES, SITE } from "@/data/site-data";

const iconMap: Record<string, React.ElementType> = {
  GraduationCap,
  ShoppingBag,
  Coffee,
  Dumbbell,
  Heart,
};

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

const highlights = [
  {
    icon: Clock,
    title: "5 Min to Campus",
    description:
      "Just a quick drive or bike ride to MTSU campus. Walk to class in under 15 minutes and never worry about being late.",
    color: "from-blue-500 to-blue-600",
  },
  {
    icon: MapPin,
    title: "Everything Nearby",
    description:
      "Groceries, restaurants, coffee shops, gyms, and healthcare all within a short drive. Everything you need is at your doorstep.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: DollarSign,
    title: "Affordable Living",
    description:
      "Enjoy premium student housing at competitive prices. Individual leasing starts at $500/month with utilities at just $100 extra.",
    color: "from-cyan-500 to-blue-500",
  },
];

const transportOptions = [
  {
    icon: Car,
    title: "By Car",
    description:
      "Free parking included for all residents. MTSU campus is a 5-minute drive via Old Lascassas Road. Quick access to I-24 for trips to Nashville (35 min).",
    color: "from-blue-500 to-blue-600",
  },
  {
    icon: Bus,
    title: "By Bus",
    description:
      "Murfreesboro Rover bus routes run nearby with stops connecting to MTSU campus and downtown. Affordable public transit options available for students.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Bike,
    title: "By Bike",
    description:
      "Bike-friendly roads connect you to campus in about 8-10 minutes. The Greenway trail system provides scenic, car-free routes throughout Murfreesboro.",
    color: "from-cyan-500 to-blue-500",
  },
];

export default function LocationGuidePage() {
  return (
    <>
      <div className="bg-ambient" />
      <main className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 text-sm text-gray-500 mb-10"
          >
            <Link href="/" className="hover:text-blue-600 transition-colors">
              Home
            </Link>
            <ChevronRight size={14} />
            <span className="text-gray-800">Location Guide</span>
          </motion.nav>

          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-medium mb-6">
              <MapPin size={14} />
              37130 Area
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-5">
              <span className="text-gradient">Location & Neighborhood Guide</span>
            </h1>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Discover everything around College Place Apartments in Murfreesboro, TN.
              From campus proximity to local hotspots, see why students love living here.
            </p>
          </motion.div>

          {/* Why Students Love This Location */}
          <motion.section
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="mb-20"
          >
            <motion.h2
              variants={itemVariants}
              className="text-3xl font-bold text-gray-900 text-center mb-12"
            >
              Why Students Love This Location
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {highlights.map((item) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.title}
                    variants={itemVariants}
                    className="glass p-6 text-center group hover:border-blue-200 transition-all duration-500"
                  >
                    <div
                      className={`w-14 h-14 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon size={28} className="text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>

          {/* Getting Around */}
          <motion.section
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="mb-20"
          >
            <motion.h2
              variants={itemVariants}
              className="text-3xl font-bold text-gray-900 text-center mb-12"
            >
              Getting Around
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {transportOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <motion.div
                    key={option.title}
                    variants={itemVariants}
                    className="glass p-6 group hover:border-blue-200 transition-all duration-500"
                  >
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${option.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon size={24} className="text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{option.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      {option.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>

          {/* What's Nearby */}
          <motion.section
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="mb-20"
          >
            <motion.h2
              variants={itemVariants}
              className="text-3xl font-bold text-gray-900 text-center mb-12"
            >
              What&apos;s Nearby
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {NEARBY_PLACES.map((category) => {
                const Icon = iconMap[category.icon] || MapPin;
                return (
                  <motion.div
                    key={category.category}
                    variants={itemVariants}
                    className="glass p-6 hover:border-blue-200 transition-all duration-500"
                  >
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center border border-blue-200">
                        <Icon size={20} className="text-blue-600" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {category.category}
                      </h3>
                    </div>
                    <ul className="space-y-3">
                      {category.places.map((place) => (
                        <li
                          key={place.name}
                          className="flex items-center justify-between text-sm"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#1a73e8]" />
                            <span className="text-gray-700">{place.name}</span>
                          </div>
                          <div className="flex items-center gap-3 text-gray-400 text-xs">
                            <span>{place.distance}</span>
                            <span className="text-gray-400">|</span>
                            <span>{place.time}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>

          {/* Map Placeholder */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className="mb-20"
          >
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
              Our Location
            </h2>
            <div className="glass overflow-hidden">
              <div className="relative h-80 sm:h-96 bg-gradient-to-br from-blue-50 via-blue-50/50 to-cyan-50/50 flex items-center justify-center">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.15),transparent_70%)]" />
                <div className="text-center relative z-10">
                  <div className="w-16 h-16 rounded-full bg-[#1a73e8] flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
                    <Navigation size={28} className="text-white" />
                  </div>
                  <p className="text-xl font-semibold text-gray-900 mb-2">
                    Interactive Map
                  </p>
                  <p className="text-gray-500 text-sm mb-4">
                    {SITE.address.full}
                  </p>
                  <a
                    href={SITE.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-glow inline-flex items-center gap-2 text-sm"
                  >
                    <MapPin size={16} />
                    View on Google Maps
                  </a>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Bottom CTA */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className="glass p-8 sm:p-12 text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Star size={20} className="text-yellow-400 fill-yellow-400" />
              <Star size={20} className="text-yellow-400 fill-yellow-400" />
              <Star size={20} className="text-yellow-400 fill-yellow-400" />
              <Star size={20} className="text-yellow-400 fill-yellow-400" />
              <Star size={20} className="text-yellow-400 fill-yellow-400" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Ready to Call This Home?
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto mb-8">
              Join hundreds of MTSU students who already love living at College Place.
              Tour our apartments and find your perfect floor plan today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/properties"
                className="btn-glow inline-flex items-center gap-2"
              >
                View Floor Plans
                <ChevronRight size={18} />
              </Link>
              <Link
                href="/schedule-tour"
                className="btn-outline inline-flex items-center gap-2"
              >
                Schedule a Tour
                <ChevronRight size={18} />
              </Link>
            </div>
          </motion.section>
        </div>
      </main>
    </>
  );
}
