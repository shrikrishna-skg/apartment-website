"use client";

import { motion } from "framer-motion";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  badge?: string;
  gradient?: boolean;
  align?: "center" | "left";
}

export default function SectionHeading({
  title,
  subtitle,
  badge,
  gradient = true,
  align = "center",
}: SectionHeadingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: "easeOut" as const }}
      className={`mb-12 md:mb-16 ${
        align === "center" ? "text-center" : "text-left"
      }`}
    >
      {badge && (
        <span
          className="inline-block mb-4 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] rounded-full"
          style={{
            background: "rgba(99,102,241,0.1)",
            border: "1px solid rgba(99,102,241,0.25)",
            color: "#818cf8",
          }}
        >
          {badge}
        </span>
      )}

      <h2
        className={`text-3xl sm:text-4xl md:text-5xl font-bold leading-tight tracking-tight ${
          gradient ? "text-gradient" : "text-white"
        }`}
      >
        {title}
      </h2>

      {subtitle && (
        <p
          className={`mt-4 text-base sm:text-lg text-gray-600 leading-relaxed ${
            align === "center" ? "max-w-2xl mx-auto" : "max-w-2xl"
          }`}
        >
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
