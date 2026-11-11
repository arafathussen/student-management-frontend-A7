import { cn } from "@/lib/utils";
import React from "react";

export interface InputProps
	extends React.InputHTMLAttributes<HTMLInputElement> {
	label?: string;
	error?: string;
	helperText?: string;
	icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
	({ className, label, error, helperText, icon, id, ...props }, ref) => {
		const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

		return (
			<div className="w-full space-y-1.5">
				{label && (
					<label
						htmlFor={inputId}
						className="block text-xs font-medium text-slate-300 tracking-wide"
					>
						{label}
					</label>
				)}
				<div className="relative">
					{icon && (
						<div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
							{icon}
						</div>
					)}
					<input
						id={inputId}
						ref={ref}
						className={cn(
							"w-full rounded-xl bg-slate-900/90 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm px-4 py-2.5 transition-all duration-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed",
							icon && "pl-10",
							error && "border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/20",
							className,
						)}
						{...props}
					/>
				</div>
				{error && <p className="text-xs text-rose-400 font-medium">{error}</p>}
				{!error && helperText && (
					<p className="text-xs text-slate-500">{helperText}</p>
				)}
			</div>
		);
	},
);

Input.displayName = "Input";
