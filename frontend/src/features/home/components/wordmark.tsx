"use client";

import { useEffect, useState } from "react";

import { HyperText } from "@/components/ui/hyper-text";

import "./wordmark-fonts.css";

const wordmarkFonts = [
  { family: "'Cormorant Garamond', serif", size: "32px", weight: 500, spacing: "-.035em" },
  { family: "'Bodoni Moda', serif", size: "27px", weight: 500, spacing: "-.045em" },
  { family: "'DM Serif Display', serif", size: "27px", weight: 400, spacing: "-.025em" },
  { family: "'Fraunces', serif", size: "27px", weight: 500, spacing: "-.04em" },
  { family: "'Prata', serif", size: "25px", weight: 400, spacing: "-.035em" },
  { family: "'Marcellus', serif", size: "26px", weight: 400, spacing: "-.025em" },
  { family: "'Libre Baskerville', serif", size: "23px", weight: 400, spacing: "-.035em" },
  { family: "'Lora', serif", size: "26px", weight: 500, spacing: "-.045em" },
  { family: "'Italiana', serif", size: "28px", weight: 400, spacing: "-.02em" },
  { family: "'Forum', serif", size: "30px", weight: 400, spacing: "-.025em" },
  { family: "'Manrope', sans-serif", size: "24px", weight: 500, spacing: "-.055em" },
  { family: "'Plus Jakarta Sans', sans-serif", size: "23px", weight: 500, spacing: "-.055em" },
  { family: "'Outfit', sans-serif", size: "26px", weight: 500, spacing: "-.045em" },
  { family: "'Urbanist', sans-serif", size: "26px", weight: 500, spacing: "-.045em" },
  { family: "'Syne', sans-serif", size: "22px", weight: 500, spacing: "-.055em" },
] as const;

const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split("");

export function Wordmark() {
  const [fontIndex, setFontIndex] = useState(0);
  const [motionAllowed, setMotionAllowed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let interval = 0;
    const frame = window.requestAnimationFrame(() => {
      setFontIndex(Math.floor(Math.random() * wordmarkFonts.length));
      setMotionAllowed(!reducedMotion.matches);
      setReady(true);
      if (!reducedMotion.matches) {
        interval = window.setInterval(() => {
          setFontIndex((current) => (current + 1) % wordmarkFonts.length);
        }, 3400);
      }
    });
    return () => {
      window.cancelAnimationFrame(frame);
      if (interval) window.clearInterval(interval);
    };
  }, []);

  const font = wordmarkFonts[fontIndex];

  if (ready && !motionAllowed) {
    return (
      <span className="wordmark" aria-label="Del Mar Travel" data-font-index={fontIndex} data-ready="true">
        <span
          className="wordmark__text wordmark__text--static"
          style={{ fontFamily: font.family, fontSize: font.size, fontWeight: font.weight, letterSpacing: font.spacing }}
        >
          Del Mar Travel
        </span>
      </span>
    );
  }

  return (
    <span className="wordmark" aria-label="Del Mar Travel" data-font-index={fontIndex} data-ready={ready}>
      <HyperText
        key={fontIndex}
        as="span"
        duration={motionAllowed ? 680 : 1}
        animateOnHover={false}
        startOnView={false}
        characterSet={characters}
        className="wordmark__text"
        style={{ fontFamily: font.family, fontSize: font.size, fontWeight: font.weight, letterSpacing: font.spacing }}
        aria-hidden="true"
      >
        Del Mar Travel
      </HyperText>
    </span>
  );
}
