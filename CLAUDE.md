# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**AceAI** - An AI-powered study application for AP exam preparation. Features adaptive practice questions, code execution for AP CSA, progress tracking, and AI tutoring feedback.

**GitHub:** https://github.com/SamyR19/ap-study-app

## Tech Stack

- **Framework:** Next.js 14 with App Router
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS + shadcn/ui + Framer Motion
- **Database:** Supabase (PostgreSQL with RLS)
- **AI:** OpenAI API (GPT-4o-mini)
- **Code Execution:** Judge0 CE (free, no API key)
- **Icons:** Lucide React
- **Code Editor:** Monaco Editor

## Build Commands

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Project Structure

```
ap-study-app/
├── app/
│   ├── (auth)/              # Auth pages (login, signup)
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (dashboard)/         # Protected dashboard routes
│   │   ├── layout.tsx       # Dashboard layout with sidebar
│   │   ├── dashboard/page.tsx
│   │   └── subjects/
│   │       ├── page.tsx     # All subjects list
│   │       └── [subjectId]/page.tsx  # Subject detail + topics
│   ├── auth/callback/       # OAuth callback handler
│   ├── globals.css          # Global styles + design system
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Landing page
├── components/
│   ├── ui/                  # shadcn/ui components (13 installed)
│   ├── landing/             # Landing page sections
│   │   ├── Header.tsx
│   │   ├── Hero.tsx
│   │   ├── Features.tsx
│   │   ├── Pricing.tsx
│   │   ├── FAQ.tsx
│   │   └── Footer.tsx
│   └── dashboard/           # Dashboard components
│       ├── Sidebar.tsx
│       └── TopicCard.tsx
├── lib/
│   ├── utils.ts             # cn() helper
│   ├── supabase.ts          # Supabase client + auth helpers
│   ├── judge0.ts            # Code execution API
│   └── openai.ts            # OpenAI client
├── types/
│   ├── index.ts             # Core TypeScript types
│   └── subjects.ts          # AP subject configurations (25 subjects)
├── data/
│   └── topics.ts            # AP CSA topics (57 topics, 4 units)
├── supabase/
│   └── schema.sql           # Database schema with RLS
└── public/
    └── aceai-logo.svg       # App logo
```

## Design System

### Brand Colors (Warm Palette)
- **Primary:** #E07856 (coral) - CTAs, active states
- **Secondary:** #F4D5C6 (peach) - backgrounds, accents
- **Cream:** #FAF9F6, #F5F3EF, #E8E4DD - neutral backgrounds
- **Charcoal:** #2D2D2D (headings), #6B6B6B (body)
- **Success:** #6B9E78 (soft green)
- **Error:** #D66B6B (muted red)

### Typography
- **Sans:** Inter (body), Plus Jakarta Sans (display)
- **Mono:** JetBrains Mono (code)

### Key CSS Classes
- `gradient-bg-hero` - Landing page gradient background
- `gradient-text` - Gradient text effect
- `pill` - Badge/pill component
- `card-warm` - Warm-styled card
- `hover-lift` - Hover lift animation

## Key Integrations

### Supabase
- Client + auth helpers in `lib/supabase.ts`
- Functions: `signIn`, `signUp`, `signOut`, `signInWithGoogle`, `getUser`
- Schema in `supabase/schema.sql` (run in Supabase SQL editor)

### Judge0 CE (Code Execution)
- Free instance at `https://ce.judge0.com`
- No API key required
- Helper functions in `lib/judge0.ts`
- Language IDs: Python (71), JavaScript (63), Java (62), C++ (54)

### OpenAI
- Client in `lib/openai.ts`
- Used for: explanations, study hints, FRQ feedback

## shadcn/ui Components

Installed: button, card, input, label, dropdown-menu, dialog, progress, tabs, select, avatar, badge, separator, skeleton

Add more: `npx shadcn@latest add [component-name]`

## Code Conventions

- TypeScript strict mode
- Named exports preferred
- `@/` import alias for absolute imports
- `cn()` helper for conditional classes
- Framer Motion for animations
- All new components in appropriate folder

## Current State

- ✅ Landing page (Header, Hero, Features, Pricing, FAQ, Footer)
- ✅ Auth pages (Login, Signup with Supabase)
- ✅ Dashboard layout with sidebar
- ✅ Dashboard home page
- ✅ Subjects list page
- ✅ Subject detail page with topics
- ✅ Type definitions for all entities
- ✅ AP CSA topics (57 topics across 4 units)
- ✅ Database schema with RLS
- 🔄 Practice flow (MCQ/FRQ pages) - Next
- 🔄 Progress tracking
- 🔄 Code editor integration
