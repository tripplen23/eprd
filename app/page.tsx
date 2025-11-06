"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { MorphingText } from "@/components/magicui/morphing-text";
import { AuroraText } from "@/components/magicui/aurora-text";

export default function Home() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push("/dashboard");
  };

  return (
    <main className="min-h-screen bg-white text-gray-900 dark:bg-black dark:text-white flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background gradients (dark only) */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/40 via-transparent to-purple-600/40 opacity-70 dark:block hidden" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-400/30 via-transparent to-transparent opacity-60 dark:block hidden" />
      {/* Stripe overlay (dark only) */}
      <div className="absolute inset-0 transform rotate-[-30deg] scale-150 bg-gradient-to-r from-indigo-500/10 via-transparent to-purple-500/10 opacity-50 blur-3xl dark:block hidden" />

      {/* Content container */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-16 text-center">
        {/* Hero section */}
        <AuroraText
          colors={[
            "var(--gradient-start)",
            "var(--secondary)",
            "var(--gradient-end)",
            "var(--primary)",
          ]}
          className="text-6xl font-bold mb-6 bg-clip-text drop-shadow-lg"
        >
          EPRD
        </AuroraText>
        <MorphingText
          className="text-gray-600 dark:text-gray-300 mb-12 mx-auto"
          texts={[
            "AI-first",
            "Rapid Prototyping",
            "Data modeling",
            "AI-powered insights",
            "Automated workflows",
            "Ship data faster",
          ]}
        />

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="secondary"
            size="xxl"
            onClick={handleGetStarted}
            className="cta-pulse px-8 py-4 font-medium bg-black/5 text-black hover:bg-black/10 border border-black/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 dark:border-white/10 backdrop-blur-sm transition-all duration-500 rounded-lg shadow-lg relative group overflow-hidden cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-transparent to-indigo-500/20 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-full transition-all duration-1000" />
            <span className="relative z-10">Get Started</span>
          </Button>
        </div>

        {/* Features section */}
        <div className="mt-24 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="group p-6 bg-white border border-gray-300 rounded-xl shadow-lg transform hover:-translate-y-2 hover:scale-105 hover:border-indigo-400 transition-all duration-300 dark:bg-gray-800 dark:border-gray-700">
            <div className="text-indigo-400 text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-indigo-600 dark:text-indigo-300 mb-2">
              Smart Data Insights
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Extract actionable insights from raw datasets effortlessly with
              AI-driven analysis.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="group p-6 bg-white border border-gray-300 rounded-xl shadow-lg transform hover:-translate-y-2 hover:scale-105 hover:border-purple-400 transition-all duration-300 dark:bg-gray-800 dark:border-gray-700">
            <div className="text-purple-400 text-4xl mb-4">🔗</div>
            <h3 className="text-xl font-semibold text-purple-600 dark:text-purple-300 mb-2">
              Seamless Data Integrations
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Connect to databases, APIs, and tools in one unified interface—no
              more manual exports.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="group p-6 bg-white border border-gray-300 rounded-xl shadow-lg transform hover:-translate-y-2 hover:scale-105 hover:border-indigo-300 transition-all duration-300 dark:bg-gray-800 dark:border-gray-700">
            <div className="text-indigo-300 text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold text-indigo-600 dark:text-indigo-300 mb-2">
              Automated Data Workflows
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Streamline ETL and analysis pipelines with AI automation, saving
              you time and effort.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}