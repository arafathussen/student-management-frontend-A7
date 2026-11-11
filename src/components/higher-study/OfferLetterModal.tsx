"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { formatCurrency } from "@/lib/utils";
import type { IHigherStudyApplication } from "@/types";
import confetti from "canvas-confetti";
import {
	AlertCircle,
	CheckCircle2,
	CreditCard,
	Download,
	Lock,
	ShieldCheck,
	Sparkles,
} from "lucide-react";
import React, { useState } from "react";

export interface OfferLetterModalProps {
	isOpen: boolean;
	onClose: () => void;
	application: any;
	onSuccessUnlock?: () => void;
	onUnlocked?: () => void;
}

export const OfferLetterModal: React.FC<OfferLetterModalProps> = ({
	isOpen,
	onClose,
	application,
	onSuccessUnlock,
	onUnlocked,
}) => {
	const [isProcessing, setIsProcessing] = useState(false);
	const [isUnlockedLocally, setIsUnlockedLocally] = useState(false);

	if (!application) return null;

	const isUnlocked = application.isOfferUnlocked || isUnlockedLocally;
	const depositFee = application.program?.university?.offerDepositFee || 500;

	const handlePayDeposit = async () => {
		setIsProcessing(true);
		try {
			// Simulate Stripe checkout confirmation
			await new Promise((resolve) => setTimeout(resolve, 1500));
			setIsUnlockedLocally(true);

			// Trigger Confetti explosion
			confetti({
				particleCount: 120,
				spread: 70,
				origin: { y: 0.6 },
				colors: ["#2563eb", "#10b981", "#f59e0b", "#8b5cf6"],
			});

			if (onSuccessUnlock) onSuccessUnlock();
			if (onUnlocked) onUnlocked();
		} catch (error) {
			console.error("Payment error:", error);
		} finally {
			setIsProcessing(false);
		}
	};

	const handleDownload = () => {
		if (application.offerLetterUrl) {
			window.open(application.offerLetterUrl, "_blank");
		} else {
			alert("Offer letter download URL is being processed.");
		}
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title="Official Offer Letter"
			description={`Application #${application.applicationNumber || application.id?.slice(0, 8)} - ${application.program?.university?.name}`}
			maxWidth="md"
		>
			<div className="space-y-6">
				{/* Status Alert Banner */}
				{isUnlocked ? (
					<div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3">
						<CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
						<div>
							<h4 className="text-sm font-semibold text-emerald-300">
								Offer Letter Unlocked & Ready!
							</h4>
							<p className="text-xs text-emerald-400/80 mt-1">
								Congratulations! Your official admission offer letter has been
								verified and is available for instant download.
							</p>
						</div>
					</div>
				) : (
					<div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
						<Lock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
						<div>
							<h4 className="text-sm font-semibold text-amber-300">
								Deposit Fee Required to Unlock
							</h4>
							<p className="text-xs text-amber-400/80 mt-1">
								The university policy requires a verified deposit fee of{" "}
								<strong>{formatCurrency(depositFee)} USD</strong> before the
								official offer letter PDF can be downloaded.
							</p>
						</div>
					</div>
				)}

				{/* University & Degree Details */}
				<div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800 space-y-2.5 text-xs text-slate-300">
					<div className="flex justify-between">
						<span className="text-slate-400">University:</span>
						<span className="font-semibold text-slate-100">
							{application.program?.university?.name}
						</span>
					</div>
					<div className="flex justify-between">
						<span className="text-slate-400">Course / Program:</span>
						<span className="font-semibold text-slate-100">
							{application.program?.title || application.program?.name}
						</span>
					</div>
					<div className="flex justify-between">
						<span className="text-slate-400">Tuition Fee:</span>
						<span className="font-semibold text-slate-100">
							{formatCurrency(application.program?.tuitionFee || 0)} / Year
						</span>
					</div>
					<div className="flex justify-between">
						<span className="text-slate-400">Offer Issued Date:</span>
						<span className="font-semibold text-slate-100">
							{application.offerIssuedAt
								? new Date(application.offerIssuedAt).toLocaleDateString()
								: "Recent"}
						</span>
					</div>
				</div>

				{/* Action Buttons */}
				<div className="flex flex-col gap-3">
					{isUnlocked ? (
						<Button
							variant="gold"
							className="w-full justify-center gap-2 py-3 text-base cursor-pointer"
							onClick={handleDownload}
						>
							<Download className="w-5 h-5" />
							<span>Download Official Offer Letter (PDF)</span>
						</Button>
					) : (
						<Button
							variant="primary"
							className="w-full justify-center gap-2 py-3 text-base cursor-pointer"
							isLoading={isProcessing}
							onClick={handlePayDeposit}
						>
							<CreditCard className="w-5 h-5" />
							<span>Pay Deposit ${depositFee} & Unlock Letter</span>
						</Button>
					)}

					<Button
						variant="ghost"
						size="sm"
						className="w-full justify-center text-slate-400"
						onClick={onClose}
					>
						Close
					</Button>
				</div>
			</div>
		</Modal>
	);
};
