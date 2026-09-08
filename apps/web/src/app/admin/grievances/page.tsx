'use client';

import React, { useState } from 'react';
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

  const [tickets, setTickets] = useState<GrievanceTicket[]>([
    {
      id: 'GRV-2026-042',
      raisedBy: 'Farmer',
      farmerName: 'Anand Shinde',
      buyerName: 'Metro Cash & Carry',
      category: 'WEIGHT_DISCREPANCY',
      title: 'Discrepancy between farm tare (45 Qtl) and buyer intake (43.2 Qtl)',
      lotId: 'LOT-ONION-9921',
      disputedAmount: 3564.00,
      status: 'UNDER_REVIEW',
      createdAt: 'Today, 08:15 AM',
      description: 'The buyer gate weighbridge registered 43.2 Qtl while the village electronic weighbridge receipt verified 45.0 Qtl before loading.',
    },
    {
      id: 'GRV-2026-039',
      raisedBy: 'Farmer',
      farmerName: 'Kailash Jadhav',
      buyerName: 'Vashi Fresh Wholesale',
      category: 'QUALITY_DOWNGRADE',
      title: 'Buyer downgraded Grade A Tomato to Grade B citing minor blemishes',
      lotId: 'LOT-TOMATO-8840',
      disputedAmount: 8200.00,
      status: 'OPEN',
      createdAt: 'Yesterday, 03:40 PM',
      description: 'Buyer arbitrarily deducted ₹250/qtl upon arrival. AI sorting photo scan verified 92% uniform grade.',
    },
    {
      id: 'GRV-2026-031',
      raisedBy: 'Buyer',
      farmerName: 'Dnyaneshwar More',
      buyerName: 'Pune Veggie Hub',
      category: 'LOGISTICS_DAMAGE',
      title: 'Crate damage during unpaved transit',
      lotId: 'LOT-TOMATO-7712',
      disputedAmount: 4100.00,
      status: 'RESOLVED',
      createdAt: '05 Sep 2026',
      description: '10 crates damaged due to vehicle suspension failure. Transporter insurance claimed.',
      resolutionNote: 'Settled via KrishiSetu Transit Micro-Insurance pool. Full payout issued to farmer.',
    },
  ]);

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
              2 Open
            </span>
            <span className="text-xs text-neutral-500 mt-1 block">1 Under Active Review</span>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-neutral-200 shadow-xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 block mb-1">
              24h Resolution Rate
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold font-instrument text-emerald-800 block">
              94.6%
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
              {formatCurrency(11764)}
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
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                  filter === tab
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
          {filteredTickets.map((ticket) => (
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
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      ticket.status === 'RESOLVED'
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
          ))}
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
