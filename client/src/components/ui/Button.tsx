import { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

type Variant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variants: Record<Variant, string> = {
  primary: "bg-amber text-ink hover:bg-yellow-500",
  secondary: "bg-navy text-white hover:bg-ink",
  ghost: "bg-white/10 text-white hover:bg-white/20"
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        "rounded-full px-5 py-3 text-sm font-semibold transition",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
