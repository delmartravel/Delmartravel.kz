"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { WhatsAppIcon } from "./whatsapp-icon";

const languages = ["RU", "KZ", "EN"] as const;

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState<(typeof languages)[number]>("RU");
  const isMounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    const trigger = triggerRef.current;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      trigger?.focus();
    };
  }, [isOpen]);

  const close = () => setIsOpen(false);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={`home-mobile-menu-trigger${isOpen ? " is-open" : ""}`}
        aria-label="Открыть меню"
        aria-expanded={isOpen}
        aria-controls="home-mobile-drawer"
        onClick={() => setIsOpen(true)}
      >
        <span /><span />
      </button>

      {isMounted && createPortal(
        <div className={`home-mobile-menu${isOpen ? " is-open" : ""}`} aria-hidden={!isOpen}>
          <button className="home-mobile-menu__overlay" type="button" aria-label="Закрыть меню" onClick={close} />
          <aside id="home-mobile-drawer" className="home-mobile-menu__drawer" role="dialog" aria-modal="true" aria-label="Навигация">
            <div className="home-mobile-menu__top">
              <span>Меню</span>
              <button ref={closeButtonRef} type="button" className="home-mobile-menu__close" aria-label="Закрыть меню" onClick={close}>
                <span /><span />
              </button>
            </div>

            <nav className="home-mobile-menu__nav" aria-label="Мобильная навигация">
              <Link href="/" onClick={close}>Главная</Link>
              <Link href="/#why-us" prefetch={false} onClick={close}>Почему мы</Link>
              <Link href="/#formats" prefetch={false} onClick={close}>Направления</Link>
              <Link href="/pages/search/index.html" onClick={close}>Поиск тура</Link>
              <Link href="/#contacts" prefetch={false} onClick={close}>Контакты</Link>
              <a href="https://wa.me/77770316653" target="_blank" rel="noopener noreferrer" onClick={close}>
                <WhatsAppIcon />
                <span>WhatsApp</span>
              </a>
            </nav>

            <div className="home-mobile-menu__footer">
              <div className="home-mobile-menu__theme-row">
                <span>Тема</span>
                <AnimatedThemeToggler className="home-mobile-menu__theme-toggle" duration={520} aria-label="Сменить тему" />
              </div>
              <div className="home-mobile-menu__languages" aria-label="Выбор языка">
                {languages.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={language === item ? "active" : ""}
                    aria-pressed={language === item}
                    onClick={() => setLanguage(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>,
        document.body,
      )}
    </>
  );
}
