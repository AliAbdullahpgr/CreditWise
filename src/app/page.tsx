import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2, UploadCloud, BarChart, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Logo from "@/components/logo";

export default function LandingPage() {
  const heroImage = PlaceHolderImages.find(p => p.id === "hero-landing");
  const reportImage = PlaceHolderImages.find(p => p.id === "report-sample");
  const featureUploadImage = PlaceHolderImages.find(p => p.id === "feature-upload");
  const featureAnalyzeImage = PlaceHolderImages.find(p => p.id === "feature-analyze");
  const featureScoreImage = PlaceHolderImages.find(p => p.id === "feature-score");
  const avatar1 = PlaceHolderImages.find(p => p.id === "avatar-1");
  const avatar2 = PlaceHolderImages.find(p => p.id === "avatar-2");
  const avatar3 = PlaceHolderImages.find(p => p.id === "avatar-3");

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <Link href="#" className="flex items-center justify-center">
          <Logo />
        </Link>
        <nav className="ml-auto hidden lg:flex gap-4 sm:gap-6">
          <Link href="#features" className="text-sm font-medium hover:underline underline-offset-4">
            Features
          </Link>
          <Link href="#how-it-works" className="text-sm font-medium hover:underline underline-offset-4">
            How It Works
          </Link>
          <Link href="#testimonials" className="text-sm font-medium hover:underline underline-offset-4">
            Testimonials
          </Link>
        </nav>
        <div className="ml-auto lg:ml-4 flex items-center gap-2">
           <Button variant="ghost" asChild>
            <Link href="/login">Log In</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">
              Sign Up <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_500px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline">
                    Your Financial Passport for the Informal Economy
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    CreditWise builds your credit score from your everyday financial life. Turn your receipts and mobile money statements into opportunities.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg" asChild>
                    <Link href="/signup">
                      Get Your Free Score
                    </Link>
                  </Button>
                </div>
              </div>
              {heroImage && (
                <Image
                  src={heroImage.imageUrl}
                  alt="Hero"
                  width={600}
                  height={400}
                  className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
                  data-ai-hint={heroImage.imageHint}
                />
              )}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32 bg-secondary">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <Badge variant="default" className="bg-primary/20 text-primary-foreground hover:bg-primary/30">How It Works</Badge>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Get Your Score in 3 Simple Steps</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our secure platform makes it easy to build your financial identity from the documents you already have.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 lg:gap-16 mt-12">
              <div className="grid gap-1 text-center">
                <div className="flex justify-center items-center mb-4">
                  <div className="p-4 bg-primary rounded-full">
                    <UploadCloud className="h-8 w-8 text-primary-foreground" />
                  </div>
                </div>
                <h3 className="text-lg font-bold font-headline">1. Upload Documents</h3>
                <p className="text-sm text-muted-foreground">
                  Snap photos of receipts, or upload utility bills and mobile money statements from your phone.
                </p>
              </div>
              <div className="grid gap-1 text-center">
                <div className="flex justify-center items-center mb-4">
                   <div className="p-4 bg-primary rounded-full">
                    <BarChart className="h-8 w-8 text-primary-foreground" />
                  </div>
                </div>
                <h3 className="text-lg font-bold font-headline">2. AI-Powered Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Our smart OCR and AI categorize your transactions, identifying income, expenses, and bill payments.
                </p>
              </div>
              <div className="grid gap-1 text-center">
                 <div className="flex justify-center items-center mb-4">
                   <div className="p-4 bg-primary rounded-full">
                    <FileText className="h-8 w-8 text-primary-foreground" />
                  </div>
                </div>
                <h3 className="text-lg font-bold font-headline">3. Receive Your Score</h3>
                <p className="text-sm text-muted-foreground">
                  Get a comprehensive credit score and a detailed report you can share with lenders.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="space-y-2 text-center mb-12">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Unlock Your Financial Future</h2>
                <p className="max-w-[900px] mx-auto text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Everything you need to build credit and access fair financial services.
                </p>
            </div>
            <div className="mx-auto grid items-center gap-6 lg:grid-cols-2 lg:gap-12">
              {featureUploadImage && 
                <Image
                  src={featureUploadImage.imageUrl}
                  width="550"
                  height="550"
                  alt="Feature"
                  className="mx-auto aspect-square overflow-hidden rounded-xl object-cover object-center sm:w-full"
                  data-ai-hint={featureUploadImage.imageHint}
                />
              }
              <div className="flex flex-col justify-center space-y-4">
                <ul className="grid gap-6">
                  <li>
                    <div className="grid gap-1">
                      <h3 className="text-xl font-bold font-headline">Seamless Document Upload</h3>
                      <p className="text-muted-foreground">
                        Use your phone's camera or file picker. Our app works online and offline, queuing uploads for when you have a connection.
                      </p>
                    </div>
                  </li>
                  <li>
                    <div className="grid gap-1">
                      <h3 className="text-xl font-bold font-headline">Intelligent Transaction Categorization</h3>
                      <p className="text-muted-foreground">
                        AI automatically sorts your income and expenses. Easily correct categories to teach the system.
                      </p>
                    </div>
                  </li>
                  <li>
                    <div className="grid gap-1">
                      <h3 className="text-xl font-bold font-headline">Actionable Insights</h3>
                      <p className="text-muted-foreground">
                        Our dashboard gives you a clear overview of your financial health and personalized tips to improve your score.
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mx-auto grid items-center gap-6 lg:grid-cols-2 lg:gap-12 mt-16 lg:mt-24">
               <div className="flex flex-col justify-center space-y-4 lg:order-last">
                <ul className="grid gap-6">
                  <li>
                    <div className="grid gap-1">
                      <h3 className="text-xl font-bold font-headline">Bank-Ready PDF Reports</h3>
                      <p className="text-muted-foreground">
                        Generate professional, detailed credit reports to share with lenders and financial institutions.
                      </p>
                    </div>
                  </li>
                  <li>
                    <div className="grid gap-1">
                      <h3 className="text-xl font-bold font-headline">Secure Sharing</h3>
                      <p className="text-muted-foreground">
                        Share your report via a unique, time-limited link with optional password protection. You control who sees your data.
                      </p>
                    </div>
                  </li>
                  <li>
                    <div className="grid gap-1">
                      <h3 className="text-xl font-bold font-headline">Holistic Credit Scoring</h3>
                      <p className="text-muted-foreground">
                        Our algorithm looks beyond traditional metrics, considering income consistency, expense management, and financial discipline.
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
              {reportImage && 
                <Image
                  src={reportImage.imageUrl}
                  width="550"
                  height="550"
                  alt="Feature"
                  className="mx-auto aspect-[4/5] overflow-hidden rounded-xl object-cover object-center sm:w-full"
                  data-ai-hint={reportImage.imageHint}
                />
              }
            </div>
          </div>
        </section>


        <section id="testimonials" className="w-full py-12 md:py-24 lg:py-32 bg-secondary">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight font-headline">
                Trusted by Entrepreneurs and Freelancers
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                See how CreditWise is helping people in the informal sector unlock financial opportunities.
              </p>
            </div>
            <div className="mx-auto w-full max-w-5xl grid sm:grid-cols-1 md:grid-cols-3 gap-8 pt-12">
              <Card>
                <CardHeader className="items-center pb-4">
                  {avatar1 && <Avatar>
                    <AvatarImage src={avatar1.imageUrl} data-ai-hint={avatar1.imageHint}/>
                    <AvatarFallback>FS</AvatarFallback>
                  </Avatar>}
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    "For the first time, I could show a bank my real income. CreditWise helped me get a loan to expand my shop."
                  </p>
                </CardContent>
                <CardFooter className="flex-col items-center">
                  <p className="font-semibold">Fatima S.</p>
                  <p className="text-xs text-muted-foreground">Small Shop Owner</p>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader className="items-center pb-4">
                  {avatar2 && <Avatar>
                    <AvatarImage src={avatar2.imageUrl} data-ai-hint={avatar2.imageHint}/>
                    <AvatarFallback>AK</AvatarFallback>
                  </Avatar>}
                </CardHeader>
                <CardContent>
                  <p className="text-sm">"As a freelancer, my income is irregular. CreditWise understood this and gave me a fair score that I used to get a new motorcycle."</p>
                </CardContent>
                 <CardFooter className="flex-col items-center">
                  <p className="font-semibold">Ahmed K.</p>
                  <p className="text-xs text-muted-foreground">Delivery Rider & Freelancer</p>
                </CardFooter>
              </Card>
               <Card>
                <CardHeader className="items-center pb-4">
                  {avatar3 && <Avatar>
                    <AvatarImage src={avatar3.imageUrl} data-ai-hint={avatar3.imageHint}/>
                    <AvatarFallback>ZH</AvatarFallback>
                  </Avatar>}
                </CardHeader>
                <CardContent>
                  <p className="text-sm">"The dashboard helped me understand where my money was going. I've improved my score by 150 points in just 3 months!"</p>
                </CardContent>
                 <CardFooter className="flex-col items-center">
                  <p className="font-semibold">Zainab H.</p>
                  <p className="text-xs text-muted-foreground">Home-based caterer</p>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container bg-primary rounded-lg text-primary-foreground p-8 md:p-12 text-center">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight font-headline">Ready to Build Your Credit?</h2>
            <p className="mx-auto max-w-[600px] mt-4">
              Join thousands of others and take the first step towards a better financial future. It's free and takes only 5 minutes.
            </p>
            <div className="mt-8">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/signup">
                  Sign Up for Free <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; 2024 CreditWise. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4">
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
