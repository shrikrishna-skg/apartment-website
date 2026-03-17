"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, ArrowRight, Calendar, Clock } from "lucide-react";
import { BLOG_POSTS } from "@/data/site-data";

export default function BlogPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");

  const categories = [
    "All Categories",
    ...Array.from(new Set(BLOG_POSTS.map((p) => p.category))),
  ];

  const filteredPosts = BLOG_POSTS.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All Categories" ||
      post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="section-padding">
      <div className="mx-auto max-w-6xl">
        {/* Hero */}
        <div className="mb-12 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold md:text-5xl"
          >
            <span className="text-gradient">Student Life Hub</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto"
          >
            Tips, guides, and local insights for MTSU students living off campus
            in Murfreesboro, TN
          </motion.p>
        </div>

        {/* Search & Filter */}
        <div className="mb-10 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-glass w-full pl-12"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input-glass cursor-pointer sm:w-56"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat} className="bg-white">
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Featured Post (first one) */}
        {filteredPosts.length > 0 && selectedCategory === "All Categories" && !searchTerm && (
          <motion.article
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            role="link"
            tabIndex={0}
            onClick={() => router.push(`/blog/${filteredPosts[0].slug}`)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                router.push(`/blog/${filteredPosts[0].slug}`);
              }
            }}
            className="glass group overflow-hidden transition-all hover:border-blue-200 cursor-pointer mb-10"
          >
            <div className="grid md:grid-cols-2">
              <div className="relative h-64 md:h-auto min-h-[280px]">
                <Image
                  src={filteredPosts[0].image}
                  alt={filteredPosts[0].title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div className="p-8 flex flex-col justify-center">
                <span className="inline-block w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
                  {filteredPosts[0].category}
                </span>
                <h2 className="mt-4 text-2xl font-bold text-gray-900 transition-colors group-hover:text-blue-600 md:text-3xl">
                  {filteredPosts[0].title}
                </h2>
                <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    {filteredPosts[0].date}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    {filteredPosts[0].readTime}
                  </span>
                </div>
                <p className="mt-4 text-gray-600 leading-relaxed">
                  {filteredPosts[0].excerpt}
                </p>
                <Link
                  href={`/blog/${filteredPosts[0].slug}`}
                  onClick={(e) => e.stopPropagation()}
                  className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-blue-600 transition-colors hover:text-blue-500"
                >
                  Read Full Article
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </motion.article>
        )}

        {/* Blog Grid */}
        {filteredPosts.length === 0 ? (
          <div className="glass py-16 text-center">
            <p className="text-lg text-gray-600">
              No articles found. Try adjusting your search or category filter.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {(selectedCategory === "All Categories" && !searchTerm
              ? filteredPosts.slice(1)
              : filteredPosts
            ).map((post, idx) => (
              <motion.article
                key={post.slug}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                role="link"
                tabIndex={0}
                onClick={() => router.push(`/blog/${post.slug}`)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    router.push(`/blog/${post.slug}`);
                  }
                }}
                className="glass group overflow-hidden transition-all hover:border-blue-200 cursor-pointer"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>

                <div className="p-5">
                  {/* Category Badge */}
                  <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
                    {post.category}
                  </span>

                  {/* Title */}
                  <h2 className="mt-3 text-lg font-semibold text-gray-900 transition-colors group-hover:text-blue-600 line-clamp-2">
                    {post.title}
                  </h2>

                  {/* Date & Read Time */}
                  <div className="mt-2 flex items-center gap-3 text-sm text-gray-500">
                    <span>{post.date}</span>
                    <span className="h-1 w-1 rounded-full bg-gray-400" />
                    <span>{post.readTime}</span>
                  </div>

                  {/* Excerpt */}
                  <p className="mt-3 text-sm leading-relaxed text-gray-600 line-clamp-3">
                    {post.excerpt}
                  </p>

                  {/* Read More */}
                  <Link
                    href={`/blog/${post.slug}`}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-blue-600 transition-colors hover:text-blue-500"
                  >
                    Read More
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        )}

        {/* Newsletter Section */}
        <div className="mt-20 glass p-8 md:p-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">
            <span className="text-gradient">Stay Updated</span>
          </h2>
          <p className="mt-3 text-gray-600">
            Get the latest tips, guides, and updates about student living
            delivered to your inbox.
          </p>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const emailInput = e.currentTarget.querySelector("input[type='email']") as HTMLInputElement;
              if (!emailInput?.value) return;
              try {
                const res = await fetch("/api/email-subscribe", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email: emailInput.value, source: "blog" }),
                });
                if (res.ok) {
                  emailInput.value = "";
                  alert("Subscribed successfully!");
                } else {
                  const data = await res.json();
                  alert(data.error || "Failed to subscribe");
                }
              } catch {
                alert("Failed to subscribe. Please try again.");
              }
            }}
            className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row"
          >
            <input
              type="email"
              placeholder="Enter your email"
              className="input-glass flex-1"
            />
            <button type="submit" className="btn-glow whitespace-nowrap">
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
