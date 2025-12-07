"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Github,
  Mail,
  GraduationCap,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";

const teamMembers = [
  {
    name: "Shravankumar Janawade",
    email: "janawade.s@northeastern.edu",
    section: "CS5610 18616 Web Development SEC 04 Fall 2025",
    role: "Full Stack Developer",
    initials: "SJ",
  },
  {
    name: "Rohit Biradar",
    email: "biradar.roh@northeastern.edu",
    section: "CS5610 18616 Web Development SEC 04 Fall 2025",
    role: "Full Stack Developer",
    initials: "RB",
  },
];

const techStack = [
  {
    category: "Frontend",
    items: [
      { name: "Next.js 14", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg" },
      { name: "React 18", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" },
      { name: "TypeScript", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" },
      { name: "Tailwind CSS", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg" },
    ],
  },
  {
    category: "Backend",
    items: [
      { name: "Hono", icon: "https://hono.dev/images/hono-title.png" },
      { name: "Appwrite", icon: "https://appwrite.io/assets/logomark/logo.svg" },
      { name: "Node.js", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" },
    ],
  },
  {
    category: "Tools & Libraries",
    items: [
      { name: "Shadcn/ui", icon: "https://avatars.githubusercontent.com/u/139895814?s=200&v=4" },
      { name: "Framer Motion", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/framermotion/framermotion-original.svg" },
      { name: "Git", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg" },
    ],
  },
];

export default function TeamPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link href="/home" className="flex items-center gap-2">
            <img src="/Logo.png" className="w-8 h-8" alt="Logo" />
            <span className="text-xl font-semibold text-gray-800">WorkNest</span>
          </Link>
          <Link href="/home">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 max-w-4xl">
        {/* Page Title */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">About the Team</h1>
          <p className="text-gray-600">
            Meet the developers behind WorkNest - a project management tool built for our Web Development course.
          </p>
        </div>

        {/* Team Members */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            Team Members
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            {teamMembers.map((member, i) => (
              <div key={i} className="bg-white rounded-lg border p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-medium">
                    {member.initials}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{member.name}</h3>
                    <p className="text-sm text-gray-500">{member.role}</p>
                  </div>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    {member.email}
                  </div>
                  <div className="flex items-start gap-2">
                    <GraduationCap className="w-4 h-4 text-gray-400 mt-0.5" />
                    <span>{member.section}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* GitHub Repo */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Github className="w-5 h-5" />
            Repository
          </h2>
          
          <a
            href="https://github.com/ShravanJanwade/WorkNest"
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-white rounded-lg border p-5 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Github className="w-8 h-8 text-gray-700" />
                <div>
                  <h3 className="font-medium text-gray-900 group-hover:text-blue-600 flex items-center gap-1">
                    ShravanJanwade/WorkNest
                    <ExternalLink className="w-3 h-3" />
                  </h3>
                  <p className="text-sm text-gray-500">Full-stack Next.js app</p>
                </div>
              </div>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Public</span>
            </div>
            <p className="mt-3 text-sm text-gray-600">
              This is a monorepo with both frontend and backend. The frontend lives in <code className="bg-gray-100 px-1 rounded">src/app/</code> and API routes are in <code className="bg-gray-100 px-1 rounded">src/features/*/server/</code>.
            </p>
          </a>
        </section>

        {/* Tech Stack */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Tech Stack</h2>
          
          <div className="space-y-6">
            {techStack.map((group, i) => (
              <div key={i}>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                  {group.category}
                </h3>
                <div className="flex flex-wrap gap-3">
                  {group.items.map((tech, j) => (
                    <div
                      key={j}
                      className="flex items-center gap-2 bg-white border rounded-lg px-3 py-2 hover:shadow-sm transition-shadow"
                    >
                      <img
                        src={tech.icon}
                        alt={tech.name}
                        className="w-5 h-5 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                      <span className="text-sm text-gray-700">{tech.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Simple Footer */}
      <footer className="border-t bg-white py-6 mt-8">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} WorkNest — CS5610 Web Development Project</p>
        </div>
      </footer>
    </div>
  );
}
