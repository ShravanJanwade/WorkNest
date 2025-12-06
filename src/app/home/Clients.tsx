'use client'
import {
    FaGoogle,
    FaAmazon,
    FaMicrosoft,
    FaApple,
    FaFacebook,
  } from "react-icons/fa";
  import { motion } from "framer-motion";
  
  export default function TrustedBySection() {
    const logos = [
      { icon: <FaGoogle />, name: "Google" },
      { icon: <FaAmazon />, name: "Amazon" },
      { icon: <FaMicrosoft />, name: "Microsoft" },
      { icon: <FaApple />, name: "Apple" },
      { icon: <FaFacebook />, name: "Facebook" },
    ];
  
    return (
      <section className="relative bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-[#0c0c0f] dark:to-[#1a1a1d] py-16">
        <motion.h2
          className="text-center text-3xl sm:text-4xl font-extrabold text-gray-800 dark:text-white mb-12 tracking-tight"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Loved by the World's Most Innovative Teams
        </motion.h2>
  
        <motion.div
          className="mx-auto flex max-w-6xl flex-wrap justify-center gap-10 px-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ staggerChildren: 0.1 }}
        >
          {logos.map(({ icon, name }, idx) => (
            <motion.div
              key={name}
              className="group relative flex h-20 w-20 items-center justify-center rounded-2xl border border-gray-200 bg-white/40 shadow-sm backdrop-blur-xl dark:bg-white/10 dark:border-white/20 transition-all duration-300 hover:shadow-xl hover:scale-105"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              whileHover={{ rotate: [0, -3, 3, 0], transition: { duration: 0.6 } }}
            >
              <span className="text-3xl text-gray-500 group-hover:text-black dark:text-gray-300 dark:group-hover:text-white transition-colors duration-300">
                {icon}
              </span>
              <span className="sr-only">{name}</span>
              {/* Optional tooltip/easter egg */}
              <div className="absolute bottom-full mb-2 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 transition">
                {name}
              </div>
            </motion.div>
          ))}
        </motion.div>
  
        {/* Decorative blur or gradient glow */}
        <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 bg-purple-500 opacity-10 blur-3xl rounded-full pointer-events-none" />
      </section>
    );
  }