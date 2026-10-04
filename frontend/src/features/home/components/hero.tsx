"use client";

import { useEffect, useRef } from "react";

import { TextAnimate } from "@/components/ui/text-animate";

import { Header } from "./header";
import { WhatsAppIcon } from "./whatsapp-icon";

export function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const progress = Math.min(1, Math.max(0, window.scrollY / Math.max(hero.offsetHeight, 1)));
      hero.style.setProperty("--home-scroll-progress", progress.toFixed(4));
      hero.classList.toggle("is-scrolled", window.scrollY > 24);
    };
    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    const hero = heroRef.current;
    const video = videoRef.current;
    if (!hero || !video) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let heroVisible = true;
    const updatePlayback = () => {
      if (document.hidden || !heroVisible || reducedMotion.matches) {
        video.pause();
        return;
      }
      void video.play().catch(() => undefined);
    };
    const observer = new IntersectionObserver(([entry]) => {
      heroVisible = entry.isIntersecting;
      updatePlayback();
    }, { rootMargin: "80px 0px", threshold: 0.01 });

    observer.observe(hero);
    document.addEventListener("visibilitychange", updatePlayback);
    reducedMotion.addEventListener("change", updatePlayback);
    updatePlayback();
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", updatePlayback);
      reducedMotion.removeEventListener("change", updatePlayback);
    };
  }, []);

  return (
    <section className="hero home-hero" ref={heroRef}>
      <video ref={videoRef} className="hero-video" autoPlay muted loop playsInline preload="auto" disablePictureInPicture aria-hidden="true">
        <source src="/assets/videos/hero.webm" type="video/webm" />
        <source src="/assets/videos/hero.mp4" type="video/mp4" />
      </video>
      <Header variant="home" />
      <div className="home-hero__main">
        <div className="hero-content">
          <p className="eyebrow">Индивидуальный подбор путешествий</p>
          <h1>
            <em><TextAnimate as="span" by="word" animation="blurInUp" delay={0.08} duration={0.46} once startOnView={false} className="hero-title-animated">Путешествия,</TextAnimate></em>
            <span><TextAnimate as="span" by="word" animation="blurInUp" delay={0.24} duration={0.52} once startOnView={false} className="hero-title-animated">которые остаются</TextAnimate></span>
            <strong><TextAnimate as="span" by="word" animation="blurInUp" delay={0.44} duration={0.46} once startOnView={false} className="hero-title-animated">в памяти.</TextAnimate></strong>
          </h1>
          <p className="hero-text">Подберём отдых под ваш стиль жизни: от премиальных курортов и вилл до семейных путешествий и индивидуальных маршрутов.</p>
          <div className="hero-actions">
            <a href="https://wa.me/77770316653" target="_blank" rel="noopener noreferrer" className="button button-outline"><WhatsAppIcon /><span>Получить подборку</span><i aria-hidden="true">↗</i></a>
          </div>
        </div>
      </div>
      <div className="home-hero__footer">
        <div className="hero-stats liquid-glass">
          <div><strong>30+</strong><p>стран для отдыха</p></div>
          <div><strong>15+</strong><p>лет опыта</p></div>
          <div><strong>10000+</strong><p>организованных поездок</p></div>
        </div>
        <a className="home-hero__continue" href="#formats"><span>Направления</span><i aria-hidden="true">↓</i></a>
      </div>
    </section>
  );
}
