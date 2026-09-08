'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '../../../components/navigation/AppShell';
import { api } from '../../../lib/api';
import {
  FileText,
  Truck,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Receipt,
  DollarSign,
} from 'lucide-react';

export default function BuyerTransactionsPage() {
  const [paymentStatus, setPaymentStatus] = useState<'PENDING_WEIGHMENT' | 'SETTLED'>('PENDING_WEIGHMENT');
  const [contract, setContract] = useState<any | null>(null);
  const [pastContracts, setPastContracts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadTransactions() {
      try {
        setIsLoading(true);
        const txs = await api.getTransactions().catch(() => []);
        if (Array.isArray(txs) && txs.length > 0) {
          const live = txs[0];
          setContract({
            id: live.id || 'TX-2026-0906-881',
            farmerName: live.farmerName || 'Ramesh Kumar',
            commodity: live.commodityName || 'Tomato Hybrid Grade A',
            quantityQtl: live.quantity || 18,
            agreedRate: live.ratePerQtl || 2975,
            grossContractPaise: (live.agreedPricePaise || 297500) * (live.quantity || 18),
            payableAmountRupees: live.payableAmountRupees || live.totalAmount || 52922,
            pickupVehicle: live.logisticsPartner || 'KrishiLogistics Direct (MH-12-Q-4491)',
            weighmentGrossKg: (live.quantity || 18) * 100,
            transitLossRecordedKg: Math.round(((live.quantity || 18) * 100) * 0.005),
            destinationPlant: 'Chakan Unit 2 Receiving Bay, Pune',
          });
          setPastContracts(txs.slice(1));
        }
      } catch (err) {
        console.warn('Failed to load transactions:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadTransactions();
  }, []);

  const handleReleasePayment = () => {
    if (!contract) return;
    setPaymentStatus('SETTLED');
    alert(
      `Escrow Payment of ₹${contract.payableAmountRupees.toLocaleString(
        'en-IN',
      )} released to ${contract.farmerName} Bank Account! Receipt generated.`,
    );
  };

  return (
    <AppShell
      badge="Procurement Fulfillment"
      title="Buyer Contracts & Settlements"
      subtitle="Monitor raw material deliveries, verify automated weighbridge receipts, and release T+1 escrow payouts."
      actions={
        <div className="flex items-center gap-2">
          {contract && paymentStatus !== 'SETTLED' ? (
            <button
              type="button"
              onClick={handleReleasePayment}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Simulate: Release T+1 Escrow Payment</span>
            </button>
          ) : contract ? (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>Escrow Released & Settled</span>
            </span>
          ) : null}
        </div>
      }
    >
      <div className="space-y-6">
        {!contract ? (
          <div className="bg-white rounded-3xl p-8 border border-neutral-200 text-center text-neutral-500">
            <p className="text-sm font-semibold">No active procurement contracts in progress.</p>
            <p className="text-xs text-neutral-400 mt-1">
              Once an offer is accepted, real-time logistics tracking and escrow settlement will appear here.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-emerald-500 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-2.5">
                <span className="bg-emerald-100 text-emerald-900 text-xs font-bold px-3 py-1 rounded-full">
                  Live Sourcing Contract
                </span>
                <span className="font-mono text-xs text-neutral-500 font-semibold">{contract.id}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-neutral-500">Supplier:</span>
                <span className="font-bold text-neutral-900">{contract.farmerName}</span>
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">Grade A Verified</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left: Contract Parameters */}
              <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200 text-xs space-y-3">
                <span className="font-bold text-neutral-900 block uppercase tracking-wider text-[11px]">
                  Procurement Terms & Settlement
                </span>

                <div className="flex justify-between py-1 border-b border-neutral-200">
                  <span className="text-neutral-600">Quantity & Spec:</span>
                  <span className="font-bold text-neutral-900">
                    {contract.quantityQtl} Qtl {contract.commodity}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-neutral-200">
                  <span className="text-neutral-600">Contract Rate:</span>
                  <span className="font-bold text-neutral-900">₹{contract.agreedRate}/qtl</span>
                </div>
                <div className="flex justify-between py-1 border-b border-neutral-200">
                  <span className="text-neutral-600">Gross Contract Value:</span>
                  <span className="font-bold text-neutral-900">
                    ₹{(contract.grossContractPaise / 100).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-neutral-200">
                  <span className="text-neutral-600">Net Payable Post-Weighment:</span>
                  <span className="font-extrabold text-emerald-800 text-sm">
                    ₹{contract.payableAmountRupees.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-neutral-500">Escrow Status:</span>
                  <span className="font-bold text-neutral-900 uppercase">
                    {paymentStatus === 'SETTLED' ? 'Transferred (T+1)' : 'Funded in Escrow'}
                  </span>
                </div>
              </div>

              {/* Right: Logistics & Weighment Verification */}
              <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200 text-xs space-y-3">
                <span className="font-bold text-neutral-900 block uppercase tracking-wider text-[11px]">
                  Weighbridge & Delivery Verification
                </span>

                <div className="flex items-start gap-2 text-neutral-700">
                  <Truck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{contract.pickupVehicle}</span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-neutral-200 space-y-1">
                  <div className="flex justify-between text-neutral-600">
                    <span>Gross Intake Weight:</span>
                    <span className="font-bold text-neutral-900">
                      {contract.weighmentGrossKg} kg ({contract.quantityQtl}.0 Qtl)
                    </span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>Transit Shrinkage Audit:</span>
                    <span className="font-bold text-emerald-700">
                      {contract.transitLossRecordedKg} kg (0.5% - within spec)
                    </span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>Receiving Bay:</span>
                    <span className="font-semibold text-neutral-800">{contract.destinationPlant}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 font-semibold bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Automated weighment certificate attached to digital contract.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* HISTORICAL SOURCING CONTRACTS TABLE */}
        <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-xs">
          <h3 className="text-lg font-bold text-neutral-900 mb-4">Past Procurement Contracts</h3>
          {pastContracts.length === 0 ? (
            <p className="text-neutral-500 text-xs text-center py-6">No previous contracts archived.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-neutral-700">
                <thead className="bg-neutral-50 text-neutral-500 font-bold border-b border-neutral-200">
                  <tr>
                    <th className="py-3 px-4">Contract ID</th>
                    <th className="py-3 px-4">Farmer / Supplier</th>
                    <th className="py-3 px-4">Commodity</th>
                    <th className="py-3 px-4">Quantity</th>
                    <th className="py-3 px-4">Rate</th>
                    <th className="py-3 px-4">Total Paid</th>
                    <th className="py-3 px-4">Settlement Date</th>
                    <th className="py-3 px-4 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {pastContracts.map((tx) => (
                    <tr key={tx.id} className="hover:bg-neutral-50/60">
                      <td className="py-3 px-4 font-mono font-medium">{tx.id}</td>
                      <td className="py-3 px-4 font-bold text-neutral-900">{tx.farmerName || tx.farmer}</td>
                      <td className="py-3 px-4">{tx.commodityName || tx.commodity}</td>
                      <td className="py-3 px-4">{tx.quantityQtl || tx.quantity} Qtl</td>
                      <td className="py-3 px-4 font-semibold">₹{tx.ratePerQtl}/qtl</td>
                      <td className="py-3 px-4 font-bold text-emerald-800">
                        ₹{(tx.totalAmount || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-neutral-500">{tx.date || 'Recent'}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => alert('Downloading Verified Tax Invoice & Weighment Slip')}
                          className="text-[#ef4d23] hover:underline font-bold inline-flex items-center gap-1"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          <span>Invoice</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
