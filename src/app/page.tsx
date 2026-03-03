import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { ROICalculator } from "@/components/landing/roi-calculator";
import { Pricing } from "@/components/landing/pricing";
import { AboutUs } from "@/components/landing/about-us";
import { FinalCTA } from "@/components/landing/final-cta";
import { Footer } from "@/components/landing/footer";

export default async function Home() {
  let userId: string | null = null;

  try {
    const authData = await auth();
    userId = authData.userId;
  } catch (e) {
    console.error("Clerk auth error on landing page:", e);
  }

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <ROICalculator />
        <Pricing />
        <AboutUs />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
