<!DOCTYPE html>

<html lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" name="viewport"/>
<title>Submission Confirmation &amp; Cryptographic Receipt - White Board</title>
<!-- Tailwind CSS CDN -->
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<!-- Google Fonts: Newsreader (Editorial Serif) & Inter (Clean UI Sans) -->
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500&amp;family=Inter:wght@400;500;600;700&amp;family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400&amp;display=swap" rel="stylesheet"/>
<script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            sans: ['Inter', 'system-ui', 'sans-serif'],
            serif: ['Newsreader', 'Georgia', 'serif'],
            mono: ['"Fira Code"', 'monospace'],
          },
          colors: {
            brand: {
              50: '#f0f4f9',
              100: '#dce5f1',
              700: '#2a4b7c',
              800: '#20395e',
              900: '#14253e',
            },
            ink: {
              800: '#1e2433',
              900: '#10141f',
              950: '#0b0d14',
            },
            ledger: {
              gold: '#b48a3c',
              bg: '#f9f8f5',
              surface: '#ffffff',
              border: '#e8e4db',
              teal: '#0d7a68'
            }
          }
        }
      }
    }
  </script>
<style data-purpose="custom-scroll-and-visuals">
    /* Custom subtle scrollbar styling for receipt modal */
    .sheet-scroll::-webkit-scrollbar {
      width: 4px;
    }
    .sheet-scroll::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 4px;
    }
    .sheet-scroll::-webkit-scrollbar-track {
      background: transparent;
    }
  </style>
</head>
<body class="bg-stone-900 font-sans antialiased text-slate-800 selection:bg-brand-100 selection:text-brand-900 flex justify-center items-center min-h-screen p-0 sm:p-4">
<!-- BEGIN: MobileDeviceFrame -->
<!-- Mimicking an authentic iPhone viewport (390px x 844px) -->
<div class="relative w-full max-w-[390px] h-[844px] bg-white overflow-hidden shadow-2xl rounded-[44px] border-[8px] border-slate-900 flex flex-col justify-between select-none">
<!-- iPhone Top Dynamic Island / Speaker Bar -->
<div class="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-full z-50 pointer-events-none flex items-center justify-end px-3">
<div class="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800"></div>
</div>
<!-- BEGIN: DimmedBackgroundDossier -->
<!-- Represents the underlying submitted dossier (SCREEN_2) in dimmed/blurred state -->
<div aria-hidden="true" class="absolute inset-0 z-0 flex flex-col opacity-35 filter blur-[2px] pointer-events-none select-none overflow-hidden bg-slate-50">
<!-- Dossier App Top Navigation -->
<header class="pt-12 px-4 pb-3 bg-white border-b border-slate-200 flex items-center justify-between">
<div class="flex items-center space-x-2">
<svg class="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewbox="0 0 24 24">
<path d="M15 19l-7-7 7-7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
</svg>
<div>
<p class="text-[9px] uppercase tracking-wider text-slate-500 font-medium">White Board Review</p>
<h1 class="font-serif text-base font-semibold text-slate-900">Dossier Overview</h1>
</div>
</div>
<div class="w-7 h-7 rounded-full bg-brand-700 flex items-center justify-center text-white text-xs font-bold">KM</div>
</header>
<!-- Background Content Mockup -->
<div class="p-4 space-y-3 flex-1 overflow-hidden">
<div class="p-3 bg-white rounded-xl border border-slate-200 shadow-sm space-y-2">
<div class="h-4 w-28 bg-brand-100 rounded"></div>
<div class="h-6 w-52 bg-slate-200 rounded"></div>
<div class="grid grid-cols-2 gap-2 pt-2">
<div class="h-12 bg-slate-100 rounded"></div>
<div class="h-12 bg-slate-100 rounded"></div>
</div>
</div>
<div class="p-3 bg-white rounded-xl border border-slate-200 shadow-sm space-y-2">
<div class="h-4 w-32 bg-slate-200 rounded"></div>
<div class="h-10 bg-slate-100 rounded"></div>
<div class="h-10 bg-slate-100 rounded"></div>
</div>
<div class="p-3 bg-emerald-50 rounded-xl border border-emerald-200 shadow-sm space-y-1">
<div class="h-4 w-36 bg-emerald-200 rounded"></div>
<div class="h-8 bg-emerald-100/70 rounded"></div>
</div>
</div>
</div>
<!-- END: DimmedBackgroundDossier -->
<!-- Dimming Overlay Scrim -->
<div class="absolute inset-0 bg-ink-950/60 backdrop-blur-[3px] z-10"></div>
<!-- BEGIN: CryptographicReceiptBottomSheet -->
<main class="relative z-20 mt-auto w-full h-[90%] bg-ledger-bg rounded-t-[28px] border-t border-slate-100/50 shadow-2xl flex flex-col overflow-hidden animate-slide-up" data-purpose="submission-confirmation-modal">
<!-- Drag Handle Bar Indicator -->
<div class="w-full pt-3 pb-2 flex justify-center items-center cursor-grab active:cursor-grabbing">
<div aria-label="Sheet Handle" class="w-11 h-1.5 bg-slate-300 rounded-full"></div>
</div>
<!-- Top Cryptographic Seal Ribbon -->
<div class="bg-brand-900 text-slate-100 px-4 py-2 flex items-center justify-between shadow-sm">
<div class="flex items-center space-x-2">
<span class="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-mono tracking-widest uppercase bg-emerald-950 text-emerald-300 border border-emerald-700/60">
<span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1"></span>Tamper-Evident
          </span>
<span class="text-[10px] tracking-wide font-medium text-slate-300">OFFICIAL CRYPTOGRAPHIC RECORD</span>
</div>
<!-- Close Button -->
<button aria-label="Dismiss Modal" class="text-slate-400 hover:text-white transition-colors p-1 -mr-1" type="button">
<svg class="w-4 h-4" fill="none" stroke="currentColor" viewbox="0 0 24 24">
<path d="M6 18L18 6M6 6l12 12" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"></path>
</svg>
</button>
</div>
<!-- Scrollable Modal Content Body -->
<section class="flex-1 overflow-y-auto sheet-scroll px-4 pt-3 pb-6 space-y-3.5">
<!-- Header & Dossier Identification -->
<div class="space-y-1">
<div class="flex items-center justify-between">
<span class="text-[11px] font-mono text-brand-800 font-medium tracking-tight">
              #WB-2025-EK-0982 <span class="text-slate-400 mx-1">•</span> Block #4,829,102
            </span>
<span class="inline-flex items-center text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
<svg class="w-3 h-3 mr-1 text-emerald-700" fill="currentColor" viewbox="0 0 20 20">
<path clip-rule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" fill-rule="evenodd"></path>
</svg>
              Cryptographically Sealed
            </span>
</div>
<h2 class="font-serif text-xl font-bold tracking-tight text-ink-900 leading-snug pt-0.5">
            Equity STEM Leadership Fellowship 2025
          </h2>
<p class="text-[11px] text-slate-500 font-medium">
            Equity Group Foundation &amp; East Africa STEM Initiative
          </p>
</div>
<!-- Candidate & Signer Two-Column Summary Card -->
<div class="bg-white rounded-xl p-3 border border-ledger-border shadow-sm space-y-2.5">
<div class="grid grid-cols-2 gap-2 text-[11px] pb-2 border-b border-slate-100">
<div>
<span class="block text-[9px] uppercase tracking-wider text-slate-400 font-medium">Beneficiary Candidate</span>
<p class="font-semibold text-slate-800 text-xs mt-0.5">Kwame Mutua</p>
<p class="text-[10px] text-slate-500 leading-tight">Yr 10 IGCSE • Riverside Academy</p>
</div>
<div>
<span class="block text-[9px] uppercase tracking-wider text-slate-400 font-medium">Guardian Signer (2FA)</span>
<p class="font-semibold text-slate-800 text-xs mt-0.5">Zainab Mutua (Mother)</p>
<p class="text-[10px] text-slate-500 leading-tight">Safaricom OTP (Token 0x82a)</p>
</div>
</div>
<div class="flex items-center justify-between text-[10px] text-slate-500">
<span class="flex items-center">
<svg class="w-3 h-3 text-slate-400 mr-1" fill="none" stroke="currentColor" viewbox="0 0 24 24">
<path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
</svg>
              July 1, 2025 · 14:22:18 EAT
            </span>
<span class="text-brand-700 font-medium flex items-center">
              Cambridge Stamp EA-089
            </span>
</div>
</div>
<!-- Cryptographic Proof Manifest Section -->
<div class="space-y-2">
<div class="flex items-center justify-between px-0.5">
<h3 class="text-xs font-semibold text-slate-800 uppercase tracking-wider flex items-center">
<svg class="w-3.5 h-3.5 text-brand-700 mr-1.5" fill="none" stroke="currentColor" viewbox="0 0 24 24">
<path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
</svg>
              Immutable Proof Manifest
            </h3>
<span class="text-[10px] text-slate-500 font-mono">3 / 3 Anchored</span>
</div>
<!-- Manifest List -->
<div class="space-y-1.5">
<!-- Item 1: Telemetry -->
<div class="p-2.5 bg-white rounded-lg border border-slate-200/90 shadow-2xs">
<div class="flex items-center justify-between">
<span class="text-[11px] font-semibold text-slate-800 leading-tight">
                  1. Formative Coursework Telemetry
                </span>
<span class="text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/80">
                  Verified
                </span>
</div>
<p class="text-[10px] text-slate-500 mt-0.5">IGCSE Physics (94%), Math (91%), Chemistry (88%)</p>
<div class="mt-1 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 flex items-center justify-between">
<span class="text-[9px] font-mono text-slate-500 truncate max-w-[280px]">
                  SHA-256: 85fa4c029a1e7488e92bc0d8327a195e2bfd0087a4192d6e3c21
                </span>
</div>
</div>
<!-- Item 2: Verified Artifacts -->
<div class="p-2.5 bg-white rounded-lg border border-slate-200/90 shadow-2xs">
<div class="flex items-center justify-between">
<span class="text-[11px] font-semibold text-slate-800 leading-tight">
                  2. Project Artifact Bundle &amp; Monograph
                </span>
<span class="text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/80">
                  Verified
                </span>
</div>
<p class="text-[10px] text-slate-500 mt-0.5">Water Filtration Sensors &amp; Solar Simulation Model</p>
<div class="mt-1 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 flex items-center justify-between">
<span class="text-[9px] font-mono text-slate-500 truncate max-w-[280px]">
                  SHA-256: 3c9a80b13d2e61a478bc39efc72834b92c4b81093de58ab72
                </span>
</div>
</div>
<!-- Item 3: Faculty Endorsement -->
<div class="p-2.5 bg-white rounded-lg border border-slate-200/90 shadow-2xs">
<div class="flex items-center justify-between">
<span class="text-[11px] font-semibold text-slate-800 leading-tight">
                  3. Cambridge Institutional Endorsement
                </span>
<span class="text-[9px] font-semibold text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded border border-brand-200/80">
                  EA-089 Signed
                </span>
</div>
<p class="text-[10px] text-slate-500 mt-0.5">Dr. Angela Kiprop, Senior Physics Lead (Riverside)</p>
<div class="mt-1 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 flex items-center justify-between">
<span class="text-[9px] font-mono text-slate-500 truncate max-w-[280px]">
                  Sig: 0x9482701bf4e7b1a209ec3849bcde7103a985
                </span>
</div>
</div>
</div>
</div>
<!-- Consensus & Ledger Audit Box -->
<div class="bg-gradient-to-br from-slate-50 to-brand-50/50 p-3 rounded-xl border border-brand-100 text-[10px] text-slate-600 space-y-1.5">
<div class="flex items-center space-x-1.5 text-brand-800 font-medium">
<svg class="w-3.5 h-3.5 text-brand-700" fill="none" stroke="currentColor" viewbox="0 0 24 24">
<path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
</svg>
<span class="font-semibold tracking-tight">Consensus &amp; Ledger Audit Trail</span>
</div>
<p class="leading-relaxed text-[10.5px]">
            Authenticated jointly through <span class="font-medium text-slate-700">East Africa Academic Verification Consortium</span> and <span class="font-medium text-slate-700">Cambridge International Ledger</span>. Block state is immutable and non-repudiable.
          </p>
</div>
</section>
<!-- END: Modal Scrollable Content -->
<!-- BEGIN: StickyBottomActionContainer -->
<!-- Fixed CTA controls optimized for iOS thumb zone -->
<footer class="p-4 bg-white border-t border-slate-200/80 shadow-lg space-y-2 shrink-0">
<!-- Primary Action -->
<button class="w-full bg-brand-700 hover:bg-brand-800 active:bg-brand-900 text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center space-x-2 shadow-sm transition-transform active:scale-[0.99]" type="button">
<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewbox="0 0 24 24">
<path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
</svg>
<span class="text-xs font-semibold tracking-wide">Download Tamper-Evident PDF Receipt</span>
</button>
<!-- Secondary Buttons (Split) -->
<div class="grid grid-cols-2 gap-2 pt-0.5">
<button class="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium py-2 px-3 rounded-lg border border-slate-200 flex items-center justify-center space-x-1.5 transition-colors" type="button">
<svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewbox="0 0 24 24">
<path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
</svg>
<span>Copy Hash</span>
</button>
<button class="text-slate-600 hover:text-slate-900 text-xs font-medium py-2 px-3 rounded-lg transition-colors flex items-center justify-center" type="button">
<span>Return to Workspace</span>
</button>
</div>
<!-- iOS Home Indicator -->
<div class="w-32 h-1 bg-slate-300 rounded-full mx-auto mt-2"></div>
</footer>
<!-- END: StickyBottomActionContainer -->
</main>
<!-- END: CryptographicReceiptBottomSheet -->
</div>
<!-- END: MobileDeviceFrame -->
</body></html>