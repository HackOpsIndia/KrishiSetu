// ============================================================
// KrishiSetu — Canonical Demo Scenario
// SINGLE SOURCE OF TRUTH for all seed data, tests, and demos.
// Every business value flows from this file → engine → output.
// Do NOT duplicate these values elsewhere.
// ============================================================

import {
  BuyerType,
  ChannelType,
  DataOrigin,
  NRPConfig,
  PriceTrend,
  RankingWeights,
  VerificationLevel,
} from './types';

// --- Platform Configuration (stored in platform_config table) ---

export const DEMO_NRP_CONFIG: NRPConfig = {
  apmcCommissionPct: 4.0,
  apmcMarketFeePct: 1.0,
  apmcWeighingPerQtlPaise: 800,       // ₹8/qtl
  mandiLoadingPerQtlPaise: 4500,       // ₹45/qtl
  buyerLoadingPerQtlPaise: 2000,       // ₹20/qtl
  transportRatePerKmPaise: 2200,       // ₹22/km
  mandiLossPercent: 2.0,
  directLossPercent: 0.5,
  storageCostPerQtlPerDayPaise: 500,   // ₹5/qtl/day
};

export const DEMO_RANKING_WEIGHTS: RankingWeights = {
  netRealisation: 40,
  reliability: 20,
  demandStrength: 15,
  qualityMatch: 10,
  paymentReliability: 5,
  priceTrend: 5,
  logisticsAvailability: 5,
};

export const DEMO_DEFAULT_MARKET_RELIABILITY = 60;
export const DEMO_DEFAULT_MARKET_PAYMENT_RELIABILITY = 70;
export const DEMO_ROAD_FACTOR = 1.3;

// --- Demo Credentials ---

export const DEMO_ACCOUNTS = {
  farmer: { email: 'ramesh@demo.in', password: 'demo1234', role: 'FARMER' as const },
  fpo: { email: 'fpo@demo.in', password: 'demo1234', role: 'FPO' as const },
  buyer: { email: 'freshmart@demo.in', password: 'demo1234', role: 'BUYER' as const },
  admin: { email: 'admin@demo.in', password: 'demo1234', role: 'ADMIN' as const },
} as const;

// --- Farmer ---

export const DEMO_FARMER = {
  name: 'Ramesh Kumar',
  phone: '9876543210',
  village: 'Dehu Road',
  district: 'Pune',
  state: 'Maharashtra',
  location: { latitude: 18.7167, longitude: 73.7667 },
  preferredRadiusKm: 100,
  preferredPayment: 'BANK_TRANSFER',
};

// --- FPO ---

export const DEMO_FPO = {
  name: 'Pune FPO Collective',
  registrationNumber: 'MH-FPO-2024-001',
  district: 'Pune',
  state: 'Maharashtra',
  location: { latitude: 18.72, longitude: 73.77 },
};

export const DEMO_FPO_FARMERS = [
  {
    name: 'Suresh Patil',
    email: 'suresh@demo.in',
    village: 'Dehu Road',
    location: { latitude: 18.72, longitude: 73.76 },
    lotQuantity: 20,
    variety: 'HYBRID',
    grade: 'A',
    eligible: true,
  },
  {
    name: 'Meena Deshpande',
    email: 'meena@demo.in',
    village: 'Talegaon Dabhade',
    location: { latitude: 18.73, longitude: 73.68 },
    lotQuantity: 30,
    variety: 'HYBRID',
    grade: 'A',
    eligible: true,
  },
  {
    name: 'Vijay Kulkarni',
    email: 'vijay@demo.in',
    village: 'Vadgaon',
    location: { latitude: 18.71, longitude: 73.79 },
    lotQuantity: 15,
    variety: 'LOCAL',
    grade: 'B',
    eligible: false,
    exclusionReason: 'Tomato (Local) Grade B — not compatible with buyer demand for Tomato (Hybrid) Grade A',
  },
  {
    name: 'Anita Shinde',
    email: 'anita@demo.in',
    village: 'Dehu',
    location: { latitude: 18.71, longitude: 73.75 },
    lotQuantity: 25,
    variety: 'HYBRID',
    grade: 'A',
    eligible: true,
  },
];

// --- Commodities ---

export const DEMO_COMMODITIES = [
  {
    name: 'Tomato',
    category: 'Vegetables',
    defaultUnit: 'quintal',
    mspPaise: null,
    varieties: [
      { name: 'Hybrid' },
      { name: 'Local' },
      { name: 'Cherry' },
    ],
    qualitySpecs: [
      { parameterName: 'grade', dataType: 'ENUM', unit: null, options: ['A', 'B', 'C'] },
      { parameterName: 'size', dataType: 'ENUM', unit: 'mm', options: ['Large', 'Medium', 'Small'] },
      { parameterName: 'colour', dataType: 'ENUM', unit: null, options: ['Red', 'Pink', 'Green'] },
      { parameterName: 'firmness', dataType: 'ENUM', unit: null, options: ['Firm', 'Medium', 'Soft'] },
      { parameterName: 'defect_percentage', dataType: 'NUMBER', unit: '%', min: 0, max: 100 },
    ],
  },
  {
    name: 'Wheat',
    category: 'Cereals',
    defaultUnit: 'quintal',
    mspPaise: 227500,  // ₹2,275 MSP
    varieties: [
      { name: 'Sharbati' },
      { name: 'Lokwan' },
    ],
    qualitySpecs: [
      { parameterName: 'grade', dataType: 'ENUM', unit: null, options: ['A', 'B', 'C'] },
      { parameterName: 'moisture', dataType: 'NUMBER', unit: '%', min: 0, max: 20 },
      { parameterName: 'foreign_matter', dataType: 'NUMBER', unit: '%', min: 0, max: 10 },
    ],
  },
  {
    name: 'Potato',
    category: 'Vegetables',
    defaultUnit: 'quintal',
    mspPaise: null,
    varieties: [{ name: 'Kufri Jyoti' }, { name: 'Kufri Pukhraj' }],
    qualitySpecs: [
      { parameterName: 'grade', dataType: 'ENUM', unit: null, options: ['A', 'B', 'C'] },
      { parameterName: 'size', dataType: 'ENUM', unit: 'mm', options: ['Large', 'Medium', 'Small'] },
    ],
  },
  {
    name: 'Onion',
    category: 'Vegetables',
    defaultUnit: 'quintal',
    mspPaise: null,
    varieties: [{ name: 'Nashik Red' }, { name: 'Bangalore Rose' }],
    qualitySpecs: [
      { parameterName: 'grade', dataType: 'ENUM', unit: null, options: ['A', 'B', 'C'] },
      { parameterName: 'size', dataType: 'ENUM', unit: 'mm', options: ['Large', 'Medium', 'Small'] },
    ],
  },
  {
    name: 'Rice',
    category: 'Cereals',
    defaultUnit: 'quintal',
    mspPaise: 223100,  // ₹2,231 MSP
    varieties: [{ name: 'Basmati' }, { name: 'Sona Masoori' }],
    qualitySpecs: [
      { parameterName: 'grade', dataType: 'ENUM', unit: null, options: ['A', 'B', 'C'] },
      { parameterName: 'moisture', dataType: 'NUMBER', unit: '%', min: 0, max: 18 },
      { parameterName: 'broken_grain', dataType: 'NUMBER', unit: '%', min: 0, max: 25 },
    ],
  },
];

// --- Markets ---

export interface DemoMarket {
  name: string;
  state: string;
  district: string;
  location: { latitude: number; longitude: number };
  distanceFromFarmerKm: number;
  marketType: string;
}

export const DEMO_MARKETS: DemoMarket[] = [
  {
    name: 'Pune APMC',
    state: 'Maharashtra',
    district: 'Pune',
    location: { latitude: 18.5204, longitude: 73.8567 },
    distanceFromFarmerKm: 35,
    marketType: 'APMC',
  },
  {
    name: 'Talegaon Mandi',
    state: 'Maharashtra',
    district: 'Pune',
    location: { latitude: 18.7350, longitude: 73.6757 },
    distanceFromFarmerKm: 18,
    marketType: 'APMC',
  },
  {
    name: 'Pimpri Market',
    state: 'Maharashtra',
    district: 'Pune',
    location: { latitude: 18.6298, longitude: 73.7997 },
    distanceFromFarmerKm: 28,
    marketType: 'APMC',
  },
];

// --- Market Prices (Tomato Hybrid, most recent) ---

export interface DemoMarketPrice {
  marketName: string;
  commodityName: string;
  varietyName: string;
  date: string;
  minPricePaise: number;
  maxPricePaise: number;
  modalPricePaise: number;
  arrivals: number;
  priceTrend: PriceTrend;
  dataOrigin: DataOrigin;
}

export const DEMO_MARKET_PRICES: DemoMarketPrice[] = [
  {
    marketName: 'Pune APMC',
    commodityName: 'Tomato',
    varietyName: 'Hybrid',
    date: '2026-09-07',
    minPricePaise: 280000,
    maxPricePaise: 330000,
    modalPricePaise: 310000,
    arrivals: 450,
    priceTrend: PriceTrend.STABLE,
    dataOrigin: DataOrigin.DEMO,
  },
  {
    marketName: 'Talegaon Mandi',
    commodityName: 'Tomato',
    varietyName: 'Hybrid',
    date: '2026-09-07',
    minPricePaise: 260000,
    maxPricePaise: 310000,
    modalPricePaise: 290000,
    arrivals: 120,
    priceTrend: PriceTrend.RISING,
    dataOrigin: DataOrigin.DEMO,
  },
  {
    marketName: 'Pimpri Market',
    commodityName: 'Tomato',
    varietyName: 'Hybrid',
    date: '2026-09-07',
    minPricePaise: 270000,
    maxPricePaise: 320000,
    modalPricePaise: 295000,
    arrivals: 280,
    priceTrend: PriceTrend.FALLING,
    dataOrigin: DataOrigin.DEMO,
  },
];

// --- Buyers ---

export interface DemoBuyer {
  companyName: string;
  email: string;
  buyerType: BuyerType;
  location: { latitude: number; longitude: number };
  distanceFromFarmerKm: number;
  serviceRadiusKm: number;
  verificationLevel: VerificationLevel;
  providesPickup: boolean;
  trustScoreOverall: number;
  paymentReliability: number;
  completedTransactions: number;
  accountAgeDays: number;
}

export const DEMO_BUYERS: DemoBuyer[] = [
  {
    companyName: 'FreshMart Foods',
    email: 'freshmart@demo.in',
    buyerType: BuyerType.PROCESSOR,
    location: { latitude: 18.5600, longitude: 73.8000 },
    distanceFromFarmerKm: 42,
    serviceRadiusKm: 100,
    verificationLevel: VerificationLevel.PLATFORM_VERIFIED,
    providesPickup: true,
    trustScoreOverall: 91,
    paymentReliability: 95,
    completedTransactions: 42,
    accountAgeDays: 380,
  },
  {
    companyName: 'Pune Veggie Hub',
    email: 'puneveggie@demo.in',
    buyerType: BuyerType.WHOLESALER,
    location: { latitude: 18.5800, longitude: 73.8200 },
    distanceFromFarmerKm: 22,
    serviceRadiusKm: 60,
    verificationLevel: VerificationLevel.DOCUMENTS_SUBMITTED,
    providesPickup: true,
    trustScoreOverall: 85,
    paymentReliability: 88,
    completedTransactions: 28,
    accountAgeDays: 250,
  },
  {
    companyName: 'Hotel Grand',
    email: 'hotelgrand@demo.in',
    buyerType: BuyerType.INSTITUTIONAL,
    location: { latitude: 18.4600, longitude: 73.8800 },
    distanceFromFarmerKm: 55,
    serviceRadiusKm: 70,
    verificationLevel: VerificationLevel.PROFILE_COMPLETE,
    providesPickup: false,
    trustScoreOverall: 78,
    paymentReliability: 75,
    completedTransactions: 8,
    accountAgeDays: 120,
  },
  {
    companyName: 'RK Traders',
    email: 'rktraders@demo.in',
    buyerType: BuyerType.TRADER,
    location: { latitude: 18.7400, longitude: 73.7900 },
    distanceFromFarmerKm: 15,
    serviceRadiusKm: 40,
    verificationLevel: VerificationLevel.DOCUMENTS_SUBMITTED,
    providesPickup: true,
    trustScoreOverall: 72,
    paymentReliability: 65,
    completedTransactions: 15,
    accountAgeDays: 200,
  },
  {
    companyName: 'AgriFresh Exports',
    email: 'agrifresh@demo.in',
    buyerType: BuyerType.EXPORTER,
    location: { latitude: 18.9200, longitude: 73.9500 },
    distanceFromFarmerKm: 88,
    serviceRadiusKm: 150,
    verificationLevel: VerificationLevel.PLATFORM_VERIFIED,
    providesPickup: false,
    trustScoreOverall: 94,
    paymentReliability: 92,
    completedTransactions: 65,
    accountAgeDays: 520,
  },
];

// --- Buyer Demands ---

export interface DemoBuyerDemand {
  buyerCompanyName: string;
  commodityName: string;
  varietyName: string;
  quantity: number;
  minQualityGrade: string;
  /** The buyer's specific offered price per qtl in paise */
  offeredPricePaise: number;
  priceLowPaise: number;
  priceHighPaise: number;
  deliveryWindowStart: string;
  deliveryWindowEnd: string;
  minLotSize: number;
  qualityMatchScore: number;
}

export const DEMO_BUYER_DEMANDS: DemoBuyerDemand[] = [
  {
    buyerCompanyName: 'FreshMart Foods',
    commodityName: 'Tomato',
    varietyName: 'Hybrid',
    quantity: 200,
    minQualityGrade: 'A',
    offeredPricePaise: 296000,   // ₹2,960/qtl
    priceLowPaise: 290000,
    priceHighPaise: 310000,
    deliveryWindowStart: '2026-09-08',
    deliveryWindowEnd: '2026-09-22',
    minLotSize: 10,
    qualityMatchScore: 100,
  },
  {
    buyerCompanyName: 'Pune Veggie Hub',
    commodityName: 'Tomato',
    varietyName: 'Hybrid',
    quantity: 80,
    minQualityGrade: 'B',
    offeredPricePaise: 285000,   // ₹2,850/qtl
    priceLowPaise: 280000,
    priceHighPaise: 300000,
    deliveryWindowStart: '2026-09-08',
    deliveryWindowEnd: '2026-09-20',
    minLotSize: 5,
    qualityMatchScore: 100,
  },
  {
    buyerCompanyName: 'Hotel Grand',
    commodityName: 'Tomato',
    varietyName: 'Hybrid',
    quantity: 25,
    minQualityGrade: 'A',
    offeredPricePaise: 310000,   // ₹3,100/qtl
    priceLowPaise: 300000,
    priceHighPaise: 320000,
    deliveryWindowStart: '2026-09-10',
    deliveryWindowEnd: '2026-09-15',
    minLotSize: 5,
    qualityMatchScore: 85,
  },
  {
    buyerCompanyName: 'RK Traders',
    commodityName: 'Tomato',
    varietyName: 'Hybrid',
    quantity: 150,
    minQualityGrade: 'C',
    offeredPricePaise: 280000,   // ₹2,800/qtl
    priceLowPaise: 270000,
    priceHighPaise: 295000,
    deliveryWindowStart: '2026-09-08',
    deliveryWindowEnd: '2026-09-25',
    minLotSize: 5,
    qualityMatchScore: 100,
  },
  {
    buyerCompanyName: 'AgriFresh Exports',
    commodityName: 'Tomato',
    varietyName: 'Hybrid',
    quantity: 500,
    minQualityGrade: 'A',
    offeredPricePaise: 320000,   // ₹3,200/qtl
    priceLowPaise: 310000,
    priceHighPaise: 330000,
    deliveryWindowStart: '2026-09-10',
    deliveryWindowEnd: '2026-09-30',
    minLotSize: 50,
    qualityMatchScore: 90,
  },
];

// --- Demo Lot (Ramesh's lot) ---

export const DEMO_LOT = {
  commodityName: 'Tomato',
  varietyName: 'Hybrid',
  quantity: 18,
  unit: 'quintal',
  harvestDate: '2026-09-06',
  expectedSaleDate: '2026-09-09',
  qualityGrade: 'A',
  qualityParams: {
    size: 'Large',
    colour: 'Red',
    firmness: 'Firm',
    defect_percentage: 2,
  },
  minAcceptablePricePaise: 250000,
};

// --- Demo Negotiation Scenario ---

export const DEMO_NEGOTIATION = {
  buyerCompanyName: 'FreshMart Foods',
  initialOfferPricePaise: 296000,   // ₹2,960/qtl
  farmerCounterPricePaise: 300000,  // ₹3,000/qtl
  finalAgreedPricePaise: 297500,    // ₹2,975/qtl
};

// --- Demand Strength Configuration ---

export const DEMAND_STRENGTH_CONFIG = {
  market: {
    rising: 75,
    stable: 50,
    falling: 25,
  },
  buyer: {
    highRatioThreshold: 10,    // demand/lot > 10x
    highRatioScore: 85,
    medRatioThreshold: 5,      // demand/lot 5-10x
    medRatioScore: 70,
    lowRatioScore: 55,         // demand/lot < 5x
  },
};

// --- Logistics Score Configuration ---

export const LOGISTICS_SCORE_CONFIG = {
  pickupScore: 100,
  maxDistanceForScore: 100,    // 100 km → score 0
};
