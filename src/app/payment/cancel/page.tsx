"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import {
  XCircle,
  ArrowLeft,
  RefreshCw,
  ShieldAlert,
  CreditCard,
  HelpCircle,
} from "lucide-react";

function PaymentCancelContent() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("payment_id") || "";

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6 bg-slate-950">
      <Card className="w-full max-w-lg bg-slate-900/90 border-slate-800 shadow-2xl backdrop-blur-xl rounded-3xl overflow-hidden relative">
        <div className="h-2 w-full bg-gradient-to-r from-amber-500 via-rose-500 to-red-600" />

        <CardContent className="p-6 sm:p-8 space-y-6 text-center">
          <div className="relative mx-auto w-20 h-20">
            <div className="absolute inset-0 rounded-full bg-amber-500/20 blur-xl animate-pulse" />
            <div className="relative w-20 h-20 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center shadow-lg shadow-amber-500/10">
              <XCircle className="w-10 h-10" />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Checkout Session Cancelled</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Payment Not Completed
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
              Your Stripe checkout session was cancelled before completion. No charges were made to your card, and your pending tuition invoice remains open.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-left space-y-2.5 text-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span>Payment Gateway:</span>
              <span className="font-semibold text-white">Stripe Checkout (Test Mode)</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Current Status:</span>
              <Badge variant="warning" className="text-[10px] font-bold">
                PENDING SETTLEMENT
              </Badge>
            </div>
            {paymentId && (
              <div className="flex items-center justify-between text-slate-400">
                <span>Invoice Reference:</span>
                <span className="font-mono text-[11px] text-slate-300">
                  #{paymentId.slice(0, 12)}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-3 pt-2">
            <Link
              href="/dashboard?tab=APPLICATIONS&subTab=PAYMENT"
              className="w-full block"
            >
              <Button
                variant="primary"
                size="md"
                className="w-full cursor-pointer shadow-lg shadow-blue-600/30 font-bold"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                <span>Retry Tuition Payment</span>
              </Button>
            </Link>

            <div className="grid grid-cols-2 gap-2.5">
              <Link href="/dashboard/payments" className="w-full block">
                <Button variant="outline" size="sm" className="w-full cursor-pointer text-xs">
                  <CreditCard className="w-3.5 h-3.5 mr-1.5" />
                  <span>Payment History</span>
                </Button>
              </Link>
              <Link href="/contact" className="w-full block">
                <Button variant="outline" size="sm" className="w-full cursor-pointer text-xs">
                  <HelpCircle className="w-3.5 h-3.5 mr-1.5" />
                  <span>Contact Support</span>
                </Button>
              </Link>
            </div>

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors pt-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Student Portal</span>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentCancelPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white text-xs">
          Loading payment status...
        </div>
      }
    >
      <PaymentCancelContent />
    </Suspense>
  );
}

