"use client";

import Link from "next/link";
import Image from "next/image";
import { Instagram, Facebook, MapPin, Phone, Mail, Clock } from "lucide-react";
import { SITE, FOOTER_LINKS } from "@/data/site-data";

export default function Footer() {
  return (
    <footer className="mt-20 bg-[#f8f9fa] border-t border-[#e5e7eb]">
      <div className="max-w-7xl mx-auto px-4 pt-16 pb-0">
        {/* Main Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Column 1: Brand */}
          <div className="flex flex-col gap-5">
            <Link href="/" className="flex items-center gap-3 no-underline">
              <Image
                src={SITE.logo}
                alt={`${SITE.name} logo`}
                width={36}
                height={36}
                className="rounded-sm h-9 w-auto"
              />
              <span className="text-base font-semibold text-[#1f2937] tracking-tight">
                {SITE.name}
              </span>
            </Link>

            <p className="text-sm leading-relaxed text-[#4b5563] m-0">
              {SITE.description}
            </p>

            <div className="flex items-center gap-2">
              <a
                href={SITE.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#e5e7eb]/60 text-[#4b5563] transition-colors duration-200 hover:bg-[#1a73e8]/10 hover:text-[#1a73e8]"
              >
                <Instagram size={18} />
              </a>
              <a
                href={SITE.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#e5e7eb]/60 text-[#4b5563] transition-colors duration-200 hover:bg-[#1a73e8]/10 hover:text-[#1a73e8]"
              >
                <Facebook size={18} />
              </a>
            </div>
          </div>

          {/* Column 2: Contact Info */}
          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[#1f2937] m-0">
              Contact Info
            </h4>
            <div className="flex flex-col gap-4">
              <a
                href={SITE.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 text-sm text-[#4b5563] no-underline leading-snug transition-colors duration-200 hover:text-[#1a73e8]"
              >
                <MapPin
                  size={16}
                  className="text-[#1a73e8] mt-0.5 shrink-0"
                />
                <span>{SITE.address.full}</span>
              </a>
              <a
                href={`tel:${SITE.phone}`}
                className="flex items-center gap-3 text-sm text-[#4b5563] no-underline transition-colors duration-200 hover:text-[#1a73e8]"
              >
                <Phone size={16} className="text-[#1a73e8] shrink-0" />
                <span>{SITE.phone}</span>
              </a>
              <a
                href={`mailto:${SITE.email}`}
                className="flex items-center gap-3 text-sm text-[#4b5563] no-underline transition-colors duration-200 hover:text-[#1a73e8]"
              >
                <Mail size={16} className="text-[#1a73e8] shrink-0" />
                <span>{SITE.email}</span>
              </a>
              <div className="flex items-start gap-3 text-sm text-[#4b5563] leading-snug">
                <Clock
                  size={16}
                  className="text-[#1a73e8] mt-0.5 shrink-0"
                />
                <div>
                  <p className="m-0">{SITE.hours.weekday}</p>
                  <p className="m-0">{SITE.hours.weekend}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Column 3: Quick Links */}
          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[#1f2937] m-0">
              Quick Links
            </h4>
            <ul className="list-none p-0 m-0 flex flex-col gap-2.5">
              {FOOTER_LINKS.quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#4b5563] no-underline transition-colors duration-200 hover:text-[#1a73e8]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Tenant Portal + Legal */}
          <div className="flex flex-col gap-8">
            {/* Tenant Portal */}
            <div className="flex flex-col gap-4">
              <h4 className="text-xs font-semibold uppercase tracking-widest text-[#1f2937] m-0">
                Tenant Portal
              </h4>
              <ul className="list-none p-0 m-0 flex flex-col gap-2.5">
                {FOOTER_LINKS.tenant.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[#4b5563] no-underline transition-colors duration-200 hover:text-[#1a73e8]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div className="flex flex-col gap-4">
              <h4 className="text-xs font-semibold uppercase tracking-widest text-[#1f2937] m-0">
                Legal
              </h4>
              <ul className="list-none p-0 m-0 flex flex-col gap-2.5">
                {FOOTER_LINKS.legal.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[#4b5563] no-underline transition-colors duration-200 hover:text-[#1a73e8]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Copyright Bar */}
        <div className="mt-14 pt-6 pb-6 border-t border-[#e5e7eb] text-center">
          <p className="text-xs text-[#4b5563] m-0">
            &copy; {new Date().getFullYear()} {SITE.name} {SITE.tagline}. All
            rights reserved. | {SITE.address.city}, {SITE.address.state}{" "}
            {SITE.address.zip}
          </p>
        </div>
      </div>
    </footer>
  );
}
