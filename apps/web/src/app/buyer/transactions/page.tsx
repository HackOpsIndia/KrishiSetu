'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '../../../components/navigation/AppShell';
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

  const contract = {
    id: 'TX-2026-0906-881',
    farmerName: 'Ramesh Kumar',
    farmerLocation: 'Dehu Road Cluster, Haveli, Pune',
    commodity: 'Tomato Hybrid Grade A',
    quantityQtl: 18,
    agreedRate: 2975,
    grossContractPaise: 5355000, // ₹53,550
    pickupVehicle: 'KrishiLogistics MH-12-Q-4491 (Driver: Vinod Shinde)',
    destinationPlant: 'Chakan Processing Facility, Bay 4',
    weighmentGrossKg: 1800,
    weighmentTareKg: 0,
    transitLossRecordedKg: 9, // 0.5%
    payableAmountRupees: 53282,
  };

  const handleReleasePayment = () => {
    setPaymentStatus('SETTLED');
    alert(`Escrow Payment of ₹${contract.payableAmountRupees.toLocaleString('en-IN')} released to Ramesh Kumar SBI Bank Account! Receipt generated.`);
  };

  return (
    <AppShell
      badge="Procurement Fulfillment"
      title="Buyer Contracts &amp; Settlements"
      subtitle="Monitor raw material deliveries, verify automated weighbridge receipts, and release T+1 escrow payouts."
      actions={
        <div className="flex items-center gap-2">
          {paymentStatus !== 'SETTLED' ? (
            <button
              type="button"
              onClick={handleReleasePayment}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Simulate: Release T+1 Escrow Payment</span>
            </button>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>Escrow Released &amp; Settled</span>
            </span>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        {/* ACTIVE PROCUREMENT CONTRACT CARD */}
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
                Procurement Terms &amp; Settlement
              </span>

              <div className="flex justify-between py-1 border-b border-neutral-200">
                <span className="text-neutral-600">Quantity &amp; Spec:</span>
                <span className="font-bold text-neutral-900">{contract.quantityQtl} Qtl {contract.commodity}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-200">
                <span className="text-neutral-600">Contract Rate:</span>
                <span className="font-bold text-neutral-900">₹{contract.agreedRate}/qtl</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-200">
                <span className="text-neutral-600">Gross Contract Value:</span>
                <span className="font-bold text-neutral-900">₹{(contract.grossContractPaise / 100).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-200">
                <span className="text-neutral-600">Net Payable Post-Weighment:</span>
                <span className="font-extrabold text-emerald-800 text-sm">₹{contract.payableAmountRupees.toLocaleString('en-IN')}</span>
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
                Weighbridge &amp; Delivery Verification
              </span>

              <div className="flex items-start gap-2 text-neutral-700">
                <Truck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{contract.pickupVehicle}</span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-neutral-200 space-y-1">
                <div className="flex justify-between text-neutral-600">
                  <span>Gross Intake Weight:</span>
                  <span className="font-bold text-neutral-900">{contract.weighmentGrossKg} kg (18.0 Qtl)</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Transit Shrinkage Audit:</span>
                  <span className="font-bold text-emerald-700">{contract.transitLossRecordedKg} kg (0.5% - within spec)</span>
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

        {/* HISTORICAL SOURCING CONTRACTS TABLE */}
        <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-xs">
          <h3 className="text-lg font-bold text-neutral-900 mb-4">Past Procurement Contracts</h3>
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
                <tr className="hover:bg-neutral-50/60">
                  <td className="py-3 px-4 font-mono font-medium">TX-2026-0818-442</td>
                  <td className="py-3 px-4 font-bold text-neutral-900">Pune FPO Collective</td>
                  <td className="py-3 px-4">Tomato Hybrid Grade A</td>
                  <td className="py-3 px-4">50 Qtl</td>
                  <td className="py-3 px-4 font-semibold">₹2,920/qtl</td>
                  <td className="py-3 px-4 font-bold text-emerald-800">₹1,46,000.00</td>
                  <td className="py-3 px-4 text-neutral-500">Aug 19, 2026</td>
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
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
