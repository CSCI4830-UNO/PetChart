import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Honestly this is probably overkill for 4 variants, but keeping it for flexibility
const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/80 border-transparent",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 border-transparent",
        destructive:
          "bg-destructive text-destructive-foreground shadow hover:bg-destructive/80 border-transparent",
        outline:
          "text-foreground border", // might need hover/focus styles here later
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

// Might want to switch to <span> if we ever use inline
function Badge({ className = "", variant = "default", ...rest }: BadgeProps) {
  const computedClassName = cn(badgeVariants({ variant }), className);

  return (
    <div className={computedClassName} {...rest}>
      {rest.children}
    </div>
  );
}

export { Badge, badgeVariants };
