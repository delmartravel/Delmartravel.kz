import "./home-first-screen.css";

import { Footer } from "./footer";
import { Hero } from "./hero";
import { Reviews } from "./reviews-section";
import { Destinations, FinalCta, WhyUs } from "./sections";

export function HomePage() {
  return <main className="legacy-home"><Hero /><Destinations /><WhyUs /><Reviews /><FinalCta /><Footer /></main>;
}
