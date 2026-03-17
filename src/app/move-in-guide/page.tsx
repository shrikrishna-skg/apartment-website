"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ChevronRight,
  CheckSquare,
  Square,
  Clock,
  Car,
  Building,
  Phone,
  Mail,
  MapPin,
  Sun,
  Lightbulb,
  Droplets,
  Wifi,
  Wrench,
  Zap,
} from "lucide-react";
import { MOVE_IN_CHECKLIST, SITE } from "@/data/site-data";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
} as const;

const quickTips = [
  {
    icon: Sun,
    title: "Best Time to Move",
    description:
      "Weekday mornings (Tues-Thurs) are the least busy. Avoid weekends and the first of the month for a smoother experience.",
    color: "from-yellow-500 to-orange-500",
  },
  {
    icon: Car,
    title: "Parking Tip",
    description:
      "Temporary loading zones are available near building entrances on move-in day. Contact the office 48 hours in advance to reserve.",
    color: "from-blue-500 to-blue-600",
  },
  {
    icon: Building,
    title: "Elevator Access",
    description:
      "Reserve elevator time for multi-story buildings by calling the leasing office. Priority slots are available between 8am-12pm.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Clock,
    title: "Office Hours",
    description: `${SITE.hours.weekday}. ${SITE.hours.weekend}. Stop by to pick up keys, access cards, and your welcome packet.`,
    color: "from-cyan-500 to-blue-500",
  },
];

export default function MoveInGuidePage() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const totalItems = useMemo(
    () => MOVE_IN_CHECKLIST.reduce((acc, section) => acc + section.items.length, 0),
    []
  );

  const checkedCount = useMemo(
    () => Object.values(checked).filter(Boolean).length,
    [checked]
  );

  const progressPercent = totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0;

  const toggleItem = (key: string) => {
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <>
      <div className="bg-ambient" />
      <main className="min-h-screen pt-6 sm:pt-10 pb-12 sm:pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
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
            <span className="text-gray-800">Move-In Guide</span>
          </motion.nav>

          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-5">
              <span className="text-gradient">Move-In Guide & Checklist</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              Everything you need for a smooth move into College Place Apartments.
              Track your progress with our interactive checklist below.
            </p>

            {/* Progress Bar */}
            <div className="max-w-md mx-auto">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">Your Progress</span>
                <span className="text-blue-600 font-semibold">
                  {progressPercent}% Complete
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-gray-50 border border-gray-200 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 via-blue-400 to-cyan-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" as const }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {checkedCount} of {totalItems} items completed
              </p>
            </div>
          </motion.div>

          {/* Quick Tips */}
          <motion.section
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="mb-16"
          >
            <motion.h2
              variants={itemVariants}
              className="text-2xl font-bold text-gray-900 mb-8 text-center"
            >
              Quick Tips
            </motion.h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {quickTips.map((tip) => {
                const Icon = tip.icon;
                return (
                  <motion.div
                    key={tip.title}
                    variants={itemVariants}
                    className="glass p-5 group hover:border-blue-200 transition-all duration-500"
                  >
                    <div
                      className={`w-10 h-10 rounded-lg bg-gradient-to-br ${tip.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon size={20} className="text-white" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 mb-1.5">
                      {tip.title}
                    </h3>
                    <p className="text-gray-600 text-xs leading-relaxed">
                      {tip.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>

          {/* Interactive Checklist */}
          <motion.section
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="mb-16"
          >
            <motion.h2
              variants={itemVariants}
              className="text-2xl font-bold text-gray-900 mb-8 text-center"
            >
              Interactive Checklist
            </motion.h2>
            <div className="space-y-6">
              {MOVE_IN_CHECKLIST.map((section, sectionIndex) => (
                <motion.div
                  key={section.title}
                  variants={itemVariants}
                  className="glass p-6"
                >
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-[#1a73e8] flex items-center justify-center text-sm font-bold text-white">
                      {sectionIndex + 1}
                    </span>
                    {section.title}
                  </h3>
                  <ul className="space-y-2">
                    {section.items.map((item, itemIndex) => {
                      const key = `${sectionIndex}-${itemIndex}`;
                      const isChecked = !!checked[key];
                      return (
                        <li key={key}>
                          <button
                            onClick={() => toggleItem(key)}
                            className="flex items-center gap-3 w-full text-left py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 group"
                          >
                            {isChecked ? (
                              <CheckSquare
                                size={20}
                                className="text-blue-600 flex-shrink-0"
                              />
                            ) : (
                              <Square
                                size={20}
                                className="text-gray-400 group-hover:text-gray-500 flex-shrink-0 transition-colors"
                              />
                            )}
                            <span
                              className={`text-sm transition-all duration-200 ${
                                isChecked
                                  ? "text-gray-400 line-through"
                                  : "text-gray-700"
                              }`}
                            >
                              {item}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Important Contacts */}
          <motion.section
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="mb-16"
          >
            <motion.h2
              variants={itemVariants}
              className="text-2xl font-bold text-gray-900 mb-8 text-center"
            >
              Important Contacts
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Leasing Office */}
              <motion.div variants={itemVariants} className="glass p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Building size={20} className="text-blue-600" />
                  Leasing Office
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-sm">
                    <Phone size={16} className="text-gray-400" />
                    <span className="text-gray-700">{SITE.phone}</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <Mail size={16} className="text-gray-400" />
                    <span className="text-gray-700">{SITE.email}</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm">
                    <MapPin size={16} className="text-gray-400 mt-0.5" />
                    <span className="text-gray-700">{SITE.address.full}</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm">
                    <Clock size={16} className="text-gray-400 mt-0.5" />
                    <div className="text-gray-700">
                      <p>{SITE.hours.weekday}</p>
                      <p>{SITE.hours.weekend}</p>
                    </div>
                  </li>
                </ul>
              </motion.div>

              {/* Emergency & Utilities */}
              <motion.div variants={itemVariants} className="glass p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Zap size={20} className="text-teal-600" />
                  Emergency & Utilities
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-sm">
                    <Wrench size={16} className="text-gray-400" />
                    <div>
                      <span className="text-gray-600">Maintenance Emergency:</span>{" "}
                      <span className="text-gray-700">{SITE.phone}</span>
                    </div>
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <Lightbulb size={16} className="text-gray-400" />
                    <div>
                      <span className="text-gray-600">Electric (MTE):</span>{" "}
                      <span className="text-gray-700">(615) 893-5514</span>
                    </div>
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <Droplets size={16} className="text-gray-400" />
                    <div>
                      <span className="text-gray-600">Water (Consolidated Utility):</span>{" "}
                      <span className="text-gray-700">(615) 848-3209</span>
                    </div>
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <Wifi size={16} className="text-gray-400" />
                    <div>
                      <span className="text-gray-600">Internet:</span>{" "}
                      <span className="text-gray-700">
                        Included in utilities ($100/mo)
                      </span>
                    </div>
                  </li>
                </ul>
              </motion.div>
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
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Ready to Move In?
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto mb-8">
              Have questions about your move-in process? Our leasing team is here to
              help make your transition as smooth as possible.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/schedule-tour"
                className="btn-glow inline-flex items-center gap-2"
              >
                Schedule a Tour
                <ChevronRight size={18} />
              </Link>
              <Link
                href="/contact"
                className="btn-outline inline-flex items-center gap-2"
              >
                Questions? Contact Us
                <ChevronRight size={18} />
              </Link>
            </div>
          </motion.section>
        </div>
      </main>
    </>
  );
}
