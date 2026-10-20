/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HeroCanvas } from './components/HeroCanvas';
import { GoldButton } from './components/GoldButton';
import { StatCounter } from './components/StatCounter';
import { ServiceCard, ServiceItem } from './components/ServiceCard';
import { ExpertCard } from './components/ExpertCard';
import { Carousel } from './components/Carousel';

const AboutCanvas = React.lazy(() =>
  import('./components/AboutCanvas').then((m) => ({ default: m.AboutCanvas }))
);

// Data definitions matching socialauctus.com
const NAV_LINKS = [
  { label: 'Why us', href: '#why-us' },
  { label: 'Services', href: '#services' },
  { label: 'About us', href: '#about-us' },
];

const STATS = [
  { to: 30000, suffix: '+', label: 'Campaigns Managed' },
  { to: 600, suffix: '%', label: 'Average ROI Increase' },
  { to: 660, suffix: '+', label: 'Happy Clients' },
  { to: 2.5, decimals: 1, suffix: 'M+', label: 'Ad Spend Managed' },
];

const SERVICES: ServiceItem[] = [
  {
    title: 'Paid Ads',
    icon: 'paid',
    body: 'Targeted campaigns that boost your ROI effectively: Google Ads, Facebook Ads, Instagram Ads',
  },
  {
    title: 'Social Media Marketing',
    icon: 'social',
    body: 'Social media marketing designed for brand growth: Facebook Marketing, Instagram Marketing, LinkedIn Ads',
  },
  {
    title: 'SEO',
    icon: 'seo',
    body: "Boost your site's search engine rankings organically: On-page SEO, Off-page SEO, Technical SEO",
  },
  {
    title: 'Email Marketing',
    icon: 'email',
    body: 'Engage your audience with personalized campaigns: Campaign Strategy, Automation, Reports',
  },
  {
    title: 'Video Editing',
    icon: 'video',
    body: 'Professional videos to promote your business: brand films shoots, brand ads, Vfx, Color grading/editing, Complete post production work',
  },
  {
    title: 'Website Design, Build & Deployment',
    icon: 'web',
    body: 'Fast, conversion-focused websites, from design and development to hosting and launch: Landing Pages, Business Websites, Hosting & Go-live',
  },
];

const EXPERTS = [
  { name: 'Ashish Makineni', role: 'CO-FOUNDER & CEO', image: '/images/ashish.png' },
  { name: 'Rituraj Soni', role: 'CO-FOUNDER & CFO', image: '/images/rituraj.png' },
];

const REASONS = [
  {
    icon: '/images/database.svg',
    title: 'Data-driven Google Ads execution',
    body: 'Every campaign backed by analytics and insider expertise',
  },
  {
    icon: '/images/cardholder.svg',
    title: 'High-converting strategies, yet affordable',
    body: 'Maximum impact within your budget constraints',
  },
  {
    icon: '/images/building-office.svg',
    title: 'Specialized in small to mid-size businesses & startups',
    body: 'Tailored approach for growing companies',
  },
  {
    icon: '/images/lightning.svg',
    title: 'Creative campaigns that stand out',
    body: 'Breakthrough creative that captures attention and converts',
  },
  {
    icon: '/images/crosshair.svg',
    title: 'Marketing that drives better ROI',
    body: 'Every penny spent is optimized for maximum return',
  },
  {
    icon: '/images/users.svg',
    title: 'Brand building + lead generation',
    body: 'Dual focus on awareness and conversion',
  },
  {
    icon: '/images/video-conference.svg',
    title: 'Flexible meeting schedules',
    body: 'We work around your availability and time zones',
  },
];

const FOOTER_SERVICES = [
  'Google Ads Management',
  'Social Media Marketing',
  'SEO Optimization',
  'Email Marketing',
  'Website Development',
];

const CONTACT_EMAIL = 'hello@socialauctus.com';
const PHONE_NUMBER = '+91 9381736309';
const WHATSAPP_URL = `https://wa.me/${PHONE_NUMBER.replace(/\D/g, '')}`;

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [inquirySubmitted, setInquirySubmitted] = useState(false);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const handleInquirySubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const fullName = `${data.get('first')} ${data.get('last')}`.trim();
    const email = data.get('email');
    const phone = data.get('phone') || '-';
    const comment = data.get('comment') || '';

    const lines = [
      `Name: ${fullName}`,
      `Email: ${email}`,
      `Phone: ${phone}`,
      '',
      String(comment),
    ];

    setInquirySubmitted(true);

    const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
      `Inquiry from ${fullName}`
    )}&body=${encodeURIComponent(lines.join('\n'))}`;

    // Trigger user mail client
    window.location.href = mailto;
  };

  return (
    <div className="min-h-screen bg-[#191919] font-['Raleway',sans-serif] text-white">
      {/* Header */}
      <header id="top" className="relative z-20">
        <div className="mx-auto flex max-w-[1728px] items-center justify-between gap-4 px-4 py-4 md:px-[70px] md:py-6">
          {/* Logo brand lockup */}
          <a href="#top" className="flex shrink-0 items-center gap-3 md:gap-[18px]">
            <img
              src="/images/logo.svg"
              alt="Social Auctus - Digital Marketing & Growth Agency"
              width={78}
              height={70}
              className="h-[36px] w-auto md:h-[60px]"
            />
            <span className="font-['Sulphur_Point',sans-serif] whitespace-nowrap text-[20px] text-white md:text-[28px] tracking-tight">
              Social Auctus
            </span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-12 text-[18px] text-white lg:flex xl:gap-[56px] xl:text-[20px]">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="transition-opacity hover:opacity-70 whitespace-nowrap"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Actions: WhatsApp + Contact Us */}
          <div className="flex items-center gap-3">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat with us on WhatsApp"
              className="grid size-11 place-items-center rounded-full border border-[#ffd04f]/50 text-[#ffd04f] transition-all hover:bg-[#ffd04f]/10 hover:scale-105 md:size-14"
            >
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 3a9 9 0 0 0-7.7 13.6L3 21l4.5-1.2A9 9 0 1 0 12 3z" />
                <path
                  fill="currentColor"
                  stroke="none"
                  d="M9.2 7.9c-.4.5-.5 1.3.2 2.5 1 1.7 2.4 2.9 4 3.5.9.3 1.5 0 1.9-.5l.3-.7-1.8-1-.7.6c-.7-.3-1.7-1.2-2.1-1.9l.6-.7-1-1.8z"
                />
              </svg>
            </a>

            <div className="hidden sm:block">
              <GoldButton
                href="#contact"
                className="h-[44px] px-5 text-[16px] md:h-[56px] md:px-10 md:text-[18px]"
              >
                Contact us
              </GoldButton>
            </div>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              className="grid size-11 place-items-center rounded-full border border-[#3a3a3a] text-white lg:hidden hover:border-[#ffd04f]/50 transition-colors"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                {mobileMenuOpen ? (
                  <path d="M6 6l12 12M18 6L6 18" />
                ) : (
                  <path d="M4 7h16M4 12h16M4 17h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <nav
            id="mobile-menu"
            className="absolute inset-x-4 top-full z-50 flex flex-col gap-1 rounded-[24px] border border-[#2b2b2b] bg-black p-3 text-[18px] text-white shadow-2xl md:inset-x-[70px] lg:hidden"
          >
            {[...NAV_LINKS, { label: 'Contact us', href: '#contact' }].map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={closeMobileMenu}
                className="rounded-2xl px-4 py-3 transition-colors hover:bg-[#1c1c1c]"
              >
                {link.label}
              </a>
            ))}
          </nav>
        )}
      </header>

      <main>
        {/* Hero Section */}
        <section className="mx-auto w-full max-w-[1621px] px-4 md:px-[54px] pt-2">
          {/* Top Hero Container with interactive WebGL Slat simulation */}
          <div className="relative flex min-h-[440px] flex-col items-center justify-center overflow-hidden rounded-t-[36px] px-6 py-16 text-center text-white md:h-[578px] md:py-0 border-t border-x border-[#2a2a2a]">
            <HeroCanvas className="pointer-events-none absolute inset-0" />
            <h1 className="font-['Sulphur_Point',sans-serif] relative text-[clamp(37px,5.55vw,90px)] font-bold tracking-tight leading-none [text-shadow:0_2px_18px_rgb(0_0_0/0.65)]">
              Social Auctus
            </h1>
            <p className="relative mt-4 text-[clamp(20px,2.78vw,45px)] font-light leading-tight [text-shadow:0_2px_18px_rgb(0_0_0/0.65)]">
              Where strategy meets growth
            </p>
            <p className="relative mt-6 text-[clamp(14px,1.39vw,22px)] font-medium [text-shadow:0_2px_18px_rgb(0_0_0/0.65)] text-[#e8e8e8]">
              Build something amazing with us today!
            </p>
            <GoldButton
              href="#contact"
              className="relative mt-8 h-[50px] px-8 text-[18px] md:h-[58px] md:w-[240px] md:text-[22px]"
            >
              Let’s Connect
            </GoldButton>
          </div>

          {/* Bottom Stats Grid with animated rolling counters */}
          <dl className="grid grid-cols-2 gap-x-6 gap-y-10 rounded-b-[36px] bg-[#f4f4f4] px-6 py-8 text-center text-black lg:grid-cols-4 lg:gap-[120px] lg:px-[109px] lg:py-[32px] shadow-lg">
            {STATS.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center">
                <dd className="order-1 text-[clamp(27px,2.78vw,45px)] font-bold leading-[1.45] text-black">
                  <StatCounter to={stat.to} decimals={stat.decimals} suffix={stat.suffix} />
                </dd>
                <dt className="order-2 text-[clamp(15px,1.72vw,28px)] font-medium leading-tight text-[#222]">
                  {stat.label}
                </dt>
              </div>
            ))}
          </dl>
        </section>

        {/* About Section */}
        <section id="about-us" className="mx-auto mt-12 w-full max-w-[1621px] px-4 md:mt-[100px] md:px-[54px]">
          <div className="relative isolate flex flex-col items-center gap-8 overflow-hidden rounded-[36px] bg-black px-6 py-14 text-center text-white md:px-[54px] md:py-[82px] border border-[#2b2b2b]">
            <React.Suspense fallback={<div className="pointer-events-none absolute inset-0 -z-10 bg-black" />}>
              <AboutCanvas className="pointer-events-none absolute inset-0 -z-10" />
            </React.Suspense>
            <h2 className="sr-only">About Social Auctus - High-Converting Performance Marketing</h2>
            <p className="text-[clamp(20px,1.72vw,28px)] font-semibold [text-shadow:0_2px_14px_rgb(0_0_0/0.8)] text-[#ffd04f]">
              At Social Auctus,
            </p>
            <p className="text-[clamp(22px,2.1vw,34px)] font-light leading-tight [text-shadow:0_2px_14px_rgb(0_0_0/0.8)]">
              we turn ad budgets into measurable business growth.
            </p>
            <p className="max-w-[1203px] [text-shadow:0_2px_14px_rgb(0_0_0/0.8)] text-[clamp(15px,1.39vw,22px)] font-medium leading-[1.3] text-[#d6dae4]">
              We bring that insider expertise to help businesses like yours, grow smarter and faster.
              We specialize in high-converting paid ad strategies, delivering maximum ROI within your budget,
              no guesswork, just results.
            </p>
            <GoldButton
              href="#contact"
              className="h-[52px] px-8 text-[18px] md:h-[60px] md:min-w-[300px] md:text-[22px]"
            >
              Schedule a Call Now
            </GoldButton>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="mx-auto mt-16 w-full max-w-[1621px] px-4 md:mt-[70px] md:px-[54px]">
          <div className="mx-auto max-w-[1245px] text-center text-[#e5e5e5]">
            <p className="text-[clamp(17px,1.72vw,28px)] font-medium text-[#ffd04f]">
              Excellence in every pixel
            </p>
            <h2 className="font-['Sulphur_Point',sans-serif] mt-4 text-[clamp(24px,2.78vw,45px)] font-bold leading-tight tracking-tight">
              INNOVATIVE SERVICES FOR MODERN BRANDS
            </h2>
          </div>

          <div className="mt-10 rounded-[36px] bg-black p-4 md:mt-[40px] md:p-[28px] border border-[#2b2b2b]">
            <h3 className="text-center text-[clamp(19px,1.72vw,28px)] font-medium text-[#e5e5e5]">
              OUR SERVICES
            </h3>
            <Carousel
              className="mt-6"
              label="services"
              slides={SERVICES.map((item) => (
                <ServiceCard key={item.title} item={item} />
              ))}
            />
          </div>
        </section>

        {/* Experts Section */}
        <section className="mx-auto mt-16 w-full max-w-[1621px] px-4 md:mt-[60px] md:px-[54px]">
          <h2 className="text-center text-[clamp(27px,2.78vw,45px)] font-normal leading-none text-[#bfbfbf]">
            Meet Our Experts
          </h2>
          <div className="mt-12 flex flex-col items-center justify-center gap-12 md:flex-row md:items-start md:gap-10 lg:gap-[72px]">
            {EXPERTS.map((expert) => (
              <ExpertCard
                key={expert.name}
                name={expert.name}
                role={expert.role}
                image={expert.image}
                ctaHref="#contact"
              />
            ))}
          </div>
        </section>

        {/* Why Choose Social Auctus */}
        <section id="why-us" className="mx-auto mt-16 w-full max-w-[1621px] px-4 pt-5 md:mt-[60px] md:px-[54px]">
          <h2 className="font-['Sulphur_Point',sans-serif] text-center text-[clamp(24px,2.78vw,45px)] font-bold leading-tight text-[#e5e5e5] tracking-tight">
            Why Choose Social Auctus?
          </h2>
          <Carousel
            className="mt-8 md:mt-12"
            label="reasons to choose us"
            slides={REASONS.map((reason) => (
              <article key={reason.title} className="rcard">
                <img
                  src={reason.icon}
                  alt={`${reason.title} - Social Auctus`}
                  width={70}
                  height={70}
                  className="rcard__icon"
                  loading="lazy"
                />
                <h3 className="rcard__title">{reason.title}</h3>
                <p className="rcard__body">{reason.body}</p>
              </article>
            ))}
          />
        </section>

        {/* Contact Section */}
        <section id="contact" className="mt-20 border-b border-[#505050] bg-black md:mt-[100px]">
          <div className="mx-auto grid max-w-[1728px] gap-10 px-5 py-14 md:px-[70px] lg:grid-cols-[minmax(0,420px)_minmax(0,954px)] lg:justify-between lg:gap-16 lg:py-[80px]">
            <div>
              <h2 className="font-['Sulphur_Point',sans-serif] text-[clamp(31px,2.78vw,45px)] font-bold leading-tight text-[#e5e5e5] [word-spacing:-0.12em]">
                Let’s get in touch
              </h2>
              <p className="mt-4 text-[#bdbdbd] text-[17px] leading-relaxed max-w-sm">
                Have questions or ready to accelerate your growth? Fill out the inquiry form and our founders will get back to you promptly.
              </p>
              <div className="mt-8 flex flex-col gap-3 text-[#d6dae4]">
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="flex items-center gap-3 text-[16px] hover:text-[#ffd04f] transition-colors"
                >
                  <span className="size-2 rounded-full bg-[#ffd04f]" />
                  {CONTACT_EMAIL}
                </a>
                <a
                  href={`tel:${PHONE_NUMBER.replace(/\s/g, '')}`}
                  className="flex items-center gap-3 text-[16px] hover:text-[#ffd04f] transition-colors"
                >
                  <span className="size-2 rounded-full bg-[#ffd04f]" />
                  {PHONE_NUMBER}
                </a>
              </div>
            </div>

            <div>
              {inquirySubmitted && (
                <div className="mb-6 rounded-xl border border-[#ffd04f]/40 bg-[#ffd04f]/10 p-4 text-[#ffd04f] flex items-center justify-between">
                  <span>Thank you! Your email client has been prepared with your inquiry details.</span>
                  <button
                    onClick={() => setInquirySubmitted(false)}
                    className="text-xs uppercase font-semibold text-white hover:underline ml-4"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              <form onSubmit={handleInquirySubmit} className="flex w-full flex-col gap-6">
                <div className="flex flex-col gap-6 sm:flex-row">
                  <input
                    name="first"
                    required
                    placeholder="First Name*"
                    aria-label="First name"
                    className="h-[60px] w-full rounded-[10px] border border-[#d6dae4] bg-[#3f3f3f] px-[17px] text-[16px] text-white placeholder:text-[#d6dae4] focus:border-[#ffd04f] focus:outline-none transition-colors"
                  />
                  <input
                    name="last"
                    required
                    placeholder="Last Name*"
                    aria-label="Last name"
                    className="h-[60px] w-full rounded-[10px] border border-[#d6dae4] bg-[#3f3f3f] px-[17px] text-[16px] text-white placeholder:text-[#d6dae4] focus:border-[#ffd04f] focus:outline-none transition-colors"
                  />
                </div>

                <input
                  name="email"
                  type="email"
                  required
                  placeholder="E-mail*"
                  aria-label="E-mail"
                  className="h-[60px] w-full rounded-[10px] border border-[#d6dae4] bg-[#3f3f3f] px-[17px] text-[16px] text-white placeholder:text-[#d6dae4] focus:border-[#ffd04f] focus:outline-none transition-colors"
                />

                <input
                  name="phone"
                  type="tel"
                  placeholder="Phone"
                  aria-label="Phone"
                  className="h-[60px] w-full rounded-[10px] border border-[#d6dae4] bg-[#3f3f3f] px-[17px] text-[16px] text-white placeholder:text-[#d6dae4] focus:border-[#ffd04f] focus:outline-none transition-colors"
                />

                <textarea
                  name="comment"
                  placeholder="Comment"
                  aria-label="Comment"
                  rows={2}
                  className="h-[60px] min-h-[60px] w-full resize-y rounded-[10px] border border-[#d6dae4] bg-[#3f3f3f] px-[17px] py-[17px] text-[16px] text-white placeholder:text-[#d6dae4] focus:border-[#ffd04f] focus:outline-none transition-colors"
                />

                <GoldButton type="submit" className="h-[56px] w-[190px] text-[18px]">
                  Send Inquiry
                </GoldButton>
              </form>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-black text-white">
        <div className="mx-auto grid max-w-[1728px] gap-12 px-5 py-14 md:px-[70px] lg:grid-cols-[minmax(0,652px)_1fr_auto_auto] lg:gap-x-16 lg:py-[62px]">
          {/* Brand & info */}
          <div className="flex flex-col gap-8">
            <a href="#top" className="flex shrink-0 items-center gap-3 md:gap-[18px]">
              <img
                src="/images/logo.svg"
                alt="Social Auctus - Where Strategy Meets Growth"
                width={78}
                height={70}
                className="h-[36px] w-auto md:h-[60px]"
              />
              <span className="font-['Sulphur_Point',sans-serif] whitespace-nowrap text-[20px] text-white md:text-[28px]">
                Social Auctus
              </span>
            </a>
            <div className="max-w-[652px]">
              <p className="text-[20px] font-medium text-[#ffd04f]">Where Strategy Meets Growth</p>
              <p className="mt-4 text-[16px] text-[#d1d5db] leading-relaxed">
                Transform your digital presence with data-driven marketing strategies from former Google
                Ads experts. We help businesses grow smarter and faster.
              </p>
            </div>
            <GoldButton href="#contact" className="h-[44px] w-[220px] text-[18px]">
              Get Started Today
            </GoldButton>
          </div>

          <div aria-hidden="true" className="hidden lg:block" />

          {/* Services Column */}
          <div>
            <p className="text-[20px] font-semibold text-white">Services</p>
            <ul className="mt-4 flex flex-col gap-2.5 text-[16px] text-[#d1d5db]">
              {FOOTER_SERVICES.map((s) => (
                <li key={s} className="hover:text-white transition-colors cursor-pointer">
                  {s}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <p className="text-[20px] font-semibold text-white">Contact</p>
            <ul className="mt-4 flex flex-col gap-2.5 text-[16px] text-[#d1d5db]">
              <li>
                <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-[#ffd04f] transition-colors">
                  {CONTACT_EMAIL}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${PHONE_NUMBER.replace(/\s/g, '')}`}
                  className="hover:text-[#ffd04f] transition-colors"
                >
                  {PHONE_NUMBER}
                </a>
              </li>
              <li className="pt-2">
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[#ffd04f] hover:underline"
                >
                  <span>Chat on WhatsApp</span>
                  <span>&rarr;</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright notice with WCAG AA compliant text color */}
        <div className="border-t border-[#262626] py-6 text-center text-xs text-[#9ca3af]">
          <p>© {new Date().getFullYear()} Social Auctus. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
