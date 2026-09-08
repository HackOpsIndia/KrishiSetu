'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '../../../components/navigation/AppShell';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  ShieldAlert,
  Scale,
  FileText,
  User,
  Building2,
  ArrowRight,
  MessageSquare,
} from 'lucide-react';
import { formatCurrency } from '../../../lib/format';

interface GrievanceTicket {
  id: string;
  raisedBy: string;
  farmerName: string;
  buyerName: string;
  category: 'WEIGHT_DISCREPANCY' | 'QUALITY_DOWNGRADE' | 'PAYMENT_DELAY' | 'LOGISTICS_DAMAGE';
  title: string;
  lotId: string;
  disputedAmount: number;
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED';
  createdAt: string;
  description: string;
  resolutionNote?: string;
}

export default function AdminGrievancesPage() {
  const [filter, setFilter] = useState<'ALL' | 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<GrievanceTicket | null>(null);
  const [tickets, setTickets] = useState<GrievanceTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Seed realistic demo grievance data on mount
  useEffect(() => {
    const seedGrievances: GrievanceTicket[] = [
      {
        id: 'GRV-2024-001',
        raisedBy: 'FARMER',
        farmerName: 'Ramesh Kumar',
        buyerName: 'FreshMart Foods',
        category: 'WEIGHT_DISCREPANCY',
        title: 'Weighbridge discrepancy: 2.3 qtl shortage on Wheat delivery',
        lotId: 'LOT-0042',
        disputedAmount: 5764,
        status: 'OPEN',
        createdAt: '2024-12-18',
        description:
          'Farmer recorded 24.5 qtl at origin weighbridge but buyer claims 22.2 qtl at destination. Electronic weighbridge log attached. Requesting escrow hold and re-inspection.',
      },
      {
        id: 'GRV-2024-002',
        raisedBy: 'FARMER',
        farmerName: 'Sita Devi',
        buyerName: 'AgriPro Industries',
        category: 'QUALITY_DOWNGRADE',
        title: 'AI-graded A-grade Rice downgraded to B by buyer',
        lotId: 'LOT-0087',
        disputedAmount: 6000,
        status: 'UNDER_REVIEW',
        createdAt: '2024-12-17',
        description:
          'Platform AI quality engine graded lot as Grade-A (moisture 12.8%, FN 315). Buyer re-graded as B citing higher broken grain %. Photo evidence and AI report attached for conciliation.',
      },
      {
        id: 'GRV-2024-003',
        raisedBy: 'BUYER',
        farmerName: 'Manoj Patel',
        buyerName: 'Metro Wholesale',
        category: 'PAYMENT_DELAY',
        title: 'Payment released but not received in farmer UPI account',
        lotId: 'LOT-0063',
        disputedAmount: 0,
        status: 'RESOLVED',
        createdAt: '2024-12-15',
        description:
          'Buyer released payment via escrow, but farmer reports UPI credit not received after 48 hours. Bank reconciliation confirmed delay due to NPCI settlement queue.',
        resolutionNote:
          'Payment confirmed credited after NPCI settlement cycle. Verified via bank statement upload. Case closed with no further action required.',
      },
      {
        id: 'GRV-2024-004',
        raisedBy: 'FARMER',
        farmerName: 'Gita Sharma',
        buyerName: 'Organic Valley Co.',
        category: 'LOGISTICS_DAMAGE',
        title: 'Mustard consignment damaged during transit — wet tarpaulin',
        lotId: 'LOT-0101',
        disputedAmount: 0,
        status: 'OPEN',
        createdAt: '2024-12-19',
        description:
          'Farmer alleges that 3.5 qtl mustard was damaged due to rain exposure during transit. Logistics partner used insufficient tarpaulin cover. Photo evidence of wet gunny bags attached.',
      },
      {
        id: 'GRV-2024-005',
        raisedBy: 'BUYER',
        farmerName: 'Vikram Singh',
        buyerName: 'Spice Hub Exports',
        category: 'QUALITY_DOWNGRADE',
        title: 'Turmeric curcumin content below agreed specification',
        lotId: 'LOT-0122',
        disputedAmount: 0,
        status: 'RESOLVED',
        createdAt: '2024-12-10',
        description:
          'Buyer lab test shows curcumin at 2.8% vs agreed 3.5% minimum. AI grading was based on visual assessment only. Requesting partial refund from escrow.',
        resolutionNote:
          'Mutually conciliated 50/50 settlement. ₹4,200 released to buyer, remaining escrow released to farmer. Both parties accepted digital lab report.',
      },
    ];
    // Simulate API fetch delay
    const timer = setTimeout(() => {
      setTickets(seedGrievances);
      setIsLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const filteredTickets = tickets.filter((t) => {
    if (filter !== 'ALL' && t.status !== filter) return false;
    if (
      searchQuery &&
      !t.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !t.buyerName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !t.id.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !t.title.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const handleResolveTicket = (ticketId: string, resolution: string) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? { ...t, status: 'RESOLVED', resolutionNote: resolution }
          : t
      )
    );
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket((curr) => curr ? { ...curr, status: 'RESOLVED', resolutionNote: resolution } : null);
    }
  };

  // Dynamic KPI calculations
  const openCount = tickets.filter((t) => t.status === 'OPEN').length;
  const reviewCount = tickets.filter((t) => t.status === 'UNDER_REVIEW').length;
  const resolvedCount = tickets.filter((t) => t.status === 'RESOLVED').length;
  const totalDisputed = tickets
    .filter((t) => t.status !== 'RESOLVED')
    .reduce((sum, t) => sum + t.disputedAmount, 0);
  const resolutionRate = tickets.length > 0 ? ((resolvedCount / tickets.length) * 100).toFixed(1) : '0.0';

  return (
    <AppShell
      badge="Farmer Protection &amp; Dispute Mediation"
      title="Grievance Resolution Center"
      subtitle="Neutral conciliation desk enforcing standard weighbridge calibrations, AI-verified grading integrity, and escrow dispute settlement."
    >
      <div className="space-y-6">
        {/* KPI OVERVIEW */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-3xl p-5 border border-neutral-200 shadow-xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 block mb-1">
              Active Grievances
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold font-instrument text-[#ef4d23] block">
              {openCount} Open
            </span>
            <span className="text-xs text-neutral-500 mt-1 block">{reviewCount} Under Active Review</span>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-neutral-200 shadow-xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 block mb-1">
              Resolution Rate
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold font-instrument text-emerald-800 block">
              {resolutionRate}%
            </span>
            <span className="text-xs text-neutral-500 mt-1 block">Within statutory SLA</span>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-neutral-200 shadow-xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 block mb-1">
              Average Conciliation Time
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold font-instrument text-neutral-900 block">
              4.2 Hours
            </span>
            <span className="text-xs text-neutral-500 mt-1 block">Facilitated via photo audit</span>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-neutral-200 shadow-xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 block mb-1">
              Escrow Disputed Sum
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold font-instrument text-neutral-900 block">
              {formatCurrency(totalDisputed)}
            </span>
            <span className="text-xs text-amber-700 font-medium mt-1 block">Safe in escrow hold</span>
          </div>
        </div>

        {/* SEARCH & FILTER BAR */}
        <div className="bg-white rounded-3xl p-4 border border-neutral-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search grievances, farmers, buyers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-[#ef4d23]"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
            {(['ALL', 'OPEN', 'UNDER_REVIEW', 'RESOLVED'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${filter === tab
                    ? 'bg-[#0b0f1a] text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
              >
                {tab === 'ALL'
                  ? 'All Grievances'
                  : tab === 'OPEN'
                    ? 'Action Required'
                    : tab === 'UNDER_REVIEW'
                      ? 'Under Review'
                      : 'Resolved'}
              </button>
            ))}
          </div>
        </div>

        {/* GRIEVANCE LIST */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-xs animate-pulse">
                  <div className="h-4 bg-neutral-200 rounded w-1/3 mb-3" />
                  <div className="h-3 bg-neutral-100 rounded w-2/3 mb-2" />
                  <div className="h-3 bg-neutral-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 border border-neutral-200 shadow-xs text-center">
              <AlertTriangle className="w-8 h-8 text-neutral-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-neutral-500">No grievances found</p>
              <p className="text-xs text-neutral-400 mt-1">Try adjusting your filters or search query.</p>
            </div>
          ) : (
          filteredTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-xs hover:border-neutral-300 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded">
                    {ticket.id}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${ticket.status === 'RESOLVED'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : ticket.status === 'UNDER_REVIEW'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}
                  >
                    {ticket.status.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-neutral-400">• {ticket.createdAt}</span>
                </div>

                <h4 className="font-bold text-sm text-neutral-900">{ticket.title}</h4>
                <p className="text-xs text-neutral-600 line-clamp-2">{ticket.description}</p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500 pt-1">
                  <span>
                    Farmer: <strong className="text-neutral-800">{ticket.farmerName}</strong>
                  </span>
                  <span>
                    Buyer: <strong className="text-neutral-800">{ticket.buyerName}</strong>
                  </span>
                  <span>
                    Disputed Escrow: <strong className="text-[#ef4d23]">{formatCurrency(ticket.disputedAmount)}</strong>
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedTicket(ticket)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0b0f1a] hover:bg-neutral-800 text-white font-semibold text-xs transition-colors shrink-0"
              >
                <span>Mediate Case</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
          )}
        </div>

        {/* MEDIATION MODAL */}
        {selectedTicket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
            <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-neutral-200 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">
                    Dispute Mediation Room
                  </span>
                  <h3 className="font-bold text-neutral-900 text-base">{selectedTicket.id}</h3>
                </div>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="w-7 h-7 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-600 text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Subject:</span>
                    <span className="font-bold text-neutral-900">{selectedTicket.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Farmer:</span>
                    <span className="font-bold text-neutral-900">{selectedTicket.farmerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Buyer:</span>
                    <span className="font-bold text-neutral-900">{selectedTicket.buyerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Disputed Value:</span>
                    <span className="font-bold text-base text-[#ef4d23] font-instrument">
                      {formatCurrency(selectedTicket.disputedAmount)}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-neutral-100 rounded-2xl border border-neutral-200">
                  <span className="font-semibold text-neutral-800 block mb-1">Grievance Description:</span>
                  <p className="text-neutral-600 leading-relaxed">{selectedTicket.description}</p>
                </div>

                {selectedTicket.resolutionNote && (
                  <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900 space-y-1">
                    <span className="font-bold block">Resolution Recorded:</span>
                    <p className="text-[11px] text-emerald-800">{selectedTicket.resolutionNote}</p>
                  </div>
                )}
              </div>

              {selectedTicket.status !== 'RESOLVED' ? (
                <div className="space-y-2 pt-2">
                  <button
                    onClick={() =>
                      handleResolveTicket(
                        selectedTicket.id,
                        'Verified with electronic weighbridge server log. Farmer claim approved, full escrow released to farmer.'
                      )
                    }
                    className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs transition-colors"
                  >
                    Release Escrow to Farmer (Claim Approved)
                  </button>
                  <button
                    onClick={() =>
                      handleResolveTicket(
                        selectedTicket.id,
                        'Mutually conciliated 50/50 compromise with digital re-inspection.'
                      )
                    }
                    className="w-full py-2.5 rounded-xl bg-[#0b0f1a] hover:bg-neutral-800 text-white font-semibold text-xs transition-colors"
                  >
                    Authorize 50/50 Settlement Split
                  </button>
                </div>
              ) : (
                <div className="pt-2">
                  <button
                    onClick={() => setSelectedTicket(null)}
                    className="w-full py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold text-xs"
                  >
                    Close Mediation View
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
