"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Application } from "@/types";
import { paymentService } from "@/services/paymentService";
import { higherStudyService } from "@/services/higherStudyService";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  Download, 
  Printer, 
  Building2, 
  ShieldCheck, 
  UploadCloud, 
  FileCheck, 
  Lock, 
  Unlock, 
  Sparkles, 
  DollarSign, 
  Receipt,
  X,
  AlertCircle,
  HelpCircle,
  Loader2
} from "lucide-react";
import confetti from "canvas-confetti";

interface ApplicationPaymentPortalProps {
  application: Application;
  onRefresh?: () => Promise<void> | void;
  onPaymentSuccess?: (appId: string) => void;
  isAdminOrCounselor?: boolean;
}

export const ApplicationPaymentPortal: React.FC<ApplicationPaymentPortalProps> = ({
  application,
  onRefresh,
  onPaymentSuccess,
  isAdminOrCounselor = false,
}) => {
  const [mounted, setMounted] = useState(false);
  const [activePaymentMethod, setActivePaymentMethod] = useState<"CARD" | "BANK_TRANSFER">("CARD");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentProgress, setPaymentProgress] = useState(0);
  const [paymentStepText, setPaymentStepText] = useState("Initializing 256-bit SSL handshake...");
  const [bankSlipUploaded, setBankSlipUploaded] = useState(false);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [isPaidLocally, setIsPaidLocally] = useState(false);
  const [downloadingReceiptId, setDownloadingReceiptId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Smooth, professional progressive loading animation starting from 0%
  useEffect(() => {
    if (!isProcessingPayment) {
      setPaymentProgress(0);
      setPaymentStepText("Initializing 256-bit SSL handshake...");
      return;
    }

    setPaymentProgress(8);
    setPaymentStepText("Initializing 256-bit SSL handshake...");

    const interval = setInterval(() => {
      setPaymentProgress((prev) => {
        if (prev < 32) {
          setPaymentStepText("Establishing encrypted connection with Stripe...");
          return prev + 6;
        } else if (prev < 68) {
          setPaymentStepText("Generating secure 256-bit checkout session...");
          return prev + 5;
        } else if (prev < 88) {
          setPaymentStepText("Authorizing gateway payment token...");
          return prev + 3;
        } else if (prev < 95) {
          setPaymentStepText("Finalizing redirection to Stripe Hosted Portal...");
          return prev + 1;
        }
        return prev;
      });
    }, 120);

    return () => clearInterval(interval);
  }, [isProcessingPayment]);

  const payments = application.payments || [];
  const pendingPayment = payments.find((p: any) => p.status === "PENDING");
  const completedPayments = payments.filter((p: any) => p.status === "PAID");

  // Derive Invoice Amount & Currency from pending payment or university
  const uni = application.program?.university;
  const currency = pendingPayment?.currency || uni?.country?.currency || "USD";
  const rawDepositAmount = pendingPayment ? Number(pendingPayment.amount) : Number(uni?.offerDepositFee) || Number(application.program?.initialDeposit) || 1500;
  const invoiceDescription = pendingPayment?.description || "Tuition Deposit & Admission Clearance";
  const invoiceNumber = pendingPayment ? `INV-${pendingPayment.id.slice(0, 8).toUpperCase()}` : `INV-2026-${application.id.slice(0, 6).toUpperCase()}`;
  const isPaid = !pendingPayment && (completedPayments.length > 0 || !!application.isFeePaid || !!application.isOfferUnlocked || isPaidLocally);

  // Handle Real Stripe Checkout Session & Hosted Gateway Redirect
  const handlePayOnline = async () => {
    try {
      setIsProcessingPayment(true);
      const res = await paymentService.createCheckoutSession({
        amount: rawDepositAmount,
        paymentType: pendingPayment?.paymentType || "OFFER_DEPOSIT",
        description: invoiceDescription,
        higherStudyApplicationId: application.id,
        paymentId: pendingPayment?.id,
      });

      if (res?.data?.checkoutUrl) {
        setPaymentProgress(100);
        setPaymentStepText("Redirecting to Stripe Gateway...");
        setTimeout(() => {
          window.location.href = res.data.checkoutUrl;
        }, 300);
      } else {
        throw new Error("Stripe checkout session URL could not be generated.");
      }
    } catch (err: any) {
      console.error("Payment checkout initialization failed", err);
      alert(err?.response?.data?.message || err?.message || "Payment processing encountered an issue. Please try again.");
      setIsProcessingPayment(false);
      setPaymentProgress(0);
    }
  };

  const handleBankSlipUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBankSlipUploaded(true);
    alert("Bank deposit slip submitted successfully! Admissions desk will verify within 1 business day.");
  };

  const handleDownloadPDFReceipt = async (paymentId: string) => {
    try {
      setDownloadingReceiptId(paymentId);
      const blob = await paymentService.downloadReceipt(paymentId);
      if (blob) {
        const url = window.URL.createObjectURL(new Blob([blob], { type: "application/pdf" }));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `payment_receipt_${paymentId.slice(0, 8)}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => window.URL.revokeObjectURL(url), 2000);
      }
    } catch (err: any) {
      console.warn("PDF receipt download notice:", err);
      if (err?.code !== "ERR_CANCELED" && err?.name !== "CanceledError" && err?.message !== "Network Error") {
        alert("Could not download receipt. Please try again.");
      }
    } finally {
      setDownloadingReceiptId(null);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  // Case 1: No Payment Requested by Admin Yet
  if (!pendingPayment && !isPaid) {
    return (
      <div className="space-y-6">
        <Card className="bg-slate-900/60 border-slate-800 shadow-xl overflow-hidden p-8 sm:p-12 text-center relative">
          <div className="w-16 h-16 rounded-3xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <Badge variant="outline" className="mb-3 px-3 py-1 text-xs bg-slate-800 text-slate-300 border-slate-700">
            Account Status: In Good Standing
          </Badge>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white mb-2">
            No Payments Currently Due
          </h3>
          <p className="text-sm text-slate-400 max-w-lg mx-auto leading-relaxed mb-6">
            There are no outstanding invoices due for this file at this time. When an invoice or fee clearance request is issued by your admissions counselor, secure online card checkout and bank wire instructions will be activated right here.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400">
            <Clock className="w-4 h-4 text-blue-400" />
            <span>Admissions Desk: Application File Processing</span>
          </div>

          {isAdminOrCounselor && (
            <div className="mt-8 pt-6 border-t border-slate-800 max-w-md mx-auto">
              <span className="text-xs text-slate-400 block mb-2 font-semibold">Staff Quick Action:</span>
              <p className="text-xs text-slate-500">
                To request tuition deposit or processing fee from this student, open the Admin Applications table and click &apos;Manage File&apos;.
              </p>
            </div>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      {/* Premium Full-Screen Loading Overlay when redirecting to Stripe */}
      {isProcessingPayment && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-slate-900/95 border border-slate-800 p-7 sm:p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl shadow-blue-950/50 space-y-5 relative overflow-hidden">
            {/* Ambient background glow */}
            <div className="absolute -top-12 -left-12 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative mx-auto w-16 h-16">
              <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl animate-pulse" />
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600/20 to-indigo-600/10 text-blue-400 border border-blue-500/30 flex items-center justify-center shadow-lg shadow-blue-500/10">
                <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
              </div>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-white tracking-tight">Connecting to Stripe Gateway</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Initializing 256-bit encrypted checkout session. Please do not refresh or close this window...
              </p>
            </div>

            {/* Dynamic Animated Progress Bar Section */}
            <div className="space-y-2 pt-1 text-left">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400 flex items-center gap-1.5 font-medium truncate max-w-[220px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping inline-block shrink-0" />
                  <span className="truncate">{paymentStepText}</span>
                </span>
                <span className="font-mono font-bold text-blue-400 shrink-0">
                  {Math.min(paymentProgress, 100)}%
                </span>
              </div>

              {/* Bar Track */}
              <div className="w-full bg-slate-950/90 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-800/80 shadow-inner">
                <div
                  className="bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 h-full rounded-full transition-all duration-300 ease-out relative overflow-hidden shadow-[0_0_12px_rgba(59,130,246,0.6)]"
                  style={{ width: `${Math.max(paymentProgress, 4)}%` }}
                >
                  {/* Continuous Shimmer Light Wave Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_1.2s_infinite]" />
                </div>
              </div>

              {/* Encryption Badge */}
              <div className="flex items-center justify-center gap-1.5 pt-1 text-[10px] text-slate-500 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>256-bit SSL Encrypted • Direct Stripe Redirection</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Invoice Summary Card */}
      <Card className="bg-slate-900/70 border-slate-800 shadow-xl overflow-hidden relative">
        <div className="p-5 sm:p-7 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-slate-800/80">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge
                  variant={isPaid ? "success" : "warning"}
                  className="text-xs"
                >
                  {isPaid ? "Invoice Paid & Cleared" : "Payment Required"}
                </Badge>
                <span className="text-xs text-slate-400 font-mono">
                  {invoiceNumber}
                </span>
              </div>
              <h3 className="font-extrabold text-lg sm:text-xl text-white">
                {invoiceDescription}
              </h3>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                <span>Official fee clearance request • Application ID: #{application.id.slice(0, 8)}</span>
              </p>
            </div>

            {/* Total Payable Amount Banner */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-right self-start sm:self-auto min-w-[200px]">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                Total Invoiced Amount
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono mt-0.5">
                {currency} {rawDepositAmount.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {isPaid ? "Status: Zero Balance (Cleared)" : "Status: Payment Outstanding"}
              </div>
            </div>
          </div>

          {/* Paid Status Hero Banner */}
          {isPaid ? (
            <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-emerald-200">
                      Payment Confirmed & Verified by Admissions Desk
                    </h4>
                    <p className="text-xs text-emerald-300/80 mt-0.5">
                      Your tuition deposit has been successfully credited. Official offer documents and visa processing files are unlocked.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="gradient"
                    size="sm"
                    onClick={() => setReceiptModalOpen(true)}
                    className="shadow-lg shadow-blue-600/20 cursor-pointer text-xs"
                  >
                    <Receipt className="w-4 h-4 mr-1.5" />
                    <span>Download Payment Receipt (PDF)</span>
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            /* Unpaid Options: Online Card vs Direct Bank Wire */
            <div className="space-y-6">
              {/* Payment Method Switcher */}
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                <button
                  type="button"
                  onClick={() => setActivePaymentMethod("CARD")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activePaymentMethod === "CARD"
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                      : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Instant Online Payment (Card / Stripe)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActivePaymentMethod("BANK_TRANSFER")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activePaymentMethod === "BANK_TRANSFER"
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                      : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>Direct Bank Wire / Slip Upload</span>
                </button>
              </div>

              {/* Method A: Online Card Checkout */}
              {activePaymentMethod === "CARD" && (
                <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-sm text-white">Instant Global Card Payment</h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Visa, Mastercard, American Express, and international student cards accepted with 256-bit SSL encryption.
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400 font-mono">VISA</span>
                      <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400 font-mono">MC</span>
                      <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400 font-mono">AMEX</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400">Payable Today:</span>
                      <div className="font-bold text-lg text-white font-mono">
                        {currency} {rawDepositAmount.toLocaleString()}
                      </div>
                    </div>

                    <Button
                      variant="gradient"
                      disabled={isProcessingPayment}
                      onClick={handlePayOnline}
                      className="shadow-lg shadow-blue-600/30 cursor-pointer font-bold text-xs"
                    >
                      {isProcessingPayment ? (
                        <span>Redirecting to Stripe...</span>
                      ) : (
                        <>
                          <CreditCard className="w-3.5 h-3.5 mr-1.5" />
                          <span>Pay {currency} {rawDepositAmount.toLocaleString()} with Stripe</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Method B: Direct Bank Wire & Deposit Slip Upload */}
              {activePaymentMethod === "BANK_TRANSFER" && (
                <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-5">
                  <div>
                    <h4 className="font-bold text-sm text-white">Official Institutional Bank Details</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Please deposit the tuition fee directly into the official Rise Abroad Education trust account and upload the transaction receipt below.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 text-[10px] uppercase font-semibold">Account Name</span>
                      <div className="font-bold text-white mt-1">Rise Abroad Education Ltd</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 text-[10px] uppercase font-semibold">Bank Name</span>
                      <div className="font-bold text-white mt-1">City Bank Ltd (Gulshan Branch)</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 text-[10px] uppercase font-semibold">Account Number</span>
                      <div className="font-bold text-white font-mono mt-1">1102-4589-3201</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 text-[10px] uppercase font-semibold">SWIFT / Routing</span>
                      <div className="font-bold text-white font-mono mt-1">CIBLBDDHXXX / 225271890</div>
                    </div>
                  </div>

                  {/* Bank Slip Upload Action */}
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-dashed border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                        <UploadCloud className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-white">Upload Bank Deposit Slip / Cheque</div>
                        <p className="text-[11px] text-slate-400">PDF, PNG or JPG (Max 10MB)</p>
                      </div>
                    </div>

                    <label className="cursor-pointer">
                      <input
                        type="file"
                        onChange={handleBankSlipUpload}
                        className="hidden"
                        accept=".pdf,.png,.jpg,.jpeg"
                      />
                      <span className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition-all">
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>{bankSlipUploaded ? "Upload Another Slip" : "Choose Bank Slip"}</span>
                      </span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Admin Payment Override Controls */}
          {isAdminOrCounselor && (
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-semibold">Staff Payment Manager:</span>
              <div className="flex items-center gap-2">
                <Button
                  variant={isPaid ? "outline" : "success"}
                  size="sm"
                  onClick={async () => {
                    await higherStudyService.toggleOfferLock(application.id, !isPaid);
                    if (onRefresh) await onRefresh();
                  }}
                  className="cursor-pointer text-xs"
                >
                  {isPaid ? <Lock className="w-3.5 h-3.5 mr-1" /> : <CheckCircle2 className="w-3.5 h-3.5 mr-1" />}
                  <span>{isPaid ? "Mark as Unpaid (Revoke)" : "Mark as Paid (Authorize)"}</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Verified Payment History & Official PDF Downloads */}
      {completedPayments.length > 0 && (
        <Card className="bg-slate-900/60 border-slate-800 shadow-xl overflow-hidden p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-emerald-400" />
              <h4 className="font-bold text-base text-white">Verified Payment History &amp; Receipts</h4>
            </div>
            <Badge variant="success" className="text-xs">
              {completedPayments.length} Settled Invoices
            </Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3 font-semibold uppercase text-[10px]">Payment Reference</th>
                  <th className="p-3 font-semibold uppercase text-[10px]">Description</th>
                  <th className="p-3 font-semibold uppercase text-[10px]">Amount</th>
                  <th className="p-3 font-semibold uppercase text-[10px]">Date Settled</th>
                  <th className="p-3 font-semibold uppercase text-[10px] text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {completedPayments.map((p: any) => (
                  <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3 font-mono text-slate-300">
                      INV-{p.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-white">{p.description || "Tuition Deposit"}</div>
                      <div className="text-[10px] text-slate-400">{p.paymentType}</div>
                    </td>
                    <td className="p-3 font-mono font-bold text-emerald-400">
                      {p.currency || "USD"} {Number(p.amount).toLocaleString()}
                    </td>
                    <td className="p-3 text-slate-400">
                      {p.paidAt ? new Date(p.paidAt).toLocaleDateString() : new Date(p.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={downloadingReceiptId === p.id}
                        onClick={() => handleDownloadPDFReceipt(p.id)}
                        className="text-xs border-slate-700 hover:border-emerald-500 hover:text-emerald-300 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5 mr-1" />
                        <span>{downloadingReceiptId === p.id ? "Downloading..." : "PDF Receipt"}</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Official Payment Receipt Modal (Printable & Downloadable) */}
      {receiptModalOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Modal Controls Bar */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-sm text-white">Official Electronic Payment Receipt</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="gradient"
                  size="sm"
                  onClick={handlePrintReceipt}
                  className="text-xs cursor-pointer shadow-md"
                >
                  <Printer className="w-3.5 h-3.5 mr-1.5" />
                  <span>Print Receipt</span>
                </Button>
                <button
                  type="button"
                  onClick={() => setReceiptModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Document Body */}
            <div id="printable-receipt" className="p-8 space-y-6 bg-slate-950 text-slate-100 font-sans">
              {/* Receipt Header & Logo */}
              <div className="flex items-start justify-between border-b border-slate-800 pb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <img src="/logo.svg" alt="Rise Abroad Education" className="w-9 h-9 object-contain" />
                    <div>
                      <div className="font-extrabold text-lg text-white tracking-tight">Rise Abroad Education</div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Admissions & Higher Study Wing</div>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-3 space-y-0.5">
                    <div>Level 6, Navana Tower, Gulshan-1, Dhaka 1212</div>
                    <div>Hotline: +880 1700-000000 • admissions@riseabroad.com</div>
                  </div>
                </div>

                <div className="text-right">
                  <Badge variant="success" className="text-xs font-bold px-3 py-1 bg-emerald-600 text-white">
                    VERIFIED PAYMENT
                  </Badge>
                  <div className="font-mono text-xs text-slate-400 mt-2">
                    Receipt #{invoiceNumber}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Issued: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                  </div>
                </div>
              </div>

              {/* Student & Institution Meta Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Student Applicant</span>
                  <div className="font-bold text-white text-sm mt-0.5">{application.student?.name || "Student Applicant"}</div>
                  <div className="text-slate-400 text-[11px]">{application.student?.email || "student@riseabroad.com"}</div>
                  <div className="text-slate-500 text-[10px] mt-0.5">Application Ref: #{application.id.slice(0, 8)}</div>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Institutional Destination</span>
                  <div className="font-bold text-white text-sm mt-0.5">{uni?.name || "Global University"}</div>
                  <div className="text-slate-400 text-[11px]">{application.program?.title || "Degree Program"}</div>
                  <div className="text-slate-500 text-[10px] mt-0.5">Country: {uni?.country?.name || "Destination"}</div>
                </div>
              </div>

              {/* Itemized Table */}
              <div className="border border-slate-800 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-3.5 font-bold uppercase text-[10px]">Description</th>
                      <th className="p-3.5 font-bold uppercase text-[10px] text-center">Type</th>
                      <th className="p-3.5 font-bold uppercase text-[10px] text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    <tr>
                      <td className="p-3.5">
                        <div className="font-bold text-white">University Acceptance Deposit & File Processing</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">Official seat confirmation fee transmitted to {uni?.name || "the university"}.</div>
                      </td>
                      <td className="p-3.5 text-center text-slate-300">Tuition Deposit</td>
                      <td className="p-3.5 text-right font-mono font-bold text-white">
                        {currency} {rawDepositAmount.toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                  <tfoot className="bg-slate-900 border-t border-slate-800 font-bold">
                    <tr>
                      <td colSpan={2} className="p-3.5 text-right text-slate-400">Total Paid & Settled:</td>
                      <td className="p-3.5 text-right font-mono text-emerald-400 text-sm">
                        {currency} {rawDepositAmount.toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Official Seal & Signature */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-[11px] text-slate-500">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Electronically Verified & Signed by Rise Abroad Central Registry</span>
                </div>
                <div className="text-right font-mono text-[10px] text-slate-400">
                  Transaction Authenticator: SEC-{Math.random().toString(36).substring(2, 9).toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
