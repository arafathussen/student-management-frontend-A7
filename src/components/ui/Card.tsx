import { cn } from "@/lib/utils";
import React from "react";

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
	className,
	children,
	...props
}) => {
	return (
		<div
			className={cn(
				"glass-card rounded-2xl p-6 border border-slate-800/80 shadow-xl",
				className,
			)}
			{...props}
		>
			{children}
		</div>
	);
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
	className,
	children,
	...props
}) => {
	return (
		<div className={cn("mb-4", className)} {...props}>
			{children}
		</div>
	);
};

export const CardTitle: React.FC<
	React.HTMLAttributes<HTMLHeadingElement>
> = ({ className, children, ...props }) => {
	return (
		<h3
			className={cn(
				"text-lg font-semibold text-slate-100 tracking-tight",
				className,
			)}
			{...props}
		>
			{children}
		</h3>
	);
};

export const CardDescription: React.FC<
	React.HTMLAttributes<HTMLParagraphElement>
> = ({ className, children, ...props }) => {
	return (
		<p className={cn("text-sm text-slate-400 mt-1", className)} {...props}>
			{children}
		</p>
	);
};

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
	className,
	children,
	...props
}) => {
	return (
		<div className={cn("", className)} {...props}>
			{children}
		</div>
	);
};

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
	className,
	children,
	...props
}) => {
	return (
		<div
			className={cn(
				"mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between",
				className,
			)}
			{...props}
		>
			{children}
		</div>
	);
};
