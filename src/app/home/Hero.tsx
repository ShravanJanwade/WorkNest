"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      <video
        className="absolute top-0 left-0 h-full w-full object-cover"
        src="hero.mp4"
        autoPlay
        muted
        loop
        playsInline
      />

      <div className="absolute inset-0 bg-black/60 z-10" />

      <header className="absolute top-0 z-30 w-full">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <Link href="/">
            <div className="flex items-center gap-3">
              <img src="Logo.png" className="w-9 h-9" alt="WorkNest" />
              <span className="text-2xl font-bold text-white">
                WorkNest
              </span>
            </div>
          </Link>
          <nav className="flex items-center gap-3">
            <Link href="/team">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                Team
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                Login
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Sign Up
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <div className="container relative z-20 mx-auto flex h-full flex-col items-center justify-center px-6 text-center text-white">
        <h1 className="max-w-3xl text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
          Manage Your Projects with{" "}
          <span className="text-blue-400">WorkNest</span>
        </h1>

        <p className="mt-5 max-w-xl text-lg text-gray-200">
          A simple, powerful project management tool. Track tasks, collaborate
          with your team, and ship faster.
        </p>

        <div className="mt-8 flex gap-4">
          <Link href="/sign-up">
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-base font-medium"
            >
              Get Started
            </Button>
          </Link>
          <Link href="/sign-in">
            <Button
              size="lg"
              className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-3 text-base font-medium"
            >
              Sign In
            </Button>
          </Link>
        </div>

        <p className="mt-6 text-sm text-gray-300">
          Free to use • No credit card required
        </p>
      </div>

      {/* Scroll indicator */}
      <button
        onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 cursor-pointer"
      >
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center pt-2 hover:border-white transition-colors">
          <div className="w-1 h-2 bg-white/70 rounded-full animate-bounce" />
        </div>
      </button>
    </section>
  );
};

export default Hero;
