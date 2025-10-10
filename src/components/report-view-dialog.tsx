'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle2, Info } from 'lucide-react';

interface ReportData {
  id: string;
  generationDate: string;
  score: number;
  grade: 'A' | 'B' | 'C' | 'D';
  factors?: {
    billPaymentHistory: number;
    incomeConsistency: number;
    expenseManagement: number;
    financialGrowth: number;
    transactionDiversity: number;
  };
  transactionCount?: number;
  periodStart?: string;
  periodEnd?: string;
}

interface ReportViewDialogProps {
  report: ReportData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReportViewDialog({ report, open, onOpenChange }: ReportViewDialogProps) {
  if (!report) return null;

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'text-green-600 bg-green-50 border-green-200';
      case 'B': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'C': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'D': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getScoreDescription = (score: number) => {
    if (score >= 800) return 'Excellent - Very Low Risk';
    if (score >= 700) return 'Good - Low Risk';
    if (score >= 600) return 'Fair - Moderate Risk';
    if (score >= 500) return 'Needs Improvement - Higher Risk';
    return 'Poor - High Risk';
  };

  const getFactorInsight = (name: string, value: number) => {
    if (value >= 80) return { icon: CheckCircle2, color: 'text-green-600', status: 'Excellent' };
    if (value >= 60) return { icon: TrendingUp, color: 'text-blue-600', status: 'Good' };
    if (value >= 40) return { icon: Info, color: 'text-yellow-600', status: 'Fair' };
    return { icon: AlertCircle, color: 'text-red-600', status: 'Needs Improvement' };
  };

  const factorDetails = [
    {
      name: 'Bill Payment History',
      key: 'billPaymentHistory',
      weight: 30,
      description: 'Consistency in paying rent, utilities, and bills on time'
    },
    {
      name: 'Income Consistency',
      key: 'incomeConsistency',
      weight: 25,
      description: 'Regularity and stability of income streams'
    },
    {
      name: 'Expense Management',
      key: 'expenseManagement',
      weight: 20,
      description: 'Spending discipline and savings behavior'
    },
    {
      name: 'Financial Growth',
      key: 'financialGrowth',
      weight: 15,
      description: 'Income growth trend over time'
    },
    {
      name: 'Transaction Diversity',
      key: 'transactionDiversity',
      weight: 10,
      description: 'Variety of income sources and transaction types'
    },
  ];

  const getRecommendations = () => {
    if (!report.factors) return [];
    
    const recommendations = [];
    const factors = report.factors;

    if (factors.billPaymentHistory < 70) {
      recommendations.push({
        priority: 'High',
        area: 'Bill Payments',
        action: 'Set up automatic payments for recurring bills to ensure on-time payments consistently.',
        impact: 'Could improve score by 50-100 points'
      });
    }

    if (factors.incomeConsistency < 70) {
      recommendations.push({
        priority: 'High',
        area: 'Income Stability',
        action: 'Focus on maintaining regular income streams. Consider diversifying income sources.',
        impact: 'Could improve score by 40-80 points'
      });
    }

    if (factors.expenseManagement < 70) {
      recommendations.push({
        priority: 'Medium',
        area: 'Expense Control',
        action: 'Reduce discretionary spending and aim to save at least 20% of income monthly.',
        impact: 'Could improve score by 30-60 points'
      });
    }

    if (factors.financialGrowth < 50) {
      recommendations.push({
        priority: 'Medium',
        area: 'Income Growth',
        action: 'Seek opportunities to increase income through skill development or business expansion.',
        impact: 'Could improve score by 20-40 points'
      });
    }

    if (factors.transactionDiversity < 60) {
      recommendations.push({
        priority: 'Low',
        area: 'Income Diversification',
        action: 'Consider adding additional income streams to reduce financial risk.',
        impact: 'Could improve score by 10-30 points'
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        priority: 'Info',
        area: 'Maintain Excellence',
        action: 'Continue current financial practices. Your credit profile is strong.',
        impact: 'Maintain current high score'
      });
    }

    return recommendations;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Alternative Credit Score Report
          </DialogTitle>
          <DialogDescription>
            Generated on {new Date(report.generationDate).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Credit Score Summary */}
          <Card className={`border-2 ${getGradeColor(report.grade)}`}>
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-sm font-medium">Your Credit Score</CardTitle>
              <div className="text-6xl font-bold mt-2">{report.score}</div>
              <div className="text-sm text-muted-foreground">out of 1000</div>
              <Badge className="mt-2 text-lg px-4 py-1" variant={
                report.grade === 'A' || report.grade === 'B' ? 'default' : 'destructive'
              }>
                Grade {report.grade}
              </Badge>
              <CardDescription className="mt-2">
                {getScoreDescription(report.score)}
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Score Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Credit Factors Analysis</CardTitle>
              <CardDescription>
                Detailed breakdown of factors affecting your credit score
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Factor</TableHead>
                    <TableHead>Weight</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Progress</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {factorDetails.map((factor) => {
                    const value = report.factors?.[factor.key as keyof typeof report.factors] || 0;
                    const insight = getFactorInsight(factor.name, value);
                    const Icon = insight.icon;

                    return (
                      <TableRow key={factor.key}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{factor.name}</div>
                            <div className="text-sm text-muted-foreground">{factor.description}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{factor.weight}%</Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold">{value}/100</span>
                        </TableCell>
                        <TableCell>
                          <div className={`flex items-center gap-1 ${insight.color}`}>
                            <Icon className="h-4 w-4" />
                            <span className="text-sm font-medium">{insight.status}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Progress value={value} className="w-24 ml-auto" />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Transaction Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Transaction Analysis</CardTitle>
              <CardDescription>
                Data analyzed for this report
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{report.transactionCount || 0}</div>
                  <div className="text-sm text-muted-foreground">Transactions</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">
                    {report.periodStart ? new Date(report.periodStart).toLocaleDateString() : 'N/A'}
                  </div>
                  <div className="text-sm text-muted-foreground">Period Start</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">
                    {report.periodEnd ? new Date(report.periodEnd).toLocaleDateString() : 'N/A'}
                  </div>
                  <div className="text-sm text-muted-foreground">Period End</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Personalized Recommendations</CardTitle>
              <CardDescription>
                Actionable steps to improve your credit score
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getRecommendations().map((rec, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={
                        rec.priority === 'High' ? 'destructive' : 
                        rec.priority === 'Medium' ? 'default' : 
                        'outline'
                      }>
                        {rec.priority} Priority
                      </Badge>
                      <span className="font-semibold">{rec.area}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{rec.action}</p>
                    <p className="text-xs text-blue-600 font-medium">{rec.impact}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-sm">Important Notice</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-2">
              <p>
                <strong>This is NOT a traditional FICO or credit bureau score.</strong> This Alternative Credit Score 
                is designed specifically for individuals in the informal economy who lack traditional credit products.
              </p>
              <p>
                This score evaluates financial behavior through alternative data sources including bill payments, 
                income patterns, and transaction history rather than traditional credit products.
              </p>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
