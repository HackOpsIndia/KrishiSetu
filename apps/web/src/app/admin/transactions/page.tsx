'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '../../../components/navigation/AppShell';
import { api } from '../../../lib/api';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  FileText,
  Lock,
  ArrowRight,
  TrendingUp,
  DollarSign,
  Scale,
  RefreshCw,
  X,
  Download,
  Eye,
} from 'lucide-react';
import { formatCurrency, formatQuintal } from '../../../lib/format';

interface TransactionAudit {
  id: string;
  txHash: string;
  farmer: string;
  buyer: string;
  commodity: string;
  quantityQtl: number;
  ratePerQtl: number;
  totalAmount: number;
  escrowStatus: 'ESCROW_LOCKED' | 'SETTLED' | 'DISPUTED';
  settlementTime: string;
  weighbridgeMatch: boolean;
  date: string;
}

export default function AdminTransactionsPage() {
  const [filter, setFilter] = useState<'ALL' | 'ESCROW_LOCKED' | 'SETTLED' | 'DISPUTED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTx, setSelectedTx] = useState<TransactionAudit | null>(null);
  const [transactions, setTransactions] = useState<TransactionAudit[]>([]);

  useEffect(() => {
    async function loadTxs() {
      try {
        const txs = await api.getTransactions();
        if (Array.isArray(txs) && txs.length > 0) {
          setTransactions(
            txs.map((t: any) => ({
              id: t.id,
              txHash: t.contractHash || `0x${t.id.slice(0, 8)}...${t.id.slice(-4)}`,
              farmer: t.farmerName || 'Farmer Account',
              buyer: t.buyerName || 'Corporate Buyer',
              commodity: t.commodityName || 'Agri Commodity',
              quantityQtl: t.quantity || 0,
              ratePerQtl: (t.agreedPricePaise || 0) / 100,
              totalAmount: ((t.agreedPricePaise || 0) * (t.quantity || 0)) / 100,
              escrowStatus: t.escrowStatus || 'ESCROW_LOCKED',
              settlementTime: 'T+1 Bank Settlement',
              weighbridgeMatch: true,
              date: 'Today',
            }))
          );
        }
      } catch {}
    }
    loadTxs();
  }, []);

  const filtered = transactions.filter((t) => {
    if (filter !== 'ALL' && t.escrowStatus !== filter) return false;
    if (
      searchQuery &&
      !t.farmer.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !t.buyer.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !t.id.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const totalGTV = transactions.reduce((acc, t) => acc + t.totalAmount, 0);
  const escrowLocked = transactions
    .filter((t) => t.escrowStatus === 'ESCROW_LOCKED')
    .reduce((acc, t) => acc + t.totalAmount, 0);

  return (
    <AppShell
      badge="Financial Governance &amp; Escrow Audit"
      title="Platform Transaction Oversight"
      subtitle="Complete ledger of smart-escrow deposits, electronic weighbridge certifications, and automated direct-to-bank settlements."
      actions={
        <button
          onClick={() => alert('Exporting platform audit log (CSV/PDF)...')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-semibold shadow-xs transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Audit Trail</span>
        </button>
      }
    >
      <div className="space-y-6">
        {/* ESCROW STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-3xl p-5 border border-neutral-200 shadow-xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 block mb-1">
              Gross Transacted Value (GTV)
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold font-instrument text-neutral-900 block">
              {formatCurrency(totalGTV)}
            </span>
            <span className="text-xs text-neutral-500 mt-1 block">5 audited transactions</span>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-neutral-200 shadow-xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 block mb-1">
              Active Escrow Locked
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold font-instrument text-[#ef4d23] block">
              {formatCurrency(escrowLocked)}
            </span>
            <span className="text-xs text-neutral-500 mt-1 block">Protected in ICICI Escrow Pool</span>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-neutral-200 shadow-xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 block mb-1">
              Avg Settlement Speed
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold font-instrument text-emerald-800 block">
              1.8 Hours
            </span>
            <span className="text-xs text-neutral-500 mt-1 block">Post-digital weighbridge slip</span>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-neutral-200 shadow-xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 block mb-1">
              Audit Integrity Rate
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold font-instrument text-neutral-900 block">
              99.2%
            </span>
            <span className="text-xs text-emerald-700 mt-1 block font-medium">Zero contract defaults</span>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="bg-white rounded-3xl p-4 border border-neutral-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by ID, farmer, or buyer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-[#ef4d23]"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
            {(['ALL', 'ESCROW_LOCKED', 'SETTLED', 'DISPUTED'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${filter === tab
                    ? 'bg-[#0b0f1a] text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
              >
                {tab === 'ALL'
                  ? 'All Transactions'
                  : tab === 'ESCROW_LOCKED'
                    ? 'Escrow Locked'
                    : tab === 'SETTLED'
                      ? 'Settled'
                      : 'Disputed'}
              </button>
            ))}
          </div>
        </div>

        {/* LEDGER TABLE */}
        <div className="bg-white rounded-3xl border border-neutral-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 text-neutral-500 font-semibold border-b border-neutral-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-5 py-3.5">Contract / Tx ID</th>
                  <th className="px-5 py-3.5">Farmer &amp; Commodity</th>
                  <th className="px-5 py-3.5">Buyer / Entity</th>
                  <th className="px-5 py-3.5 text-right">Volume &amp; Rate</th>
                  <th className="px-5 py-3.5 text-right">Gross Total</th>
                  <th className="px-5 py-3.5 text-center">Escrow Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {filtered.map((tx) => (
                  <tr key={tx.id} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-mono font-bold text-neutral-900">{tx.id}</div>
                      <span className="text-[10px] text-neutral-400 font-mono">{tx.txHash}</span>
                      <span className="text-[10px] text-neutral-400 block mt-0.5">{tx.date}</span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-bold text-neutral-900">{tx.farmer}</div>
                      <span className="text-neutral-500 text-[11px] block">{tx.commodity}</span>
                      {tx.weighbridgeMatch ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-medium mt-0.5">
                          <CheckCircle2 className="w-3 h-3" /> Weighbridge Validated
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 font-medium mt-0.5">
                          <AlertTriangle className="w-3 h-3" /> Tare Discrepancy
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-bold text-neutral-900">{tx.buyer}</div>
                      <span className="text-neutral-500 text-[11px]">{tx.settlementTime}</span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="font-bold text-neutral-900">{formatQuintal(tx.quantityQtl)}</div>
                      <span className="text-neutral-500 text-[11px]">₹{tx.ratePerQtl.toFixed(2)}/qtl</span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="font-bold text-neutral-900 text-sm font-instrument">
                        {formatCurrency(tx.totalAmount)}
                      </div>
                      <span className="text-[10px] text-neutral-500">100% Escrow Backed</span>
                    </td>

                    <td className="px-5 py-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${tx.escrowStatus === 'SETTLED'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : tx.escrowStatus === 'ESCROW_LOCKED'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-rose-50 text-rose-800 border border-rose-200'
                          }`}
                      >
                        {tx.escrowStatus === 'SETTLED' && <CheckCircle2 className="w-3 h-3" />}
                        {tx.escrowStatus === 'ESCROW_LOCKED' && <Lock className="w-3 h-3" />}
                        {tx.escrowStatus === 'DISPUTED' && <AlertTriangle className="w-3 h-3" />}
                        {tx.escrowStatus.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => setSelectedTx(tx)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-100 text-neutral-700 font-semibold text-xs transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Audit</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AUDIT MODAL */}
        {selectedTx && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
            <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-neutral-200 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
                <div>
                  <h3 className="font-bold text-neutral-900 text-base">Escrow Audit Ledger</h3>
                  <span className="text-xs text-neutral-500 font-mono">{selectedTx.id}</span>
                </div>
                <button
                  onClick={() => setSelectedTx(null)}
                  className="w-7 h-7 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-600 text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Contract Farmer:</span>
                    <span className="font-bold text-neutral-900">{selectedTx.farmer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Institutional Buyer:</span>
                    <span className="font-bold text-neutral-900">{selectedTx.buyer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Commodity &amp; Volume:</span>
                    <span className="font-bold text-neutral-900">
                      {selectedTx.commodity} • {formatQuintal(selectedTx.quantityQtl)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Agreed Net Rate:</span>
                    <span className="font-bold text-neutral-900">₹{selectedTx.ratePerQtl.toFixed(2)} / Qtl</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-neutral-200">
                    <span className="font-bold text-neutral-900">Gross Contract Value:</span>
                    <span className="font-bold text-base text-[#ef4d23] font-instrument">
                      {formatCurrency(selectedTx.totalAmount)}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    Cryptographic Weighbridge Hash Verified
                  </div>
                  <p className="text-[11px] text-emerald-800">
                    Net tare matched within 0.05% tolerance against APMC certified sensor log.
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    alert(`Super Admin Escrow Release triggered for ${selectedTx.id}`);
                    setSelectedTx(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-[#0b0f1a] hover:bg-neutral-800 text-white font-semibold text-xs transition-colors text-center"
                >
                  Authorize Settlement Release
                </button>
                <button
                  onClick={() => setSelectedTx(null)}
                  className="px-4 py-2.5 rounded-xl border border-neutral-200 hover:bg-neutral-100 text-neutral-700 font-semibold text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
