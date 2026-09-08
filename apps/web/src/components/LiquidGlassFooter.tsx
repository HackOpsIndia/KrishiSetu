'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Music2 } from 'lucide-react';

export function LiquidGlassFooter() {
  return (
    <footer className="relative w-full bg-[#0a0d14] text-white pt-20 pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden font-sans selection:bg-white/20 selection:text-white">
      {/* Immersive Background Video for Liquid Glass */}
      <div className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260429_114316_1c7889ad-2885-410e-b493-98119fee0ddb.mp4"
            type="video/mp4"
          />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0d14] via-[#0a0d14]/70 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Upper CTA Banner */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-white mb-4 font-sans">
            Ready to discover true <span className="font-serif italic font-normal">in-hand realization</span>?
          </h2>
          <p className="text-white/70 text-sm sm:text-base leading-relaxed mb-6">
            Join thousands of smallholder farmers and FPO clusters across Maharashtra unlocking institutional contracts and eliminating hidden middleman cuts.
          </p>
          <a
            href="#opportunities"
            className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-white text-neutral-900 text-sm font-semibold hover:bg-neutral-100 transition-all duration-200 shadow-lg"
          >
            Get Started Now
          </a>
        </div>

        {/* Liquid Glass Footer Container */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
          className="liquid-glass w-full rounded-3xl p-6 md:p-10 text-white/70 shadow-2xl"
        >
          {/* Top Grid (12-column) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12 mb-10">
            {/* First Column (md:col-span-5) */}
            <div className="md:col-span-5">
              <div className="flex items-center gap-3 mb-4 text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
                  viewBox="0 0 256 256"
                  fill="currentColor"
                  className="text-white shrink-0"
                >
                  <path d="M 4.688 136 C 68.373 136 120 187.627 120 251.312 C 120 252.883 119.967 254.445 119.905 256 L 0 256 L 0 136.096 C 1.555 136.034 3.117 136 4.688 136 Z M 251.312 136 C 252.883 136 254.445 136.034 256 136.096 L 256 256 L 136.095 256 C 136.032 254.438 136.001 252.875 136 251.312 C 136 187.627 187.627 136 251.312 136 Z M 119.905 0 C 119.967 1.555 120 3.117 120 4.688 C 120 68.373 68.373 120 4.687 120 C 3.117 120 1.555 119.967 0 119.905 L 0 0 Z M 256 119.905 C 254.445 119.967 252.883 120 251.312 120 C 187.627 120 136 68.373 136 4.687 C 136 3.117 136.033 1.555 136.095 0 L 256 0 Z" />
                </svg>
                <span className="text-xl font-medium tracking-tight">KrishiSetu • Team HackOps</span>
              </div>
              <p className="text-sm leading-relaxed max-w-sm text-white/70 font-light">
                KrishiSetu provides transparent Net Realized Price discovery, FPO collective aggregation, and direct institutional buyer access for Bharat&apos;s farmers.
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs text-emerald-400 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Smart India Hackathon SIH26132 • Team HackOps</span>
              </div>
            </div>

            {/* Links Section (md:col-span-7) */}
            <div className="md:col-span-7 grid grid-cols-3 gap-6 sm:gap-8">
              {/* Discover */}
              <div>
                <h4 className="text-sm uppercase tracking-wider text-white font-medium mb-4">Discover</h4>
                <ul className="space-y-2.5 text-xs text-white/70">
                  <li>
                    <a href="#opportunities" className="hover:text-white transition-colors block">
                      Market Opportunities
                    </a>
                  </li>
                  <li>
                    <a href="#aggregation" className="hover:text-white transition-colors block">
                      FPO Collective Pool
                    </a>
                  </li>
                  <li>
                    <a href="#simulator" className="hover:text-white transition-colors block">
                      Freight Simulator
                    </a>
                  </li>
                  <li>
                    <a href="#impact" className="hover:text-white transition-colors block">
                      Resource Vault
                    </a>
                  </li>
                  <li>
                    <a href="#mosaic" className="hover:text-white transition-colors block">
                      Future Roadmap
                    </a>
                  </li>
                </ul>
              </div>

              {/* The Mission */}
              <div>
                <h4 className="text-sm uppercase tracking-wider text-white font-medium mb-4">The Mission</h4>
                <ul className="space-y-2.5 text-xs text-white/70">
                  <li>
                    <a href="#mosaic" className="hover:text-white transition-colors block">
                      Origin Story
                    </a>
                  </li>
                  <li>
                    <a href="#aggregation" className="hover:text-white transition-colors block">
                      The Collective
                    </a>
                  </li>
                  <li>
                    <a href="#hero" className="hover:text-white transition-colors block">
                      Newsroom Hub
                    </a>
                  </li>
                  <li>
                    <a href="#opportunities" className="hover:text-white transition-colors block">
                      Join the Team
                    </a>
                  </li>
                </ul>
              </div>

              {/* Concierge */}
              <div>
                <h4 className="text-sm uppercase tracking-wider text-white font-medium mb-4">Concierge</h4>
                <ul className="space-y-2.5 text-xs text-white/70">
                  <li>
                    <a href="#hero" className="hover:text-white transition-colors block">
                      Get in Touch
                    </a>
                  </li>
                  <li>
                    <a href="#hero" className="hover:text-white transition-colors block">
                      Legal Privacy
                    </a>
                  </li>
                  <li>
                    <a href="#hero" className="hover:text-white transition-colors block">
                      User Agreement
                    </a>
                  </li>
                  <li>
                    <a href="#hero" className="hover:text-white transition-colors block">
                      Report Concern
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4">
            <p className="text-[10px] uppercase tracking-widest opacity-50">
              Curated by Team HackOps • SIH26132
            </p>

            <div className="flex items-center gap-4">
              <span className="text-[10px] uppercase tracking-widest opacity-50">Join the Journey:</span>
              <div className="flex items-center gap-3">
                <a
                  href="https://tiktok.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Music"
                  className="opacity-70 hover:opacity-100 transition-colors hover:text-white text-white"
                >
                  <Music2 className="w-4 h-4" />
                </a>

                {/* Facebook SVG */}
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="opacity-70 hover:opacity-100 transition-colors hover:text-white text-white"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.6 5H18V0h-3.808C10.595 0 9 1.582 9 4.615V8z" />
                  </svg>
                </a>

                {/* Twitter / X SVG */}
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter"
                  className="opacity-70 hover:opacity-100 transition-colors hover:text-white text-white"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>

                {/* YouTube SVG */}
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="opacity-70 hover:opacity-100 transition-colors hover:text-white text-white"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>

                {/* Instagram SVG */}
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="opacity-70 hover:opacity-100 transition-colors hover:text-white text-white"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
