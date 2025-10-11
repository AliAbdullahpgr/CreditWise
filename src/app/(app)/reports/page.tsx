'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditReport } from '@/lib/types';
import { PlusCircle, Download, Eye, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { ReportViewDialog } from '@/components/report-view-dialog';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';

export default function ReportsPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  
  const creditReportsQuery = useMemoFirebase(() =>
    user ? query(collection(firestore, 'users', user.uid, 'creditReports'), orderBy('generationDate', 'desc')) : null
  , [firestore, user]);
  const { data: creditReports, isLoading: reportsLoading } = useCollection<CreditReport>(creditReportsQuery);

  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedReport, setSelectedReport] = useState<CreditReport | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const handleGenerateReport = async () => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to generate a credit report.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    console.log('\n🚀 [REPORT] Starting credit report generation...');

    try {
      console.log('📥 [STEP 1] Fetching user transactions...');
      const response = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid }),
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
        description:
          error.message || 'Failed to generate credit report. Please try again.',
        variant: 'destructive',
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
    if (!user) return;
    console.log('📥 [DOWNLOAD] Generating PDF for report:', report.id);

    try {
      toast({
        title: 'Generating PDF...',
        description: 'Please wait while we prepare your report.',
      });

      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId: report.id, userId: user.uid }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `credit-report-${report.id.substring(0, 8)}-${
        new Date().toISOString().split('T')[0]
      }.pdf`;
      document.body.appendChild(a);
      a.click();
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

  if (isUserLoading || reportsLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null; 
  }

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
              {reportsLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center text-muted-foreground"
                  >
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                  </TableCell>
                </TableRow>
              ) : creditReports && creditReports.length > 0 ? (
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
                          report.grade === 'A' || report.grade === 'B'
                            ? 'default'
                            : 'destructive'
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
                          <DropdownMenuItem
                            onClick={() => handleDownloadPDF(report)}
                          >
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
