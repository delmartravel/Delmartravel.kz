import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CountryPage, countryPages, countrySlugs } from "@/features/countries/components/country-page";

export function generateStaticParams() {
  return countrySlugs.map((country) => ({ country }));
}

export async function generateMetadata({ params }: { params: Promise<{ country: string }> }): Promise<Metadata> {
  const { country } = await params;
  const page = countryPages[country];
  return page ? { title: page.title.replace(" | Del Mar Travel", ""), description: page.description } : {};
}

export default async function CountryRoute({ params }: { params: Promise<{ country: string }> }) {
  const { country } = await params;
  if (!countryPages[country]) notFound();
  return <CountryPage country={country} />;
}
