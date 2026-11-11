"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useMyPaymentsQuery } from "@/hooks/usePortalQueries";
import { paymentService, type IPaymentRecord } from "@/services/paymentService";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import {
  CreditCard,
  Download,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
} from "lucide-react";

export default function StudentPaymentsHistoryPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const { data: payments = [], isLoading: paymentsLoading } =
    useMyPaymentsQuery(isAuthenticated);

  useEffect(() => {
    document.title = "Payments & Official Receipts | Rise Abroad Education";
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  const handlePayWithStripe = async (record?: IPaymentRecord) => {
    try {
      setProcessingId(record?.id || "new");
      const res = await paymentService.createCheckoutSession({
        amount: Number(record?.amount || 250),
        paymentType: record?.paymentType || "OFFER_DEPOSIT",
        description:
          record?.description || "Tuition Deposit & Admission Clearance",
        paymentId: record?.id,
      });

      const checkoutUrl = res?.data?.checkoutUrl || res?.checkoutUrl;
      if (checkoutUrl) {
        toast.info("Redirecting to Stripe Checkout...");
        window.location.href = checkoutUrl;
      } else {
        toast.error("Could not initialize Stripe checkout session.");
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to initiate Stripe checkout."
      );
    } finally {
      setProcessingId(null);
    }
  };

  const handleDownloadReceipt = async (paymentId: string) => {
    try {
      setDownloadingId(paymentId);
      const blob = await paymentService.downloadReceipt(paymentId);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `Official-Receipt-${paymentId.slice(0, 8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success("Official PDF receipt downloaded!");
    } catch (err) {
      toast.error("Could not download receipt PDF.");
    } finally {
      setDownloadingId(null);
    }
  };

  if (isLoading) return null;

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Stripe Official Payment &amp; Invoice Desk</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Tuition Deposits &amp; Payment History
          </h1>
          <p className="text-xs text-slate-400">
            Settle university admission invoices via Stripe and download stamped PDF receipts.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="primary"
            size="sm"
            isLoading={processingId === "new"}
            onClick={() => handlePayWithStripe()}
            className="cursor-pointer"
          >
            <CreditCard className="w-4 h-4 mr-1.5" />
            <span>Pay Tuition Deposit ($250)</span>
          </Button>
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="cursor-pointer">
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              <span>Student Portal</span>
            </Button>
          </Link>
        </div>
      </div>

      <Card className="border-slate-800 bg-slate-900/70 overflow-hidden">
        <CardHeader className="border-b border-slate-800/80 pb-3">
          <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-blue-400" />
            <span>My Invoices &amp; Transactions ({payments.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {paymentsLoading ? (
            <div className="p-8 space-y-3 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 w-full rounded-xl bg-slate-800/70" />
              ))}
            </div>
          ) : (payments as IPaymentRecord[]).length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Clock className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-sm font-bold text-white">
                No Payment Invoices Yet
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                You can initiate a direct Stripe tuition deposit above or wait for your admissions counselor to issue an application invoice.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase text-[10px]">
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {(payments as IPaymentRecord[]).map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">
                        {item.description || "University Tuition Deposit"}
                      </div>
                      <div className="text-[10px] font-mono text-slate-500">
                        Ref: #{item.id.slice(0, 10)}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                      {item.currency || "USD"} {Number(item.amount).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      {item.status === "PAID" ? (
                        <Badge variant="success" className="text-[10px]">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          PAID
                        </Badge>
                      ) : (
                        <Badge variant="warning" className="text-[10px]">
                          PENDING
                        </Badge>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {item.status === "PAID" ? (
                        <Button
                          variant="outline"
                          size="sm"
                          isLoading={downloadingId === item.id}
                          onClick={() => handleDownloadReceipt(item.id)}
                          className="cursor-pointer text-[11px] h-7 px-2.5"
                        >
                          <Download className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                          <span>PDF Receipt</span>
                        </Button>
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          isLoading={processingId === item.id}
                          onClick={() => handlePayWithStripe(item)}
                          className="cursor-pointer text-[11px] h-7 px-2.5"
                        >
                          <ExternalLink className="w-3.5 h-3.5 mr-1" />
                          <span>Pay via Stripe</span>
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

