// ============================================================
// KrishiSetu — Golden Demo End-to-End Test
// Validates the complete application flow:
// login -> lot -> opportunity -> recommendation -> negotiation ->
// transaction -> logistics -> payment -> impact -> FPO aggregation
// ============================================================

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../app.module';

jest.setTimeout(35000);

describe('Golden Demo — Complete Application Lifecycle', () => {
  let app: INestApplication;
  let baseUrl: string;
  let authToken: string;
  let transactionId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.listen(0);
    const address = app.getHttpServer().address();
    baseUrl = `http://localhost:${address.port}`;
  });

  afterAll(async () => {
    await app.close();
  });

  // 1. Authentication
  test('Step 1: Farmer authentication with valid credentials', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'ramesh@demo.in', password: 'demo1234' }),
    });

    expect(res.status).toBe(201);
    const data = (await res.json()) as any;
    expect(data.token).toBeDefined();
    expect(data.user.role).toBe('FARMER');
    expect(data.user.name).toBe('Ramesh Kumar');
    authToken = data.token;
  });

  // 2. Lot Retrieval
  test('Step 2: Retrieve active harvest lot (18 qtl Tomato Hybrid Grade A)', async () => {
    const res = await fetch(`${baseUrl}/api/lots/demo-lot`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    expect(res.status).toBe(200);
    const data = (await res.json()) as any;
    expect(data.commodityName).toBe('Tomato');
    expect(data.varietyName).toBe('Hybrid');
    expect(data.quantity).toBe(18);
    expect(data.qualityGrade).toBe('A');
  });

  // 3. Opportunities & NRP Ranking
  test('Step 3: Analyze opportunities — FreshMart ranks #1, AgriFresh filtered', async () => {
    const res = await fetch(`${baseUrl}/api/opportunities/demo-lot`);
    expect(res.status).toBe(200);
    const data = (await res.json()) as any;

    expect(data.ranked).toBeDefined();
    expect(data.ranked.length).toBeGreaterThan(0);

    // FreshMart ranks #1 naturally
    const topOpp = data.ranked[0];
    expect(topOpp.opportunity.buyerName).toBe('FreshMart Foods');
    expect(topOpp.opportunity.nrp.netRealisablePricePerQtlPaise).toBeGreaterThan(290000);

    // AgriFresh is filtered out due to min lot 50 > 18
    const ineligible = data.ineligible;
    expect(ineligible.some((i: any) => i.opportunityName === 'AgriFresh Exports')).toBe(true);

    // Pune APMC NRP ≈ ₹2,787 vs FreshMart NRP ≈ ₹2,925
    const puneApmc = data.ranked.find((r: any) => r.opportunity.marketName === 'Pune APMC');
    expect(puneApmc.opportunity.nrp.netRealisablePricePerQtlPaise).toBeLessThan(
      topOpp.opportunity.nrp.netRealisablePricePerQtlPaise
    );
  });

  // 4. Recommendation: "What should I do today?"
  test('Step 4: Get lot recommendation and decision rationale', async () => {
    const res = await fetch(`${baseUrl}/api/lots/demo-lot/recommendation`);
    expect(res.status).toBe(200);
    const data = (await res.json()) as any;

    expect(data.headline).toContain('Sell to FreshMart Foods');
    expect(data.decisionRationale.length).toBeGreaterThan(0);
    expect(data.aggregationAlert).toBeDefined();
  });

  // 5. Offer Negotiation Flow
  test('Step 5: Negotiation flow — Counter to ₹3,000, Accepted at ₹2,975', async () => {
    // 5a. Submit counter-offer
    const counterRes = await fetch(`${baseUrl}/api/offers/offer-freshmart-01/counter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pricePaise: 300000 }),
    });

    expect(counterRes.status).toBe(201);
    const counterData = (await counterRes.json()) as any;
    expect(counterData.status).toBe('COUNTERED');

    // 5b. Accept offer
    const acceptRes = await fetch(`${baseUrl}/api/offers/offer-freshmart-01/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    expect(acceptRes.status).toBe(201);
    const acceptData = (await acceptRes.json()) as any;
    expect(acceptData.offer.status).toBe('ACCEPTED');
    expect(acceptData.transaction).toBeDefined();
    expect(acceptData.transaction.agreedPricePaise).toBe(297500); // ₹2,975 canonical agreed

    transactionId = acceptData.transaction.id;
  });

  // 6. Transaction, Logistics, and Payment (₹53,550)
  test('Step 6: Logistics booking and payment execution (18 × ₹2,975 = ₹53,550)', async () => {
    // 6a. Book logistics
    const logisticsRes = await fetch(`${baseUrl}/api/transactions/${transactionId}/logistics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ distanceKm: 42, estimatedCostPaise: 0 }),
    });

    expect(logisticsRes.status).toBe(201);
    const logisticsData = (await logisticsRes.json()) as any;
    expect(logisticsData.booking.status).toBe('SCHEDULED');

    // 6b. Complete payment
    const paymentRes = await fetch(`${baseUrl}/api/transactions/${transactionId}/payment/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    expect(paymentRes.status).toBe(201);
    const paymentData = (await paymentRes.json()) as any;
    // Exact dynamic payment calculation: 18 × 2975 = 53550
    expect(paymentData.payment.amountPaise).toBe(5355000); // ₹53,550
    expect(paymentData.payment.status).toBe('SUCCESS');

    // 6c. Verify summary
    const summaryRes = await fetch(`${baseUrl}/api/transactions/${transactionId}/summary`);
    expect(summaryRes.status).toBe(200);
    const summaryData = (await summaryRes.json()) as any;
    expect(summaryData.paymentTotalRupees).toBe(53550);
    expect(summaryData.finalNRP.netRealisablePricePerQtlPaise).toBeGreaterThan(293000);
  });

  // 7. Realized Economic Impact
  test('Step 7: Realized economic impact vs baseline (+₹318/qtl)', async () => {
    const res = await fetch(`${baseUrl}/api/transactions/${transactionId}/impact`);
    expect(res.status).toBe(200);
    const data = (await res.json()) as any;

    expect(data.additionalRealisationPerQtlPaise).toBeGreaterThan(30000);
    expect(data.additionalRealisationTotalPaise).toBeGreaterThan(550000);
  });

  // 8. FPO Aggregation Opportunity & Large Buyer Demand Unlock
  test('Step 8: FPO aggregation — 4 farmers, 3 eligible, 75 qtl pooled, AgriFresh demand unlocked, bulk advantage ≈ ₹297/qtl', async () => {
    const res = await fetch(`${baseUrl}/api/fpo/aggregation-opportunities`);
    expect(res.status).toBe(200);
    const data = (await res.json()) as any;

    expect(data.totalFarmers).toBe(4);
    expect(data.eligibleFarmers.length).toBe(3);
    expect(data.excludedFarmers.length).toBe(1);
    expect(data.pooledQuantity).toBe(75);
    expect(data.bulkAdvantage).toBe(297);
    expect(data.individualAverageNRP).toBe(2628);
    expect(data.pooledNRP).toBe(2925);
    expect(data.demandUnlocked).toBe(true);
    expect(data.minimumRequiredQuantity).toBe(50);

    // Verify AgriFresh matched buyer status
    const agriFreshMatch = data.matchedBuyers?.find((b: any) => b.buyerName === 'AgriFresh Exports');
    expect(agriFreshMatch).toBeDefined();
    expect(agriFreshMatch.individualEligibility).toBe('UNAVAILABLE');
    expect(agriFreshMatch.pooledEligibility).toBe('ELIGIBLE');
    expect(agriFreshMatch.state).toBe('ELIGIBLE');

    // Verify demand unlock explanation
    expect(data.demandUnlockExplanation.beforePooling.requiredMinimumQuantity).toBe(50);
    expect(data.demandUnlockExplanation.afterPooling.compatiblePooledQuantity).toBe(75);
  });
});
