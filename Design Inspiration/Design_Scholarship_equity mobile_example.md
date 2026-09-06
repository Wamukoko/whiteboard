<!DOCTYPE html>

<html lang="en"><head><meta charset="utf-8"/><meta content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" name="viewport"/><link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet"/><link href="https://fonts.googleapis.com" rel="preconnect"/><link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&amp;family=JetBrains+Mono:wght@400&amp;family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/><script src="https://cdn.tailwindcss.com"></script><script id="tailwind-config">tailwind.config = {
    darkMode: "class",
    theme: {
      extend: {
        "colors": {
          "secondary-container": "#dedfeb",
          "on-surface": "#161a2d",
          "primary": "#0d3464",
          "surface-container-high": "#e4e7ff",
          "error-container": "#ffdad6",
          "on-surface-variant": "#43474f",
          "surface-container-low": "#f3f2ff",
          "outline": "#747780",
          "primary-fixed-dim": "#a9c7ff",
          "on-tertiary": "#ffffff",
          "surface-bright": "#fbf8ff",
          "on-secondary-container": "#60626c",
          "surface-container-highest": "#dee1fb",
          "secondary-fixed-dim": "#c4c6d2",
          "on-error-container": "#93000a",
          "on-primary-fixed": "#001b3d",
          "on-error": "#ffffff",
          "secondary": "#5c5e68",
          "surface-tint": "#3f5f91",
          "on-primary-fixed-variant": "#254778",
          "inverse-primary": "#a9c7ff",
          "tertiary-fixed": "#ffdad2",
          "error": "#ba1a1a",
          "on-background": "#161a2d",
          "primary-fixed": "#d6e3ff",
          "secondary-fixed": "#e1e2ee",
          "surface-container": "#ececff",
          "primary-container": "#2a4b7c",
          "outline-variant": "#c3c6d0",
          "on-secondary-fixed-variant": "#444650",
          "tertiary-fixed-dim": "#ffb4a3",
          "surface-variant": "#dee1fb",
          "on-tertiary-fixed": "#3d0600",
          "on-tertiary-container": "#ffa38d",
          "on-tertiary-fixed-variant": "#891d03",
          "background": "#fbf8ff",
          "on-secondary-fixed": "#191b24",
          "inverse-surface": "#2b2f43",
          "on-primary-container": "#9dbcf4",
          "surface": "#fbf8ff",
          "on-secondary": "#ffffff",
          "tertiary-container": "#8f2106",
          "surface-container-lowest": "#ffffff",
          "on-primary": "#ffffff",
          "inverse-on-surface": "#f0efff",
          "surface-dim": "#d6d8f2",
          "tertiary": "#691200"
        },
        "borderRadius": {
          "DEFAULT": "0.125rem",
          "lg": "0.25rem",
          "xl": "0.5rem",
          "full": "0.75rem"
        },
        "spacing": {
          "unit-6": "1.5rem",
          "unit-2": "0.5rem",
          "margin-tablet": "2rem",
          "margin-mobile": "1rem",
          "unit-4": "1rem",
          "unit-3": "0.75rem",
          "unit-16": "4rem",
          "margin-desktop": "3rem",
          "unit-8": "2rem",
          "unit-1": "0.25rem",
          "gutter-desktop": "1.5rem",
          "gutter-mobile": "1rem",
          "unit-24": "6rem",
          "unit-12": "3rem"
        },
        "fontFamily": {
          "code-sm": ["JetBrains Mono"],
          "body-sm": ["Inter"],
          "display-lg-mobile": ["Newsreader"],
          "headline-sm": ["Newsreader"],
          "display-md": ["Newsreader"],
          "label-md": ["Inter"],
          "label-sm": ["Inter"],
          "body-md": ["Inter"],
          "display-lg": ["Newsreader"],
          "display-md-mobile": ["Newsreader"],
          "body-lg": ["Inter"],
          "headline-lg": ["Newsreader"]
        },
        "fontSize": {
          "code-sm": ["0.8125rem", {"lineHeight": "1.25rem", "letterSpacing": "0em", "fontWeight": "400"}],
          "body-sm": ["0.875rem", {"lineHeight": "1.375rem", "letterSpacing": "0.005em", "fontWeight": "400"}],
          "display-lg-mobile": ["2.25rem", {"lineHeight": "2.75rem", "letterSpacing": "-0.015em", "fontWeight": "400"}],
          "headline-sm": ["1.375rem", {"lineHeight": "1.875rem", "letterSpacing": "0em", "fontWeight": "500"}],
          "display-md": ["2.5rem", {"lineHeight": "3rem", "letterSpacing": "-0.015em", "fontWeight": "400"}],
          "label-md": ["0.875rem", {"lineHeight": "1.25rem", "letterSpacing": "0.01em", "fontWeight": "600"}],
          "label-sm": ["0.75rem", {"lineHeight": "1rem", "letterSpacing": "0.04em", "fontWeight": "600"}],
          "body-md": ["1rem", {"lineHeight": "1.5rem", "letterSpacing": "0em", "fontWeight": "400"}],
          "display-lg": ["3.5rem", {"lineHeight": "4rem", "letterSpacing": "-0.02em", "fontWeight": "400"}],
          "display-md-mobile": ["1.75rem", {"lineHeight": "2.25rem", "letterSpacing": "-0.01em", "fontWeight": "400"}],
          "body-lg": ["1.125rem", {"lineHeight": "1.75rem", "letterSpacing": "-0.005em", "fontWeight": "400"}],
          "headline-lg": ["2rem", {"lineHeight": "2.5rem", "letterSpacing": "-0.01em", "fontWeight": "500"}]
        }
      }
    }
  }</script><style>@layer base{html,body{width:100vw;margin:0;padding:0;}body{overscroll-behavior:none;}.pb-safe{padding-bottom:env(safe-area-inset-bottom,0px);}.pt-safe{padding-top:env(safe-area-inset-top,0px);}main>:first-child{margin-top:0!important;}main>:last-child{margin-bottom:0!important;}}::-webkit-scrollbar{display:none;}</style><style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head><body class="bg-surface font-body-md text-body-md text-on-surface flex flex-col min-h-screen"><header class="fixed top-0 w-full z-50 pt-safe bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]"><div class="h-16 px-gutter-mobile flex items-center justify-between"><div class="flex items-center gap-unit-2"><a aria-label="Back to Opportunities" class="w-11 h-11 flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors" href="#"><span class="material-symbols-outlined text-[24px]">arrow_back</span></a><div class="flex flex-col"><span class="font-label-sm text-label-sm uppercase tracking-wider text-secondary">White Board Review</span><h1 class="font-headline-sm text-headline-sm text-on-surface leading-tight">Dossier Overview</h1></div></div><div class="flex items-center gap-unit-1"><button aria-label="Notifications" class="w-11 h-11 flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors relative"><span class="material-symbols-outlined text-[22px]">notifications</span><span class="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-tertiary-container"></span></button><div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center ml-unit-1"><span class="material-symbols-outlined text-on-primary text-[18px]">person</span></div></div></div></header><main class="flex flex-col relative w-full pt-16 pb-24 bg-surface min-h-screen"><div class="flex flex-col w-full pb-8">
<!-- Top Dossier Summary Card -->
<section class="px-gutter-mobile pt-unit-3 pb-unit-4">
<div class="bg-surface-container-lowest rounded-xl p-unit-4 shadow-[0_8px_24px_-4px_rgba(22,26,45,0.06),0_2px_6px_-1px_rgba(22,26,45,0.04)] flex flex-col gap-unit-3">
<!-- Track & Initiative Header -->
<div class="flex flex-wrap items-center gap-unit-2">
<span class="inline-flex items-center gap-1 bg-primary-fixed text-on-primary-fixed px-unit-2 py-0.5 rounded-lg font-label-sm text-label-sm uppercase tracking-wider font-semibold">
<span class="material-symbols-outlined text-[14px]">school</span>
          STEM Leadership Track
        </span>
<span class="text-secondary font-label-sm text-label-sm">
          Equity Group Foundation • EA STEM
        </span>
</div>
<!-- Main Title -->
<div class="flex flex-col gap-unit-1">
<h2 class="font-headline-sm text-headline-sm text-on-surface leading-snug">
          Equity STEM Leadership Fellowship 2025
        </h2>
<div class="flex items-center gap-unit-2 text-on-surface-variant font-body-sm text-body-sm">
<span class="material-symbols-outlined text-[16px] text-primary">person_check</span>
<span class="truncate">Kwame Mutua • Yr 10 IGCSE • Riverside Academy</span>
</div>
</div>
<!-- Quick Telemetry Badges Grid -->
<div class="grid grid-cols-2 gap-unit-2 pt-unit-1">
<!-- Endowment Value -->
<div class="bg-surface-container-low rounded-lg p-unit-3 flex flex-col justify-between">
<div class="flex items-center justify-between text-secondary mb-1">
<span class="font-label-sm text-label-sm uppercase tracking-wider">Endowment</span>
<span class="material-symbols-outlined text-[16px] text-primary">payments</span>
</div>
<span class="font-headline-sm text-headline-sm text-primary font-semibold">$4,500<span class="font-body-sm text-body-sm font-normal text-secondary">/yr</span></span>
<span class="font-label-sm text-label-sm text-on-surface-variant line-clamp-1">Full Tuition + Lab</span>
</div>
<!-- Match Index -->
<div class="bg-surface-container-low rounded-lg p-unit-3 flex flex-col justify-between">
<div class="flex items-center justify-between text-secondary mb-1">
<span class="font-label-sm text-label-sm uppercase tracking-wider">Match Index</span>
<span class="material-symbols-outlined text-[16px] text-surface-tint">verified</span>
</div>
<div class="flex items-baseline gap-1">
<span class="font-headline-sm text-headline-sm text-on-surface font-semibold">91%</span>
<span class="font-label-sm text-label-sm text-surface-tint font-medium">Tier 1</span>
</div>
<span class="font-label-sm text-label-sm text-secondary">Formative Fit</span>
</div>
<!-- Urgency -->
<div class="bg-surface-container-low rounded-lg p-unit-3 flex flex-col justify-between">
<div class="flex items-center justify-between text-secondary mb-1">
<span class="font-label-sm text-label-sm uppercase tracking-wider">Deadline</span>
<span class="material-symbols-outlined text-[16px] text-tertiary-container">schedule</span>
</div>
<span class="font-headline-sm text-headline-sm text-tertiary-container font-semibold">14 Days</span>
<span class="font-label-sm text-label-sm text-secondary">July 15, 2025</span>
</div>
<!-- Dossier Completeness -->
<div class="bg-surface-container-low rounded-lg p-unit-3 flex flex-col justify-between">
<div class="flex items-center justify-between text-secondary mb-1">
<span class="font-label-sm text-label-sm uppercase tracking-wider">Completion</span>
<span class="material-symbols-outlined text-[16px] text-primary-container">edit_document</span>
</div>
<span class="font-headline-sm text-headline-sm text-primary-container font-semibold">85%</span>
<span class="font-label-sm text-label-sm text-tertiary font-medium">Needs Parent Sign</span>
</div>
</div>
</div>
</section>
<!-- 4-Stage Workflow Progress Stepper -->
<section class="px-gutter-mobile pb-unit-4">
<div class="flex items-center justify-between mb-unit-2">
<span class="font-label-sm text-label-sm uppercase tracking-wider text-secondary">Workflow Verification</span>
<span class="font-label-sm text-label-sm text-primary font-semibold">Stage 4 of 4 Action Required</span>
</div>
<!-- Stepper Scroll Track -->
<div class="flex gap-unit-2 overflow-x-auto pb-unit-2 -mx-gutter-mobile px-gutter-mobile">
<!-- Step 1: Telemetry Matching -->
<div class="flex-shrink-0 w-44 bg-surface-container-lowest rounded-lg p-unit-3 shadow-sm flex flex-col justify-between relative overflow-hidden">
<div class="flex items-center justify-between mb-unit-2">
<div class="w-6 h-6 rounded-full bg-surface-container-high text-primary flex items-center justify-center">
<span class="material-symbols-outlined text-[14px]">done_all</span>
</div>
<span class="font-label-sm text-label-sm font-semibold text-primary">01 • Match</span>
</div>
<div>
<h3 class="font-label-md text-label-md text-on-surface leading-snug">Telemetry Fit</h3>
<p class="font-label-sm text-label-sm text-secondary mt-0.5">Verified by Engine</p>
</div>
</div>
<!-- Step 2: Academic Portfolio -->
<div class="flex-shrink-0 w-44 bg-surface-container-lowest rounded-lg p-unit-3 shadow-sm flex flex-col justify-between relative overflow-hidden">
<div class="flex items-center justify-between mb-unit-2">
<div class="w-6 h-6 rounded-full bg-surface-container-high text-primary flex items-center justify-center">
<span class="material-symbols-outlined text-[14px]">done_all</span>
</div>
<span class="font-label-sm text-label-sm font-semibold text-primary">02 • Lab Work</span>
</div>
<div>
<h3 class="font-label-md text-label-md text-on-surface leading-snug">Academic Papers</h3>
<p class="font-label-sm text-label-sm text-secondary mt-0.5">3 Papers Stamped</p>
</div>
</div>
<!-- Step 3: Faculty Endorsement -->
<div class="flex-shrink-0 w-44 bg-surface-container-lowest rounded-lg p-unit-3 shadow-sm flex flex-col justify-between relative overflow-hidden">
<div class="flex items-center justify-between mb-unit-2">
<div class="w-6 h-6 rounded-full bg-surface-container-high text-primary flex items-center justify-center">
<span class="material-symbols-outlined text-[14px]">done_all</span>
</div>
<span class="font-label-sm text-label-sm font-semibold text-primary">03 • Faculty</span>
</div>
<div>
<h3 class="font-label-md text-label-md text-on-surface leading-snug">Endorsement</h3>
<p class="font-label-sm text-label-sm text-secondary mt-0.5">Dr. Kiprop Signed</p>
</div>
</div>
<!-- Step 4: Parent Consent (Active / Pending) -->
<div class="flex-shrink-0 w-48 bg-primary text-on-primary rounded-lg p-unit-3 shadow-sm flex flex-col justify-between relative overflow-hidden">
<div class="flex items-center justify-between mb-unit-2">
<div class="w-6 h-6 rounded-full bg-white/20 text-on-primary flex items-center justify-center animate-pulse">
<span class="material-symbols-outlined text-[14px]">draw</span>
</div>
<span class="font-label-sm text-label-sm font-semibold text-primary-fixed">04 • Pending</span>
</div>
<div>
<h3 class="font-label-md text-label-md text-on-primary leading-snug">Parent Consent</h3>
<p class="font-label-sm text-label-sm text-primary-fixed-dim mt-0.5">Authorization Due</p>
</div>
</div>
</div>
</section>
<!-- Formative Telemetry Record Section -->
<section class="px-gutter-mobile pb-unit-4">
<div class="bg-surface-container-lowest rounded-xl p-unit-4 shadow-sm flex flex-col gap-unit-3">
<div class="flex items-center justify-between">
<div class="flex items-center gap-unit-2">
<span class="material-symbols-outlined text-primary text-[20px]">analytics</span>
<h2 class="font-headline-sm text-headline-sm text-on-surface">Formative Telemetry</h2>
</div>
<span class="font-label-sm text-label-sm bg-secondary-container text-on-secondary-container px-unit-2 py-0.5 rounded-lg">Continuous Mastery</span>
</div>
<!-- Physics Vector -->
<div class="bg-surface-container-low rounded-lg p-unit-3 flex flex-col gap-unit-1">
<div class="flex items-center justify-between">
<span class="font-label-md text-label-md text-on-surface font-semibold">Cambridge IGCSE Physics (0625)</span>
<span class="font-label-md text-label-md text-primary font-bold">94%</span>
</div>
<div class="w-full bg-surface-container-highest rounded-full h-2 overflow-hidden">
<div class="bg-primary h-2 rounded-full" style="width: 94%"></div>
</div>
<div class="flex items-center justify-between text-secondary font-label-sm text-label-sm pt-0.5">
<span>Top 2% Decile • 12/12 Labs Validated</span>
<span class="text-on-surface-variant font-medium">Mechanics &amp; Electromagnetism</span>
</div>
</div>
<!-- Add Maths Vector -->
<div class="bg-surface-container-low rounded-lg p-unit-3 flex flex-col gap-unit-1">
<div class="flex items-center justify-between">
<span class="font-label-md text-label-md text-on-surface font-semibold">Additional Mathematics (0606)</span>
<span class="font-label-md text-label-md text-primary font-bold">91%</span>
</div>
<div class="w-full bg-surface-container-highest rounded-full h-2 overflow-hidden">
<div class="bg-primary h-2 rounded-full" style="width: 91%"></div>
</div>
<div class="flex items-center justify-between text-secondary font-label-sm text-label-sm pt-0.5">
<span>Top 5% Decile • Vector Mechanics Certified</span>
<span class="text-on-surface-variant font-medium">Calculus &amp; Modeling</span>
</div>
</div>
<!-- Chemistry Vector -->
<div class="bg-surface-container-low rounded-lg p-unit-3 flex flex-col gap-unit-1">
<div class="flex items-center justify-between">
<span class="font-label-md text-label-md text-on-surface font-semibold">Cambridge IGCSE Chemistry (0620)</span>
<span class="font-label-md text-label-md text-primary font-bold">88%</span>
</div>
<div class="w-full bg-surface-container-highest rounded-full h-2 overflow-hidden">
<div class="bg-primary h-2 rounded-full" style="width: 88%"></div>
</div>
<div class="flex items-center justify-between text-secondary font-label-sm text-label-sm pt-0.5">
<span>Top 8% Decile</span>
<span class="text-on-surface-variant font-medium">Stoichiometry &amp; Kinetics</span>
</div>
</div>
<!-- Cryptographic Ledger Stamping Badge -->
<div class="bg-surface-container-high/60 rounded-lg p-unit-3 flex items-start gap-unit-2">
<span class="material-symbols-outlined text-primary text-[18px] flex-shrink-0 mt-0.5">token</span>
<div class="flex flex-col gap-0.5 overflow-hidden">
<span class="font-label-sm text-label-sm font-semibold text-on-surface">Cryptographic Proof • SHA-256</span>
<p class="font-code-sm text-code-sm text-on-surface-variant truncate">
            85fa4c029a1e7488e92bc0d8327a195e2bf0087a4192d6e3c21
          </p>
<span class="font-label-sm text-label-sm text-primary flex items-center gap-1 mt-0.5">
<span class="w-1.5 h-1.5 rounded-full bg-primary"></span>
            Immutable &amp; validated on Academic Ledger
          </span>
</div>
</div>
</div>
</section>
<!-- Candidate Project Portfolio Cards -->
<section class="px-gutter-mobile pb-unit-4 flex flex-col gap-unit-3">
<div class="flex items-center justify-between">
<div class="flex items-center gap-unit-2">
<span class="material-symbols-outlined text-primary text-[20px]">folder_supervised</span>
<h2 class="font-headline-sm text-headline-sm text-on-surface">Verified Artifacts</h2>
</div>
<span class="font-label-sm text-label-sm text-secondary">2 Submissions</span>
</div>
<!-- Artifact 01 Card -->
<div class="bg-surface-container-lowest rounded-xl p-unit-4 shadow-sm flex flex-col gap-unit-3">
<div class="flex items-center justify-between">
<span class="bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm px-unit-2 py-0.5 rounded-lg font-semibold uppercase">
          Artifact 01
        </span>
<span class="font-label-sm text-label-sm text-secondary flex items-center gap-1">
<span class="material-symbols-outlined text-[15px] text-surface-tint">military_tech</span>
          EA Science Fair Finalist
        </span>
</div>
<div class="flex flex-col gap-1">
<h3 class="font-headline-sm text-headline-sm text-on-surface leading-snug">
          Kinematic Wave Mechanics in Low-Cost Water Filtration Sensors
        </h3>
<p class="font-body-sm text-body-sm text-on-surface-variant">
          Applied acoustical frequency attenuation in poly-membrane water tubes to identify turbidity thresholds without chemical reagents.
        </p>
</div>
<!-- Action Buttons -->
<div class="flex flex-wrap gap-unit-2 pt-unit-1">
<button class="flex-1 bg-surface-container text-on-surface rounded-lg px-unit-3 py-unit-2 flex items-center justify-center gap-unit-1 font-label-sm text-label-sm active:bg-surface-container-high transition-colors" type="button">
<span class="material-symbols-outlined text-[16px] text-primary">description</span>
          14-Pg Monograph (PDF)
        </button>
<button class="flex-1 bg-surface-container text-on-surface rounded-lg px-unit-3 py-unit-2 flex items-center justify-center gap-unit-1 font-label-sm text-label-sm active:bg-surface-container-high transition-colors" type="button">
<span class="material-symbols-outlined text-[16px] text-primary">data_table</span>
          Sensor CSV (4.2 MB)
        </button>
</div>
</div>
<!-- Artifact 02 Card -->
<div class="bg-surface-container-lowest rounded-xl p-unit-4 shadow-sm flex flex-col gap-unit-3">
<div class="flex items-center justify-between">
<span class="bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm px-unit-2 py-0.5 rounded-lg font-semibold uppercase">
          Artifact 02
        </span>
<span class="font-label-sm text-label-sm text-secondary">
          Computational Physics
        </span>
</div>
<div class="flex flex-col gap-1">
<h3 class="font-headline-sm text-headline-sm text-on-surface leading-snug">
          Comparative Thermal Dissipation in Solar Micro-Inverters
        </h3>
<p class="font-body-sm text-body-sm text-on-surface-variant">
          Finite element thermal mesh simulation optimizing heat sink fin geometry for sub-Saharan solar home setups under ambient 38°C conditions.
        </p>
</div>
<div>
<button class="w-full bg-primary-container text-on-primary rounded-lg px-unit-3 py-unit-2 flex items-center justify-center gap-unit-2 font-label-sm text-label-sm active:bg-primary transition-colors" type="button">
<span class="material-symbols-outlined text-[16px]">play_arrow</span>
          Launch Interactive WebGL Model
        </button>
</div>
</div>
<!-- Candidate Rationale Quote Card -->
<div class="bg-surface-container-low rounded-xl p-unit-4 flex flex-col gap-unit-2">
<div class="flex items-center gap-unit-1 text-primary">
<span class="material-symbols-outlined text-[20px]">format_quote</span>
<span class="font-label-sm text-label-sm uppercase tracking-wider font-semibold">Candidate Rationale</span>
</div>
<blockquote class="font-headline-sm text-headline-sm italic text-on-surface leading-snug">
        “When borehole testing failed our school community in Nakuru County, I realized rural water security doesn’t lack chemistry—it lacks automated, rugged kinetic diagnostics that anyone can read.”
      </blockquote>
<div class="flex items-center justify-between pt-unit-1">
<span class="font-label-sm text-label-sm font-semibold text-on-surface">Kwame Mutua</span>
<span class="font-label-sm text-label-sm text-secondary">Personal Statement Extract</span>
</div>
</div>
</section>
<!-- Institutional Endorsement -->
<section class="px-gutter-mobile pb-unit-4">
<div class="bg-surface-container-lowest rounded-xl p-unit-4 shadow-sm flex flex-col gap-unit-3">
<div class="flex items-center gap-unit-2">
<span class="material-symbols-outlined text-primary text-[20px]">verified_user</span>
<h2 class="font-headline-sm text-headline-sm text-on-surface">Faculty Endorsement</h2>
</div>
<div class="bg-surface-container-low rounded-lg p-unit-3 flex flex-col gap-unit-2">
<div class="flex items-center gap-unit-3">
<div class="w-11 h-11 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-md text-label-md font-bold flex-shrink-0">
            AK
          </div>
<div class="flex flex-col min-w-0">
<span class="font-label-md text-label-md font-semibold text-on-surface truncate">Dr. Angela Kiprop, Ph.D.</span>
<span class="font-label-sm text-label-sm text-secondary truncate">Senior Physics Lead • Cambridge Coordinator</span>
<span class="font-label-sm text-label-sm text-on-surface-variant truncate">Riverside Academy, Nairobi</span>
</div>
</div>
<p class="font-body-sm text-body-sm text-on-surface-variant italic pt-unit-1">
          “Kwame operates at the intellectual cadence of an advanced A-Level research fellow. His analytical rigor in computational kinematics is matched only by his civic sense of stewardship.”
        </p>
<div class="flex items-center justify-between pt-unit-1">
<span class="font-label-sm text-label-sm text-surface-tint font-medium flex items-center gap-1">
<span class="material-symbols-outlined text-[15px]">lock</span>
            Cryptographically Signed
          </span>
<span class="font-label-sm text-label-sm text-secondary">June 28, 2025</span>
</div>
</div>
</div>
</section>
<!-- Fellowship Entitlements & Key Dates -->
<section class="px-gutter-mobile pb-unit-4 flex flex-col gap-unit-3">
<!-- Entitlements Card -->
<div class="bg-surface-container-lowest rounded-xl p-unit-4 shadow-sm flex flex-col gap-unit-3">
<div class="flex items-center justify-between">
<div class="flex items-center gap-unit-2">
<span class="material-symbols-outlined text-primary text-[20px]">stars</span>
<h2 class="font-headline-sm text-headline-sm text-on-surface">Fellowship Entitlements</h2>
</div>
<span class="font-label-sm text-label-sm bg-primary-fixed text-on-primary-fixed px-unit-2 py-0.5 rounded-lg font-semibold">Award Package</span>
</div>
<div class="space-y-unit-2">
<div class="flex items-start gap-unit-2">
<span class="material-symbols-outlined text-[18px] text-primary mt-0.5">check_circle</span>
<div class="flex flex-col">
<span class="font-label-md text-label-md text-on-surface">100% Cambridge Tuition &amp; Exam Fees</span>
<span class="font-body-sm text-body-sm text-secondary">Disbursed directly to Riverside Academy for Year 11 &amp; A-Levels.</span>
</div>
</div>
<div class="flex items-start gap-unit-2">
<span class="material-symbols-outlined text-[18px] text-primary mt-0.5">check_circle</span>
<div class="flex flex-col">
<span class="font-label-md text-label-md text-on-surface">$800 Annual Hardware Lab Grant</span>
<span class="font-body-sm text-body-sm text-secondary">Dedicated equipment fund for sensors, microcontrollers, and chemicals.</span>
</div>
</div>
<div class="flex items-start gap-unit-2">
<span class="material-symbols-outlined text-[18px] text-primary mt-0.5">check_circle</span>
<div class="flex flex-col">
<span class="font-label-md text-label-md text-on-surface">3-Week August University Residency</span>
<span class="font-body-sm text-body-sm text-secondary">Hands-on residency at University of Nairobi Science &amp; Fab Lab.</span>
</div>
</div>
<div class="flex items-start gap-unit-2">
<span class="material-symbols-outlined text-[18px] text-primary mt-0.5">check_circle</span>
<div class="flex flex-col">
<span class="font-label-md text-label-md text-on-surface">1-on-1 Systems Engineering Mentorship</span>
<span class="font-body-sm text-body-sm text-secondary">Paired with Safaricom Senior IoT Architect throughout academic year.</span>
</div>
</div>
</div>
</div>
<!-- Key Timeline Dates -->
<div class="bg-surface-container-lowest rounded-xl p-unit-4 shadow-sm flex flex-col gap-unit-3">
<div class="flex items-center gap-unit-2">
<span class="material-symbols-outlined text-primary text-[20px]">calendar_month</span>
<h2 class="font-headline-sm text-headline-sm text-on-surface">Fellowship Timeline</h2>
</div>
<div class="grid grid-cols-3 gap-unit-2">
<div class="bg-surface-container-low rounded-lg p-unit-2 flex flex-col items-center text-center">
<span class="font-label-sm text-label-sm text-secondary">Dossier Close</span>
<span class="font-label-md text-label-md font-bold text-on-surface mt-1">July 15</span>
<span class="font-label-sm text-label-sm text-tertiary font-medium">11:59 PM EAT</span>
</div>
<div class="bg-surface-container-low rounded-lg p-unit-2 flex flex-col items-center text-center">
<span class="font-label-sm text-label-sm text-secondary">Shortlist Call</span>
<span class="font-label-md text-label-md font-bold text-on-surface mt-1">July 28</span>
<span class="font-label-sm text-label-sm text-secondary font-medium">Virtual Panel</span>
</div>
<div class="bg-surface-container-low rounded-lg p-unit-2 flex flex-col items-center text-center">
<span class="font-label-sm text-label-sm text-secondary">Endowment</span>
<span class="font-label-md text-label-md font-bold text-primary mt-1">Aug 10</span>
<span class="font-label-sm text-label-sm text-primary font-medium">Award Gala</span>
</div>
</div>
</div>
</section>
<!-- Bottom Authorization & Consent Section -->
<section class="px-gutter-mobile pb-unit-6">
<div class="bg-surface-container-lowest rounded-xl p-unit-4 shadow-[0_8px_24px_-4px_rgba(22,26,45,0.06),0_2px_6px_-1px_rgba(22,26,45,0.04)] flex flex-col gap-unit-3">
<div class="flex items-center justify-between">
<div class="flex items-center gap-unit-2">
<span class="material-symbols-outlined text-primary text-[20px]">shield_person</span>
<h3 class="font-headline-sm text-headline-sm text-on-surface">Legal Authorization</h3>
</div>
<span class="font-label-sm text-label-sm bg-error-container text-on-error-container px-unit-2 py-0.5 rounded-lg font-semibold">Action Required</span>
</div>
<!-- Legal Checkbox Box -->
<label class="bg-surface-container-low rounded-lg p-unit-3 flex items-start gap-unit-3 cursor-pointer select-none">
<input class="mt-1 w-4 h-4 rounded text-primary accent-primary cursor-pointer" id="parent-consent-toggle" type="checkbox"/>
<span class="font-body-sm text-body-sm text-on-surface leading-snug">
          I, <strong class="font-semibold text-on-surface">Zainab Mutua</strong>, confirm that all personal, academic, and project records in this dossier are authentic and authorize immediate release to the Equity Foundation Selection Committee.
        </span>
</label>
<!-- Main Action Buttons -->
<div class="flex flex-col gap-unit-2 pt-unit-1">
<button class="w-full bg-primary hover:bg-primary-container text-on-primary rounded-lg py-unit-3 px-unit-4 flex items-center justify-center gap-unit-2 font-label-md text-label-md font-semibold transition-all shadow-md active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none" disabled="" id="dispatch-dossier-btn" type="button">
<span class="material-symbols-outlined text-[20px]">verified</span>
<span>Digitally Sign &amp; Dispatch Dossier</span>
<span class="material-symbols-outlined text-[16px] ml-auto">lock</span>
</button>
<button class="w-full bg-transparent hover:bg-surface-container text-secondary hover:text-on-surface rounded-lg py-unit-2 px-unit-3 flex items-center justify-center gap-unit-2 font-label-sm text-label-sm transition-colors" type="button">
<span class="material-symbols-outlined text-[18px]">contact_phone</span>
<span>Consult Academic Advisor Dr. David Omwamba</span>
</button>
</div>
<!-- Microcopy -->
<p class="font-label-sm text-label-sm text-secondary text-center">
        Encrypted with 256-bit institutional authentication • Tamper proof
      </p>
</div>
</section>
</div>
<script>
  (function() {
    const consentToggle = document.getElementById('parent-consent-toggle');
    const dispatchBtn = document.getElementById('dispatch-dossier-btn');

    if (consentToggle && dispatchBtn) {
      consentToggle.addEventListener('change', function() {
        if (this.checked) {
          dispatchBtn.removeAttribute('disabled');
          dispatchBtn.classList.add('animate-bounce');
          setTimeout(() => dispatchBtn.classList.remove('animate-bounce'), 800);
        } else {
          dispatchBtn.setAttribute('disabled', 'true');
        }
      });

      dispatchBtn.addEventListener('click', function() {
        if (!dispatchBtn.hasAttribute('disabled')) {
          const originalText = dispatchBtn.innerHTML;
          dispatchBtn.innerHTML = '<span class="material-symbols-outlined text-[20px] animate-spin">sync</span><span>Transmitting Cryptographic Dossier...</span>';
          setTimeout(() => {
            dispatchBtn.innerHTML = '<span class="material-symbols-outlined text-[20px]">check_circle</span><span>Dossier Dispatched to Selection Board!</span>';
            dispatchBtn.classList.remove('bg-primary');
            dispatchBtn.classList.add('bg-surface-tint');
          }, 1200);
        }
      });
    }
  })();
</script></main><nav class="fixed bottom-0 w-full z-50 pb-safe bg-surface/85 backdrop-blur-xl shadow-[0_-1px_12px_rgba(0,0,0,0.04)]" data-active-classes="text-primary font-semibold"><div class="flex justify-around items-center h-16 px-gutter-mobile"><a aria-current="page" class="flex flex-col items-center justify-center gap-unit-1 w-16 h-12 transition-colors text-primary font-semibold" data-path="dossier-overview" href="#"><span class="material-symbols-outlined text-[22px]">article</span><span class="font-label-sm text-label-sm">Dossier</span></a><a class="flex flex-col items-center justify-center gap-unit-1 w-16 h-12 text-on-surface-variant hover:text-on-surface transition-colors" data-path="portfolio-artifacts" href="#"><span class="material-symbols-outlined text-[22px]">folder_supervised</span><span class="font-label-sm text-label-sm">Artifacts</span></a><a class="flex flex-col items-center justify-center gap-unit-1 w-16 h-12 text-on-surface-variant hover:text-on-surface transition-colors" data-path="telemetry-progress" href="#"><span class="material-symbols-outlined text-[22px]">insights</span><span class="font-label-sm text-label-sm">Telemetry</span></a><a class="flex flex-col items-center justify-center gap-unit-1 w-16 h-12 text-on-surface-variant hover:text-on-surface transition-colors" data-path="academic-endorsements" href="#"><span class="material-symbols-outlined text-[22px]">verified</span><span class="font-label-sm text-label-sm">Endorse</span></a></div></nav></body></html>