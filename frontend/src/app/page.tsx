"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { BackgroundEffects } from "@/components/layout/PageContainer";

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 mb-8 animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse" />
              <span className="text-sm text-neon-cyan font-medium">Gen 44 is Live</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 animate-slide-up">
              <span className="gradient-text">Breed. Evolve. Dominate.</span>
            </h1>

            {/* Subtext */}
            <p className="text-xl sm:text-2xl text-white/60 mb-12 max-w-2xl mx-auto animate-slide-up">
              The future of AI isn't built. It's grown.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-up">
              <Link href="/population">
                <Button size="lg" className="min-w-[200px]">
                  Explore Population
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Button>
              </Link>
              <Link href="/breeding">
                <Button variant="secondary" size="lg" className="min-w-[200px]">
                  Start Breeding
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto animate-fade-in">
              {[
                { label: "Population", value: "2,847", color: "text-neon-cyan" },
                { label: "Generation", value: "#44", color: "text-neon-purple" },
                { label: "Avg Fitness", value: "892", color: "text-neon-green" },
                { label: "Mutations", value: "12.4K", color: "text-neon-yellow" },
              ].map((stat) => (
                <div key={stat.label} className="glass rounded-xl p-4">
                  <p className={cn("text-2xl sm:text-3xl font-bold", stat.color)}>{stat.value}</p>
                  <p className="text-sm text-white/50">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* DNA Animation */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-64 h-64 opacity-30 pointer-events-none hidden lg:block">
          <svg viewBox="0 0 200 400" className="w-full h-full animate-dna-spin">
            {[...Array(10)].map((_, i) => (
              <g key={i} transform={`translate(0, ${i * 40})`}>
                <circle
                  cx={100 + Math.sin(i * 0.8) * 60}
                  cy="20"
                  r="6"
                  fill="#00F0FF"
                  className="animate-pulse"
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
                <circle
                  cx={100 - Math.sin(i * 0.8) * 60}
                  cy="20"
                  r="6"
                  fill="#A855F7"
                  className="animate-pulse"
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
                <line
                  x1={100 + Math.sin(i * 0.8) * 60}
                  y1="20"
                  x2={100 - Math.sin(i * 0.8) * 60}
                  y2="20"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="2"
                />
              </g>
            ))}
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              Harness the power of genetic algorithms to evolve AI agents with unique traits and capabilities.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={feature.title} className="p-6 group">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", feature.bgColor)}>
                  <feature.icon className={cn("w-6 h-6", feature.iconColor)} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-white/60 text-sm">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-card rounded-2xl p-8 sm:p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan/10 via-neon-purple/10 to-neon-green/10" />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to Evolve?</h2>
              <p className="text-white/60 mb-8 max-w-xl mx-auto">
                Join thousands of researchers and enthusiasts breeding the next generation of AI agents.
              </p>
              <Link href="/population">
                <Button size="lg">
                  Get Started
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

const features = [
  {
    title: "Genome System",
    description: "Each agent has a unique genetic code that determines their traits, abilities, and potential.",
    icon: DnaIcon,
    bgColor: "bg-neon-cyan/20",
    iconColor: "text-neon-cyan",
  },
  {
    title: "Fitness Evaluation",
    description: "Advanced algorithms evaluate agent performance across multiple dimensions and tasks.",
    icon: ChartIcon,
    bgColor: "bg-neon-purple/20",
    iconColor: "text-neon-purple",
  },
  {
    title: "Breeding Mechanics",
    description: "Combine parent traits strategically to produce offspring with enhanced capabilities.",
    icon: HeartIcon,
    bgColor: "bg-neon-green/20",
    iconColor: "text-neon-green",
  },
  {
    title: "Mutation Engine",
    description: "Random mutations introduce diversity and enable discovery of novel trait combinations.",
    icon: SparklesIcon,
    bgColor: "bg-neon-yellow/20",
    iconColor: "text-neon-yellow",
  },
  {
    title: "Natural Selection",
    description: "Only the fittest agents survive to the next generation, driving continuous improvement.",
    icon: TargetIcon,
    bgColor: "bg-neon-cyan/20",
    iconColor: "text-neon-cyan",
  },
  {
    title: "Leaderboards",
    description: "Compete globally and track the evolution of top-performing agents in real-time.",
    icon: TrophyIcon,
    bgColor: "bg-neon-purple/20",
    iconColor: "text-neon-purple",
  },
];

// Icons
function DnaIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
  );
}

function ChartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  );
}

function TargetIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function TrophyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  );
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}
