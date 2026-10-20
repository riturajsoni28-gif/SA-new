import React, { useMemo, useState } from 'react';
import { GoldButton } from './GoldButton';

interface CurrencyConfig {
  code: string;
  symbol: string;
  label: string;
  locale: string;
  defaultSpend: number;
  spendMin: number;
  spendMax: number;
  spendStep: number;
  defaultAov: number;
}

const WORLD_CURRENCIES: CurrencyConfig[] = [
  {
    code: 'INR',
    symbol: '₹',
    label: 'INR (₹) - Indian Rupee',
    locale: 'en-IN',
    defaultSpend: 250000,
    spendMin: 10000,
    spendMax: 5000000,
    spendStep: 10000,
    defaultAov: 2500,
  },
  {
    code: 'USD',
    symbol: '$',
    label: 'USD ($) - US Dollar',
    locale: 'en-US',
    defaultSpend: 5000,
    spendMin: 200,
    spendMax: 100000,
    spendStep: 200,
    defaultAov: 75,
  },
  {
    code: 'EUR',
    symbol: '€',
    label: 'EUR (€) - Euro',
    locale: 'de-DE',
    defaultSpend: 4500,
    spendMin: 200,
    spendMax: 100000,
    spendStep: 200,
    defaultAov: 70,
  },
  {
    code: 'GBP',
    symbol: '£',
    label: 'GBP (£) - British Pound',
    locale: 'en-GB',
    defaultSpend: 4000,
    spendMin: 200,
    spendMax: 80000,
    spendStep: 200,
    defaultAov: 60,
  },
  {
    code: 'AED',
    symbol: 'AED ',
    label: 'AED - UAE Dirham',
    locale: 'en-AE',
    defaultSpend: 18000,
    spendMin: 1000,
    spendMax: 350000,
    spendStep: 1000,
    defaultAov: 250,
  },
  {
    code: 'CAD',
    symbol: 'C$',
    label: 'CAD (C$) - Canadian Dollar',
    locale: 'en-CA',
    defaultSpend: 6500,
    spendMin: 300,
    spendMax: 120000,
    spendStep: 300,
    defaultAov: 90,
  },
  {
    code: 'AUD',
    symbol: 'A$',
    label: 'AUD (A$) - Australian Dollar',
    locale: 'en-AU',
    defaultSpend: 7500,
    spendMin: 300,
    spendMax: 140000,
    spendStep: 300,
    defaultAov: 100,
  },
  {
    code: 'SGD',
    symbol: 'S$',
    label: 'SGD (S$) - Singapore Dollar',
    locale: 'en-SG',
    defaultSpend: 6800,
    spendMin: 300,
    spendMax: 130000,
    spendStep: 300,
    defaultAov: 95,
  },
  {
    code: 'JPY',
    symbol: '¥',
    label: 'JPY (¥) - Japanese Yen',
    locale: 'ja-JP',
    defaultSpend: 650000,
    spendMin: 25000,
    spendMax: 12000000,
    spendStep: 25000,
    defaultAov: 8500,
  },
];

export const RoasCalculator: React.FC = () => {
  // Currency state
  const [currencyCode, setCurrencyCode] = useState<string>('INR');
  const activeCurrency =
    WORLD_CURRENCIES.find((c) => c.code === currencyCode) || WORLD_CURRENCIES[0];

  // Input states
  const [adSpend, setAdSpend] = useState<number>(activeCurrency.defaultSpend);
  const [aov, setAov] = useState<number>(activeCurrency.defaultAov);
  const [conversionRate, setConversionRate] = useState<number>(3.2);

  // Switch currency helper with contextual defaults
  const handleCurrencyChange = (newCode: string) => {
    const next = WORLD_CURRENCIES.find((c) => c.code === newCode);
    if (!next) return;
    setCurrencyCode(newCode);
    setAdSpend(next.defaultSpend);
    setAov(next.defaultAov);
  };

  // Calculations based on Auctus optimization benchmarks
  const { multiplier, estimatedRevenueIncrease, netProfitGain, projectedRevenue } = useMemo(() => {
    const baseMult = 4.4;
    const crBonus = Math.min(2.0, (conversionRate / 2.5) * 1.1);
    
    // Normalize AOV factor across different currency magnitudes
    const normalizedAov = currencyCode === 'INR' || currencyCode === 'JPY' ? aov / 35 : aov;
    const aovFactor = Math.min(0.8, Math.max(-0.4, (Math.log10(Math.max(10, normalizedAov)) - 1.8) * 0.5));
    
    // Computed multiplier (averages 5.6x - 6.4x)
    const mult = Math.max(3.5, Math.min(7.5, baseMult + crBonus + aovFactor));
    
    const projRev = adSpend * mult;
    const baselineRev = adSpend * 2.4;
    const revIncrease = Math.max(0, projRev - baselineRev);
    const profitGain = revIncrease * 0.45;

    return {
      multiplier: Number(mult.toFixed(1)),
      projectedRevenue: Math.round(projRev),
      estimatedRevenueIncrease: Math.round(revIncrease),
      netProfitGain: Math.round(profitGain),
    };
  }, [adSpend, aov, conversionRate, currencyCode]);

  // Currency Formatter
  const formatMoney = (val: number) => {
    return (
      activeCurrency.symbol +
      val.toLocaleString(activeCurrency.locale, {
        maximumFractionDigits: 0,
      })
    );
  };

  return (
    <div className="relative isolate overflow-hidden rounded-[36px] border border-[#2e2e2e] bg-[#121213] p-6 md:p-12 lg:p-16 shadow-2xl">
      {/* Subtle Golden Slat Grid Background Pattern */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-30"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 20%, rgba(255, 208, 79, 0.12) 0%, transparent 60%),
            repeating-linear-gradient(0deg, rgba(255, 208, 79, 0.04) 0px, rgba(255, 208, 79, 0.04) 1px, transparent 1px, transparent 26px),
            repeating-linear-gradient(90deg, rgba(255, 208, 79, 0.04) 0px, rgba(255, 208, 79, 0.04) 1px, transparent 1px, transparent 26px)
          `,
        }}
      />

      {/* Section Header */}
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-[clamp(15px,1.4vw,20px)] font-semibold uppercase tracking-wider text-[#ffd04f]">
          ROI Projection
        </p>
        <h2 className="font-['Sulphur_Point',sans-serif] mt-3 text-[clamp(28px,3.2vw,52px)] font-bold leading-tight text-white tracking-tight">
          Calculate Your Potential ROAS
        </h2>
        <p className="mt-3 text-[clamp(15px,1.2vw,18px)] text-[#bdbdbd] font-normal leading-relaxed">
          Select your currency, input your monthly ad budget, AOV, and conversion rate to see data-driven revenue and multiplier projections.
        </p>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ALL CAMPAIGN PARAMETERS & CURRENCY SELECTOR (UNIFIED INPUT PANEL)   */}
      {/* ========================================================================= */}
      <div className="mt-10 rounded-[28px] border border-[#2e2e2e] bg-[#18181a]/95 p-6 md:p-8 backdrop-blur-md shadow-xl">
        {/* Panel Header & Currency Selector */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2b2b2b] pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex size-2.5 rounded-full bg-[#ffd04f]" />
              <h3 className="text-lg md:text-xl font-bold text-white tracking-tight">
                Campaign Parameters & Budget
              </h3>
            </div>
            <p className="mt-1 text-xs md:text-sm text-[#9ca3af]">
              Enter custom digits manually or use the interactive slider.
            </p>
          </div>

          {/* Worldwide Currency Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <label htmlFor="currency-select" className="text-xs font-semibold uppercase tracking-wider text-[#ffd04f]">
              Choose Currency:
            </label>
            <div className="relative">
              <select
                id="currency-select"
                value={currencyCode}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                className="h-[44px] cursor-pointer rounded-xl border border-[#ffd04f]/50 bg-[#252528] px-4 pr-10 text-sm font-semibold text-white focus:border-[#ffd04f] focus:outline-none focus:ring-1 focus:ring-[#ffd04f]"
              >
                {WORLD_CURRENCIES.map((curr) => (
                  <option key={curr.code} value={curr.code} className="bg-[#1f1f21] text-white">
                    {curr.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-[#ffd04f]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Currency Pills */}
        <div className="mt-5 flex flex-wrap items-center gap-2 pb-2">
          <span className="text-xs text-[#888]">Popular:</span>
          {['INR', 'USD', 'EUR', 'GBP', 'AED', 'CAD', 'AUD'].map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => handleCurrencyChange(code)}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                currencyCode === code
                  ? 'bg-[#ffd04f] text-black shadow-md'
                  : 'bg-[#262629] text-[#bdbdbd] hover:bg-[#333] hover:text-white'
              }`}
            >
              {code}
            </button>
          ))}
        </div>

        {/* 3 Parameter Inputs (Arranged in a Clean Responsive Grid) */}
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Field 1: Monthly Ad Spend */}
          <div className="flex flex-col justify-between rounded-2xl border border-[#333] bg-[#202022] p-5 transition-colors hover:border-[#ffd04f]/40">
            <div className="flex items-center justify-between">
              <label htmlFor="ad-spend-digit" className="text-sm font-semibold text-[#e5e7eb]">
                Monthly Ad Spend
              </label>
              <span className="rounded bg-[#ffd04f]/15 px-2 py-0.5 text-xs font-bold text-[#ffd04f]">
                {activeCurrency.code}
              </span>
            </div>

            {/* Editable Direct Numeric Input */}
            <div className="relative my-3">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-lg font-bold text-[#ffd04f]">
                {activeCurrency.symbol}
              </span>
              <input
                id="ad-spend-digit"
                type="number"
                min={1}
                step={activeCurrency.spendStep}
                value={adSpend}
                onChange={(e) => setAdSpend(Math.max(0, Number(e.target.value)))}
                className="h-[52px] w-full rounded-xl border border-[#3d3d40] bg-[#171719] pl-9 pr-4 text-xl font-bold text-white placeholder:text-[#666] focus:border-[#ffd04f] focus:outline-none focus:ring-1 focus:ring-[#ffd04f] transition-colors"
                aria-label="Monthly Ad Spend number input"
              />
            </div>

            {/* Range Slider for quick sliding */}
            <div className="mt-2 space-y-1.5">
              <input
                id="ad-spend-slider"
                type="range"
                min={activeCurrency.spendMin}
                max={activeCurrency.spendMax}
                step={activeCurrency.spendStep}
                value={Math.min(adSpend, activeCurrency.spendMax)}
                onChange={(e) => setAdSpend(Number(e.target.value))}
                className="roas-slider w-full cursor-pointer"
                aria-label="Monthly Ad Spend range slider"
                style={{
                  background: `linear-gradient(to right, #ffd04f 0%, #ffd04f ${Math.min(
                    100,
                    (adSpend / activeCurrency.spendMax) * 100
                  )}%, #333333 ${Math.min(
                    100,
                    (adSpend / activeCurrency.spendMax) * 100
                  )}%, #333333 100%)`,
                }}
              />
              <div className="flex justify-between text-[11px] text-[#888]">
                <span>{formatMoney(activeCurrency.spendMin)}</span>
                <span>{formatMoney(activeCurrency.spendMax)}+</span>
              </div>
            </div>
          </div>

          {/* Field 2: Average Order Value (AOV) */}
          <div className="flex flex-col justify-between rounded-2xl border border-[#333] bg-[#202022] p-5 transition-colors hover:border-[#ffd04f]/40">
            <div className="flex items-center justify-between">
              <label htmlFor="aov-input" className="text-sm font-semibold text-[#e5e7eb]">
                Average Order Value (AOV)
              </label>
              <span className="rounded bg-[#ffd04f]/15 px-2 py-0.5 text-xs font-bold text-[#ffd04f]">
                {activeCurrency.code}
              </span>
            </div>

            {/* Editable Direct Numeric Input */}
            <div className="relative my-3">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-lg font-bold text-[#ffd04f]">
                {activeCurrency.symbol}
              </span>
              <input
                id="aov-input"
                type="number"
                min={1}
                step={1}
                value={aov}
                onChange={(e) => setAov(Math.max(0, Number(e.target.value)))}
                className="h-[52px] w-full rounded-xl border border-[#3d3d40] bg-[#171719] pl-9 pr-4 text-xl font-bold text-white placeholder:text-[#666] focus:border-[#ffd04f] focus:outline-none focus:ring-1 focus:ring-[#ffd04f] transition-colors"
                aria-label="Average Order Value numeric input"
              />
            </div>

            {/* Dynamic Presets Based on Currency */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {(currencyCode === 'INR'
                ? [1200, 2500, 4800, 9500]
                : currencyCode === 'JPY'
                ? [3500, 7500, 15000, 25000]
                : [45, 75, 120, 250]
              ).map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAov(preset)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                    aov === preset
                      ? 'bg-[#ffd04f] text-black font-semibold'
                      : 'bg-[#2b2b2e] text-[#bdbdbd] hover:bg-[#38383c] hover:text-white'
                  }`}
                >
                  {activeCurrency.symbol}
                  {preset.toLocaleString(activeCurrency.locale)}
                </button>
              ))}
            </div>
          </div>

          {/* Field 3: Conversion Rate */}
          <div className="flex flex-col justify-between rounded-2xl border border-[#333] bg-[#202022] p-5 transition-colors hover:border-[#ffd04f]/40">
            <div className="flex items-center justify-between">
              <label htmlFor="cr-input" className="text-sm font-semibold text-[#e5e7eb]">
                Conversion Rate
              </label>
              <span className="rounded bg-[#ffd04f]/15 px-2 py-0.5 text-xs font-bold text-[#ffd04f]">
                % RATE
              </span>
            </div>

            {/* Editable Direct Numeric Input */}
            <div className="relative my-3">
              <input
                id="cr-input"
                type="number"
                min={0.1}
                max={30.0}
                step={0.1}
                value={conversionRate}
                onChange={(e) => setConversionRate(Math.max(0.1, Number(e.target.value)))}
                className="h-[52px] w-full rounded-xl border border-[#3d3d40] bg-[#171719] pl-4 pr-10 text-xl font-bold text-white placeholder:text-[#666] focus:border-[#ffd04f] focus:outline-none focus:ring-1 focus:ring-[#ffd04f] transition-colors"
                aria-label="Conversion rate percentage input"
              />
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-lg font-bold text-[#ffd04f]">
                %
              </span>
            </div>

            {/* Conversion Rate Presets */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[1.8, 2.5, 3.2, 4.5].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setConversionRate(preset)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                    conversionRate === preset
                      ? 'bg-[#ffd04f] text-black font-semibold'
                      : 'bg-[#2b2b2e] text-[#bdbdbd] hover:bg-[#38383c] hover:text-white'
                  }`}
                >
                  {preset}%
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 2: ESTIMATED REVENUE, PROJECTED ROAS, NET PROFIT (UNIFIED RESULTS PANEL) */}
      {/* ========================================================================= */}
      <div className="mt-8 rounded-[28px] border-2 border-[#ffd04f]/70 bg-gradient-to-b from-[#221e14] via-[#171719] to-[#111112] p-6 md:p-10 shadow-[0_0_35px_rgba(255,208,79,0.14)] backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-[#ffd04f]/25 pb-4">
          <div>
            <h3 className="text-lg md:text-xl font-bold text-white tracking-tight">
              Projected Returns & Profit Multiplier
            </h3>
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#ffd04f]">
            Currency: {activeCurrency.code}
          </span>
        </div>

        {/* 3 Result Boxes Inside the Unified Results Tab */}
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-6 items-center">
          {/* Box 1: Estimated Revenue Increase */}
          <div className="flex flex-col justify-center rounded-2xl border border-[#ffd04f]/30 bg-[#161618] p-6 text-center transition-all hover:border-[#ffd04f]/70 hover:-translate-y-0.5">
            <p className="text-xs md:text-sm font-semibold uppercase tracking-wider text-[#d1d5db]">
              Estimated Revenue Increase
            </p>
            <div className="mt-2 text-[clamp(24px,2.5vw,36px)] font-extrabold text-[#ffd04f] tabular-nums tracking-tight">
              +{formatMoney(estimatedRevenueIncrease)}
            </div>
            <p className="mt-1 text-xs text-[#999]">
              Incremental lift above baseline
            </p>
          </div>

          {/* Box 2 (Central): Projected ROAS Multiplier Display */}
          <div className="relative flex flex-col justify-center rounded-2xl border-2 border-[#ffd04f] bg-gradient-to-b from-[#2e2612] via-[#1d1b14] to-[#141416] p-7 text-center shadow-[0_0_25px_rgba(255,208,79,0.25)] md:scale-105 transition-all">
            <div className="inline-block mx-auto mb-1 rounded-full border border-[#ffd04f]/60 bg-[#ffd04f]/20 px-3.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#ffd04f]">
              Outcome Multiplier
            </div>
            <p className="text-sm md:text-base font-semibold text-white tracking-wide">
              Projected ROAS Multiplier
            </p>
            <div className="mt-2 text-[clamp(44px,4.5vw,68px)] font-black leading-none text-[#ffd04f] [text-shadow:0_0_24px_rgba(255,208,79,0.5)] tabular-nums">
              {multiplier}x
            </div>
            <p className="mt-2 text-xs text-[#d1d5db]">
              Total projected sales: <span className="font-semibold text-white">{formatMoney(projectedRevenue)}</span>
            </p>
          </div>

          {/* Box 3: Net Profit Gain */}
          <div className="flex flex-col justify-center rounded-2xl border border-[#ffd04f]/30 bg-[#161618] p-6 text-center transition-all hover:border-[#ffd04f]/70 hover:-translate-y-0.5">
            <p className="text-xs md:text-sm font-semibold uppercase tracking-wider text-[#d1d5db]">
              Net Profit Gain
            </p>
            <div className="mt-2 text-[clamp(24px,2.5vw,36px)] font-extrabold text-white tabular-nums tracking-tight">
              +{formatMoney(netProfitGain)}
            </div>
            <p className="mt-1 text-xs text-[#999]">
              Net contribution margin gained
            </p>
          </div>
        </div>

        {/* Dynamic summary message */}
        <div className="mt-8 rounded-xl border border-[#333] bg-[#161618]/90 p-4 text-center text-xs md:text-sm text-[#d1d5db]">
          Investing <span className="font-bold text-[#ffd04f]">{formatMoney(adSpend)}/mo</span> with Auctus is projected to yield{' '}
          <span className="font-bold text-white">{formatMoney(projectedRevenue)}</span> in revenue at a{' '}
          <span className="font-bold text-[#ffd04f]">{multiplier}x ROAS multiplier</span>.
        </div>
      </div>

      {/* CTA Button placed below the results */}
      <div className="mt-10 md:mt-12 flex flex-col items-center justify-center text-center">
        <GoldButton
          href="#contact"
          className="h-[54px] px-10 text-[18px] md:h-[60px] md:px-14 md:text-[20px] font-semibold"
        >
          Get Your Strategy Session
        </GoldButton>
        <p className="mt-3 text-xs text-[#8c8c8c]">
          Free 30-minute ad strategy session with former Google Ads experts & founders.
        </p>
      </div>
    </div>
  );
};
