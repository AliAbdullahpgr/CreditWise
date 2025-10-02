# Alternative Credit Scoring - Technical Documentation

## Overview

CreditWise uses an **Alternative Credit Scoring** model designed specifically for the informal economy. This is **NOT** a FICO or traditional credit score.

## Why Alternative Scoring?

### The Problem with Traditional Credit Scores

Traditional credit scoring models (FICO, VantageScore) were designed for developed economies with:
- Widespread credit card usage
- Bank loans and mortgages
- Formal employment records
- Credit bureaus tracking every transaction

**This excludes 2+ billion people worldwide** including:
- Gig workers and freelancers
- Street vendors and small merchants
- Cash-based economy workers
- Mobile wallet users
- Migrant workers
- Informal sector employees

### Our Solution

CreditWise evaluates financial behavior through alternative data points that are accessible to everyone, regardless of traditional banking relationships.

## Scoring Algorithm

### Factors and Weights

| Factor | Weight | Description |
|--------|--------|-------------|
| **Bill Payment History** | 30% | On-time payment of rent, utilities, mobile bills |
| **Income Consistency** | 25% | Regularity and variance in monthly earnings |
| **Expense Management** | 20% | Expense-to-income ratio and savings behavior |
| **Financial Growth** | 15% | Income trend over 3-6 months |
| **Transaction Diversity** | 10% | Variety of income sources |

### Score Range

- **0-1000 scale** (similar to traditional scores for familiarity)
- **Risk Grades:**
  - **A (800-1000)**: Excellent - Very low risk
  - **B+ (700-799)**: Good - Low risk
  - **B (600-699)**: Fair - Moderate risk
  - **C (500-599)**: Needs improvement - Higher risk
  - **D (0-499)**: Poor - High risk

### Calculation Method

```
Raw Score = (BillPayment * 0.30) + 
            (Income * 0.25) + 
            (Expense * 0.20) + 
            (Growth * 0.15) + 
            (Diversity * 0.10)

Final Score = Raw Score * 10  // Scale to 0-1000
```

## Comparison with FICO

| Factor | FICO Weight | CreditWise Weight | Notes |
|--------|-------------|-------------------|-------|
| Payment History | 35% | 30% | Similar but adapted for non-credit payments |
| Credit Utilization | 30% | N/A | Not applicable without credit cards |
| Credit History Length | 15% | N/A | Replaced by Financial Growth |
| Credit Mix | 10% | 10% | Similar concept (Transaction Diversity) |
| New Credit Inquiries | 10% | N/A | Not applicable without credit applications |
| Income Consistency | N/A | 25% | **CreditWise Innovation** |
| Expense Management | N/A | 20% | **CreditWise Innovation** |
| Financial Growth | N/A | 15% | **CreditWise Innovation** |

## Data Sources

### What We Analyze

1. **Bill Payment Records**
   - Rent receipts
   - Utility bills (electricity, water, gas)
   - Mobile phone bills
   - Internet/cable subscriptions

2. **Income Patterns**
   - Mobile wallet transactions
   - Gig platform earnings
   - Cash receipts from sales
   - Remittances received

3. **Expense Behavior**
   - Daily spending patterns
   - Savings deposits
   - Discretionary vs. essential spending
   - Cash flow management

4. **Transaction History**
   - Merchant diversity
   - Income source variety
   - Transaction frequency
   - Spending categories

## AI Implementation

### Technology Stack

- **Google Genkit** with Gemini 2.5 Flash for AI orchestration
- **Zod schemas** for type-safe validation
- **OCR processing** for document data extraction
- **Transaction categorization** with confidence scoring

### Processing Flow

```
1. User uploads document (receipt, bill, statement)
   ↓
2. AI extracts transaction data via OCR
   ↓
3. Transactions categorized into 12 categories
   ↓
4. Financial factors calculated from transaction history
   ↓
5. Alternative credit score computed
   ↓
6. Recommendations generated for improvement
```

## Use Cases

### Who Benefits?

1. **Gig Workers**
   - Uber/Lyft drivers
   - Freelance designers
   - Food delivery workers
   - Online sellers

2. **Small Business Owners**
   - Street vendors
   - Market stall operators
   - Home-based businesses
   - Service providers

3. **Cash Economy Workers**
   - Construction workers
   - Domestic workers
   - Agricultural workers
   - Day laborers

### What Can They Access?

With an Alternative Credit Score, users can:
- Apply for microloans
- Get better mobile wallet credit limits
- Qualify for merchant financing
- Access rent-to-own programs
- Build reputation for P2P lending

## Regulatory Compliance

### Fair Lending Principles

- **Transparency**: Full explanation of scoring factors
- **Non-Discrimination**: No race, gender, or age factors
- **Contestability**: Users can dispute inaccuracies
- **Privacy**: Data encrypted and user-controlled

### Data Privacy

- **Local-first storage**: Data stored in user's browser/device
- **User consent**: Explicit permission for data collection
- **Data minimization**: Only collect necessary information
- **Right to deletion**: Users can delete their data anytime

## Limitations

### What This Score Cannot Do

❌ Replace FICO for traditional bank loans  
❌ Qualify for mortgages at major banks  
❌ Work with credit card companies directly  
❌ Report to traditional credit bureaus  

### What This Score CAN Do

✅ Provide credit access to unbanked populations  
✅ Enable microfinance and alternative lending  
✅ Build financial reputation over time  
✅ Demonstrate creditworthiness to alternative lenders  

## Future Enhancements

### Planned Features

1. **Mobile Money Integration**
   - M-Pesa, GCash, Paytm data
   - Real-time balance tracking
   - Savings behavior analysis

2. **Social Verification**
   - Community vouching system
   - Peer-to-peer reputation
   - Business references

3. **Behavioral Biometrics**
   - App usage patterns
   - Financial decision timing
   - Risk tolerance assessment

4. **Machine Learning**
   - Personalized factor weights
   - Fraud detection
   - Default prediction

## References

### Research

- [Credit Invisibles: How to Serve 45 Million Americans](https://www.brookings.edu/)
- [Alternative Credit Scoring Methods](https://www.worldbank.org/)
- [Financial Inclusion Report 2023](https://www.imf.org/)

### Standards

- Fair Credit Reporting Act (FCRA) principles
- GDPR data privacy guidelines
- ISO/IEC 27001 security standards

---

**Version:** 1.0  
**Last Updated:** October 2, 2025  
**Maintained by:** CreditWise Development Team
