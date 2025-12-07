"use client";

import { Rocket, BellRing, Cloud, BrainCircuit, ShieldCheck, Code2 } from "lucide-react";

const features = [
  {
    icon: Rocket,
    title: "Project Dashboard",
    desc: "See all your projects and tasks in one place. Stay organized and never miss a deadline.",
  },
  {
    icon: BellRing,
    title: "Notifications",
    desc: "Get updates when tasks are assigned, completed, or when deadlines are approaching.",
  },
  {
    icon: Cloud,
    title: "Cloud Sync",
    desc: "Access your work from anywhere, on any device. Your data is always up to date.",
  },
  {
    icon: BrainCircuit,
    title: "Smart Insights",
    desc: "Track progress with visual charts and identify bottlenecks before they slow you down.",
  },
  {
    icon: ShieldCheck,
    title: "Secure & Reliable",
    desc: "Your data is encrypted and protected. We take security seriously.",
  },
  {
    icon: Code2,
    title: "Developer Friendly",
    desc: "Built with Next.js, TypeScript, and clean APIs. Easy to extend and customize.",
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-gray-900">
            Everything you need to manage projects
          </h2>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            WorkNest brings together all the tools your team needs. Simple enough for small teams, 
            powerful enough for complex projects.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, desc }, i) => (
            <div
              key={i}
              className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center justify-center h-12 w-12 mb-4 rounded-lg bg-blue-600 text-white">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {title}
              </h3>
              <p className="text-gray-600 mt-2 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
