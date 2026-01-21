import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const progressVariants = cva(
  "relative h-3 w-full overflow-hidden rounded-full",
  {
    variants: {
      variant: {
        default: "bg-muted",
        glass: "bg-muted/50 backdrop-blur-sm",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const indicatorVariants = cva(
  "h-full w-full flex-1 transition-all duration-500 ease-out rounded-full",
  {
    variants: {
      indicatorColor: {
        default: "bg-primary",
        gradient: "bg-gradient-to-r from-primary to-secondary",
        energy: "bg-energy",
        waste: "bg-waste",
        commute: "bg-commute",
        food: "bg-food",
        accent: "bg-gradient-to-r from-accent to-energy",
      },
    },
    defaultVariants: {
      indicatorColor: "default",
    },
  }
);

type IndicatorColor = VariantProps<typeof indicatorVariants>["indicatorColor"];

interface ProgressProps
  extends Omit<React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>, "color">,
    VariantProps<typeof progressVariants> {
  indicatorColor?: IndicatorColor;
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, variant, indicatorColor, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(progressVariants({ variant, className }))}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn(indicatorVariants({ indicatorColor }))}
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
