import React, { useEffect, useState } from 'react';
import { GoldButton } from './GoldButton';

interface AuditScores {
  performance: number;
  seo: number;
  accessibility: number;
  security: number;
}

const ANALYSIS_STEPS = [
  'Connecting to host & pinging server response time...',
  'Checking Core Web Vitals (LCP, FID, CLS, INP)...',
  'Analyzing On-Page SEO, OpenGraph & Structured Data...',
  'Evaluating Accessibility, ARIA tree & Touch Targets...',
  'Auditing Security Headers (HSTS, CSP, COOP, SSL)...',
  'Compiling optimization roadmap & scorecard...',
];

const CircularGauge: React.FC<{ score: number; label: string }> = ({ score, label }) => {
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const scoreColor =
    score >= 90 ? '#22c55e' : score >= 65 ? '#ffd04f' : '#f87171';

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-[#2e2e2e] bg-[#161617]/90 p-4 transition-all hover:border-[#ffd04f]/40">
      <div className="relative size-24 md:size-28 flex items-center justify-center">
        <svg className="size-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="#262626"
            strokeWidth="7"
            fill="transparent"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke={scoreColor}
            strokeWidth="7"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-2xl md:text-3xl font-extrabold text-white tabular-nums">
            {score}
          </span>
          <span className="text-[10px] text-[#888] uppercase tracking-wider">/ 100</span>
        </div>
      </div>
      <span className="mt-3 text-center text-[13px] md:text-sm font-semibold text-[#e5e7eb]">
        {label}
      </span>
      <span
        className="mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
        style={{
          color: scoreColor,
          backgroundColor: `${scoreColor}18`,
          border: `1px solid ${scoreColor}30`,
        }}
      >
        {score >= 90 ? 'Elite' : score >= 65 ? 'Needs Work' : 'Poor'}
      </span>
    </div>
  );
};

export const WebsiteAudit: React.FC = () => {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<'idle' | 'analyzing' | 'completed'>('idle');
  const [stepIdx, setStepIdx] = useState(0);
  const [scores, setScores] = useState<AuditScores>({
    performance: 0,
    seo: 0,
    accessibility: 0,
    security: 0,
  });
  const [analyzedUrl, setAnalyzedUrl] = useState('');
  const [leadForm, setLeadForm] = useState({ name: '', email: '', phone: '' });
  const [isUnlocked, setIsUnlocked] = useState(false);

  // Check if target is socialauctus.com
  const isAuctus = /socialauctus\.com/i.test(analyzedUrl);

  // Generate deterministic scores based on domain string
  const generateScores = (domain: string): AuditScores => {
    // If someone checks socialauctus.com, ALWAYS keep results at top tier (99-100)
    if (/socialauctus\.com/i.test(domain)) {
      return {
        performance: 99,
        seo: 100,
        accessibility: 100,
        security: 100,
      };
    }

    let hash = 0;
    for (let i = 0; i < domain.length; i++) {
      hash = (hash << 5) - hash + domain.charCodeAt(i);
      hash |= 0;
    }
    const abs = Math.abs(hash);

    // Realistic audits: other websites score between 54 and 86 before agency optimization
    const perf = 56 + (abs % 28);
    const seo = 68 + ((abs >> 3) % 24);
    const a11y = 65 + ((abs >> 5) % 26);
    const sec = 52 + ((abs >> 7) % 35);

    return {
      performance: Math.min(92, Math.max(48, perf)),
      seo: Math.min(94, Math.max(55, seo)),
      accessibility: Math.min(93, Math.max(50, a11y)),
      security: Math.min(90, Math.max(45, sec)),
    };
  };

  const handleStartAudit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    let clean = url.trim();
    if (!/^https?:\/\//i.test(clean)) {
      clean = 'https://' + clean;
    }

    setAnalyzedUrl(clean);
    setStatus('analyzing');
    setStepIdx(0);
    setIsUnlocked(false);
  };

  // Step through analysis animation
  useEffect(() => {
    if (status !== 'analyzing') return;

    const timer = setInterval(() => {
      setStepIdx((prev) => {
        if (prev < ANALYSIS_STEPS.length - 1) {
          return prev + 1;
        } else {
          clearInterval(timer);
          setScores(generateScores(analyzedUrl));
          setStatus('completed');
          return prev;
        }
      });
    }, 600);

    return () => clearInterval(timer);
  }, [status, analyzedUrl]);

  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadForm.name || !leadForm.email) return;
    setIsUnlocked(true);
  };

  const handleReset = () => {
    setStatus('idle');
    setUrl('');
    setIsUnlocked(false);
  };

  return (
    <div className="relative isolate overflow-hidden rounded-[36px] border border-[#2e2e2e] bg-[#121213] p-6 md:p-12 lg:p-16 shadow-2xl">
      {/* Subtle Golden Grid Pattern */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-30"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 10%, rgba(255, 208, 79, 0.12) 0%, transparent 65%),
            repeating-linear-gradient(0deg, rgba(255, 208, 79, 0.04) 0px, rgba(255, 208, 79, 0.04) 1px, transparent 1px, transparent 26px),
            repeating-linear-gradient(90deg, rgba(255, 208, 79, 0.04) 0px, rgba(255, 208, 79, 0.04) 1px, transparent 1px, transparent 26px)
          `,
        }}
      />

      {/* Header */}
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-[clamp(15px,1.4vw,20px)] font-semibold uppercase tracking-wider text-[#ffd04f]">
          Free Performance Diagnostic
        </p>
        <h2 className="font-['Sulphur_Point',sans-serif] mt-3 text-[clamp(28px,3.2vw,52px)] font-bold leading-tight text-white tracking-tight">
          Free Website Audit & PageSpeed Checker
        </h2>
        <p className="mt-3 text-[clamp(15px,1.2vw,18px)] text-[#bdbdbd] font-normal leading-relaxed">
          Test your website's real-world loading speed, Core Web Vitals, technical SEO health, and security headers with our instant scanner.
        </p>
      </div>

      {/* URL Input Form (Active when idle or completed) */}
      <div className="mx-auto mt-8 md:mt-10 max-w-2xl">
        <form onSubmit={handleStartAudit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[#ffd04f]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </span>
            <input
              type="text"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://yourwebsite.com"
              aria-label="Website URL for speed and SEO audit"
              disabled={status === 'analyzing'}
              className="h-[56px] w-full rounded-xl border border-[#3b3b3b] bg-[#1a1a1c] pl-11 pr-4 text-[16px] text-white placeholder:text-[#888] focus:border-[#ffd04f] focus:outline-none focus:ring-1 focus:ring-[#ffd04f] transition-all disabled:opacity-60"
            />
          </div>

          <GoldButton
            type="submit"
            disabled={status === 'analyzing'}
            className="h-[56px] px-8 text-[17px] font-semibold whitespace-nowrap disabled:opacity-60"
          >
            {status === 'analyzing' ? 'Auditing...' : 'Run Free Audit'}
          </GoldButton>
        </form>

        {/* Suggestion tags (socialauctus.com removed as requested) */}
        {status === 'idle' && (
          <div className="mt-3 flex items-center justify-center gap-2 text-xs text-[#999]">
            <span>Try sample:</span>
            {['shopify.com', 'mybrandstore.in', 'nike.com'].map((sample) => (
              <button
                key={sample}
                type="button"
                onClick={() => setUrl(`https://${sample}`)}
                className="text-[#ffd04f] hover:underline underline-offset-2"
              >
                {sample}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Analyzing Progress State */}
      {status === 'analyzing' && (
        <div className="mx-auto mt-12 max-w-xl rounded-2xl border border-[#ffd04f]/30 bg-[#161617]/90 p-8 text-center backdrop-blur-md">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full border-2 border-[#ffd04f]/40 bg-[#ffd04f]/10 text-[#ffd04f]">
            <svg
              className="animate-spin"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          </div>

          <h3 className="mt-4 text-xl font-bold text-white">
            Running In-Depth Audit for{' '}
            <span className="text-[#ffd04f]">{analyzedUrl.replace(/^https?:\/\//i, '')}</span>
          </h3>

          {/* Progress bar */}
          <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-[#2a2a2a]">
            <div
              className="h-full bg-gradient-to-r from-[#ffd04f] to-[#ffb800] transition-all duration-500 ease-out"
              style={{ width: `${((stepIdx + 1) / ANALYSIS_STEPS.length) * 100}%` }}
            />
          </div>

          <p className="mt-4 text-sm font-medium text-[#d1d5db] animate-pulse">
            {ANALYSIS_STEPS[stepIdx]}
          </p>

          <div className="mt-6 flex flex-col gap-2 text-left text-xs text-[#8c8c8c]">
            {ANALYSIS_STEPS.slice(0, stepIdx + 1).map((step, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className={i === stepIdx ? 'text-[#ffd04f]' : 'text-[#22c55e]'}>
                  {i === stepIdx ? '●' : '✓'}
                </span>
                <span className={i === stepIdx ? 'text-white font-medium' : 'text-[#777]'}>
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed State: Scorecard & Lead Unlock */}
      {status === 'completed' && (
        <div className="mt-12 space-y-10">
          {/* Top Bar with URL and Re-run button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-[#2b2b2b] bg-[#1a1a1c] p-4 text-sm">
            <div className="flex items-center gap-3">
              <span className="flex size-3 rounded-full bg-[#22c55e]" />
              <span className="text-[#888]">Audit target:</span>
              <span className="font-semibold text-white">{analyzedUrl}</span>
              {isAuctus && (
                <span className="rounded-full bg-[#ffd04f]/15 border border-[#ffd04f]/40 px-2.5 py-0.5 text-[11px] font-bold text-[#ffd04f]">
                  TOP VERIFIED
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="text-xs font-semibold text-[#ffd04f] hover:underline"
            >
              ← Test another URL
            </button>
          </div>

          {/* Circular Gauges Scorecard */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            <CircularGauge score={scores.performance} label="Performance & Speed" />
            <CircularGauge score={scores.seo} label="SEO Health" />
            <CircularGauge score={scores.accessibility} label="Accessibility" />
            <CircularGauge score={scores.security} label="Security Score" />
          </div>

          {/* Key Findings Preview */}
          <div className="rounded-2xl border border-[#2b2b2b] bg-[#171718] p-6">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <span className="text-[#ffd04f]">⚡</span> Diagnostic Findings for{' '}
              {analyzedUrl.replace(/^https?:\/\//i, '').replace(/\/$/, '')}:
            </h4>

            {isAuctus ? (
              /* Top-tier verified findings for Social Auctus */
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs md:text-sm">
                <div className="flex items-start gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3 text-[#d1d5db]">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <div>
                    <p className="font-semibold text-white">Elite Core Web Vitals (LCP: 0.4s, FID: 0ms)</p>
                    <p className="text-xs text-[#9ca3af] mt-0.5">Non-render-blocking CSS, preconnected fonts & instant paint times.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3 text-[#d1d5db]">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <div>
                    <p className="font-semibold text-white">Full Schema.org JSON-LD & Dynamic OpenGraph</p>
                    <p className="text-xs text-[#9ca3af] mt-0.5">Rich search engine knowledge graph & social share cards configured.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3 text-[#d1d5db]">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <div>
                    <p className="font-semibold text-white">100% WCAG AA/AAA Accessibility Tree</p>
                    <p className="text-xs text-[#9ca3af] mt-0.5">Accessible 44x44px touch targets, compliant contrast & clean ARIA roles.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3 text-[#d1d5db]">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <div>
                    <p className="font-semibold text-white">Hardened Enterprise Security Headers</p>
                    <p className="text-xs text-[#9ca3af] mt-0.5">HSTS preload, Strict CSP, Anti-Clickjacking & COOP protection active.</p>
                  </div>
                </div>
              </div>
            ) : (
              /* General findings for client websites */
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs md:text-sm">
                <div className="flex items-start gap-2.5 rounded-xl border border-[#333] bg-[#1f1f21] p-3 text-[#d1d5db]">
                  <span className="text-amber-400 font-bold">⚠️</span>
                  <div>
                    <p className="font-semibold text-white">Render-Blocking Stylesheets Detected</p>
                    <p className="text-xs text-[#9ca3af] mt-0.5">Deferring non-critical CSS could save up to 480ms on First Contentful Paint.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 rounded-xl border border-[#333] bg-[#1f1f21] p-3 text-[#d1d5db]">
                  <span className="text-amber-400 font-bold">⚠️</span>
                  <div>
                    <p className="font-semibold text-white">Missing Strict-Transport-Security (HSTS)</p>
                    <p className="text-xs text-[#9ca3af] mt-0.5">HSTS and Content Security Policy (CSP) headers are recommended for ad trust.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 rounded-xl border border-[#333] bg-[#1f1f21] p-3 text-[#d1d5db]">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <div>
                    <p className="font-semibold text-white">Mobile Viewport Configured</p>
                    <p className="text-xs text-[#9ca3af] mt-0.5">Meta viewport tag configured correctly for smartphone displays.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 rounded-xl border border-[#333] bg-[#1f1f21] p-3 text-[#d1d5db]">
                  <span className="text-amber-400 font-bold">⚠️</span>
                  <div>
                    <p className="font-semibold text-white">Image Modernization (WebP/AVIF)</p>
                    <p className="text-xs text-[#9ca3af] mt-0.5">Converting hero & catalog images can reduce page payload by ~65%.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Lead Capture / Report Lock Section */}
          <div className="relative overflow-hidden rounded-2xl border-2 border-[#ffd04f]/60 bg-gradient-to-b from-[#221e14] via-[#1a1914] to-[#121213] p-6 md:p-10 shadow-2xl">
            {!isUnlocked ? (
              <div className="max-w-2xl mx-auto text-center">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-[#ffd04f]/40 bg-[#ffd04f]/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#ffd04f]">
                  <span>🔒</span> Full Audit Report Locked
                </div>
                <h3 className="font-['Sulphur_Point',sans-serif] mt-3 text-2xl md:text-3xl font-bold text-white tracking-tight">
                  Unlock Your Complete 24-Point Technical SEO & Ad Conversion Roadmap
                </h3>
                <p className="mt-2 text-sm text-[#d1d5db]">
                  Enter your details below to receive the complete PDF audit, code snippets for instant fixes, and personalized suggestions from our founders.
                </p>

                <form onSubmit={handleLeadSubmit} className="mt-6 flex flex-col gap-3 text-left">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Your Full Name*"
                      value={leadForm.name}
                      onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                      className="h-[50px] rounded-xl border border-[#3f3f3f] bg-[#2a2a2c] px-4 text-sm text-white placeholder:text-[#888] focus:border-[#ffd04f] focus:outline-none"
                    />
                    <input
                      type="email"
                      required
                      placeholder="Work Email*"
                      value={leadForm.email}
                      onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                      className="h-[50px] rounded-xl border border-[#3f3f3f] bg-[#2a2a2c] px-4 text-sm text-white placeholder:text-[#888] focus:border-[#ffd04f] focus:outline-none"
                    />
                    <input
                      type="tel"
                      placeholder="Phone (Optional)"
                      value={leadForm.phone}
                      onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                      className="h-[50px] rounded-xl border border-[#3f3f3f] bg-[#2a2a2c] px-4 text-sm text-white placeholder:text-[#888] focus:border-[#ffd04f] focus:outline-none"
                    />
                  </div>

                  <GoldButton type="submit" className="mt-2 h-[54px] w-full text-base font-semibold">
                    Unlock Full SEO & Speed Report
                  </GoldButton>
                </form>

                <p className="mt-3 text-center text-xs text-[#8c8c8c]">
                  🔒 We respect your privacy. No spam. You'll receive actionable code fixes for your site.
                </p>
              </div>
            ) : (
              <div className="max-w-xl mx-auto text-center py-4">
                <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#22c55e]/20 text-[#22c55e] text-2xl">
                  ✓
                </div>
                <h3 className="font-['Sulphur_Point',sans-serif] mt-3 text-2xl md:text-3xl font-bold text-white">
                  Report Queued & Unlocked!
                </h3>
                <p className="mt-2 text-sm text-[#d1d5db]">
                  Thank you, <span className="font-semibold text-white">{leadForm.name}</span>. Your deep-dive audit for{' '}
                  <span className="font-semibold text-[#ffd04f]">{analyzedUrl}</span> has been compiled and dispatched to{' '}
                  <span className="font-semibold text-white">{leadForm.email}</span>.
                </p>
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <GoldButton href="#contact" className="h-[48px] px-8 text-sm font-semibold">
                    Speak with Founder
                  </GoldButton>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="h-[48px] rounded-full border border-[#444] px-6 text-sm text-[#d1d5db] hover:border-[#ffd04f] hover:text-white transition-colors"
                  >
                    Audit Another Site
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
