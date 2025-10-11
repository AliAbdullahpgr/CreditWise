import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { generateProfessionalPDF } from '@/lib/pdf-generator';

/**
 * Generate PDF Report API
 * Creates a comprehensive business report with credit analysis using jsPDF
 */
export async function POST(request: NextRequest) {
  console.log('\n📄 [API] /api/generate-pdf called');
  
  try {
    const body = await request.json();
    const { reportId, userId } = body;

    if (!reportId || !userId) {
      console.log('❌ [API] Missing reportId or userId');
      return NextResponse.json(
        { message: 'Report ID and User ID are required' },
        { status: 400 }
      );
    }

    console.log('👤 [API] User ID:', userId);
    console.log('📋 [API] Report ID:', reportId);

    // Step 1: Fetch the credit report from Firestore
    console.log('\n📥 [STEP 1] Fetching credit report from Firestore...');
    const reportDoc = await adminDb
      .collection('users')
      .doc(userId)
      .collection('creditReports')
      .doc(reportId)
      .get();
    
    if (!reportDoc.exists) {
      console.log('❌ [API] Report not found');
      return NextResponse.json(
        { message: 'Report not found' },
        { status: 404 }
      );
    }

    const reportData = reportDoc.data();
    
    // Verify the report belongs to the user (redundant check but good for security)
    if (reportData?.userId !== userId) {
      console.log('❌ [API] Unauthorized access attempt');
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 403 }
      );
    }

    console.log('✅ [STEP 1] Report fetched successfully');

    // Step 2: Generate professional PDF with jsPDF
    console.log('\n📝 [STEP 2] Generating professional PDF with jsPDF...');
    
    const pdfBuffer = await generateProfessionalPDF(reportData);
    
    console.log('✅ [STEP 2] PDF generated successfully');

    // Step 3: Return PDF as blob
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="credit-report-${reportId.substring(0, 8)}.pdf"`,
      },
    });

  } catch (error: any) {
    console.error('❌ [API] Error generating PDF:', error);
    return NextResponse.json(
      { 
        message: 'Internal server error',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
