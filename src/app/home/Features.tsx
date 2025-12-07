'use client'

import { motion } from "framer-motion";
import {
  Rocket,
  BellRing,
  Cloud,
  BrainCircuit,
  ShieldCheck,
  Code2,
} from "lucide-react";
import { useEffect } from "react";

const features = [
  {
    icon: Rocket,
    title: "All-in-One Dashboard",
    desc: "Monitor every aspect of your project from a single place. ✨",
    hint: "Try typing 'launch' on your keyboard...",
  },
  {
    icon: BellRing,
    title: "Custom Notifications",
    desc: "Get notified when it *really* matters.",
    hint: "Hover 3 times for a secret chime 🛎️",
  },
  {
    icon: Cloud,
    title: "Cloud Sync",
    desc: "Work from anywhere — even from Mars 🌌",
    hint: "Double-click this tile for a surprise.",
  },
  {
    icon: BrainCircuit,
    title: "AI-Powered Insights",
    desc: "Smarter than your ex. Stronger than your excuses. 💡",
    hint: "Hidden neural net inside.",
  },
  {
    icon: ShieldCheck,
    title: "Top-Notch Security",
    desc: "Vault-level encryption. 🔐",
    hint: "🛡️ No one gets through.",
  },
  {
    icon: Code2,
    title: "Developer Friendly",
    desc: "You speak code? So do we. { 👨‍💻 }",
    hint: "Try pressing '/' key here!",
  },
];

export default function FeaturesUltra() {
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.key === "l") alert("🚀 TaskForge Launch Mode Activated!");
      if (e.key === "/") alert("👨‍💻 Dev Console Connected.");
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);

  return (
    <section className="relative z-10 py-24 px-6 md:px-12 bg-gradient-to-br from-white via-blue-50 to-purple-100">
      <div className="max-w-7xl mx-auto text-center mb-20">
        <motion.h2
          className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          Why <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">Choose TaskForge?</span>
        </motion.h2>
        <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
          We've packed in magic, muscle, and a little mischief. ✨
        </p>
      </div>

      <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
        {features.map(({ icon: Icon, title, desc, hint }, i) => (
          <motion.div
            key={i}
            className="relative group rounded-3xl bg-white/40 border border-white/20 backdrop-blur-xl p-6 shadow-lg hover:shadow-2xl transition-all hover:scale-[1.04] duration-300 overflow-hidden"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
          >
            <div className="flex items-center justify-center h-14 w-14 mb-5 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 text-white shadow-lg transition-transform group-hover:scale-110">
              <Icon className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
              {title}
            </h3>
            <p className="text-gray-600 mt-2">{desc}</p>

            {/* Easter Egg Hint */}
            <div className="absolute bottom-4 right-4 text-xs text-gray-400 group-hover:text-purple-400 transition-opacity opacity-0 group-hover:opacity-100">
              {hint}
            </div>

            {/* Secret Pulse Glow on Hover */}
            <div className="absolute -inset-1 opacity-0 group-hover:opacity-100 transition rounded-3xl pointer-events-none">
              <div className="h-full w-full rounded-3xl border border-purple-500/30 animate-pulse" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Glowy BG blob */}
      <div className="absolute -z-10 top-[20%] left-[50%] -translate-x-1/2 h-[400px] w-[400px] bg-gradient-to-tr from-purple-500 to-blue-500 opacity-20 blur-3xl rounded-full" />
    </section>
  );
}
