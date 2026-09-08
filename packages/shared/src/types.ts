// ============================================================
// KrishiSetu — Domain Types
// Single source of truth for all business data structures.
// ============================================================

// --- Enums ---

export enum UserRole {
  FARMER = 'FARMER',
  FPO = 'FPO',
  BUYER = 'BUYER',
  ADMIN = 'ADMIN',
}

export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  DISABLED = 'DISABLED',
  PENDING = 'PENDING',
}

export enum AuthProvider {
  EMAIL = 'EMAIL',
  GOOGLE = 'GOOGLE',
  DEMO = 'DEMO',
}

export enum BuyerType {
  TRADER = 'TRADER',
  PROCESSOR = 'PROCESSOR',
  WHOLESALER = 'WHOLESALER',
  RETAILER = 'RETAILER',
  INSTITUTIONAL = 'INSTITUTIONAL',
  EXPORTER = 'EXPORTER',
}

export enum VerificationLevel {
  PROFILE_COMPLETE = 'PROFILE_COMPLETE',
  DOCUMENTS_SUBMITTED = 'DOCUMENTS_SUBMITTED',
  PLATFORM_VERIFIED = 'PLATFORM_VERIFIED',
}

export enum ChannelType {
  MARKET = 'MARKET',
  BUYER = 'BUYER',
}

export enum LotStatus {
  DRAFT = 'DRAFT',
  READY = 'READY',
  MATCHED = 'MATCHED',
  OFFER_RECEIVED = 'OFFER_RECEIVED',
  NEGOTIATING = 'NEGOTIATING',
  ACCEPTED = 'ACCEPTED',
  LOGISTICS_BOOKED = 'LOGISTICS_BOOKED',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  PAYMENT_PENDING = 'PAYMENT_PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum OfferStatus {
  ACTIVE = 'ACTIVE',
  COUNTERED = 'COUNTERED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
}

export enum NegotiationAction {
  OFFER = 'OFFER',
  COUNTER = 'COUNTER',
  ACCEPT = 'ACCEPT',
  REJECT = 'REJECT',
  EXPIRE = 'EXPIRE',
}

export enum TransactionStatus {
  CONFIRMED = 'CONFIRMED',
  LOGISTICS_BOOKED = 'LOGISTICS_BOOKED',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  PAYMENT_PENDING = 'PAYMENT_PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

export enum PriceTrend {
  RISING = 'RISING',
  STABLE = 'STABLE',
  FALLING = 'FALLING',
}

export enum DataOrigin {
  DEMO = 'DEMO',
  GOVERNMENT_SOURCE = 'GOVERNMENT_SOURCE',
  MANUAL = 'MANUAL',
  PROVIDER = 'PROVIDER',
}

export enum CostCategory {
  TRANSPORT = 'TRANSPORT',
  LOADING = 'LOADING',
  COMMISSION = 'COMMISSION',
  MARKET_FEES = 'MARKET_FEES',
  WEIGHING = 'WEIGHING',
  STORAGE = 'STORAGE',
  POST_HARVEST_LOSS = 'POST_HARVEST_LOSS',
}

export enum CostSource {
  CONFIG = 'CONFIG',
  CALCULATED = 'CALCULATED',
  PROVIDER = 'PROVIDER',
  ESTIMATED = 'ESTIMATED',
}

export enum CostConfidence {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

export enum ConfidenceLevel {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export enum OpportunityCategory {
  BEST_NET = 'BEST_NET',
  BEST_PRICE = 'BEST_PRICE',
  LOWEST_RISK = 'LOWEST_RISK',
  NEAREST = 'NEAREST',
}

export enum SaleWindowRecommendation {
  SELL_NOW = 'SELL_NOW',
  HOLD = 'HOLD',
  PARTIAL_SELL = 'PARTIAL_SELL',
}

export enum GrievanceStatus {
  OPEN = 'OPEN',
  UNDER_REVIEW = 'UNDER_REVIEW',
  RESOLVED = 'RESOLVED',
}

// --- Geo ---

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

// --- NRP Engine Types ---

export interface NRPInput {
  /** Gross sale price in paise per quintal */
  salePricePaise: number;
  /** Quantity in quintals (may be fractional) */
  quantity: number;
  /** Distance in kilometers (final road distance) */
  distanceKm: number;
  /** Selling channel */
  channelType: ChannelType;
  /** Whether the buyer provides pickup (BUYER channel only) */
  buyerProvidesPickup: boolean;
  /** Commodity identifier for loss rate lookup */
  commodityId: string;
  /** Storage days (0 for immediate sale) */
  storageDays: number;
}

export interface NRPConfig {
  /** APMC commission as percentage (e.g., 4.0 = 4%) */
  apmcCommissionPct: number;
  /** APMC market fee as percentage */
  apmcMarketFeePct: number;
  /** APMC weighing charge in paise per quintal */
  apmcWeighingPerQtlPaise: number;
  /** Loading cost at mandi in paise per quintal */
  mandiLoadingPerQtlPaise: number;
  /** Loading cost for direct buyer sale in paise per quintal */
  buyerLoadingPerQtlPaise: number;
  /** Transport rate in paise per kilometer */
  transportRatePerKmPaise: number;
  /** Post-harvest loss percentage at mandi */
  mandiLossPercent: number;
  /** Post-harvest loss percentage for direct sale */
  directLossPercent: number;
  /** Storage cost in paise per quintal per day */
  storageCostPerQtlPerDayPaise: number;
}

export interface CostItem {
  category: CostCategory;
  /** Human-readable label */
  label: string;
  /** Cost in paise per quintal */
  amountPerQtlPaise: number;
  /** Total cost in paise for the full quantity */
  totalAmountPaise: number;
  /** Where this cost comes from */
  source: CostSource;
  /** Human-readable formula description */
  calculationMethod: string;
  /** Confidence in this cost estimate */
  confidence: CostConfidence;
  /** The actual numerical inputs used */
  inputs: Record<string, number>;
}

export interface NRPResult {
  /** Gross price in paise per quintal */
  grossPricePerQtlPaise: number;
  /** Gross total value in paise */
  grossTotalPaise: number;
  /** Itemized cost breakdown */
  costs: CostItem[];
  /** Sum of all costs in paise */
  totalCostsPaise: number;
  /** Net realizable price in paise per quintal */
  netRealisablePricePerQtlPaise: number;
  /** Net total value in paise */
  netTotalValuePaise: number;
  /** Net/gross margin as percentage */
  marginPercent: number;
  /** The channel used */
  channelType: ChannelType;
  /** Quantity used in calculation */
  quantity: number;
}

// --- Opportunity Ranking Types ---

export interface OpportunityFeatures {
  nrpScore: number;
  reliabilityScore: number;
  demandScore: number;
  qualityScore: number;
  paymentScore: number;
  trendScore: number;
  logisticsScore: number;
}

export interface RankingWeights {
  netRealisation: number;
  reliability: number;
  demandStrength: number;
  qualityMatch: number;
  paymentReliability: number;
  priceTrend: number;
  logisticsAvailability: number;
}

export interface MarketOpportunity {
  type: ChannelType.MARKET;
  marketId: string;
  marketName: string;
  modalPricePaise: number;
  minPricePaise: number;
  maxPricePaise: number;
  arrivals: number;
  priceTrend: PriceTrend;
  distanceKm: number;
  nrp: NRPResult;
}

export interface BuyerOpportunity {
  type: ChannelType.BUYER;
  buyerId: string;
  buyerName: string;
  demandId: string;
  offeredPricePaise: number;
  demandQuantity: number;
  qualityMatch: number;
  trustScore: TrustScore;
  distanceKm: number;
  deliveryWindow: string;
  providesPickup: boolean;
  nrp: NRPResult;
}

export type Opportunity = MarketOpportunity | BuyerOpportunity;

export interface ExplanationItem {
  factor: string;
  description: string;
  advantage: boolean;
}

export interface ComparisonItem {
  nextBestName: string;
  nextBestNRPPaise: number;
  nrpDifferencePaise: number;
  advantages: string[];
  disadvantages: string[];
}

export interface RankedOpportunity {
  rank: number;
  score: number;
  opportunity: Opportunity;
  features: OpportunityFeatures;
  categories: OpportunityCategory[];
  risk: RiskLevel;
  confidence: ConfidenceScore;
  explanation: ExplanationItem[];
  comparedToNextBest?: ComparisonItem;
}

export interface EligibilityResult {
  opportunityId: string;
  opportunityName: string;
  eligible: boolean;
  reason?: string;
}

// --- Confidence ---

export interface ConfidenceFactor {
  name: string;
  value: number;
  weight: number;
  reason: string;
}

export interface ConfidenceScore {
  score: number;
  level: ConfidenceLevel;
  factors: ConfidenceFactor[];
  description: string;
}

// --- Trust Score ---

export interface TrustComponent {
  name: string;
  score: number;
  detail: string;
}

export interface TrustScore {
  overall: number;
  components: TrustComponent[];
  verificationLevel: VerificationLevel;
  completedTransactions: number;
  accountAgeDays: number;
  sampleSizeWarning?: string;
}

// --- Buyer Matching ---

export interface MatchFactor {
  name: string;
  score: number;
  weight: number;
  detail: string;
}

export interface MatchResult {
  buyerId: string;
  demandId: string;
  score: number;
  factors: MatchFactor[];
  explanation: string[];
}

// --- Sale Window ---

export interface SaleWindowResult {
  recommendation: SaleWindowRecommendation | null;
  sellPercentage?: number;
  holdPercentage?: number;
  sellQuantity?: number;
  holdQuantity?: number;
  currentNRPPaise: number;
  forecastRange?: { lowPaise: number; midPaise: number; highPaise: number };
  forecastHorizon?: number;
  storageCostPerDayPaise: number;
  spoilagePerDayPaise: number;
  riskAdjustedFutureValuePaise?: number;
  priceTrend: PriceTrend;
  volatility: RiskLevel;
  confidence: ConfidenceScore;
  explanation: string;
  disclaimer: string;
  unavailableReason?: string;
}

// --- Logistics ---

export interface LogisticsCostResult {
  distanceKm: number;
  estimatedCostPaise: number;
  costPerQuintalPaise: number;
  estimatedDurationMinutes: number;
  vehicleType: string;
  ratePerKmPaise: number;
  source: 'DEMO_PROVIDER' | 'OSRM' | 'BUYER_PICKUP';
  confidence: CostConfidence;
}

// --- FPO Aggregation ---

export interface AggregationFarmer {
  farmerId: string;
  farmerName: string;
  quantity: number;
  qualityGrade: string;
  individualNRPPaise: number;
}

export interface AggregationExclusion {
  farmerId: string;
  farmerName: string;
  reason: string;
}

export interface AggregationMatchedBuyer {
  buyerName: string;
  minLotSize: number;
  individualEligibility: 'UNAVAILABLE' | 'ELIGIBLE';
  pooledEligibility: 'UNAVAILABLE' | 'ELIGIBLE';
  state: 'UNAVAILABLE' | 'ELIGIBLE' | 'SELECTED';
  pooledNRPPaise?: number;
  pooledNRPRupees?: number;
  statusText?: string;
}

export interface DemandUnlockExplanation {
  buyerName: string;
  minimumRequiredQuantity: number;
  individualLots: { farmerName: string; quantity: number }[];
  pooledQuantity: number;
  message: string;
}

export interface AggregationOpportunity {
  commodityId: string;
  commodityName: string;
  varietyId: string;
  varietyName: string;
  eligibleFarmers: AggregationFarmer[];
  excludedFarmers: AggregationExclusion[];
  totalQuantity: number;
  pooledQuantity: number;
  matchingDemandId: string;
  matchingBuyerName: string;
  demandQuantity: number;
  demandCoveragePercent: number;
  minimumRequiredQuantity: number;
  demandUnlocked: boolean;
  demandUnlockExplanation?: DemandUnlockExplanation;
  matchedBuyers?: AggregationMatchedBuyer[];
  individualWeightedAvgNRPPaise: number;
  individualAverageNRP: number;
  pooledNRPPaise: number;
  pooledNRP: number;
  bulkAdvantage: number;
  bulkAdvantagePaise: number;
  estimatedBulkAdvantagePaise: number;
  estimatedBulkAdvantagePercent: number;
  bulkAdvantagePercent: number;
  totalImprovementPaise: number;
}

// --- Impact ---

export interface BaselineDefinition {
  type: 'NEAREST_MANDI_NRP';
  opportunityId: string;
  opportunityName: string;
  nrpPerQtlPaise: number;
  nrpTotalPaise: number;
  timestamp: Date;
}

export interface ImpactMetrics {
  selectedOpportunityName: string;
  selectedNRPPerQtlPaise: number;
  selectedNRPTotalPaise: number;
  baseline: BaselineDefinition;
  additionalRealisationPerQtlPaise: number;
  additionalRealisationTotalPaise: number;
  transactionCostDifferencePerQtlPaise: number;
  transactionCostDifferenceTotalPaise: number;
  postHarvestLossReductionPaise: number;
  baselineLossPercent: number;
  selectedLossPercent: number;
}

// --- Lot State Machine ---

export const LOT_TRANSITIONS: Record<LotStatus, LotStatus[]> = {
  [LotStatus.DRAFT]: [LotStatus.READY, LotStatus.CANCELLED],
  [LotStatus.READY]: [LotStatus.MATCHED, LotStatus.CANCELLED],
  [LotStatus.MATCHED]: [LotStatus.OFFER_RECEIVED, LotStatus.CANCELLED],
  [LotStatus.OFFER_RECEIVED]: [LotStatus.NEGOTIATING, LotStatus.ACCEPTED, LotStatus.READY],
  [LotStatus.NEGOTIATING]: [LotStatus.ACCEPTED, LotStatus.OFFER_RECEIVED, LotStatus.READY],
  [LotStatus.ACCEPTED]: [LotStatus.LOGISTICS_BOOKED],
  [LotStatus.LOGISTICS_BOOKED]: [LotStatus.IN_TRANSIT],
  [LotStatus.IN_TRANSIT]: [LotStatus.DELIVERED],
  [LotStatus.DELIVERED]: [LotStatus.PAYMENT_PENDING],
  [LotStatus.PAYMENT_PENDING]: [LotStatus.COMPLETED],
  [LotStatus.COMPLETED]: [],
  [LotStatus.CANCELLED]: [],
};

export function isValidLotTransition(from: LotStatus, to: LotStatus): boolean {
  return LOT_TRANSITIONS[from]?.includes(to) ?? false;
}

// --- Transaction State Machine ---

export const TRANSACTION_TRANSITIONS: Record<TransactionStatus, TransactionStatus[]> = {
  [TransactionStatus.CONFIRMED]: [TransactionStatus.LOGISTICS_BOOKED, TransactionStatus.CANCELLED],
  [TransactionStatus.LOGISTICS_BOOKED]: [TransactionStatus.IN_TRANSIT, TransactionStatus.CANCELLED],
  [TransactionStatus.IN_TRANSIT]: [TransactionStatus.DELIVERED],
  [TransactionStatus.DELIVERED]: [TransactionStatus.PAYMENT_PENDING],
  [TransactionStatus.PAYMENT_PENDING]: [TransactionStatus.COMPLETED],
  [TransactionStatus.COMPLETED]: [],
  [TransactionStatus.CANCELLED]: [],
};

export function isValidTransactionTransition(from: TransactionStatus, to: TransactionStatus): boolean {
  return TRANSACTION_TRANSITIONS[from]?.includes(to) ?? false;
}

// --- Formatting Utilities ---

export function paiseToRupees(paise: number): number {
  return paise / 100;
}

export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

export function formatRupees(paise: number): string {
  const rupees = paise / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(rupees);
}

export function formatRupeesDecimal(paise: number): string {
  const rupees = paise / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(rupees);
}

// --- User & Governance ---

export interface UserIdentity {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatarUrl?: string;
  role: UserRole;
  status: AccountStatus;
  authProvider: AuthProvider;
  googleSubId?: string;
  verificationStatus?: string;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export interface UserAdminAuditRecord {
  id: string;
  targetUserId: string;
  targetEmail: string;
  actorEmail: string;
  action:
    | 'ADMIN_ROLE_GRANTED'
    | 'ADMIN_ROLE_REVOKED'
    | 'USER_ROLE_CHANGED'
    | 'USER_SUSPENDED'
    | 'USER_ACTIVATED'
    | 'USER_DISABLED';
  previousValue: string;
  newValue: string;
  reason?: string;
  timestamp: Date;
}

