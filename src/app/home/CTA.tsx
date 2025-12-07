"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CallToAction() {
  return (
    <section className="py-20 bg-gray-900 text-white">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold mb-4">
          Ready to streamline your workflow?
        </h2>
        <p className="text-gray-300 mb-8 max-w-lg mx-auto">
          Join teams who use WorkNest to manage projects, track progress, and collaborate better.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/sign-up">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-6">
              Get Started Free
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
          <Link href="/team">
            <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 px-6">
              Meet the Team
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
