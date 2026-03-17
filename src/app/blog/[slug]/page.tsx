"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Calendar, Clock } from "lucide-react";
import { BLOG_POSTS } from "@/data/site-data";

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

  const relatedPosts = BLOG_POSTS.filter(
    (p) => p.slug !== slug
  ).slice(0, 3);

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
          <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
            {post.category}
          </span>

          {/* Title */}
          <h1 className="mt-4 text-3xl font-bold leading-tight text-gray-900 md:text-4xl lg:text-[2.75rem]">
            {post.title}
          </h1>

          {/* Date & Read Time */}
          <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {post.date}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {post.readTime}
            </span>
          </div>
        </motion.div>

        {/* Hero Image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-8 relative h-64 md:h-96 rounded-2xl overflow-hidden"
        >
          <Image
            src={post.image}
            alt={post.title}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 768px"
          />
        </motion.div>

        {/* Post Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mt-10"
        >
          <div
            className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-headings:font-bold prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3 prose-p:text-gray-600 prose-p:leading-relaxed prose-p:mb-4 prose-li:text-gray-600 prose-li:leading-relaxed prose-ul:my-4 prose-ul:space-y-2 prose-strong:text-gray-800 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </motion.div>

        {/* CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="mt-12 rounded-2xl bg-gradient-to-r from-[#1a73e8] to-[#4d9ef6] p-8 text-center text-white"
        >
          <h3 className="text-xl font-bold md:text-2xl">Ready to Find Your Home Near MTSU?</h3>
          <p className="mt-2 text-white/80">Studios and apartments starting from $600/month with individual leasing.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/schedule-tour" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-[#1a73e8] font-semibold text-sm hover:bg-gray-100 transition-colors">
              Schedule a Tour
            </Link>
            <Link href="/properties" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/20 text-white font-semibold text-sm border border-white/30 hover:bg-white/30 transition-colors">
              View Floor Plans
            </Link>
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
                <div className="relative h-36 overflow-hidden">
                  <Image
                    src={related.image}
                    alt={related.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 640px) 100vw, 33vw"
                  />
                </div>
                <div className="p-4">
                  <span className="text-xs font-medium text-blue-600">
                    {related.category}
                  </span>
                  <h3 className="mt-1 text-sm font-semibold text-gray-800 transition-colors group-hover:text-blue-500 line-clamp-2">
                    {related.title}
                  </h3>
                  <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-blue-600">
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
