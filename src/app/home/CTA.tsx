"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";

export default function CallToAction() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-gray-50 to-white py-24">
      {}
      <div className="absolute -top-20 -left-20 h-96 w-96 bg-purple-400/20 rounded-full blur-3xl opacity-40 animate-pulse hidden md:block" />
      <div className="absolute -bottom-10 -right-10 h-80 w-80 bg-indigo-400/20 rounded-full blur-2xl opacity-50 hidden md:block" />

      <div className="container mx-auto px-6 text-center">
        <motion.h2
          className="mb-6 text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Experience the Future of Project Management
        </motion.h2>

        <motion.p
          className="mb-10 max-w-2xl mx-auto text-lg text-gray-600"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          Join 10,000+ modern teams transforming productivity with{" "}
          <span className="font-semibold text-indigo-600">WorkNest</span>. No credit card required.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Link href="/sign-up">
            <Button
              size="lg"
              className="relative inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 px-10 py-4 text-lg font-semibold text-white shadow-xl hover:shadow-2xl transition-shadow duration-300"
            >
              <span className="z-10">Join Now</span>
              <div className="absolute inset-0 rounded-xl bg-white opacity-10 blur-md pointer-events-none" />
            </Button>
          </Link>
        </motion.div>

        {}
        <div className="mt-6 text-sm text-gray-500">
          <span className="inline-block bg-gray-100 px-3 py-1 rounded-full">
            ⭐ Rated 4.9/5 by productivity leaders worldwide
          </span>
        </div>
      </div>
    </section>
  );
}
