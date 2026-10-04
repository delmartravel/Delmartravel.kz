"use client";

import { useRef, useState } from "react";

import { Footer } from "@/features/home/components/footer";
import { Header } from "@/features/home/components/header";

import { SearchResults } from "./search-results";
import { TourSearchForm } from "./tour-search-form";
import { useTourvisorSearch } from "../use-tourvisor-search";
import type { TourvisorSearchRequest } from "../types";

export function SearchPage() {
  const [hasSearched, setHasSearched] = useState(false);
  const search = useTourvisorSearch();
  const resultsRef = useRef<HTMLDivElement>(null);
  const showResults = (request: TourvisorSearchRequest) => {
    setHasSearched(true);
    void search.start(request);
    window.setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  };

  return <div className="search-page-body"><Header /><main className="search-page"><section className="search-intro"><div className="search-intro__copy"><h1>Поиск тура</h1></div><TourSearchForm onSearch={showResults} /><div ref={resultsRef}>{hasSearched && search.phase !== "idle" && <SearchResults phase={search.phase} progress={search.progress} results={search.results} error={search.error} />}</div></section></main><Footer /></div>;
}
