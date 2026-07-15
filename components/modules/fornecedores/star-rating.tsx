"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRating({
  value,
  onChange,
  readOnly,
}: {
  value: number | null | undefined;
  onChange?: (value: number) => void;
  readOnly?: boolean;
}) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(n)}
          className={cn("text-muted-foreground", !readOnly && "cursor-pointer hover:text-amber-500")}
        >
          <Star
            className={cn(
              "size-4",
              value && n <= value && "fill-amber-500 text-amber-500"
            )}
          />
        </button>
      ))}
    </div>
  );
}
