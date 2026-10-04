"use client";

import { useEffect } from "react";

export function CountryInteractions() {
  useEffect(() => {
    const switcher = document.querySelector<HTMLElement>(".country-page-shell .lang-switch");
    if (!switcher) return;

    const buttons = [...switcher.querySelectorAll<HTMLAnchorElement>("a")];
    const setActive = (selected: HTMLAnchorElement) => {
      buttons.forEach((button) => button.classList.toggle("active", button === selected));
      switcher.style.setProperty("--lang-indicator-x", `${selected.offsetLeft}px`);
      switcher.style.setProperty("--lang-indicator-width", `${selected.offsetWidth}px`);
    };
    const listeners = buttons.map((button) => {
      const listener = (event: MouseEvent) => {
        event.preventDefault();
        setActive(button);
      };
      button.addEventListener("click", listener);
      return [button, listener] as const;
    });

    const initial = buttons.find((button) => button.textContent?.trim() === "RU") ?? buttons[0];
    if (initial) setActive(initial);
    switcher.classList.add("lang-switch--ready");

    return () => listeners.forEach(([button, listener]) => button.removeEventListener("click", listener));
  }, []);

  return null;
}
