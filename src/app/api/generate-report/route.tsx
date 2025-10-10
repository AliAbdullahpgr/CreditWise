
import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import ReactDOMServer from 'react-dom/server';
import { CreditReportComponent } from '@/components/report/credit-report';
import { formatReportData } from '@/lib/reportUtils';
import { Transaction } from '@/lib/types';
import { calculateCreditScore, CalculateCreditScoreInput } from '@/ai/flows/calculate-credit-score';

export async function POST(request: NextRequest) {
  try {
    const { transactions, userFinancials: factors } = await request.json();

    if (!transactions || !factors) {
      return NextResponse.json({ error: 'Missing transactions or financial factors' }, { status: 400 });
    }

    // 1. Calculate credit score
    const creditScoreInput: CalculateCreditScoreInput = {
        billPaymentHistory: factors.billPaymentHistory,
        incomeConsistency: factors.incomeConsistency,
        expenseManagement: factors.expenseManagement,
        financialGrowth: factors.financialGrowth,
        transactionDiversity: factors.transactionDiversity,
        transactions: transactions
    };
    const scoreOutput = await calculateCreditScore(creditScoreInput, 'user-report-gen-001'); // Using a dummy user ID for report generation

    // 2. Format data for the report component
    const reportData = formatReportData(transactions as Transaction[], scoreOutput);

    // 3. Render React component to HTML
    const html = ReactDOMServer.renderToString(
      <CreditReportComponent reportData={reportData} />
    );
    
    // 4. Add TailwindCSS styles
    // In a real app, you'd fetch and inline the compiled CSS file. For this demo, we'll use a basic style block.
    const finalHtml = `
      <html>
        <head>
          <style>
            /* Basic styles - for a full implementation, you'd inline your compiled CSS */
            body { font-family: sans-serif; }
            .p-12 { padding: 3rem; } .text-3xl { font-size: 1.875rem; } .font-bold { font-weight: 700; }
            /* Add more critical CSS here */
          </style>
        </head>
        <body>
          ${html}
        </body>
      </html>
    `;

    // 5. Launch Puppeteer
    const browser = await puppeteer.launch({ 
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    const page = await browser.newPage();
    await page.setContent(finalHtml, { waitUntil: 'networkidle0' });

    // 6. Generate PDF
    const pdf = await page.pdf({ 
      format: 'A4', 
      printBackground: true,
      margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' }
    });
    await browser.close();

    // 7. Return PDF
    return new NextResponse(pdf, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="credit-report-${reportData.summary.reportId}.pdf"`,
      },
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
