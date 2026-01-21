import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 font-display",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-glow-sm active:scale-95",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border-2 border-primary/50 bg-transparent text-primary hover:bg-primary/10 hover:border-primary",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90 hover:shadow-[0_0_20px_hsl(85_80%_55%_/_0.3)]",
        ghost: "text-foreground hover:bg-muted hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        hero: "bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-glow-md hover:shadow-glow-lg hover:scale-105 active:scale-95 px-8 py-4 text-lg",
        glow: "bg-primary text-primary-foreground shadow-glow-sm hover:shadow-glow-md active:scale-95",
        glass: "bg-card/50 backdrop-blur-xl border border-white/10 text-foreground hover:bg-card/70 hover:border-primary/30",
        accent: "bg-accent text-accent-foreground hover:bg-accent/90 hover:shadow-glow-accent",
        energy: "bg-energy text-energy-foreground hover:bg-energy/90 hover:shadow-[0_0_20px_hsl(45_100%_55%_/_0.4)]",
        commute: "bg-commute text-commute-foreground hover:bg-commute/90 hover:shadow-[0_0_20px_hsl(200_90%_55%_/_0.4)]",
        food: "bg-food text-food-foreground hover:bg-food/90 hover:shadow-[0_0_20px_hsl(140_70%_50%_/_0.4)]",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        xl: "h-14 rounded-2xl px-10 text-lg",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
