import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

export function PageShell({
  className,
  ...props
}: ComponentPropsWithoutRef<"main">) {
  return (
    <main
      className={cn(
        "mx-auto w-full max-w-(--content-max) px-(--page-gutter)",
        className,
      )}
      {...props}
    />
  );
}
