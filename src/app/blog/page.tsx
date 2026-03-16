"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, ArrowRight } from "lucide-react";
import { BLOG_POSTS } from "@/data/site-data";

const POST_COLORS = [
  "from-blue-500 to-blue-600",
  "from-purple-500 to-pink-500",
  "from-cyan-600 to-blue-600",
  "from-emerald-600 to-teal-600",
  "from-orange-600 to-rose-600",
  "from-pink-600 to-purple-600",
];

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
            className="mt-4 text-lg text-gray-500"
          >
            Your guide to student living at College Place
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

        {/* Blog Grid */}
        {filteredPosts.length === 0 ? (
          <div className="glass py-16 text-center">
            <p className="text-lg text-gray-500">
              No articles found. Try adjusting your search or category filter.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {filteredPosts.map((post, idx) => (
              <motion.article
                key={post.slug}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
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
                {/* Gradient Image Placeholder */}
                <div
                  className={`h-48 bg-gradient-to-br ${POST_COLORS[idx % POST_COLORS.length]} flex items-center justify-center`}
                >
                  <span className="text-5xl font-bold text-gray-900/20">
                    {post.title.charAt(0)}
                  </span>
                </div>

                <div className="p-6">
                  {/* Category Badge */}
                  <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-500">
                    {post.category}
                  </span>

                  {/* Title */}
                  <h2 className="mt-3 text-xl font-semibold text-gray-900 transition-colors group-hover:text-blue-500">
                    <Link href={`/blog/${post.slug}`} onClick={(e) => e.stopPropagation()}>{post.title}</Link>
                  </h2>

                  {/* Date & Read Time */}
                  <div className="mt-2 flex items-center gap-3 text-sm text-gray-400">
                    <span>{post.date}</span>
                    <span className="h-1 w-1 rounded-full bg-gray-400" />
                    <span>{post.readTime}</span>
                  </div>

                  {/* Excerpt */}
                  <p className="mt-3 text-sm leading-relaxed text-gray-500 line-clamp-3">
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
          <p className="mt-3 text-gray-500">
            Get the latest tips, guides, and updates about student living
            delivered to your inbox.
          </p>
          <form
            onSubmit={(e) => e.preventDefault()}
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
