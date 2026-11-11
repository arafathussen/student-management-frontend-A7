"use client";

import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	title?: string;
	description?: string;
	children: React.ReactNode;
	footer?: React.ReactNode;
	maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
}

export const Modal: React.FC<ModalProps> = ({
	isOpen,
	onClose,
	title,
	description,
	children,
	footer,
	maxWidth = "md",
}) => {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		if (isOpen) {
			document.body.style.overflow = "hidden";
			window.addEventListener("keydown", handleEscape);
		}
		return () => {
			document.body.style.overflow = "unset";
			window.removeEventListener("keydown", handleEscape);
		};
	}, [isOpen, onClose]);

	if (!isOpen || !mounted) return null;

	const maxWidths = {
		sm: "max-w-sm",
		md: "max-w-md",
		lg: "max-w-lg",
		xl: "max-w-xl",
		"2xl": "max-w-2xl",
	};

	const modalContent = (
		<div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
			{/* Backdrop - covers 100% of entire viewport including sidebar & navbar */}
			<div
				className="fixed inset-0 bg-slate-950/85 backdrop-blur-md transition-opacity duration-200 animate-in fade-in"
				onClick={onClose}
				aria-hidden="true"
			/>

			{/* Modal Dialog Box */}
			<div
				className={cn(
					"relative w-full my-auto rounded-2xl sm:rounded-3xl bg-slate-900/95 glass-panel p-5 sm:p-6 border border-slate-700/80 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-200 max-h-[calc(100vh-2rem)] flex flex-col overflow-hidden",
					maxWidths[maxWidth],
				)}
				role="dialog"
				aria-modal="true"
			>
				{/* Close Button */}
				<button
					type="button"
					onClick={onClose}
					className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors z-20 cursor-pointer"
					aria-label="Close modal"
				>
					<X className="w-5 h-5" />
				</button>

				{/* Header */}
				{(title || description) && (
					<div className="mb-4 pr-8 shrink-0">
						{title && (
							<h3 className="text-lg font-semibold text-slate-100 tracking-tight">
								{title}
							</h3>
						)}
						{description && (
							<p className="text-sm text-slate-400 mt-0.5">{description}</p>
						)}
					</div>
				)}

				{/* Body */}
				<div className="flex-1 overflow-y-auto pr-1 custom-scrollbar min-h-0">{children}</div>

				{/* Fixed / Sticky Footer */}
				{footer && (
					<div className="pt-3.5 mt-2 border-t border-slate-800/80 shrink-0">
						{footer}
					</div>
				)}
			</div>
		</div>
	);

	return createPortal(modalContent, document.body);
};
