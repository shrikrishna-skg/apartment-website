"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Calendar, Clock } from "lucide-react";
import { BLOG_POSTS } from "@/data/site-data";

const POST_COLORS = [
  "from-blue-500 to-blue-600",
  "from-purple-500 to-pink-500",
  "from-cyan-600 to-blue-600",
  "from-emerald-600 to-teal-600",
  "from-orange-600 to-rose-600",
  "from-pink-600 to-purple-600",
];

function getPostColor(slug: string) {
  const idx = BLOG_POSTS.findIndex((p) => p.slug === slug);
  return POST_COLORS[idx >= 0 ? idx % POST_COLORS.length : 0];
}

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const post = BLOG_POSTS.find((p) => p.slug === slug);

  if (!post) {
    return (
      <div className="section-padding">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Post Not Found
          </h1>
          <p className="mt-4 text-gray-500">
            The blog post you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link href="/blog" className="btn-glow mt-6 inline-block">
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  const relatedPosts = BLOG_POSTS.filter((p) => p.slug !== slug).slice(0, 3);

  return (
    <div className="section-padding">
      <div className="mx-auto max-w-3xl">
        {/* Breadcrumb */}
        <nav className="mb-8 flex flex-wrap items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link
            href="/blog"
            className="hover:text-blue-600 transition-colors"
          >
            Student Life Hub
          </Link>
          <span>/</span>
          <span className="text-gray-800 line-clamp-1">{post.title}</span>
        </nav>

        {/* Post Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Category Badge */}
          <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-500">
            {post.category}
          </span>

          {/* Date & Read Time */}
          <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {post.date}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {post.readTime}
            </span>
          </div>

          {/* Title */}
          <h1 className="mt-4 text-3xl font-bold leading-tight text-gray-900 md:text-4xl lg:text-5xl">
            {post.title}
          </h1>
        </motion.div>

        {/* Hero Image Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className={`mt-8 flex h-64 items-center justify-center rounded-2xl bg-gradient-to-br ${getPostColor(slug)} md:h-80`}
        >
          <span className="text-7xl font-bold text-gray-900/15">
            {post.title.charAt(0)}
          </span>
        </motion.div>

        {/* Post Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mt-10"
        >
          <div className="glass p-6 md:p-10">
            <p className="text-lg leading-relaxed text-gray-700">
              {post.content}
            </p>
          </div>
        </motion.div>

        {/* Back to Blog */}
        <div className="mt-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 transition-colors hover:text-blue-500"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Student Life Hub
          </Link>
        </div>

        {/* Related Posts */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900">
            Related Articles
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {relatedPosts.map((related) => (
              <Link
                key={related.slug}
                href={`/blog/${related.slug}`}
                className="glass group overflow-hidden transition-all hover:border-blue-200"
              >
                <div
                  className={`h-32 bg-gradient-to-br ${getPostColor(related.slug)} flex items-center justify-center`}
                >
                  <span className="text-3xl font-bold text-gray-900/20">
                    {related.title.charAt(0)}
                  </span>
                </div>
                <div className="p-4">
                  <span className="text-xs text-blue-600">
                    {related.category}
                  </span>
                  <h3 className="mt-1 text-sm font-semibold text-gray-800 transition-colors group-hover:text-blue-500 line-clamp-2">
                    {related.title}
                  </h3>
                  <span className="mt-2 inline-flex items-center gap-1 text-xs text-blue-600">
                    Read More
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-16 glass p-8 md:p-10 text-center">
          <h2 className="text-xl font-bold text-gray-900">
            <span className="text-gradient">Stay Updated</span>
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Get the latest tips and guides delivered to your inbox.
          </p>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="mx-auto mt-4 flex max-w-sm flex-col gap-3 sm:flex-row"
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
