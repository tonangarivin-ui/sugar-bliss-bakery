import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-brown text-[#FAF4EB] shadow-sm hover:bg-brown-light active:scale-[0.99]",
        rose:
          "bg-rose text-white shadow-sm hover:bg-rose-light active:scale-[0.99]",
        outline:
          "border-2 border-brown text-brown bg-transparent hover:bg-cream-muted",
        "outline-rose":
          "border-2 border-rose text-rose bg-transparent hover:bg-rose-soft",
        secondary:
          "bg-rose-soft text-brown hover:bg-[#ebd8d9]",
        ghost:
          "text-brown hover:bg-cream-muted hover:text-brown-dark",
        link:
          "text-rose underline-offset-4 hover:underline p-0 h-auto min-h-0",
      },
      size: {
        default: "min-h-[44px] px-5 py-2.5",
        sm: "min-h-[38px] px-3.5 py-1.5 text-xs",
        lg: "min-h-[48px] px-7 py-3 text-base font-semibold",
        icon: "h-11 w-11 p-0 shrink-0",
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
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
