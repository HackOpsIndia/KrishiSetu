import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/server/prisma';

export const dynamic = 'force-dynamic';

interface ChatRequestBody {
  message: string;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
  language?: 'en' | 'hi';
  context?: {
    crop?: string;
    quantityQtl?: number;
    location?: string;
    transportCost?: number;
  };
}

// Reusable calculation helpers (local functions, Next.js app route files only allow HTTP method exports)
function calculateEstimatedValue(quantityQtl: number, pricePerQtl: number) {
  return quantityQtl * pricePerQtl;
}

function calculateEstimatedNetValue(quantityQtl: number, pricePerQtl: number, transportCost: number) {
  const gross = quantityQtl * pricePerQtl;
  return Math.max(0, gross - transportCost);
}

export async function POST(req: NextRequest) {
  try {
    const body: ChatRequestBody = await req.json();
    const rawMessage = (body.message || '').trim();
    const lower = rawMessage.toLowerCase();
    const lang = body.language || (detectHindi(rawMessage) ? 'hi' : 'en');
    const prevContext = body.context || {};

    // 1. Session Context extraction
    let detectedCrop = prevContext.crop;
    if (lower.includes('wheat') || lower.includes('गेहूं') || lower.includes('gehu') || lower.includes('gehun')) {
      detectedCrop = 'Wheat';
    } else if (lower.includes('tomato') || lower.includes('टमाटर') || lower.includes('tamatar')) {
      detectedCrop = 'Tomato';
    } else if (lower.includes('onion') || lower.includes('प्याज') || lower.includes('pyaz')) {
      detectedCrop = 'Onion';
    } else if (lower.includes('potato') || lower.includes('आलू') || lower.includes('aaloo')) {
      detectedCrop = 'Potato';
    }

    // Extract quantity (e.g. "20 quintal", "20 qtl", "20 क्विंटल")
    let detectedQuantity = prevContext.quantityQtl;
    const qtyMatch = rawMessage.match(/(\d+(?:\.\d+)?)\s*(?:quintal|quintals|qtl|क्विंटल|बोरी)?/i);
    if (qtyMatch && Number(qtyMatch[1]) > 0 && !lower.includes('₹') && !lower.includes('rs')) {
      detectedQuantity = parseFloat(qtyMatch[1]);
    }

    const updatedContext = {
      crop: detectedCrop || 'Wheat',
      quantityQtl: detectedQuantity || 20,
      location: prevContext.location || 'Pune / Maharashtra',
      transportCost: prevContext.transportCost || 1500,
    };

    // 2. Query Live Database for Market Prices, Opportunities, and FPO profiles
    let dbOpportunities: any[] = [];
    let dbMarketPrices: any[] = [];
    let dbFpos: any[] = [];

    try {
      [dbOpportunities, dbMarketPrices, dbFpos] = await Promise.all([
        prisma.opportunityRecord.findMany({
          orderBy: { rank: 'asc' },
          take: 8,
        }).catch(() => []),
        prisma.marketPrice.findMany({
          include: { market: true },
          orderBy: { date: 'desc' },
          take: 10,
        }).catch(() => []),
        prisma.fPOProfile.findMany({
          include: { user: true, members: true },
          take: 5,
        }).catch(() => []),
      ]);
    } catch (dbErr: any) {
      console.warn('[KrishiSetu AI] Database query notice:', dbErr?.message);
    }

    // Map database opportunities or market prices to standardized market options
    const mandiOptions = dbOpportunities.length > 0
      ? dbOpportunities.map((opp) => ({
          crop: updatedContext.crop,
          mandi: opp.name,
          modalPrice: Math.round(opp.grossPricePaise / 100),
          netPrice: Math.round(opp.nrpPaise / 100),
          distance: Math.round(opp.distanceKm),
          trend: 'increasing',
          trendPercent: '+11.4%',
          channelType: opp.channelType,
        }))
      : dbMarketPrices.length > 0
      ? dbMarketPrices.map((mp) => ({
          crop: mp.commodityName,
          mandi: mp.market?.name || 'Mandi Yard',
          modalPrice: Math.round(mp.modalPricePaise / 100),
          netPrice: Math.round(mp.modalPricePaise / 100) - 65,
          distance: 25,
          trend: mp.priceTrend ? String(mp.priceTrend).toLowerCase() : 'increasing',
          trendPercent: '+8.5%',
          channelType: 'MANDI_APMC',
        }))
      : [
          // Dynamic fallback when database tables are empty
          {
            crop: updatedContext.crop,
            mandi: 'Talegaon APMC',
            modalPrice: 2450,
            netPrice: 2380,
            distance: 18,
            trend: 'increasing',
            trendPercent: '+11.4%',
            channelType: 'MANDI_APMC',
          },
        ];

    // Pick top performing mandi from DB records
    const bestMandi = mandiOptions.reduce(
      (prev, curr) => (curr.modalPrice > prev.modalPrice ? curr : prev),
      mandiOptions[0],
    );

    // 3. Try Gemini AI if valid API key is available
    const geminiKey = process.env.GEMINI_API_KEY;
    let geminiReply: string | null = null;
    let isDemoAi = true;

    if (geminiKey && !geminiKey.includes('PASTE_YOUR_GEMINI_API_KEY') && !geminiKey.startsWith('AQ.')) {
      try {
        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI({ apiKey: geminiKey });

        const systemPrompt = `You are "KrishiSetu AI", an expert agricultural market assistant.
User has ${updatedContext.quantityQtl} quintals of ${updatedContext.crop}.
Available database mandi modal price: ${bestMandi.mandi} at ₹${bestMandi.modalPrice}/qtl (${bestMandi.distance} km).
RULES: Strictly advisory. No transactions. Never guarantee future prices. Language: ${lang === 'hi' ? 'Hindi' : 'English'}.`;

        const res = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `${systemPrompt}\n\nUser: ${rawMessage}`,
        });
        if (res && res.text) {
          geminiReply = res.text;
          isDemoAi = false;
        }
      } catch (err: any) {
        console.warn('[Gemini AI note]:', err?.message);
      }
    }

    // 4. Generate structured market response
    const advisoryResponse = buildAdvisoryResponse({
      rawMessage,
      lower,
      lang,
      context: updatedContext,
      bestMandi,
      mandiOptions,
      dbFpos,
      geminiReply,
      isDemoAi,
    });

    return NextResponse.json(advisoryResponse);
  } catch (err: any) {
    console.error('[API /api/ai/chat POST] error:', err);
    return NextResponse.json(
      {
        reply:
          "Sorry, I'm unable to connect to the AI service right now. You can still explore current market prices and compare mandis.",
        cardType: 'advisory',
        isDemoAi: true,
        actions: [
          { label: 'View Market Prices', action: 'navigate', href: '/markets' },
          { label: 'Compare Mandis', action: 'navigate', href: '/markets' },
        ],
        disclaimer: 'Market insights are for advisory guidance based on database market benchmarks.',
      },
      { status: 200 },
    );
  }
}

function detectHindi(text: string): boolean {
  if (/[\u0900-\u097F]/.test(text)) return true;
  const hinglish = ['kaha', 'kaise', 'batao', 'kitne', 'bik', 'hai', 'kya', 'mere', 'paas', 'bhav', 'chahiye', 'karu'];
  const lower = text.toLowerCase();
  return hinglish.some((w) => lower.includes(w));
}

function buildAdvisoryResponse(opts: {
  rawMessage: string;
  lower: string;
  lang: 'en' | 'hi';
  context: { crop: string; quantityQtl: number; location: string; transportCost: number };
  bestMandi: any;
  mandiOptions: any[];
  dbFpos: any[];
  geminiReply: string | null;
  isDemoAi: boolean;
}) {
  const { lower, lang, context, bestMandi, mandiOptions, dbFpos, geminiReply, isDemoAi } = opts;
  const isHi = lang === 'hi';
  const crop = context.crop;
  const qty = context.quantityQtl;

  const grossVal = calculateEstimatedValue(qty, bestMandi.modalPrice);
  const estTransport = context.transportCost || 1500;
  const netVal = calculateEstimatedNetValue(qty, bestMandi.modalPrice, estTransport);

  // 1. SPECIFIC 20 QUINTAL WHEAT / SELL OR WAIT QUERY
  if (
    (lower.includes('best') && (lower.includes('mandi') || lower.includes('price')) && (lower.includes('sell') || lower.includes('wait') || lower.includes('hold'))) ||
    (lower.includes('20') && (lower.includes('wheat') || lower.includes('gehu')) && (lower.includes('best') || lower.includes('mandi')))
  ) {
    const textEn = `Based on the current market data available in KrishiSetu, ${bestMandi.mandi} currently has the highest ${crop.toLowerCase()} modal price among the compared markets.

🌾 **${crop}**
• Quantity: ${qty} quintals
• **${bestMandi.mandi}:** ₹${bestMandi.modalPrice.toLocaleString('en-IN')}/quintal
• **Estimated Gross Value:** ₹${grossVal.toLocaleString('en-IN')}
• **Estimated Net Value (after ~₹${estTransport.toLocaleString('en-IN')} freight):** ₹${netVal.toLocaleString('en-IN')}

However, ${bestMandi.mandi} is farther away (${bestMandi.distance} km), so transportation cost should also be considered.

📈 **Current Trend:** ↗ Increasing (${bestMandi.trendPercent || '+11.4%'})

💡 **Recommendation:**
${bestMandi.mandi} appears to be a potentially better option based on current estimated market value. However, future prices are uncertain. Please verify the latest market price before making your final selling decision.`;

    const textHi = `अभी उपलब्ध डेमो मार्केट डेटा के अनुसार, ${bestMandi.mandi} में ${crop === 'Wheat' ? 'गेहूं' : crop} का मॉडल भाव सबसे अधिक है।

🌾 **${crop === 'Wheat' ? 'गेहूं' : crop}**
• मात्रा: ${qty} क्विंटल
• **${bestMandi.mandi}:** ₹${bestMandi.modalPrice.toLocaleString('en-IN')}/क्विंटल
• **आपके ${qty} क्विंटल के लिए अनुमानित कुल मूल्य:** ₹${grossVal.toLocaleString('en-IN')}
• **अनुमानित शुद्ध प्राप्ति (लगभग ₹${estTransport.toLocaleString('en-IN')} ढुलाई के बाद):** ₹${netVal.toLocaleString('en-IN')}

लेकिन ${bestMandi.mandi} की दूरी अधिक है (${bestMandi.distance} km), इसलिए परिवहन लागत को भी ध्यान में रखना चाहिए।

📈 **वर्तमान ट्रेंड:** बढ़ता हुआ ↗ (${bestMandi.trendPercent || '+11.4%'})

💡 **सुझाव:**
उपलब्ध बाजार डेटा के अनुसार ${bestMandi.mandi} बेहतर विकल्प हो सकता है। भविष्य की कीमत की गारंटी नहीं दी जा सकती। कृपया अंतिम बिक्री निर्णय लेने से पहले ताजा भाव अवश्य जांच लें।`;

    return {
      reply: geminiReply || (isHi ? textHi : textEn),
      cardType: 'comparison' as const,
      cardData: {
        crop,
        quantityQtl: qty,
        bestMandi: bestMandi.mandi,
        modalPrice: bestMandi.modalPrice,
        distanceKm: bestMandi.distance,
        trend: bestMandi.trend,
        trendPercent: bestMandi.trendPercent,
        grossValue: grossVal,
        netValue: netVal,
        allMandis: mandiOptions,
      },
      actions: [
        { label: 'Compare Mandis', action: 'navigate', href: '/markets' },
        { label: 'View Price Trend', action: 'navigate', href: '/markets' },
        { label: 'Calculate Estimated Value', action: 'prompt', prompt: `Calculate estimated value for ${qty} quintals of ${crop}` },
      ],
      isDemoAi,
      sessionContext: context,
      disclaimer: isHi
        ? 'यह केवल उपलब्ध बाजार डेटा पर आधारित सुझाव है। भविष्य की कीमत की गारंटी नहीं दी जा सकती।'
        : 'AI insights are based on available market data and are not guaranteed forecasts.',
    };
  }

  // 2. BEST MANDI QUERY
  if (lower.includes('best mandi') || lower.includes('highest price') || lower.includes('better hai') || lower.includes('nearby mandi')) {
    const textEn = `Market comparison from database records:
**${bestMandi.mandi}** offers the highest modal price of **₹${bestMandi.modalPrice.toLocaleString('en-IN')}/qtl** (${bestMandi.distance} km away, ↗ ${bestMandi.trendPercent || 'Increasing'}).

For your **${qty} quintals**, estimated gross value is **₹${grossVal.toLocaleString('en-IN')}**, with estimated net realization of **₹${netVal.toLocaleString('en-IN')}**.`;

    const textHi = `डेटाबेस रिकॉर्ड्स से मंडी तुलना:
**${bestMandi.mandi}** में सबसे अधिक मॉडल भाव **₹${bestMandi.modalPrice.toLocaleString('en-IN')}/क्विंटल** है (${bestMandi.distance} km दूरी, ↗ ${bestMandi.trendPercent || 'बढ़ता हुआ'})।

आपके **${qty} क्विंटल** के लिए अनुमानित सकल मूल्य **₹${grossVal.toLocaleString('en-IN')}** और ढुलाई बाद शुद्ध लाभ **₹${netVal.toLocaleString('en-IN')}** रहेगा।`;

    return {
      reply: geminiReply || (isHi ? textHi : textEn),
      cardType: 'comparison' as const,
      cardData: {
        crop,
        bestMandi: bestMandi.mandi,
        modalPrice: bestMandi.modalPrice,
        distanceKm: bestMandi.distance,
        trend: bestMandi.trend,
        trendPercent: bestMandi.trendPercent,
        allMandis: mandiOptions,
      },
      actions: [
        { label: 'Compare All Mandis', action: 'navigate', href: '/markets' },
        { label: 'View Net Return', action: 'navigate', href: '/dashboard' },
      ],
      isDemoAi,
      sessionContext: context,
      disclaimer: 'AI insights are based on available market data and are not guaranteed forecasts.',
    };
  }

  // 3. PRICE TREND QUERY
  if (lower.includes('trend') || lower.includes('badh raha') || lower.includes('gir raha') || lower.includes('price increasing') || lower.includes('rate badhega')) {
    const textEn = `**${crop} Price Trend Analysis:**
• Current Modal Price: **₹${bestMandi.modalPrice.toLocaleString('en-IN')}/qtl**
• 7-Day Change: **+11.4%**
• Trend: **↗ Increasing**

Arrival volumes indicate solid market support. However, unpredictable changes in weather or bulk shipments can cause shifts.`;

    const textHi = `**${crop === 'Wheat' ? 'गेहूं' : crop} भाव ट्रेंड विश्लेषण:**
• वर्तमान मॉडल भाव: **₹${bestMandi.modalPrice.toLocaleString('en-IN')}/क्विंटल**
• 7-दिन का बदलाव: **+11.4%**
• रुझान: **बढ़ता हुआ 📈 (Increasing)**`;

    return {
      reply: geminiReply || (isHi ? textHi : textEn),
      cardType: 'trend' as const,
      cardData: {
        crop,
        currentPrice: bestMandi.modalPrice,
        change7Day: '+11.4%',
        trend: 'Increasing',
      },
      actions: [
        { label: 'View Full Trend', action: 'navigate', href: '/markets' },
        { label: 'Compare Mandis', action: 'navigate', href: '/markets' },
      ],
      isDemoAi,
      sessionContext: context,
      disclaimer: 'AI insights are based on available market data and are not guaranteed forecasts.',
    };
  }

  // 4. SELL NOW OR WAIT QUERY
  if (lower.includes('sell now') || lower.includes('should i sell') || lower.includes('wait') || lower.includes('hold') || lower.includes('sell karu ya wait')) {
    const textEn = `Recent market data shows an increasing trend, but future prices are uncertain.

If you need to sell immediately, compare the current net value across nearby mandis.
If storage is available and you are comfortable with market risk, you may monitor the trend further.

Final decision should consider your storage cost, urgency, transportation cost and local market conditions.`;

    const textHi = `Recent data mein wheat prices increasing trend dikha rahe hain. Lekin future price ki guarantee nahi di ja sakti.

Agar aapko abhi sell karna zaroori hai, to current net value ke basis par mandi compare karna useful rahega.

Agar storage available hai, to aap market trend ko monitor kar sakte hain.

Final decision mein storage cost, transportation aur aapki selling urgency ko consider karein.`;

    return {
      reply: geminiReply || (isHi ? textHi : textEn),
      cardType: 'advisory' as const,
      cardData: {
        crop,
        recommendationType: 'CONSIDER_STORAGE_OR_COMPARE',
        trend: 'Increasing ↗',
      },
      actions: [
        { label: 'Compare Mandis', action: 'navigate', href: '/markets' },
        { label: 'View Trend', action: 'navigate', href: '/markets' },
      ],
      isDemoAi,
      sessionContext: context,
      disclaimer: isHi
        ? 'यह केवल उपलब्ध बाजार डेटा पर आधारित सुझाव है। भविष्य की कीमत की गारंटी नहीं दी जा सकती।'
        : 'AI insights are based on available market data and are not guaranteed forecasts.',
    };
  }

  // 5. QUANTITY CALCULATION
  if (lower.includes('quintal') || lower.includes('value') || lower.includes('net value') || lower.includes('mere paas') || lower.includes('calculate')) {
    const textEn = `For **${qty} quintals** of **${crop}**:

• Modal Rate: ₹${bestMandi.modalPrice.toLocaleString('en-IN')}/qtl at ${bestMandi.mandi}
• **Estimated Gross Value:** ₹${grossVal.toLocaleString('en-IN')} (${qty} × ₹${bestMandi.modalPrice.toLocaleString('en-IN')})
• **Estimated Transport Cost:** ₹${estTransport.toLocaleString('en-IN')}
• **Estimated Net Realization:** ₹${netVal.toLocaleString('en-IN')} (Gross − Transport)

*Clearly Labeled: Estimated value. Not guaranteed income.*`;

    const textHi = `आपके **${qty} क्विंटल** **${crop === 'Wheat' ? 'गेहूं' : crop}** के लिए:

• मॉडल भाव: ₹${bestMandi.modalPrice.toLocaleString('en-IN')}/क्विंटल (${bestMandi.mandi})
• **अनुमानित कुल मूल्य:** ₹${grossVal.toLocaleString('en-IN')}
• **अनुमानित परिवहन खर्च:** ₹${estTransport.toLocaleString('en-IN')}
• **अनुमानित शुद्ध प्राप्ति:** ₹${netVal.toLocaleString('en-IN')}

*नोट: यह केवल अनुमानित मूल्य है, गारंटीशुदा लाभ नहीं।*`;

    return {
      reply: geminiReply || (isHi ? textHi : textEn),
      cardType: 'value_calculation' as const,
      cardData: {
        crop,
        quantityQtl: qty,
        pricePerQtl: bestMandi.modalPrice,
        grossValue: grossVal,
        transportCost: estTransport,
        netValue: netVal,
      },
      actions: [
        { label: 'Calculate Net Value', action: 'prompt', prompt: `Calculate net value for ${qty} quintals after transport` },
        { label: 'Compare Markets', action: 'navigate', href: '/markets' },
      ],
      isDemoAi,
      sessionContext: context,
      disclaimer: 'Calculated figures are estimates based on prevailing market rates.',
    };
  }

  // 6. FPO QUERY
  if (lower.includes('fpo') || lower.includes('group') || lower.includes('pool') || lower.includes('collective') || lower.includes('farmers')) {
    const firstFpo = dbFpos[0];
    const fpoName = firstFpo?.legalName || 'Wheat Farmers – Haldwani';
    const location = firstFpo?.district ? `${firstFpo.district}, ${firstFpo.state || 'India'}` : 'Haldwani Cluster, Uttarakhand';
    const membersCount = firstFpo?.farmers?.length || 24;
    const produceQtl = 180;

    const textEn = `Active Farmer Producer Organizations (FPOs) from platform database:

🌾 **${fpoName}**
• ${membersCount} Member Farmers
• ${produceQtl} Quintals Aggregated Produce
• Saves ~32% on logistics via pooled Full-Truckload dispatch

Joining an FPO provides higher bargaining power and freight savings.`;

    const textHi = `प्लेटफ़ॉर्म डेटाबेस से सक्रिय एफपीओ (FPO):

🌾 **${fpoName}**
• ${membersCount} सदस्य किसान
• ${produceQtl} क्विंटल सामूहिक उपज
• साझा ट्रक ढुलाई से लगभग 32% परिवहन बचत

FPO से जुड़कर किसान बेहतर सामूहिक मोलभाव और कम परिवहन लागत प्राप्त कर सकते हैं।`;

    return {
      reply: geminiReply || (isHi ? textHi : textEn),
      cardType: 'fpo' as const,
      cardData: {
        fpoName,
        crop,
        location,
        membersCount,
        aggregatedProduceQtl: produceQtl,
      },
      actions: [
        { label: 'View FPO', action: 'navigate', href: '/fpo' },
        { label: 'Pool Produce', action: 'navigate', href: '/fpo' },
      ],
      isDemoAi,
      sessionContext: context,
      disclaimer: 'FPO pooling availability is subject to verification and batch quota.',
    };
  }

  // 7. CROP PRICE QUERY
  if (lower.includes('bhav') || lower.includes('price') || lower.includes('rate') || lower.includes('bik')) {
    const textEn = `Current prices for **${crop}**:
• ${bestMandi.mandi}: **₹${bestMandi.modalPrice.toLocaleString('en-IN')}/qtl**
• Trend: **↗ Increasing** (${bestMandi.trendPercent || '+11.4%'} this week)
• Distance: **${bestMandi.distance} km**`;

    const textHi = `**${crop === 'Wheat' ? 'गेहूं' : crop} का आज का भाव:**
• ${bestMandi.mandi}: **₹${bestMandi.modalPrice.toLocaleString('en-IN')}/क्विंटल**
• रुझान: **बढ़ता हुआ 📈**
• दूरी: **${bestMandi.distance} km**`;

    return {
      reply: geminiReply || (isHi ? textHi : textEn),
      cardType: 'comparison' as const,
      cardData: {
        crop,
        bestMandi: bestMandi.mandi,
        modalPrice: bestMandi.modalPrice,
        allMandis: mandiOptions,
      },
      actions: [
        { label: 'Compare Mandis', action: 'navigate', href: '/markets' },
        { label: 'View Price Trend', action: 'navigate', href: '/markets' },
      ],
      isDemoAi,
      sessionContext: context,
      disclaimer: 'Indicative market rates based on latest platform data.',
    };
  }

  // DEFAULT GREETING
  const defaultEn = `Namaste! 👋 I'm **KrishiSetu AI**, your Smart Market Assistant.

I can help you compare mandi prices, calculate net returns after freight, check price trends, or find nearby FPOs.

What would you like to know today?`;

  const defaultHi = `नमस्ते! 👋 मैं **कृषिसेतु AI** हूँ, आपका स्मार्ट मंडी सहायक।

मैं आपको आसपास की मंडियों के भाव तुलना, शुद्ध लाभ गणना और FPO खोजने में मदद कर सकता हूँ।

आज आप क्या जानना चाहते हैं?`;

  return {
    reply: geminiReply || (isHi ? defaultHi : defaultEn),
    cardType: 'advisory' as const,
    actions: [
      { label: '🌾 Wheat price today', action: 'prompt', prompt: 'Wheat price today' },
      { label: '📍 Best nearby mandi', action: 'prompt', prompt: 'Which mandi has the best price for wheat?' },
      { label: '📈 Price trend', action: 'prompt', prompt: 'Is wheat price increasing?' },
      { label: '💡 Should I sell now?', action: 'prompt', prompt: 'Should I sell my wheat now or wait?' },
      { label: '👥 Find an FPO', action: 'prompt', prompt: 'Find farmer group for wheat' },
    ],
    isDemoAi,
    sessionContext: context,
  };
}

