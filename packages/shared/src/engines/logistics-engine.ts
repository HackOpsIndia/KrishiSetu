// ============================================================
// KrishiSetu — Logistics Cost Engine
// Single authoritative source for distance/cost calculations.
// Other engines consume results from this — no duplicate formulas.
// ============================================================

import { CostConfidence, LogisticsCostResult } from '../types';

export interface LogisticsConfig {
  transportRatePerKmPaise: number;  // ₹22/km = 2200 paise
  roadFactor: number;               // 1.3 haversine → road
}

/**
 * Calculate logistics cost for a transport leg.
 * For buyer pickup, returns cost=0 but preserves distance.
 */
export function calculateLogisticsCost(
  distanceKm: number,
  quantity: number,
  config: LogisticsConfig,
  buyerProvidesPickup: boolean = false,
): LogisticsCostResult {
  if (distanceKm < 0) {
    throw new Error(`Invalid distance: ${distanceKm}. Must be non-negative.`);
  }
  if (quantity <= 0) {
    throw new Error(`Invalid quantity: ${quantity}. Must be positive.`);
  }

  if (buyerProvidesPickup) {
    return {
      distanceKm,
      estimatedCostPaise: 0,
      costPerQuintalPaise: 0,
      estimatedDurationMinutes: 0,
      vehicleType: 'BUYER_VEHICLE',
      ratePerKmPaise: config.transportRatePerKmPaise,
      source: 'BUYER_PICKUP',
      confidence: CostConfidence.HIGH,
    };
  }

  const totalCost = distanceKm * config.transportRatePerKmPaise;
  const costPerQtl = Math.round(totalCost / quantity);
  const durationMinutes = Math.round(distanceKm / 40 * 60); // avg 40 km/h

  return {
    distanceKm,
    estimatedCostPaise: totalCost,
    costPerQuintalPaise: costPerQtl,
    estimatedDurationMinutes: durationMinutes,
    vehicleType: 'TEMPO',
    ratePerKmPaise: config.transportRatePerKmPaise,
    source: 'DEMO_PROVIDER',
    confidence: CostConfidence.HIGH,
  };
}

/**
 * Calculate road distance from haversine distance.
 * Used ONLY when computing from raw coordinates.
 * Seeded demo distances are already final road distances — do NOT apply this again.
 */
export function haversineToRoadDistance(haversineKm: number, roadFactor: number): number {
  return Math.round(haversineKm * roadFactor * 10) / 10;
}

/**
 * Calculate haversine distance between two geo points.
 */
export function haversineDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number,
): number {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
