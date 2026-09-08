'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '../../components/navigation/AppShell';
import { api } from '../../lib/api';
import {
  FileText,
  Truck,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Receipt,
  Download,
} from 'lucide-react';

const steps = [
  { key: 'ACCEPTED', label: 'Offer Accepted' },
  { key: 'LOGISTICS_BOOKED', label: 'Logistics Booked' },
  { key: 'IN_TRANSIT', label: 'In Transit' },
  { key: 'DELIVERED', label: 'Delivered & Weighed' },
  { key: 'COMPLETED', label: 'Payment Settled' },
];

export default function TransactionsPage() {
  const [currentStatus, setCurrentStatus] = useState<
    'ACCEPTED' | 'LOGISTICS_BOOKED' | 'IN_TRANSIT' | 'DELIVERED' | 'COMPLETED'
  >('IN_TRANSIT');
  const [activeTx, setActiveTx] = useState<any | null>(null);
  const [pastTxs, setPastTxs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadTransactions() {
      try {
        setIsLoading(true);
        const txs = await api.getTransactions().catch(() => []);
        if (Array.isArray(txs) && txs.length > 0) {
          const t = txs[0];
          setActiveTx({
            id: t.id || 'TX-2026-0906-881',
            buyer: t.buyer || t.buyerName || 'FreshMart Foods Ltd.',
            buyerType: 'Corporate Food Processor',
            lotId: t.lotId || 'demo-lot-ramesh-18qtl',
            commodity: t.commodity || t.commodityName || 'Tomato Hybrid Grade A',
            quantityQtl: t.quantityQtl || t.quantity || 18,
            agreedPricePerQtl: t.ratePerQtl || 2975,
            grossValue: (t.ratePerQtl || 2975) * (t.quantity || 18),
            deductions: {
              transport: 0,
              loading: 360,
              mandiFee: 0,
              commission: 0,
              transitLoss: 268,
            },
            netPayout: t.payableAmountRupees || t.totalAmount || 52922,
            logisticsPartner: t.logisticsPartner || 'KrishiLogistics Direct (Vehicle MH-12-Q-4491)',
            driverName: t.driverName || 'Vinod Shinde',
            eta: t.eta || 'Today, 4:30 PM (Chakan Industrial Area)',
            settlementCycle: 'T+1 Escrow Settlement directly to Bank Account',
          });
          setPastTxs(txs.slice(1));
        }
      } catch (err) {
        console.warn('Failed to load transactions:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadTransactions();
  }, []);

  const getStepIndex = (key: string) => {
    return steps.findIndex((s) => s.key === key);
  };

  const activeIndex = getStepIndex(currentStatus);

  const handleAdvanceStep = () => {
    if (currentStatus === 'IN_TRANSIT') setCurrentStatus('DELIVERED');
    else if (currentStatus === 'DELIVERED') setCurrentStatus('COMPLETED');
    else setCurrentStatus('COMPLETED');
  };

  return (
    <AppShell
      badge="Contract & Settlement Lifecycle"
      title="Trade Contracts & Settlements"
      subtitle="Track your active crop sales, verified weighment receipts, logistics status, and direct T+1 bank transfers."
      actions={
        <div className="flex items-center gap-2">
          {activeTx && currentStatus !== 'COMPLETED' ? (
            <button
              type="button"
              onClick={handleAdvanceStep}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Simulate: {currentStatus === 'IN_TRANSIT' ? 'Confirm Delivery' : 'Release Payment'}</span>
            </button>
          ) : activeTx ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>Fully Settled</span>
            </span>
          ) : null}
        </div>
      }
    >
      <div className="space-y-6">
        {/* ACTIVE TRANSACTION TIMELINE CARD */}
        {!activeTx ? (
          <div className="bg-white rounded-3xl p-8 border border-neutral-200 text-center text-neutral-500">
            <p className="text-sm font-semibold">No active trade contracts in execution.</p>
            <p className="text-xs text-neutral-400 mt-1">
              Once an offer is agreed with a buyer, real-time lifecycle tracking will be displayed here.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-emerald-500 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-2.5">
                <span className="bg-emerald-100 text-emerald-900 text-xs font-bold px-3 py-1 rounded-full">
                  Active Trade Contract
                </span>
                <span className="font-mono text-xs text-neutral-500 font-semibold">{activeTx.id}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-neutral-500">Buyer:</span>
                <span className="font-bold text-neutral-900">{activeTx.buyer}</span>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
            </div>

            {/* Progress Timeline Stepper */}
            <div className="my-8">
              <div className="flex items-center justify-between relative">
                {/* Connecting line */}
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-neutral-200 -translate-y-1/2 z-0" />
                <div
                  className="absolute top-1/2 left-0 h-1 bg-emerald-500 -translate-y-1/2 z-0 transition-all duration-500"
                  style={{
                    width: `${(activeIndex / (steps.length - 1)) * 100}%`,
                  }}
                />

                {steps.map((step, idx) => {
                  const isPassed = idx <= activeIndex;
                  const isCurrent = idx === activeIndex;

                  return (
                    <div key={step.key} className="relative z-10 flex flex-col items-center">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                          isCurrent
                            ? 'bg-[#ef4d23] text-white ring-4 ring-orange-100 shadow-md scale-110'
                            : isPassed
                            ? 'bg-emerald-500 text-white'
                            : 'bg-white border-2 border-neutral-300 text-neutral-400'
                        }`}
                      >
                        {idx + 1}
                      </div>
                      <span
                        className={`text-[11px] mt-2 font-semibold text-center whitespace-nowrap ${
                          isCurrent ? 'text-neutral-900 font-bold' : 'text-neutral-500'
                        }`}
                        dangerouslySetInnerHTML={{ __html: step.label }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Financial Breakdown & Logistics Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-neutral-200/80">
              {/* Left: Financial Ledger */}
              <div className="space-y-3 bg-neutral-50 p-5 rounded-2xl border border-neutral-200 text-xs">
                <span className="font-bold text-neutral-900 block uppercase tracking-wider text-[11px]">
                  Contract Settlement Ledger
                </span>

                <div className="flex justify-between py-1 border-b border-neutral-200">
                  <span className="text-neutral-600">Agreed Price (Negotiated):</span>
                  <span className="font-bold text-neutral-900">₹{activeTx.agreedPricePerQtl.toLocaleString('en-IN')}/qtl</span>
                </div>
                <div className="flex justify-between py-1 border-b border-neutral-200">
                  <span className="text-neutral-600">Gross Lot Value ({activeTx.quantityQtl} Qtl):</span>
                  <span className="font-bold text-neutral-900">₹{activeTx.grossValue.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-neutral-200 text-emerald-700">
                  <span>Transport / Freight (Direct Pickup):</span>
                  <span className="font-semibold">₹0 (Zero Deduction)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-neutral-200 text-neutral-600">
                  <span>Farmgate Loading Fee:</span>
                  <span>-₹{activeTx.deductions?.loading || 360}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-neutral-200 text-neutral-600">
                  <span>Estimated Transit Loss (0.5%):</span>
                  <span>-₹{activeTx.deductions?.transitLoss || 268}</span>
                </div>
                <div className="flex justify-between pt-2 text-sm font-extrabold text-emerald-800">
                  <span>Net In-Hand Bank Payout:</span>
                  <span>₹{activeTx.netPayout.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Right: Logistics & Real-Time Tracking */}
              <div className="space-y-3 bg-neutral-50 p-5 rounded-2xl border border-neutral-200 text-xs">
                <span className="font-bold text-neutral-900 block uppercase tracking-wider text-[11px]">
                  Logistics & Fulfillment
                </span>

                <div className="flex items-start gap-2.5">
                  <Truck className="w-4 h-4 text-emerald-600 mt-0.5" />
                  <div>
                    <span className="font-semibold text-neutral-900 block">{activeTx.logisticsPartner}</span>
                    <span className="text-neutral-500">Driver: {activeTx.driverName}</span>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-neutral-200 space-y-1">
                  <div className="flex justify-between text-neutral-600">
                    <span>Current Phase:</span>
                    <span className="font-bold text-neutral-900 uppercase">{currentStatus.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>Target Destination:</span>
                    <span className="font-semibold text-neutral-800">{activeTx.eta}</span>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900">
                  <span className="font-semibold block mb-0.5">Escrow Payment Security:</span>
                  <span className="text-[11px] leading-relaxed block text-emerald-800">
                    {activeTx.settlementCycle}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* HISTORICAL TRANSACTIONS TABLE */}
        <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-neutral-900">Past Completed Trades</h3>
            <span className="text-xs text-neutral-500">{pastTxs.length} completed transactions</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-700">
              <thead className="bg-neutral-50 text-neutral-500 font-bold border-b border-neutral-200">
                <tr>
                  <th className="py-3 px-4">Contract ID</th>
                  <th className="py-3 px-4">Buyer</th>
                  <th className="py-3 px-4">Lot</th>
                  <th className="py-3 px-4">Agreed Price</th>
                  <th className="py-3 px-4">Net Payout</th>
                  <th className="py-3 px-4">Payment Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {pastTxs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-neutral-500">
                      No archived trades yet.
                    </td>
                  </tr>
                ) : (
                  pastTxs.map((tx) => (
                    <tr key={tx.id} className="hover:bg-neutral-50/60">
                      <td className="py-3 px-4 font-mono font-medium">{tx.id}</td>
                      <td className="py-3 px-4 font-semibold text-neutral-900">{tx.buyer || tx.buyerName}</td>
                      <td className="py-3 px-4">{tx.commodity || tx.commodityName}</td>
                      <td className="py-3 px-4 font-semibold">₹{tx.ratePerQtl}/qtl</td>
                      <td className="py-3 px-4 font-bold text-emerald-800">
                        ₹{(tx.totalAmount || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-neutral-500">{tx.date || 'Recent'}</td>
                      <td className="py-3 px-4">
                        <span className="bg-emerald-50 text-emerald-800 font-semibold px-2 py-0.5 rounded-full text-[11px]">
                          {tx.escrowStatus || 'SETTLED'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => alert('Downloading Verified Weighment & Tax Receipt PDF')}
                          className="inline-flex items-center gap-1 text-[#ef4d23] hover:underline font-semibold"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          <span>Receipt</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
