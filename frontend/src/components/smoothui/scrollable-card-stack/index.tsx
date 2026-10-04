"use client";

/* eslint-disable @next/next/no-img-element */

import { cn } from "@/lib/utils";
import { ShinyButton } from "@/components/ui/shiny-button";
import { TextAnimate } from "@/components/ui/text-animate";
import { ArrowLeft, ArrowRight, MoveUpRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useCallback, useRef, useState } from "react";

const SCROLL_TIMEOUT_OFFSET = 100;
const SCALE_FACTOR = 0.08;
const MIN_SCALE = 0.08;
const MAX_SCALE = 2;
const CARD_PADDING = 100;

export interface CardItem {
  href: string;
  id: string;
  image: string;
  name: string;
}

export interface ScrollableCardStackProps {
  cardHeight?: number;
  className?: string;
  items: CardItem[];
  perspective?: number;
  transitionDuration?: number;
  showControls?: boolean;
}

const ScrollableCardStack: React.FC<ScrollableCardStackProps> = ({
  items,
  cardHeight = 384,
  perspective = 1000,
  transitionDuration = 180,
  showControls = false,
  className,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const touchStart = useRef({ x: 0, y: 0 });
  const suppressLink = useRef(false);
  const shouldReduceMotion = useReducedMotion();

  // Calculate the total number of items
  const totalItems = items.length;

  // Constants for visual effects - matching reference code exactly
  const FRAME_OFFSET = -30;
  const FRAMES_VISIBLE_LENGTH = 3;

  // Clamp function from reference code - memoized to prevent recreation
  const clamp = useCallback(
    (val: number, [min, max]: [number, number]): number =>
      Math.min(Math.max(val, min), max),
    []
  );

  const selectCard = useCallback(
    (index: number) => {
      if (!totalItems) return;
      const newIndex = ((index % totalItems) + totalItems) % totalItems;
      if (newIndex === currentIndex) return;

      setIsScrolling(true);
      setCurrentIndex(newIndex);
      window.setTimeout(() => setIsScrolling(false), transitionDuration + SCROLL_TIMEOUT_OFFSET);
    },
    [currentIndex, totalItems, transitionDuration],
  );

  const handleTouchStart = useCallback((event: React.TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
    suppressLink.current = false;
  }, []);

  const handleTouchEnd = useCallback((event: React.TouchEvent<HTMLDivElement>) => {
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStart.current.x;
    const deltaY = touch.clientY - touchStart.current.y;

    if (Math.abs(deltaX) < 52 || Math.abs(deltaX) <= Math.abs(deltaY)) return;
    suppressLink.current = true;
    selectCard(currentIndex + (deltaX < 0 ? 1 : -1));
    window.setTimeout(() => { suppressLink.current = false; }, 0);
  }, [currentIndex, selectCard]);

  // Calculate transform for each card based on the reference code
  const getCardTransform = useCallback(
    (index: number) => {
      const offsetIndex = index - currentIndex;

      // Apply blur effect for cards behind the current one - matching reference exactly
      const isBehindCurrent = currentIndex > index;
      const blur = !shouldReduceMotion && isBehindCurrent ? 2 : 0;

      // Opacity based on distance - improved logic from reference
      const opacity = currentIndex > index ? 0 : 1;

      // Scale with improved calculation inspired by reference - using clamp function
      const scale = shouldReduceMotion
        ? 1
        : clamp(1 - offsetIndex * SCALE_FACTOR, [MIN_SCALE, MAX_SCALE]);

      // Vertical offset with improved calculation - matching reference exactly
      const y = shouldReduceMotion
        ? 0
        : clamp(offsetIndex * FRAME_OFFSET, [
            FRAME_OFFSET * FRAMES_VISIBLE_LENGTH,
            Number.POSITIVE_INFINITY,
          ]);

      // Z-index for proper layering - matching reference pattern
      const zIndex = items.length - index;

      return {
        blur,
        opacity,
        scale,
        y,
        zIndex,
      };
    },
    [currentIndex, items.length, clamp, shouldReduceMotion]
  );

  return (
    <section
      aria-atomic="true"
      aria-label="Scrollable card stack"
      aria-live="polite"
      className={cn("relative mx-auto h-fit w-fit min-w-[300px]", className)}
      data-card-hovered={hoveredIndex === currentIndex}
    >
      <div
        aria-label="Стопка направлений"
        className="h-full w-full"
        onTouchEnd={handleTouchEnd}
        onTouchStart={handleTouchStart}
        style={{
          minHeight: `calc(var(--directions-card-height, ${cardHeight}px) + ${CARD_PADDING}px)`,
          perspective: `${perspective}px`,
          perspectiveOrigin: "center 60%",
          touchAction: "pan-y",
        }}
      >
        {items.map((item, i) => {
          const transform = getCardTransform(i);
          const isActive = i === currentIndex;
          const isHovered = hoveredIndex === i;

          return (
            <motion.div
              animate={
                shouldReduceMotion
                  ? { x: "-50%" }
                  : {
                      scale: transform.scale,
                      x: "-50%",
                      y: `calc(-50% + ${transform.y}px)`,
                    }
              }
              aria-hidden={!isActive}
              className="absolute top-1/2 left-1/2 w-max max-w-[100vw] overflow-hidden rounded-2xl bg-background shadow-lg"
              data-active={isActive}
              initial={false}
              key={`scrollable-card-${item.id}`}
              onBlur={() => setHoveredIndex(null)}
              onFocus={() => isActive && setHoveredIndex(i)}
              onMouseEnter={() => isActive && setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{
                filter: `blur(${transform.blur}px)`,
                height: `var(--directions-card-height, ${cardHeight}px)`,
                width: "var(--directions-card-width, min(760px, calc(100vw - 48px)))",
                opacity: transform.opacity,
                pointerEvents: isActive ? "auto" : "none",
                transformOrigin: "center center",
                transitionDuration: shouldReduceMotion ? "0ms" : "200ms",
                transitionProperty: shouldReduceMotion
                  ? "none"
                  : "opacity, filter",
                transitionTimingFunction:
                  "cubic-bezier(0.645, 0.045, 0.355, 1)",
                willChange: shouldReduceMotion
                  ? undefined
                  : "opacity, filter, transform",
                zIndex: transform.zIndex,
              }}
              tabIndex={isActive ? 0 : -1}
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : {
                      damping: 20,
                      duration: 0.25,
                      mass: 0.5,
                      stiffness: 250,
                      type: "spring" as const,
                    }
              }
            >
              {/* Card Content */}
              <a
                aria-label={item.name}
                className={cn(
                  "flex h-full w-full overflow-hidden rounded-xl bg-background transition-all duration-200",
                  isHovered && "shadow-xl",
                  isScrolling && isActive && "ring-2 ring-brand ring-opacity-50"
                )}
                href={item.href}
                onClick={(event) => {
                  if (suppressLink.current) event.preventDefault();
                }}
                tabIndex={isActive ? 0 : -1}
              >
                {/* Scroll indicator */}
                {isScrolling && isActive ? (
                  <div className="absolute -top-1 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full bg-brand opacity-75" />
                ) : null}

                {/* Image Container - takes remaining space */}
                <div className="relative w-full flex-1 overflow-hidden">
                  {/* Image */}
                  <img
                    alt={item.name}
                    className="absolute inset-0 h-full w-full object-cover"
                    decoding="async"
                    draggable={false}
                    height={cardHeight}
                    src={item.image}
                    style={{
                      pointerEvents: "none",
                      userSelect: "none",
                      zIndex: 2,
                    }}
                    loading={i === 0 ? "eager" : "lazy"}
                    width={760}
                  />
                </div>
              </a>
            </motion.div>
          );
        })}

        {/* Instructions for screen readers */}
        <div aria-live="polite" className="sr-only">
          {`Выбрано направление ${currentIndex + 1} из ${items.length}. Для переключения используйте кнопки.`}
        </div>
      </div>
      {showControls ? (
        <div className="directions-stack__controls" aria-label="Управление направлениями">
          <div className="directions-stack__identity" aria-live="polite">
            <strong>
              <TextAnimate
                key={items[currentIndex]?.id}
                as="span"
                animation="blurInUp"
                by="word"
                className="directions-stack__country-name"
                delay={0}
                duration={0.38}
                once
                startOnView={false}
              >
                {items[currentIndex]?.name ?? ""}
              </TextAnimate>
            </strong>
          </div>
          <div className="directions-stack__actions">
            <div className="directions-stack__arrows">
              <ShinyButton className="directions-stack__arrow" type="button" aria-label="Предыдущее направление" onClick={() => selectCard(currentIndex - 1)}>
                <ArrowLeft aria-hidden="true" />
              </ShinyButton>
              <ShinyButton className="directions-stack__arrow" type="button" aria-label="Следующее направление" onClick={() => selectCard(currentIndex + 1)}>
                <ArrowRight aria-hidden="true" />
              </ShinyButton>
            </div>
            <ShinyButton className="directions-stack__open" type="button" aria-label={`Перейти к направлению ${items[currentIndex]?.name}`} onClick={() => window.location.assign(items[currentIndex]?.href)}>
              <span>Перейти</span>
              <MoveUpRight aria-hidden="true" />
            </ShinyButton>
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default ScrollableCardStack;
