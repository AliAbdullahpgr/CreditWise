# CreditWise - AI Coding Instructions

## Project Overview
CreditWise is a **financial passport for the informal economy** - a Next.js application that calculates credit scores using AI-powered document processing and transaction analysis. Built with Next.js 15, Firebase hosting, and Google Genkit AI flows.

## Architecture & Key Concepts

### AI-First Financial Processing
- **Primary AI System**: Google Genkit with Gemini 2.5 Flash (`src/ai/genkit.ts`)
- **AI Flows Pattern**: All AI logic in `src/ai/flows/` as server actions with strict Zod schemas
  - `calculate-credit-score.ts` - 6-factor weighted credit scoring (0-1000 scale)
  - `categorize-transactions.ts` - 12-category transaction classification
  - `extract-transactions-from-document.ts` - OCR and data extraction
- **Flow Structure**: Each flow exports input/output types and uses `ai.definePrompt()` + `ai.defineFlow()`

### Credit Scoring Algorithm
Credit scores calculated via weighted factors:
- Income Consistency (25%), Expense Management (20%), Bill Payment History (20%)
- Financial Growth (15%), Transaction Diversity (10%), Financial Discipline (10%)
- Risk grades: A (800+), B (600-799), C (400-599), D (<400)

### App Router Structure
```
src/app/
├── layout.tsx              # Root layout with custom fonts (Poppins/PT Sans)
├── (auth)/                 # Auth route group
│   ├── login/page.tsx
│   └── signup/page.tsx
└── (app)/                  # Protected app route group
    ├── layout.tsx          # Sidebar + header layout
    ├── dashboard/page.tsx  # Main financial overview
    ├── transactions/page.tsx
    ├── documents/page.tsx
    ├── reports/page.tsx
    └── settings/page.tsx
```

### Design System & Theming
- **Color Scheme**: Primary yellow (`HSL(49, 100%, 50%)`), warm background (`HSL(53, 26%, 92%)`), orange accent (`HSL(19, 92%, 51%)`)
- **Typography**: Poppins headlines, PT Sans body text via `font-headline`/`font-body` classes
- **Components**: Shadcn/ui with custom color tokens in `globals.css` and `tailwind.config.ts`
- **Mobile-First**: Responsive design prioritizing low-end Android devices

## Development Workflows

### AI Development
```bash
npm run genkit:dev          # Start Genkit UI for testing flows
npm run genkit:watch        # Auto-reload during development
```

### Next.js Development
```bash
npm run dev                 # Next.js dev server with Turbopack on port 9003
npm run build               # Production build
npm run typecheck           # TypeScript validation
```

### Key Development Patterns

#### AI Flow Creation
1. Define input/output schemas with Zod
2. Create prompt template with schema validation
3. Export flow function as server action
4. Use strict typing: `z.infer<typeof SchemaName>`

#### Data Management
- **Client State**: localStorage for transactions with key "transactions", no external database yet
- **Types**: Core types in `src/lib/types.ts` (Transaction, Document, CreditReport)
- **Mock Data**: `src/lib/data.ts` with `userFinancials` object for development
- **Document Status**: 'processed' | 'pending' | 'failed' workflow states

#### Component Patterns
- **Server Components**: Default for layouts and static content
- **Client Components**: Mark with `'use client'` for useState, useEffect, event handlers (dashboard, forms, score-gauge)
- **Custom Components**: Score gauge, charts use React hooks for animations and localStorage access
- **Sidebar Layout**: Uses Shadcn sidebar provider pattern in `(app)/layout.tsx`

## Critical Integrations

### Firebase App Hosting
- Configuration in `apphosting.yaml` with maxInstances: 1
- Deploy target for production builds

### Google Genkit AI
- Centralized AI instance in `src/ai/genkit.ts`
- All AI operations use server actions pattern
- Structured outputs with Zod schema validation

## Code Conventions

### File Naming
- AI flows: kebab-case in `src/ai/flows/`
- Components: kebab-case for reusable UI, PascalCase for page components
- Route pages: always `page.tsx` in App Router

### Import Patterns
```typescript
import {ai} from '@/ai/genkit';                    // AI utilities
import {Component} from '@/components/ui';          // UI components
import {Transaction, Document} from '@/lib/types';  // Type definitions
```

### TypeScript
- Strict typing with Zod for AI inputs/outputs
- Export types alongside schemas: `export type Name = z.infer<typeof Schema>`
- Use satisfies operator for config objects

## Testing & Debugging
- AI flows testable via Genkit UI at `http://localhost:4000`
- Credit score calculation has detailed breakdown for transparency
- Transaction categorization includes confidence scoring