import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { generateProfessionalPDF } from '@/lib/pdf-generator';

/**
 * Generate PDF Report API
 * Creates a comprehensive business report with credit analysis using jsPDF
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reportId, userId } = body;

    if (!reportId || !userId) {
      return NextResponse.json(
        { message: 'Report ID and User ID are required' },
        { status: 400 }
      );
    }

    // Step 1: Fetch the credit report from Firestore
    const reportDoc = await adminDb
      .collection('users')
      .doc(userId)
      .collection('creditReports')
      .doc(reportId)
      .get();
    
    if (!reportDoc.exists) {
      return NextResponse.json(
        { message: 'Report not found' },
        { status: 404 }
      );
    }

    const reportData = reportDoc.data();
    
    // Verify the report belongs to the user (redundant check but good for security)
    if (reportData?.userId !== userId) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Step 2: Generate professional PDF with jsPDF
    const pdfBuffer = await generateProfessionalPDF(reportData as any);

    // Step 3: Return PDF as blob
    return new NextResponse(pdfBuffer as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="credit-report-${reportId.substring(0, 8)}.pdf"`,
      },
    });

  } catch (error: any) {
    return NextResponse.json(
      { 
        message: 'Internal server error',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
