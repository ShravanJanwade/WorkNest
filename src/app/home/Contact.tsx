"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, SendHorizonal } from "lucide-react";

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2500);
  };

  return (
    <section className="relative py-28 bg-gradient-to-tr from-blue-600 via-indigo-700 to-purple-800 overflow-hidden text-white">
      {}
      <motion.div
        animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.02, 1] }}
        transition={{ repeat: Infinity, duration: 10 }}
        className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-purple-400/30 blur-3xl"
      />

      <div className="container mx-auto px-6 text-center relative z-10">
        <h2 className="text-5xl font-extrabold tracking-tight mb-4 drop-shadow-[0_1px_8px_rgba(255,255,255,0.2)]">
          Let's Connect <span className="inline-block animate-bounce">👋</span>
        </h2>
        <p className="max-w-xl mx-auto text-white/80 mb-10 text-lg">
          Whether you have questions, ideas, or just want to say hi—I'm all ears!
        </p>

        <motion.form
          onSubmit={handleSubmit}
          className="mx-auto max-w-2xl bg-white/10 backdrop-blur-lg p-10 rounded-3xl shadow-2xl border border-white/20 space-y-6 text-left"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <FloatingInput label="Your Name" name="name" type="text" />
          <FloatingInput label="Your Email" name="email" type="email" />
          <FloatingTextarea label="Your Message" name="message" />

          <motion.button
            type="submit"
            disabled={submitted}
            className="relative inline-flex items-center gap-2 px-6 py-3 text-white bg-gradient-to-br from-blue-500 to-purple-600 rounded-full shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50"
            whileTap={{ scale: 0.95 }}
          >
            {submitted ? (
              <motion.span
                className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              />
            ) : (
              <>
                <SendHorizonal className="w-5 h-5" />
                Send Message
              </>
            )}
          </motion.button>
        </motion.form>

        {}
        <div className="mt-16 flex justify-center items-center gap-2 text-white/50 text-sm animate-pulse">
          <Sparkles className="w-4 h-4 text-yellow-300" />
          <span>Made with magic ✨ & passion 💜</span>
        </div>
      </div>
    </section>
  );
}

function FloatingInput({ label, name, type }: { label: string; name: string; type: string }) {
  return (
    <div className="relative">
      <input
        required
        type={type}
        name={name}
        placeholder=" "
        className="peer w-full rounded-md bg-white/20 px-4 pt-6 pb-2 text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-400"
      />

      <label
        htmlFor={name}
        className="absolute left-4 top-2 text-sm text-white/80 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-white/50 peer-focus:top-2 peer-focus:text-sm peer-focus:text-white"
      >
        {label}
      </label>
    </div>
  );
}

function FloatingTextarea({ label, name }: { label: string; name: string }) {
  return (
    <div className="relative">
      <textarea
        required
        name={name}
        rows={4}
        placeholder=" "
        className="peer w-full rounded-md bg-white/20 px-4 pt-6 pb-2 text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-400"
      />

      <label
        htmlFor={name}
        className="absolute left-4 top-2 text-sm text-white/80 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-white/50 peer-focus:top-2 peer-focus:text-sm peer-focus:text-white"
      >
        {label}
      </label>
    </div>
  );
}
