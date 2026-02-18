import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2.5 py-1 text-xs font-medium whitespace-nowrap [&>svg]:size-3 [&>svg]:pointer-events-none transition-[color,box-shadow,background-color] focus-visible:border-ring focus-visible:ring-ring/60 focus-visible:ring-[3px] focus-visible:ring-offset-2 focus-visible:ring-offset-background aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "border-primary/70 bg-[linear-gradient(130deg,hsl(var(--primary))_0%,#8db7ff_48%,#4b6a9b_100%)] text-primary-foreground [a&]:hover:brightness-105",
        secondary: "bg-[linear-gradient(180deg,rgba(56,62,73,0.75)_0%,rgba(33,37,45,0.82)_100%)] text-secondary-foreground border-blacksmith [a&]:hover:brightness-110",
        destructive: "bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/25",
        outline: "border-blacksmith bg-[linear-gradient(180deg,rgba(30,35,43,0.82)_0%,rgba(16,18,23,0.9)_100%)] text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        ghost: "[a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        link: "text-primary underline-offset-4 [a&]:hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "span";

  return <Comp data-slot="badge" data-variant={variant} className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };

