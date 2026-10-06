import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-rose focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-brown text-[#FAF4EB] shadow-xs hover:bg-brown-light",
        rose:
          "bg-rose text-white shadow-xs hover:bg-rose-light",
        secondary:
          "border border-rose-border bg-rose-soft text-brown hover:bg-[#ebd9d9]",
        outline:
          "border border-rose text-rose bg-transparent",
        cream:
          "border border-[#e4d4bf] bg-cream-muted text-brown",
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

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
