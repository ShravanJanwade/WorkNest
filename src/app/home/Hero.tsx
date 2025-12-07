"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
const Hero = () => {
  return (
    <section className="relative h-screen w-full overflow-hidden font-sans">
      {}
      <video
        className="absolute top-0 left-0 h-full w-full object-cover"
        src="hero.mp4"
        autoPlay
        muted
        loop
        playsInline
      />

      {}
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/20 to-[#0f0c29]/80 z-10 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-black/40 to-black/80 z-20 pointer-events-none" />

      {}
      <header className="absolute top-0 z-30 w-full">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <Link href="/">
              <div className="flex gap-4">
                <img src="Logo.png" className="size-10" />
                <span className="text-3xl font-black tracking-widest text-white/90 drop-shadow-[0_2px_6px_rgba(255,255,255,0.25)] hover:text-blue-400 transition">
                  WorkNest
                </span>
              </div>
            </Link>
          </motion.div>
          <nav className="flex items-center gap-5 text-white font-medium">
            <motion.div whileHover={{ scale: 1.1 }} transition={{ type: "spring", stiffness: 300 }}>
              <Link href="/sign-in">
                <Button variant="ghost" className="text-white hover:text-blue-300">
                  Login
                </Button>
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.1 }} transition={{ type: "spring", stiffness: 300 }}>
              <Link href="/sign-up">
                <Button className="bg-gradient-to-br from-blue-600 via-indigo-500 to-purple-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-indigo-500/50">
                  Sign Up
                </Button>
              </Link>
            </motion.div>
          </nav>
        </div>
      </header>

      {}
      <div className="container relative z-30 mx-auto mt-32 flex h-full flex-col items-center justify-center px-6 text-center text-white">
        <motion.h1
          className="max-w-5xl text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-400 to-purple-500 drop-shadow-lg"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 1 }}
        >
          Redefine Your Workflow with <span className="font-extrabold">WorkNest</span>
        </motion.h1>

        <motion.p
          className="mt-6 max-w-2xl text-lg sm:text-xl md:text-2xl text-white/80"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          Experience productivity like never before. AI, automation, collaboration – all in one
          sublime dashboard.
        </motion.p>

        <motion.div
          className="mt-10 flex flex-wrap gap-5 justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 1 }}
        >
          <Link href="/signup">
            <Button
              size="lg"
              className="rounded-full px-8 py-4 text-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-xl hover:scale-105 hover:shadow-purple-500/50 transition-transform"
            >
              Get Started Free
            </Button>
          </Link>
          <Link href="/login">
            <Button
              variant="outline"
              size="lg"
              className="rounded-full border-white/70 text-black hover:border-blue-400 hover:text-blue-300 transition"
            >
              Explore Dashboard
            </Button>
          </Link>
        </motion.div>
      </div>

      {}
      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 1.8, repeat: Infinity }}
      >
        <div className="h-4 w-4 rounded-full bg-white shadow-[0_0_20px_5px_rgba(255,255,255,0.6)] animate-pulse" />
      </motion.div>
    </section>
  );
};

export default Hero;
