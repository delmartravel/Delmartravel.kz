import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

type ExternalUiBoundaryProps = ComponentPropsWithoutRef<"div"> & {
  source: string;
};

export function ExternalUiBoundary({
  className,
  source,
  ...props
}: ExternalUiBoundaryProps) {
  return (
    <div
      data-ui-source={source}
      className={cn("text-foreground", className)}
      {...props}
    />
  );
}
