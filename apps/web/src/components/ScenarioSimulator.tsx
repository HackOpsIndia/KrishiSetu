'use client';

import React from 'react';
import { RefreshCwIcon, TruckIcon } from './icons';

interface ScenarioSimulatorProps {
  quantity: number;
  onQuantityChange: (q: number) => void;
  transportRate: number;
  onTransportRateChange: (rate: number) => void;
  fuelMultiplier: number;
  onFuelMultiplierChange: (mult: number) => void;
  onResetToDefaults: () => void;
}

export function ScenarioSimulator({
  quantity,
  onQuantityChange,
  transportRate,
  onTransportRateChange,
  fuelMultiplier,
  onFuelMultiplierChange,
  onResetToDefaults,
}: ScenarioSimulatorProps) {
  // Estimated impact calculation
  const estTransportCostPerQtl = Math.round((transportRate * fuelMultiplier * 35) / Math.max(1, quantity));

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/90 shadow-sm text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="p-2 rounded-xl bg-orange-50 border border-orange-200 text-[#ef4d23]">
              <TruckIcon className="w-4 h-4" />
            </span>
            <h3 className="text-base sm:text-lg font-bold text-neutral-900 tracking-tight">
              Interactive Logistics &amp; Sensitivity Simulator
            </h3>
          </div>
          <p className="text-xs text-neutral-500">
            Simulate harvest volume shifts and diesel price fluctuations on net in-hand realization in real time.
          </p>
        </div>

        <button
          type="button"
          onClick={onResetToDefaults}
          className="self-start sm:self-auto text-xs text-neutral-600 hover:text-neutral-900 flex items-center gap-1.5 bg-neutral-100 hover:bg-neutral-200 px-3.5 py-1.5 rounded-full transition-all border border-neutral-200 cursor-pointer font-medium"
        >
          <RefreshCwIcon className="w-3.5 h-3.5" />
          <span>Reset Defaults</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
        {/* Slider 1: Lot Size */}
        <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/70 space-y-2.5">
          <div className="flex justify-between items-center">
            <span className="text-xs text-neutral-600 font-medium">Harvest Lot Size</span>
            <span className="text-xl font-bold font-instrument text-neutral-900">
              {quantity} Quintals
            </span>
          </div>

          <input
            type="range"
            min="5"
            max="100"
            step="1"
            value={quantity}
            onChange={(e) => onQuantityChange(Number(e.target.value))}
            className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-[#ef4d23]"
          />

          <div className="flex justify-between text-[11px] text-neutral-500 font-medium">
            <span>5 Qtl (Smallholder)</span>
            <span className={quantity >= 50 ? 'text-[#ef4d23] font-bold' : ''}>
              50 Qtl (Bulk)
            </span>
            <span>100 Qtl</span>
          </div>
        </div>

        {/* Slider 2: Base Freight Rate */}
        <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/70 space-y-2.5">
          <div className="flex justify-between items-center">
            <span className="text-xs text-neutral-600 font-medium">Base Freight Rate</span>
            <span className="text-xl font-bold font-instrument text-neutral-900">
              ₹{transportRate}/km
            </span>
          </div>

          <input
            type="range"
            min="15"
            max="40"
            step="1"
            value={transportRate}
            onChange={(e) => onTransportRateChange(Number(e.target.value))}
            className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-800"
          />

          <div className="flex justify-between text-[11px] text-neutral-500 font-medium">
            <span>₹15/km (Aggregated)</span>
            <span>₹25/km (Standard)</span>
            <span>₹40/km (Spot Rate)</span>
          </div>
        </div>

        {/* Slider 3: Fuel Multiplier */}
        <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/70 space-y-2.5">
          <div className="flex justify-between items-center">
            <span className="text-xs text-neutral-600 font-medium">Fuel &amp; Road Factor</span>
            <span className="text-xl font-bold font-instrument text-neutral-900">
              {fuelMultiplier.toFixed(2)}x
            </span>
          </div>

          <input
            type="range"
            min="1.0"
            max="1.8"
            step="0.05"
            value={fuelMultiplier}
            onChange={(e) => onFuelMultiplierChange(Number(e.target.value))}
            className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-800"
          />

          <div className="flex justify-between text-[11px] text-neutral-500 font-medium">
            <span>1.0x (Normal Highway)</span>
            <span>1.3x (Monsoon / Rural)</span>
            <span>1.8x (Peak Diesel)</span>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-neutral-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-neutral-600">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>
            Simulated Freight Burden: <strong className="text-neutral-900 font-semibold">₹{estTransportCostPerQtl}/qtl</strong> for 35km transit
          </span>
        </div>
        <span className="text-[11px] text-neutral-500">
          Scaling to 50 Qtl unlocks 40% bulk logistics discount
        </span>
      </div>
    </div>
  );
}
