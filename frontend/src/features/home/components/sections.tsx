import ScrollableCardStack from "@/components/smoothui/scrollable-card-stack";
import { ArrowUpRight, MessageCircle } from "lucide-react";

import { countries } from "../data";

export function Destinations() {
  return (
    <section id="formats" className="travel-moods">
      <div className="directions-scene">
        <div className="directions-scene__heading">
          <p className="section-label directions-scene__eyebrow">Направления</p>
          <h2>Выберите направление</h2>
          <span aria-hidden="true">10 стран</span>
        </div>
        <div className="directions-scene__stage">
          <ScrollableCardStack
            className="directions-stack"
            cardHeight={430}
            showControls
            items={countries.map(([slug, name]) => ({
              id: slug,
              name,
              image: `/assets/images/directions/${slug}.webp`,
              href: `/pages/${slug}/index.html`,
            }))}
          />
        </div>
      </div>
    </section>
  );
}

export function WhyUs() {
  return (
    <section id="why-us" className="why-us why-story">
      <div className="why-story__copy">
        <h2>Берём на себя всё, чтобы отдых начался спокойно.</h2>
        <div className="why-story__narrative">
          <p>Мы начинаем с вашего запроса: учитываем состав поездки, привычный уровень отдыха, пожелания и бюджет, чтобы предложить действительно подходящие варианты.</p>
          <p>Проверяем отели и детали поездки, сравниваем варианты и честно говорим, если какое-то решение вам не подходит — даже если оно популярно или хорошо выглядит на первый взгляд.</p>
          <p>После бронирования остаёмся рядом: помогаем подготовиться к поездке, сопровождаем во время отдыха и остаёмся на связи до возвращения домой.</p>
        </div>
      </div>
      <div className="why-story__media">
        <img
          src="/assets/images/home/delmar-personal-consultation.webp"
          alt="Персональная консультация пары со специалистом"
          loading="lazy"
          decoding="async"
        />
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section id="contacts" className="final-cta">
      <div className="final-cta__inner">
        <h2>Не знаете,<br />куда отправиться?</h2>
        <div className="final-cta__aside">
          <p>Напишите нам — подберём несколько вариантов под ваши даты, бюджет и стиль отдыха.</p>
          <a
            href="https://wa.me/77770316653"
            target="_blank"
            rel="noopener noreferrer"
            className="final-cta__action"
          >
            <MessageCircle aria-hidden="true" />
            <span>Написать в WhatsApp</span>
            <ArrowUpRight aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
