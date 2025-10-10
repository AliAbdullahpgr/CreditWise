
'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditReport } from "@/lib/types";
import { PlusCircle, Download, Eye, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { auth } from '@/lib/firebase/config';
import { getCreditReportsCollection, getTransactionsCollection } from '@/lib/firebase/collections';
import { useToast } from '@/hooks/use-toast';
import { ReportViewDialog } from '@/components/report-view-dialog';

export default function ReportsPage() {
  const [creditReports, setCreditReports] = useState<CreditReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<CreditReport | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      setUserId(user ? user.uid : 'user-test-001'); // Fallback to mock user for demo
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const creditReportsCollection = getCreditReportsCollection();
    const q = query(
      creditReportsCollection,
      where('userId', '==', userId),
      orderBy('generationDate', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reportData = snapshot.docs.map(doc => doc.data() as CreditReport);
      setCreditReports(reportData);
      setLoading(false);
    }, (error) => {
        console.error("Error fetching reports:", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);
  
  const handleGenerateReport = async () => {
    if (!userId) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to generate a credit report.',
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);
    console.log('\n🚀 [REPORT] Starting credit report generation...');
    
    try {
      // Step 1: Fetch user transactions
      console.log('📥 [STEP 1] Fetching user transactions...');
      const response = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate report');
      }

      const result = await response.json();
      console.log('✅ [REPORT] Credit report generated successfully:', result);

      toast({
        title: 'Report Generated! 🎉',
        description: `Your credit score is ${result.score} (Grade ${result.grade})`,
      });
    } catch (error: any) {
      console.error('❌ [REPORT] Error generating report:', error);
      toast({
        title: 'Report Generation Failed',
        description: error.message || 'Failed to generate credit report. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleViewReport = (report: CreditReport) => {
    console.log('👁️ [VIEW] Opening report:', report.id);
    setSelectedReport(report);
    setViewDialogOpen(true);
  };

  const handleDownloadPDF = async (report: CreditReport) => {
    console.log('📥 [DOWNLOAD] Generating PDF for report:', report.id);
    
    try {
      toast({
        title: 'Generating PDF...',
        description: 'Please wait while we prepare your report.',
      });

      // Call PDF generation API
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId: report.id, userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      // Get the PDF blob
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `credit-report-${report.id.substring(0, 8)}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'PDF Downloaded! 📄',
        description: 'Your credit report has been downloaded.',
      });
    } catch (error: any) {
      console.error('❌ [DOWNLOAD] Error generating PDF:', error);
      toast({
        title: 'Download Failed',
        description: error.message || 'Failed to download PDF. Please try again.',
        variant: 'destructive',
      });
    }
  };


  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-headline">Credit Reports</CardTitle>
            <CardDescription>
              Generate and manage your credit reports to share with lenders.
            </CardDescription>
          </div>
          <Button onClick={handleGenerateReport} disabled={isGenerating}>
            {isGenerating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <PlusCircle className="mr-2 h-4 w-4" />
            )}
            {isGenerating ? 'Generating...' : 'Generate New Report'}
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report ID</TableHead>
                <TableHead className="hidden sm:table-cell">
                  Generation Date
                </TableHead>
                <TableHead className="hidden md:table-cell">Score</TableHead>
                <TableHead className="hidden md:table-cell">Grade</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                 <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Loading reports...
                  </TableCell>
                </TableRow>
              ) : creditReports.length > 0 ? (
                creditReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-mono text-sm">
                      {report.id.substring(0, 12)}...
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {new Date(report.generationDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="hidden md:table-cell font-semibold">
                      {report.score}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge
                        variant={
                          report.grade === "A" || report.grade === "B"
                            ? "default"
                            : "destructive"
                        }
                      >
                        {report.grade}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewReport(report)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDownloadPDF(report)}>
                            <Download className="mr-2 h-4 w-4" />
                            Download PDF
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No reports generated yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Report View Dialog */}
      <ReportViewDialog 
        report={selectedReport}
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
      />
    </div>
  );
}
