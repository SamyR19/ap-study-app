# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AP Study App - A comprehensive study application for AP (Advanced Placement) exam preparation. Built with Next.js 14, featuring AI-powered tutoring, code execution for AP Computer Science, and progress tracking.

## Tech Stack

- **Framework:** Next.js 14 with App Router
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS + shadcn/ui components
- **Database:** Supabase (PostgreSQL)
- **AI:** OpenAI API (GPT-4o-mini)
- **Code Execution:** Judge0 CE (free public instance)
- **Animations:** Framer Motion
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
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   └── globals.css         # Global styles + Tailwind
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── shared/             # Reusable app components
│   └── layout/             # Layout components (header, footer, etc.)
├── lib/
│   ├── utils.ts            # Utility functions (cn helper)
│   ├── supabase.ts         # Supabase client
│   ├── judge0.ts           # Code execution API
│   └── openai.ts           # OpenAI client
├── types/
│   └── index.ts            # TypeScript type definitions
├── data/
│   └── subjects.ts         # AP subjects and topics
└── public/
    └── images/             # Static images
```

## Key Integrations

### Supabase
- Client initialized in `lib/supabase.ts`
- Used for authentication and data storage
- Environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Judge0 CE (Code Execution)
- Free public instance at `https://ce.judge0.com`
- No API key required
- Helper functions in `lib/judge0.ts`
- Supports: Python, JavaScript, Java, C++, C

### OpenAI
- Client in `lib/openai.ts`
- Used for AI tutoring explanations
- Environment variable: `OPENAI_API_KEY`

## shadcn/ui Components Available

button, card, input, label, dropdown-menu, dialog, progress, tabs, select, avatar, badge, separator, skeleton

Add more with: `npx shadcn@latest add [component-name]`

## Code Style

- Use TypeScript strict mode
- Prefer named exports
- Use `@/` import alias for absolute imports
- Use `cn()` helper from `lib/utils.ts` for conditional classes
