import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 font-display",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive text-destructive-foreground",
        outline: "border-primary/50 text-primary",
        energy: "border-transparent bg-energy/20 text-energy border-energy/30",
        waste: "border-transparent bg-waste/20 text-waste border-waste/30",
        commute: "border-transparent bg-commute/20 text-commute border-commute/30",
        food: "border-transparent bg-food/20 text-food border-food/30",
        points: "border-transparent bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-glow-sm",
        streak: "border-transparent bg-accent/20 text-accent border-accent/30",
        rank: "border-transparent bg-muted text-foreground",
        glow: "border-primary/30 bg-primary/10 text-primary shadow-glow-sm",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
