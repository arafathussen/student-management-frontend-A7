import { cn } from "@/lib/utils";
import React from "react";

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: "primary" | "secondary" | "outline" | "danger" | "ghost" | "gold" | "gradient" | "success";
	size?: "sm" | "md" | "lg";
	isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{
			className,
			variant = "primary",
			size = "md",
			isLoading = false,
			children,
			disabled,
			...props
		},
		ref,
	) => {
		const baseStyles =
			"inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98]";

		const variants = {
			primary:
				"bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/25 focus:ring-blue-500",
			gradient:
				"bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-lg shadow-blue-500/25 focus:ring-blue-500",
			secondary:
				"bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700/60 focus:ring-slate-500",
			outline:
				"border border-slate-700 hover:border-blue-500 hover:bg-blue-500/10 text-slate-200 focus:ring-blue-500",
			danger:
				"bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-lg shadow-rose-500/25 focus:ring-rose-500",
			success:
				"bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/25 focus:ring-emerald-500",
			ghost:
				"hover:bg-slate-800/60 text-slate-300 hover:text-white focus:ring-slate-500",
			gold:
				"bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-semibold shadow-lg shadow-amber-500/20 focus:ring-amber-500",
		};

		const sizes = {
			sm: "px-3 py-1.5 text-xs",
			md: "px-4 py-2 text-sm",
			lg: "px-6 py-3 text-base",
		};

		return (
			<button
				ref={ref}
				disabled={disabled || isLoading}
				className={cn(baseStyles, variants[variant], sizes[size], className)}
				{...props}
			>
				{isLoading ? (
					<span className="inline-flex items-center justify-center gap-2">
						<svg
							className="animate-spin h-3.5 w-3.5 text-current shrink-0"
							fill="none"
							viewBox="0 0 24 24"
						>
							<circle
								className="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								strokeWidth="3.5"
							/>
							<path
								className="opacity-90"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							/>
						</svg>
						<span className="inline-flex items-center tracking-wide font-semibold text-inherit">
							<span>Loading</span>
							<span className="inline-flex items-center ml-1 space-x-0.5">
								<span className="inline-block w-1 h-1 rounded-full bg-current animate-bounce [animation-delay:-0.3s]" />
								<span className="inline-block w-1 h-1 rounded-full bg-current animate-bounce [animation-delay:-0.15s]" />
								<span className="inline-block w-1 h-1 rounded-full bg-current animate-bounce" />
							</span>
						</span>
					</span>
				) : (
					children
				)}
			</button>
		);
	},
);

Button.displayName = "Button";
