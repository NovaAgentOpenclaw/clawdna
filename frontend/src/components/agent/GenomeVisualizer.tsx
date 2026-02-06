"use client";

import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

interface GenomeVisualizerProps {
  sequence?: string;
  hash?: string;
  className?: string;
}

export function GenomeVisualizer({
  sequence = "ATCGATCGATCGATCGATCGATCGATCGATCG",
  hash,
  className,
}: GenomeVisualizerProps) {
  const nucleotideColors: Record<string, string> = {
    A: "#00F0FF",
    T: "#FF00A0",
    C: "#00FF88",
    G: "#FFD700",
  };

  return (
    <Card className={cn("p-5", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Genome</h3>
        {hash && <span className="text-xs text-white/50 font-mono">{hash}</span>}
      </div>

      {/* DNA Helix Animation */}
      <div className="relative h-32 mb-4 overflow-hidden rounded-lg bg-black/20">
        <div className="absolute inset-0 flex items-center justify-center">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-full flex items-center justify-center"
              style={{
                animation: `dna-float 3s ease-in-out infinite`,
                animationDelay: `${i * 0.2}s`,
                opacity: 1 - i * 0.1,
              }}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: nucleotideColors.A,
                  transform: `translateX(${Math.sin(i * 0.8) * 60}px)`,
                  boxShadow: `0 0 10px ${nucleotideColors.A}`,
                }}
              />
              <div className="w-12 h-0.5 bg-white/20 mx-2" />
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: nucleotideColors.T,
                  transform: `translateX(${-Math.sin(i * 0.8) * 60}px)`,
                  boxShadow: `0 0 10px ${nucleotideColors.T}`,
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Sequence Display */}
      <div className="glass rounded-lg p-3 overflow-x-auto">
        <div className="flex gap-1 font-mono text-sm whitespace-nowrap">
          {sequence.split("").map((nucleotide, i) => (
            <span
              key={i}
              className="w-6 h-6 flex items-center justify-center rounded"
              style={{
                color: nucleotideColors[nucleotide] || "#fff",
                backgroundColor: `${nucleotideColors[nucleotide]}20` || "rgba(255,255,255,0.1)",
              }}
            >
              {nucleotide}
            </span>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4">
        {Object.entries(nucleotideColors).map(([letter, color]) => (
          <div key={letter} className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }}
            />
            <span className="text-xs text-white/60">{letter}</span>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes dna-float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </Card>
  );
}
