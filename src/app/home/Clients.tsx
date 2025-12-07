"use client";

import { FaReact, FaNodeJs, FaGithub } from "react-icons/fa";
import { SiNextdotjs, SiTypescript, SiTailwindcss } from "react-icons/si";

export default function TechStack() {
  const techs = [
    { icon: <SiNextdotjs />, name: "Next.js" },
    { icon: <FaReact />, name: "React" },
    { icon: <SiTypescript />, name: "TypeScript" },
    { icon: <SiTailwindcss />, name: "Tailwind" },
    { icon: <FaNodeJs />, name: "Node.js" },
    { icon: <FaGithub />, name: "GitHub" },
  ];

  return (
    <section className="py-12 bg-gray-50 border-y">
      <div className="container mx-auto px-6">
        <p className="text-center text-sm text-gray-500 mb-6">Built with modern technologies</p>
        <div className="flex flex-wrap justify-center gap-8">
          {techs.map(({ icon, name }) => (
            <div key={name} className="flex items-center gap-2 text-gray-600">
              <span className="text-xl">{icon}</span>
              <span className="text-sm">{name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
