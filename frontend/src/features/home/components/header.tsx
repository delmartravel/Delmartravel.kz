/* eslint-disable @next/next/no-img-element */

import "./header.css";

import Link from "next/link";

import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { navigationCountries } from "../data";
import { MobileMenu } from "./mobile-menu";
import { WhatsAppIcon } from "./whatsapp-icon";
import { Wordmark } from "./wordmark";

export function Header({ variant = "default" }: { variant?: "default" | "home" }) {
  return (
    <header className={`header delmar-header${variant === "home" ? " home-header delmar-header--home" : " delmar-header--surface"}`}>
      <div className="logo-orb"><img src="/assets/logos/logo.jpg" alt="Del Mar Travel" /></div>
      <div className="header-glass">
        <div className="logo"><Wordmark /></div>
        <nav className="menu" aria-label="Главная навигация">
          <Link href="/">Главная</Link>
          <Link href="/#why-us" prefetch={false}>Почему мы</Link>
          <div className="menu-destinations">
            <Link href="/#formats" prefetch={false} className="menu-destinations__toggle">Направления</Link>
            <div className="menu-destinations__list" aria-label="Страны">
              {navigationCountries.map(([slug, name]) => <Link key={slug} href={`/pages/${slug}/index.html`}>{name}</Link>)}
            </div>
          </div>
          <Link href="/pages/search/index.html">Поиск тура</Link>
          <Link href="/#contacts" prefetch={false}>Контакты</Link>
        </nav>
        <div className="header-actions">
          <AnimatedThemeToggler className="delmar-theme-toggle" duration={520} aria-label="Сменить тему" />
          <div className="lang-switch">
            <a href="#" className="active">RU</a><a href="#">KZ</a><a href="#">EN</a>
          </div>
          <a href="https://wa.me/77770316653" target="_blank" rel="noopener noreferrer" className="header-button">
            <WhatsAppIcon />WhatsApp
          </a>
        </div>
        <MobileMenu />
      </div>
    </header>
  );
}
