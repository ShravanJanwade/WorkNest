"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Github, Linkedin, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative bg-gradient-to-tr from-white via-gray-100 to-white dark:from-[#0f0f11] dark:via-[#1a1a1d] dark:to-[#0f0f11] border-t border-gray-200 dark:border-gray-700 py-10">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-6 px-6">
        {}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center md:text-left"
        >
          <p className="text-sm text-gray-600 dark:text-gray-400">
            &copy; {new Date().getFullYear()} <span className="font-semibold">TaskForge</span>. All
            rights reserved.
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">
            Built with ❤️ by humans, not AI (but maybe a little help).
          </p>
        </motion.div>

        {}
        <motion.div
          className="flex flex-wrap gap-6 text-sm justify-center text-gray-600 dark:text-gray-400"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <Link href="/terms" className="hover:text-blue-600 transition-colors">
            Terms
          </Link>
          <Link href="/privacy" className="hover:text-purple-600 transition-colors">
            Privacy
          </Link>
          <Link href="/contact" className="hover:text-indigo-600 transition-colors">
            Contact
          </Link>
        </motion.div>

        {}
        <motion.div
          className="flex gap-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          {[
            { icon: Github, link: "https://github.com" },
            { icon: Linkedin, link: "https://linkedin.com" },
            { icon: Twitter, link: "https://twitter.com" },
          ].map(({ icon: Icon, link }, i) => (
            <a
              key={i}
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:scale-110 transition-transform duration-200 text-gray-600 dark:text-gray-400 hover:text-blue-500"
            >
              <Icon className="w-5 h-5" />
            </a>
          ))}
        </motion.div>
      </div>
    </footer>
  );
}
