import { cn } from "@/lib/utils";
import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
	variant?: "default" | "primary" | "secondary" | "outline" | "info" | "success" | "warning" | "danger" | "purple" | "gold";
}

export const Badge: React.FC<BadgeProps> = ({
	className,
	variant = "default",
	children,
	...props
}) => {
	const variants = {
		default: "bg-blue-500/15 text-blue-400 border-blue-500/30",
		primary: "bg-blue-500/15 text-blue-400 border-blue-500/30",
		secondary: "bg-slate-800/80 text-slate-300 border-slate-700/60",
		outline: "bg-transparent text-slate-300 border-slate-700",
		info: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
		success: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
		warning: "bg-amber-500/15 text-amber-400 border-amber-500/30",
		danger: "bg-rose-500/15 text-rose-400 border-rose-500/30",
		purple: "bg-purple-500/15 text-purple-400 border-purple-500/30",
		gold: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
	};

	return (
		<span
			className={cn(
				"inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border backdrop-blur-sm",
				variants[variant],
				className,
			)}
			{...props}
		>
			{children}
		</span>
	);
};
