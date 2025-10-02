# CreditWise - Financial Passport for the Informal Economy

> **Alternative Credit Scoring powered by AI for the 2+ billion unbanked people worldwide**

## 🌟 Overview

CreditWise is an AI-powered platform that provides **Alternative Credit Scores** for gig workers, street vendors, freelancers, and informal economy workers who lack traditional credit history.

Unlike FICO or VantageScore, which require credit cards and bank loans, CreditWise analyzes:
- 📱 Mobile wallet transactions
- 💰 Income consistency patterns
- 💳 Bill payment history (rent, utilities)
- 📊 Expense management
- 📈 Financial growth trends

## 🚀 Key Features

- **AI Document Processing**: Upload receipts, bills, statements → AI extracts transactions automatically
- **Alternative Credit Scoring**: 0-1000 score based on 5 factors (not FICO)
- **Transaction Categorization**: 12 categories with confidence scoring
- **Real-time Dashboard**: Financial metrics and credit score visualization
- **Mobile-First Design**: Optimized for low-end Android devices

## 🎯 Why Alternative Scoring?

Traditional credit scores exclude 2 billion people because they require:
❌ Credit cards  
❌ Bank loans  
❌ Mortgages  
❌ Formal credit history  

**CreditWise includes them by evaluating:**
✅ Income patterns from gig work  
✅ Bill payments (rent, utilities, mobile)  
✅ Spending discipline  
✅ Financial growth  
✅ Transaction diversity  

## 📊 Scoring Algorithm

| Factor | Weight | What It Measures |
|--------|--------|------------------|
| Bill Payment History | 30% | On-time rent, utilities, mobile bills |
| Income Consistency | 25% | Regular earning patterns |
| Expense Management | 20% | Spending discipline & savings |
| Financial Growth | 15% | Income trend over time |
| Transaction Diversity | 10% | Multiple income sources |

**Score Range:** 0-1000 (A: 800+, B+: 700-799, B: 600-699, C: 500-599, D: <500)

## 🛠️ Tech Stack

- **Next.js 15** with App Router & Turbopack
- **Google Genkit** + Gemini 2.5 Flash for AI
- **Firebase** for hosting & future auth
- **Zod** for type-safe schemas
- **Shadcn/ui** + Tailwind CSS for design
- **Recharts** for data visualization

## 🏃 Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/AliAbdullahpgr/CreditWise.git
cd CreditWise

# 2. Install dependencies
npm install

# 3. Add your API key to .env.local
GOOGLE_GENAI_API_KEY=your_key_here

# 4. Start the dev server
npm run dev

# 5. Open http://localhost:9003
```

Get your Google Genkit API key: https://aistudio.google.com/app/apikey

## 📁 Project Structure

```
src/
├── ai/
│   ├── genkit.ts                        # AI configuration
│   └── flows/
│       ├── calculate-credit-score.ts    # Alternative scoring algorithm
│       ├── categorize-transactions.ts   # 12-category classification
│       └── extract-transactions-from-document.ts  # OCR extraction
├── app/
│   ├── (app)/                           # Protected routes
│   │   ├── dashboard/                   # Main overview
│   │   ├── documents/                   # Upload & processing
│   │   ├── transactions/                # Transaction management
│   │   ├── reports/                     # Credit reports
│   │   └── settings/                    # User settings
│   └── (auth)/                          # Login/signup (UI only)
├── components/
│   ├── score-gauge.tsx                  # Animated score display
│   ├── charts.tsx                       # Financial charts
│   ├── alternative-credit-info.tsx      # Scoring explanation
│   └── ui/                              # Shadcn components
└── lib/
    ├── types.ts                         # TypeScript types
    ├── data.ts                          # Mock demo data
    └── utils.ts                         # Utility functions
```

## 🧪 Development

```bash
# Run dev server with Turbopack
npm run dev

# Test AI flows with Genkit UI
npm run genkit:dev

# TypeScript type checking
npm run typecheck

# Production build
npm run build
```

## 📖 Documentation

- [Alternative Credit Scoring Explained](./ALTERNATIVE_CREDIT_SCORING.md)
- [Hackathon Quick Start Guide](./HACKATHON_QUICK_START.md)
- [Comprehensive Audit Report](./HACKATHON_AUDIT_REPORT.md)

## 🎯 Use Cases

### Who Benefits?
- 🚗 Gig workers (Uber, Lyft, delivery)
- 🛒 Street vendors & market sellers
- 💻 Freelancers & online sellers
- 🏠 Domestic & construction workers
- 📦 Small business owners

### What Can They Access?
- Microloans from alternative lenders
- Mobile wallet credit limits
- Merchant financing
- Rent-to-own programs
- P2P lending platforms

## 🌍 Social Impact

**Target Market:** 2+ billion unbanked/underbanked people worldwide  
**Problem:** Traditional credit systems exclude informal economy workers  
**Solution:** AI-powered alternative credit scoring using accessible data  
**Impact:** Financial inclusion for previously excluded populations  

## ⚠️ Important Notes

- **This is NOT a FICO score** - It's an alternative scoring model
- Designed for informal economy workers without traditional credit
- Cannot be used for traditional bank loans or credit cards
- Intended for alternative lenders, microfinance, and fintech platforms

## 📄 License

MIT License - See [LICENSE](LICENSE) for details

## 🤝 Contributing

Contributions welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📧 Contact

- **Developer:** Ali Abdullah
- **GitHub:** [@AliAbdullahpgr](https://github.com/AliAbdullahpgr)
- **Project:** [CreditWise](https://github.com/AliAbdullahpgr/CreditWise)

---

**Built with ❤️ for financial inclusion**
