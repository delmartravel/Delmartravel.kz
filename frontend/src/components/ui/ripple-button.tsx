"use client"

import React, { useEffect, useState, type MouseEvent } from "react"

import { cn } from "@/lib/utils"

interface RippleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  rippleColor?: string
  duration?: string
}

export const RippleButton = React.forwardRef<
  HTMLButtonElement,
  RippleButtonProps
>(
  (
    {
      className,
      children,
      rippleColor = "#ffffff",
      duration = "600ms",
      onClick,
      ...props
    },
    ref
  ) => {
    const [buttonRipples, setButtonRipples] = useState<
      Array<{ x: number; y: number; size: number; key: number }>
    >([])

    const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
      createRipple(event)
      onClick?.(event)
    }

    const createRipple = (event: MouseEvent<HTMLButtonElement>) => {
      const button = event.currentTarget
      const rect = button.getBoundingClientRect()
      const size = Math.max(rect.width, rect.height)
      const x = event.clientX - rect.left - size / 2
      const y = event.clientY - rect.top - size / 2

      const newRipple = { x, y, size, key: Date.now() }
      setButtonRipples((prevRipples) => [...prevRipples, newRipple])
    }

    useEffect(() => {
      let timeout: ReturnType<typeof setTimeout> | null = null

      if (buttonRipples.length > 0) {
        const lastRipple = buttonRipples[buttonRipples.length - 1]
        timeout = setTimeout(() => {
          setButtonRipples((prevRipples) =>
            prevRipples.filter((ripple) => ripple.key !== lastRipple.key)
          )
        }, parseInt(duration))
      }

      return () => {
        if (timeout !== null) {
          clearTimeout(timeout)
        }
      }
    }, [buttonRipples, duration])

    return (
      <button
        className={cn(
          "bg-background text-primary relative flex cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 px-4 py-2 text-center",
          className
        )}
        onClick={handleClick}
        ref={ref}
        {...props}
      >
        <div className="relative z-10">{children}</div>
        <span className="pointer-events-none absolute inset-0">
          {buttonRipples.map((ripple) => (
            <span
              className="animate-rippling bg-background absolute rounded-full opacity-30"
              key={ripple.key}
              style={
                {
                  width: `${ripple.size}px`,
                  height: `${ripple.size}px`,
                  top: `${ripple.y}px`,
                  left: `${ripple.x}px`,
                  backgroundColor: rippleColor,
                  transform: `scale(0)`,
                  "--duration": duration,
                } as React.CSSProperties
              }
            />
          ))}
        </span>
      </button>
    )
  }
)

RippleButton.displayName = "RippleButton"

const rippleSelector = [
  "button",
  "a.button",
  "a.header-button",
  "[role='button']",
].join(",")

function isLightSurface(element: HTMLElement) {
  const color = getComputedStyle(element).backgroundColor
  const channels = color.match(/[\d.]+/g)?.slice(0, 3).map(Number)
  if (!channels || channels.length < 3) return false
  const [red, green, blue] = channels.map((value) => value / 255)
  return red * 0.299 + green * 0.587 + blue * 0.114 > 0.68
}

export function RippleProvider() {
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")

    const createGlobalRipple = (event: PointerEvent) => {
      if (reducedMotion.matches || event.button !== 0) return

      const source = event.target
      if (!(source instanceof Element)) return
      const target = source.closest<HTMLElement>(rippleSelector)
      if (!target || target.matches(":disabled, [aria-disabled='true']")) return
      if (
        target.matches(".tour-search-date-btn, .tour-search-star") ||
        target.closest(".tour-search-popover")
      ) return

      const rect = target.getBoundingClientRect()
      const size = Math.max(rect.width, rect.height)
      const ripple = document.createElement("span")
      ripple.className = "delmar-global-ripple"
      ripple.style.width = `${size}px`
      ripple.style.height = `${size}px`
      ripple.style.left = `${event.clientX - rect.left - size / 2}px`
      ripple.style.top = `${event.clientY - rect.top - size / 2}px`
      ripple.style.setProperty(
        "--delmar-ripple-color",
        isLightSurface(target) ? "rgba(6, 18, 32, .46)" : "rgba(255, 255, 255, .68)"
      )

      target.classList.add("delmar-ripple-host")
      target.append(ripple)
      ripple.addEventListener("animationend", () => ripple.remove(), { once: true })
    }

    document.addEventListener("pointerdown", createGlobalRipple)
    return () => document.removeEventListener("pointerdown", createGlobalRipple)
  }, [])

  return null
}
