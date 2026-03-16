"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Star, Users, Award, RefreshCw, CalendarCheck } from "lucide-react";
import { TESTIMONIALS } from "@/data/site-data";

const STATS = [
  { icon: Users, label: "Happy Residents", value: "500+" },
  { icon: Award, label: "Average Rating", value: "4.9/5" },
  { icon: RefreshCw, label: "Renew Their Lease", value: "85%" },
  { icon: CalendarCheck, label: "Years Serving MTSU", value: "10+" },
];

const QUICK_LINKS = [
  { label: "View Properties", href: "/properties" },
  { label: "Location Guide", href: "/location-guide" },
  { label: "FAQ", href: "/faq" },
];

export default function TestimonialsPage() {
  return (
    <div className="section-padding">
      <div className="mx-auto max-w-6xl">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-gray-800">Student Reviews</span>
        </nav>

        {/* Hero */}
        <div className="mb-14 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-yellow-500/10 px-4 py-1.5 text-sm font-medium text-yellow-300 border border-yellow-500/20">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              5.0 Average Rating
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-6 text-4xl font-bold md:text-5xl"
          >
            <span className="text-gradient">Student Testimonials</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 text-lg text-gray-500"
          >
            Hear from real students about their experience living at College
            Place Apartments near MTSU.
          </motion.p>
        </div>

        {/* Testimonial Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((testimonial, idx) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="glass p-6 flex flex-col justify-between transition-all hover:border-blue-200"
            >
              {/* Stars */}
              <div>
                <div className="flex gap-1">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>

                {/* Review Text */}
                <p className="mt-4 leading-relaxed text-gray-700">
                  &quot;{testimonial.text}&quot;
                </p>
              </div>

              {/* Reviewer Info */}
              <div className="mt-6 border-t border-gray-100 pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {testimonial.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {testimonial.source}
                    </p>
                  </div>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-500">
                    Moved in {testimonial.movedIn}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  {testimonial.property}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-20 glass p-8 md:p-12"
        >
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {STATS.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="mt-3 text-2xl font-bold text-gradient md:text-3xl">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mt-16 glass p-8 md:p-12 text-center"
        >
          <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">
            Ready to Join Our Community?
          </h2>
          <p className="mt-3 text-gray-500">
            Experience the College Place difference for yourself.
          </p>

          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/schedule-tour" className="btn-glow">
              Schedule a Tour
            </Link>
            <Link href="/apply" className="btn-outline">
              Apply Now
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {QUICK_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-700 transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-gray-900"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
