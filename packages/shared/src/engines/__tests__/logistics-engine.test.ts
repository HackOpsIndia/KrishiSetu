// ============================================================
// Logistics Cost Engine Tests
// Validates distance/cost calculations, buyer pickup, haversine.
// ============================================================

import {
  calculateLogisticsCost,
  haversineDistance,
  haversineToRoadDistance,
  LogisticsConfig,
} from '../logistics-engine';
import { DEMO_NRP_CONFIG, DEMO_ROAD_FACTOR, DEMO_FARMER, DEMO_MARKETS } from '../../demo-scenario';

const LOGISTICS_CONFIG: LogisticsConfig = {
  transportRatePerKmPaise: DEMO_NRP_CONFIG.transportRatePerKmPaise,
  roadFactor: DEMO_ROAD_FACTOR,
};

describe('Logistics Cost Engine', () => {
  test('farmer transport: distance × ₹22/km', () => {
    const result = calculateLogisticsCost(35, 18, LOGISTICS_CONFIG);
    expect(result.estimatedCostPaise).toBe(35 * 2200);
    expect(result.costPerQuintalPaise).toBe(Math.round(35 * 2200 / 18));
    expect(result.source).toBe('DEMO_PROVIDER');
  });

  test('buyer pickup: transport cost = ₹0, distance preserved', () => {
    const result = calculateLogisticsCost(42, 18, LOGISTICS_CONFIG, true);
    expect(result.estimatedCostPaise).toBe(0);
    expect(result.costPerQuintalPaise).toBe(0);
    expect(result.distanceKm).toBe(42); // distance still available
    expect(result.source).toBe('BUYER_PICKUP');
  });

  test('zero distance returns zero cost', () => {
    const result = calculateLogisticsCost(0, 18, LOGISTICS_CONFIG);
    expect(result.estimatedCostPaise).toBe(0);
  });

  test('rejects negative distance', () => {
    expect(() => calculateLogisticsCost(-5, 18, LOGISTICS_CONFIG)).toThrow();
  });

  test('rejects non-positive quantity', () => {
    expect(() => calculateLogisticsCost(35, 0, LOGISTICS_CONFIG)).toThrow();
    expect(() => calculateLogisticsCost(35, -1, LOGISTICS_CONFIG)).toThrow();
  });

  test('estimated duration is reasonable', () => {
    const result = calculateLogisticsCost(35, 18, LOGISTICS_CONFIG);
    expect(result.estimatedDurationMinutes).toBeGreaterThan(0);
    // 35km at 40km/h ≈ 53 minutes
    expect(result.estimatedDurationMinutes).toBe(Math.round(35 / 40 * 60));
  });
});

describe('Logistics — Haversine', () => {
  test('haversine distance between known points is reasonable', () => {
    const farmer = DEMO_FARMER.location;
    const puneAPMC = DEMO_MARKETS[0].location;

    const dist = haversineDistance(
      farmer.latitude, farmer.longitude,
      puneAPMC.latitude, puneAPMC.longitude,
    );

    // Should be a positive number representing km
    expect(dist).toBeGreaterThan(0);
    expect(dist).toBeLessThan(50); // Pune area, should be < 50km straight line
  });

  test('haversine to road distance applies factor correctly', () => {
    const haversineDist = 25.0;
    const roadDist = haversineToRoadDistance(haversineDist, DEMO_ROAD_FACTOR);
    expect(roadDist).toBe(32.5); // 25 × 1.3
  });

  test('road factor is not applied twice (seeded distances are final)', () => {
    // Seeded demo distances are already road distances.
    // Applying haversineToRoadDistance to them would be wrong.
    const puneAPMCDistance = 35; // already road distance
    // Just verify the distance stays the same if used directly
    const result = calculateLogisticsCost(puneAPMCDistance, 18, LOGISTICS_CONFIG);
    expect(result.distanceKm).toBe(35);
  });
});
