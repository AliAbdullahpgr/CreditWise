"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Info,
  TrendingUp,
  DollarSign,
  Calendar,
  PieChart,
  CreditCard,
} from "lucide-react";

export function AlternativeCreditScoreInfo() {
  return (
    <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Info className="h-5 w-5 text-primary" />
          <CardTitle className="font-headline text-lg">
            What is an Alternative Credit Score?
          </CardTitle>
        </div>
        <CardDescription>
          Designed for the 2+ billion people without traditional credit
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <p className="text-sm text-foreground/80">
            Traditional credit scores (FICO, VantageScore) require credit cards,
            bank loans, and mortgages. But{" "}
            <strong>gig workers, street vendors, and cash-based workers</strong>{" "}
            don't have these products!
          </p>

          <div className="bg-background/50 rounded-lg p-4 space-y-3">
            <p className="text-sm font-semibold">Our Alternative Model Uses:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">Bill Payment (30%)</p>
                  <p className="text-xs text-muted-foreground">
                    Rent, utilities, mobile bills
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <DollarSign className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">
                    Income Consistency (25%)
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Regular earning patterns
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <PieChart className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">
                    Expense Management (20%)
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Spending discipline & savings
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <TrendingUp className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">Financial Growth (15%)</p>
                  <p className="text-xs text-muted-foreground">
                    Income growth trends
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CreditCard className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">
                    Transaction Diversity (10%)
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Multiple income sources
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <Badge
              variant="outline"
              className="bg-green-500/10 text-green-700 border-green-500/20"
            >
              A: 800-1000
            </Badge>
            <Badge
              variant="outline"
              className="bg-blue-500/10 text-blue-700 border-blue-500/20"
            >
              B+: 700-799
            </Badge>
            <Badge
              variant="outline"
              className="bg-blue-500/10 text-blue-700 border-blue-500/20"
            >
              B: 600-699
            </Badge>
            <Badge
              variant="outline"
              className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20"
            >
              C: 500-599
            </Badge>
            <Badge
              variant="outline"
              className="bg-red-500/10 text-red-700 border-red-500/20"
            >
              D: 0-499
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
