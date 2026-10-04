import countryPagesJson from "../data/country-pages.json";
import type { CountryPageData } from "../types";
import { Footer } from "@/features/home/components/footer";
import { Header } from "@/features/home/components/header";
import { CountryInteractions } from "./country-interactions";
import { CountryNodeView } from "./country-node";

export const countryPages = countryPagesJson as Record<string, CountryPageData>;
export const countrySlugs = Object.keys(countryPages);

export function CountryPage({ country }: { country: string }) {
  const page = countryPages[country];

  return (
    <div className="country-page-body country-page-shell">
      <Header />
      <CountryNodeView node={page.tree} nodeKey={`${country}-main`} />
      <Footer />
      <CountryInteractions />
    </div>
  );
}
