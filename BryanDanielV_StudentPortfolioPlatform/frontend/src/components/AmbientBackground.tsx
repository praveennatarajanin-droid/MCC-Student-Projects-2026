"use client";

import React from "react";

interface AmbientBackgroundProps {
  /** Controls visual intensity. Default: "default" */
  variant?: "default" | "hero" | "subtle" | "login";
  className?: string;
}

/**
 * AmbientBackground — Reusable premium background layer.
 * Renders floating CSS-animated orbs and a subtle mesh grid.
 * Zero JS overhead — pure CSS animations.
 */
export default function AmbientBackground({
  variant = "default",
  className = "",
}: AmbientBackgroundProps) {
  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 overflow-hidden pointer-events-none select-none ${className}`}
    >
      {/* ── Mesh Grid ── */}
      <div className="absolute inset-0 dark:bg-mesh-dark bg-mesh-light opacity-60" />

      {/* ── Orb 1 — Primary (Maroon) ── */}
      <div
        className="animate-orb-float animate-pulse-glow absolute rounded-full"
        style={{
          width: variant === "hero" ? "55vw" : variant === "login" ? "45vw" : "40vw",
          height: variant === "hero" ? "55vw" : variant === "login" ? "45vw" : "40vw",
          top: variant === "login" ? "-20%" : "-15%",
          left: variant === "login" ? "-15%" : "-10%",
          background: "radial-gradient(circle, var(--orb-primary) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      {/* ── Orb 2 — Secondary (Gold) ── */}
      <div
        className="animate-orb-float-2 animate-pulse-glow absolute rounded-full"
        style={{
          width: variant === "hero" ? "45vw" : "35vw",
          height: variant === "hero" ? "45vw" : "35vw",
          bottom: "-20%",
          right: "-10%",
          background: "radial-gradient(circle, var(--orb-secondary) 0%, transparent 70%)",
          filter: "blur(50px)",
          animationDelay: "2s",
        }}
      />

      {/* ── Orb 3 — Accent (Indigo/subtle) ── */}
      {(variant === "hero" || variant === "login") && (
        <div
          className="animate-orb-float-3 absolute rounded-full"
          style={{
            width: "30vw",
            height: "30vw",
            top: "40%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "radial-gradient(circle, var(--orb-accent) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
      )}

      {/* ── Decorative corner arcs ── */}
      {variant !== "subtle" && (
        <>
          {/* Top-left arc */}
          <div
            className="absolute -top-8 -left-8 w-48 h-48 rounded-full opacity-[0.03] dark:opacity-[0.06]"
            style={{
              border: "1px solid hsl(var(--mcc-gold))",
            }}
          />
          <div
            className="absolute -top-4 -left-4 w-32 h-32 rounded-full opacity-[0.04] dark:opacity-[0.08]"
            style={{
              border: "1px solid hsl(var(--mcc-gold))",
            }}
          />

          {/* Bottom-right arc */}
          <div
            className="absolute -bottom-10 -right-10 w-56 h-56 rounded-full opacity-[0.03] dark:opacity-[0.05]"
            style={{
              border: "1px solid hsl(var(--mcc-maroon))",
            }}
          />
        </>
      )}
    </div>
  );
}
