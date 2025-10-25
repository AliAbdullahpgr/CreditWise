import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  UploadCloud,
  BarChart,
  FileText,
  Star,
  Shield,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Logo from "@/components/logo";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center bg-background/95 backdrop-blur-md sticky top-0 z-50 border-b border-border/40">
        <Link href="#" className="flex items-center justify-center">
          <Logo />
        </Link>
        <nav className="ml-auto hidden lg:flex gap-6">
          <Link
            href="#features"
            className="text-sm font-medium hover:text-primary transition-colors duration-200"
          >
            Features
          </Link>
          <Link
            href="#how-it-works"
            className="text-sm font-medium hover:text-primary transition-colors duration-200"
          >
            How It Works
          </Link>
          <Link
            href="#testimonials"
            className="text-sm font-medium hover:text-primary transition-colors duration-200"
          >
            Testimonials
          </Link>
        </nav>
        <div className="ml-auto lg:ml-6 flex items-center gap-3">
          <Button
            className="hover:bg-primary/10 hover:text-primary hidden sm:flex transition-all duration-200"
            variant="ghost"
            size="sm"
            asChild
          >
            <Link href="/login">Log In</Link>
          </Button>
          <Button
            size="sm"
            className="shadow-lg hover:shadow-xl transition-all duration-200"
            asChild
          >
            <Link href="/signup">
              <span className="hidden sm:inline">Get Started</span>
              <span className="sm:hidden">Join</span>
              <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
            </Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        <section className="w-full py-8 md:py-16 lg:py-24 xl:py-16">
          <div className="container px-4 md:px-6">
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="flex flex-col justify-center space-y-6 order-2 lg:order-1">
                <div className="space-y-4">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl font-headline">
                    Your Financial Passport for the Informal Economy
                  </h1>
                  <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-[600px]">
                    HisaabScore builds your credit score from your everyday
                    financial life. Turn your receipts and mobile money
                    statements into opportunities.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button size="lg" className="w-full sm:w-auto" asChild>
                    <Link href="/signup">Get Your Free Score</Link>
                  </Button>
                </div>
              </div>
              <div className="order-1 lg:order-2 flex justify-center">
                <div className="w-64 sm:w-80 md:w-96 lg:w-full max-w-xl">
                  <Image
                    src="/heroImage.svg"
                    alt="HisaabScore Hero Illustration"
                    width={600}
                    height={400}
                    className="w-full h-auto rounded-xl"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="w-full py-12 md:py-24 lg:py-32 bg-secondary"
        >
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <Badge
                  variant="default"
                  className="bg-[#1055CB] text-primary-foreground hover:bg-primary/30"
                >
                  How It Works
                </Badge>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
                  Get Your Score in 3 Simple Steps
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our secure platform makes it easy to build your financial
                  identity from the documents you already have.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-2 lg:grid-cols-3 mt-12">
              <div className="flex flex-col items-center text-center space-y-4 p-6">
                <div className="p-4 bg-primary rounded-full">
                  <UploadCloud className="h-6 w-6 sm:h-8 sm:w-8 text-primary-foreground" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold font-headline">
                  1. Upload Documents
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Snap photos of receipts, or upload utility bills and mobile
                  money statements from your phone.
                </p>
              </div>
              <div className="flex flex-col items-center text-center space-y-4 p-6">
                <div className="p-4 bg-primary rounded-full">
                  <BarChart className="h-6 w-6 sm:h-8 sm:w-8 text-primary-foreground" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold font-headline">
                  2. AI-Powered Analysis
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Our smart OCR and AI categorize your transactions, identifying
                  income, expenses, and bill payments.
                </p>
              </div>
              <div className="flex flex-col items-center text-center space-y-4 p-6 sm:col-span-2 lg:col-span-1">
                <div className="p-4 bg-primary rounded-full">
                  <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-primary-foreground" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold font-headline">
                  3. Receive Your Score
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Get a comprehensive credit score and a detailed report you can
                  share with lenders.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="space-y-2 text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
                Unlock Your Financial Future
              </h2>
              <p className="max-w-[900px] mx-auto text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Everything you need to build credit and access fair financial
                services.
              </p>
            </div>
            <div className="mx-auto grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
              <div className="flex flex-col justify-center space-y-6 order-1 lg:order-2">
                <ul className="grid gap-6">
                  <li>
                    <div className="space-y-2">
                      <h3 className="text-lg sm:text-xl font-bold font-headline">
                        Seamless Document Upload
                      </h3>
                      <p className="text-sm sm:text-base text-muted-foreground">
                        Use your phone's camera or file picker. Our app works
                        online and offline, queuing uploads for when you have a
                        connection.
                      </p>
                    </div>
                  </li>
                  <li>
                    <div className="space-y-2">
                      <h3 className="text-lg sm:text-xl font-bold font-headline">
                        Intelligent Transaction Categorization
                      </h3>
                      <p className="text-sm sm:text-base text-muted-foreground">
                        AI automatically sorts your income and expenses. Easily
                        correct categories to teach the system.
                      </p>
                    </div>
                  </li>
                  <li>
                    <div className="space-y-2">
                      <h3 className="text-lg sm:text-xl font-bold font-headline">
                        Actionable Insights
                      </h3>
                      <p className="text-sm sm:text-base text-muted-foreground">
                        Our dashboard gives you a clear overview of your
                        financial health and personalized tips to improve your
                        score.
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="order-2 lg:order-1 flex justify-center">
                <div className="w-56 sm:w-72 md:w-80 lg:w-96 xl:w-full max-w-lg">
                  <Image
                    src="/heroImage2.svg"
                    width={550}
                    height={550}
                    alt="Document Upload Feature"
                    className="w-full h-auto rounded-xl"
                  />
                </div>
              </div>
            </div>

            <div className="mx-auto grid items-center gap-8 lg:grid-cols-2 lg:gap-12 mt-16 lg:mt-24">
              <div className="flex flex-col justify-center space-y-6 order-1 lg:order-1">
                <ul className="grid gap-6">
                  <li>
                    <div className="space-y-2">
                      <h3 className="text-lg sm:text-xl font-bold font-headline">
                        Bank-Ready PDF Reports
                      </h3>
                      <p className="text-sm sm:text-base text-muted-foreground">
                        Generate professional, detailed credit reports to share
                        with lenders and financial institutions.
                      </p>
                    </div>
                  </li>
                  <li>
                    <div className="space-y-2">
                      <h3 className="text-lg sm:text-xl font-bold font-headline">
                        Secure Sharing
                      </h3>
                      <p className="text-sm sm:text-base text-muted-foreground">
                        Share your report via a unique, time-limited link with
                        optional password protection. You control who sees your
                        data.
                      </p>
                    </div>
                  </li>
                  <li>
                    <div className="space-y-2">
                      <h3 className="text-lg sm:text-xl font-bold font-headline">
                        Holistic Credit Scoring
                      </h3>
                      <p className="text-sm sm:text-base text-muted-foreground">
                        Our algorithm looks beyond traditional metrics,
                        considering income consistency, expense management, and
                        financial discipline.
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="order-2 lg:order-2 flex justify-center">
                <div className="w-56 sm:w-72 md:w-80 lg:w-96 xl:w-full max-w-lg">
                  <Image
                    src="/heroImage3.svg"
                    width={450}
                    height={450}
                    alt="Credit Report Feature"
                    className="w-full h-auto rounded-xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="testimonials"
          className="w-full py-12 md:py-24 lg:py-32 bg-secondary"
        >
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight font-headline">
                Trusted by Entrepreneurs and Freelancers
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                See how HisaabScore is helping people in the informal sector
                unlock financial opportunities.
              </p>
            </div>
            <div className="mx-auto w-full max-w-6xl grid gap-6 sm:grid-cols-2 lg:grid-cols-3 pt-12">
              <Card className="h-full">
                <CardHeader className="items-center pb-4">
                  <Avatar className="w-12 h-12 sm:w-16 sm:h-16">
                    <AvatarFallback className="text-lg font-semibold">
                      FS
                    </AvatarFallback>
                  </Avatar>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm sm:text-base text-center">
                    "For the first time, I could show a bank my real income.
                    HisaabScore helped me get a loan to expand my shop."
                  </p>
                </CardContent>
                <CardFooter className="flex-col items-center space-y-1">
                  <p className="font-semibold text-sm sm:text-base">
                    Fatima S.
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Small Shop Owner
                  </p>
                </CardFooter>
              </Card>
              <Card className="h-full">
                <CardHeader className="items-center pb-4">
                  <Avatar className="w-12 h-12 sm:w-16 sm:h-16">
                    <AvatarFallback className="text-lg font-semibold">
                      AK
                    </AvatarFallback>
                  </Avatar>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm sm:text-base text-center">
                    "As a freelancer, my income is irregular. HisaabScore
                    understood this and gave me a fair score that I used to get
                    a new motorcycle."
                  </p>
                </CardContent>
                <CardFooter className="flex-col items-center space-y-1">
                  <p className="font-semibold text-sm sm:text-base">Ahmed K.</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Delivery Rider & Freelancer
                  </p>
                </CardFooter>
              </Card>
              <Card className="h-full sm:col-span-2 lg:col-span-1">
                <CardHeader className="items-center pb-4">
                  <Avatar className="w-12 h-12 sm:w-16 sm:h-16">
                    <AvatarFallback className="text-lg font-semibold">
                      ZH
                    </AvatarFallback>
                  </Avatar>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm sm:text-base text-center">
                    "The dashboard helped me understand where my money was
                    going. I've improved my score by 150 points in just 3
                    months!"
                  </p>
                </CardContent>
                <CardFooter className="flex-col items-center space-y-1">
                  <p className="font-semibold text-sm sm:text-base">
                    Zainab H.
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Home-based caterer
                  </p>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="bg-primary rounded-lg text-primary-foreground p-6 sm:p-8 md:p-12 text-center">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tighter font-headline">
                Ready to Build Your Credit?
              </h2>
              <p className="mx-auto max-w-[600px] mt-4 text-sm sm:text-base md:text-lg">
                Join thousands of others and take the first step towards a
                better financial future. It's free and takes only 5 minutes.
              </p>
              <div className="mt-6 sm:mt-8">
                <Button
                  size="lg"
                  variant="secondary"
                  className="w-full sm:w-auto"
                  asChild
                >
                  <Link href="/signup">
                    Sign Up for Free <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="flex flex-col gap-4 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
          &copy; 2025 HisaabScore. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link
            href="#"
            className="text-xs sm:text-sm hover:underline underline-offset-4"
          >
            Terms of Service
          </Link>
          <Link
            href="#"
            className="text-xs sm:text-sm hover:underline underline-offset-4"
          >
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
