import Script from "next/script";

import { HomePage } from "@/features/home/components/home-page";

export default function Page() {
  return (
    <>
      <HomePage />
      <Script src="/animations.js" strategy="lazyOnload" />
    </>
  );
}
