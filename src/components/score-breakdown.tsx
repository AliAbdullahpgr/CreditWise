"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { userFinancials } from "@/lib/data";

interface ScoreFactorProps {
  label: string;
  value: number;
  weight: number;
  description: string;
}

function ScoreFactor({ label, value, weight, description }: ScoreFactorProps) {
  const contribution = Math.round(((value * weight) / 100) * 10); // Scale to 0-1000

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">{weight}% weight</span>
      </div>
      <Progress value={value} className="h-2" />
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{description}</span>
        <span>
          {value}/100 → {contribution} points
        </span>
      </div>
    </div>
  );
}

export function ScoreBreakdown() {
  const factors = [
    {
      label: "Bill Payment History",
      value: userFinancials.billPaymentHistory,
      weight: 30,
      description: "Rent, utilities, mobile bills",
    },
    {
      label: "Income Consistency",
      value: userFinancials.incomeConsistency,
      weight: 25,
      description: "Regular earning patterns",
    },
    {
      label: "Expense Management",
      value: userFinancials.expenseManagement,
      weight: 20,
      description: "Spending discipline & savings",
    },
    {
      label: "Financial Growth",
      value: userFinancials.financialGrowth,
      weight: 15,
      description: "Income growth trends",
    },
    {
      label: "Transaction Diversity",
      value: userFinancials.transactionDiversity,
      weight: 10,
      description: "Multiple income sources",
    },
  ];

  const totalScore = factors.reduce((sum, factor) => {
    return sum + ((factor.value * factor.weight) / 100) * 10;
  }, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Score Breakdown</CardTitle>
        <CardDescription>
          How your Alternative Credit Score of {Math.round(totalScore)} is
          calculated
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {factors.map((factor, index) => (
          <ScoreFactor
            key={index}
            label={factor.label}
            value={factor.value}
            weight={factor.weight}
            description={factor.description}
          />
        ))}

        <div className="pt-4 border-t">
          <div className="flex items-center justify-between font-semibold">
            <span>Total Alternative Credit Score:</span>
            <span className="text-primary text-xl">
              {Math.round(totalScore)}/1000
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Calculated as: Sum of (Factor Score × Weight) scaled to 0-1000
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
