"use client";

import Link from "next/link";
import { Github } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-8">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/Logo.png" className="w-6 h-6" alt="Logo" />
            <span className="text-white font-semibold">WorkNest</span>
          </div>

          <div className="flex gap-6 text-sm">
            <Link href="/team" className="hover:text-white transition-colors">
              Team
            </Link>
            <Link href="/sign-in" className="hover:text-white transition-colors">
              Login
            </Link>
            <Link href="/sign-up" className="hover:text-white transition-colors">
              Sign Up
            </Link>
          </div>

          <a
            href="https://github.com/ShravanJanwade/WorkNest"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-white transition-colors"
          >
            <Github className="w-4 h-4" />
            <span className="text-sm">GitHub</span>
          </a>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-800 text-center text-sm">
          <p>© {new Date().getFullYear()} WorkNest. CS5610 Web Development Project.</p>
        </div>
      </div>
    </footer>
  );
}
