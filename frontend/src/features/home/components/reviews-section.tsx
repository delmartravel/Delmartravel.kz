/* eslint-disable @next/next/no-img-element */

import { Marquee } from "@/components/ui/marquee";

import { travelReviews, type TravelReview } from "../data/reviews";

function ReviewCard({ review }: { review: TravelReview }) {
  return (
    <article className="travel-review-card">
      {review.image ? (
        <img
          className="travel-review-card__media"
          src={review.image}
          alt=""
          loading="lazy"
          decoding="async"
        />
      ) : null}
      <div className="travel-review-card__head">
        <strong>{review.name}</strong>
        <span>{review.destination}</span>
      </div>
      <p>{review.text}</p>
      <a className="travel-review-card__source" href={review.sourceUrl} target="_blank" rel="noopener noreferrer">
        Отзыв в 2ГИС
      </a>
    </article>
  );
}

export function Reviews() {
  const midpoint = Math.ceil(travelReviews.length / 2);
  const firstRow = travelReviews.slice(0, midpoint);
  const secondRow = travelReviews.slice(midpoint);

  return (
    <section id="reviews" className="reviews-marquee-section">
      <header className="reviews-marquee-section__head">
        <h2>Нас выбирают<br />и возвращаются.</h2>
        <p>Истории туристов Del Mar Travel</p>
      </header>

      <div className="reviews-marquee-section__lanes">
        <Marquee pauseOnHover repeat={4} className="reviews-marquee reviews-marquee--forward">
          {firstRow.map((review) => <ReviewCard key={`${review.name}-${review.destination}`} review={review} />)}
        </Marquee>
        <Marquee reverse pauseOnHover repeat={4} className="reviews-marquee reviews-marquee--reverse">
          {secondRow.map((review) => <ReviewCard key={`${review.name}-${review.destination}`} review={review} />)}
        </Marquee>
      </div>
    </section>
  );
}
