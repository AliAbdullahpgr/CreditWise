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
import { PlusCircle, Share2, Download, Eye } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { onSnapshot, query, where, orderBy, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

// MOCK USER ID
const MOCK_USER_ID = "user-test-001";

export default function ReportsPage() {
  const [creditReports, setCreditReports] = useState<CreditReport[]>([]);
  const [loading, setLoading] = useState(true);
  const userId = MOCK_USER_ID;

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "creditReports"),
      where('userId', '==', userId),
      orderBy('generationDate', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reportData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as CreditReport[];
      setCreditReports(reportData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);


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
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Generate New Report
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
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Share2 className="mr-2 h-4 w-4" />
                            Share
                          </DropdownMenuItem>
                          <DropdownMenuItem>
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
    </div>
  );
}
