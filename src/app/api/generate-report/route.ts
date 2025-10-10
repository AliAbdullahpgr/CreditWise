
import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import ReactDOMServer from 'react-dom/server';
import { formatReportData } from '@/lib/reportUtils';
import { calculateCreditScore } from '@/ai/flows/calculate-credit-score';
import CreditReportComponent from '@/components/report/credit-report';
import { userFinancials } from '@/lib/data';

export async function POST(request: NextRequest) {
  try {
    const { transactions, userId } = await request.json();

    if (!transactions || transactions.length === 0) {
      return NextResponse.json({ error: 'No transactions provided' }, { status: 400 });
    }
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    // 1. Calculate credit score using the AI flow
    // In a real app, these would be calculated from transactions, but for demo we use mock factors
    const creditScoreInput = {
      billPaymentHistory: userFinancials.billPaymentHistory,
      incomeConsistency: userFinancials.incomeConsistency,
      expenseManagement: userFinancials.expenseManagement,
      financialGrowth: userFinancials.financialGrowth,
      transactionDiversity: userFinancials.transactionDiversity,
      transactions,
    };

    const creditScoreOutput = await calculateCreditScore(creditScoreInput, userId);

    // 2. Format the data for the report
    const reportData = formatReportData(transactions, creditScoreOutput);
    
    // 3. Render React component to HTML
    const html = ReactDOMServer.renderToString(
      <CreditReportComponent reportData={reportData} />
    );
    
    // 4. Add TailwindCSS styles
    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Credit Report</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
             body { font-family: 'Poppins', 'PT Sans', sans-serif; }
          </style>
        </head>
        <body class="font-body">${html}</body>
      </html>
    `;

    // 5. Launch Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    
    const page = await browser.newPage();
    
    // 6. Set content and generate PDF
    await page.setContent(fullHtml, { waitUntil: 'networkidle0' });
    
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm',
      },
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
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: errorMessage },
      { status: 500 }
    );
  }
}
