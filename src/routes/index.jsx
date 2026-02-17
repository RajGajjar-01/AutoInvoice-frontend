import { createFileRoute } from '@tanstack/react-router';
import { Navbar } from '@/components/landing-new/Navbar';
import { Hero } from '@/components/landing-new/Hero';
import { TrustedBy } from '@/components/landing-new/TrustedBy';
import { ProblemSolution } from '@/components/landing-new/ProblemSolution';
import { Features } from '@/components/landing-new/Features';
import { BuiltFor } from '@/components/landing-new/BuiltFor';
import { DashboardPreview } from '@/components/landing-new/DashboardPreview';
import { Security } from '@/components/landing-new/Security';
import { Pricing } from '@/components/landing-new/Pricing';
import { Testimonials } from '@/components/landing-new/Testimonials';
import { FAQ } from '@/components/landing-new/FAQ';
import { FinalCTA } from '@/components/landing-new/FinalCTA';
import { Footer } from '@/components/landing-new/Footer';

export const Route = createFileRoute('/')({
    component: LandingPage,
})

function LandingPage() {
    return (
        <div className="min-h-screen bg-white selection:bg-[#0a4a5c]/10 selection:text-[#0a4a5c]">
            <Navbar />
            <Hero />
            <TrustedBy />
            <ProblemSolution />
            <Features />
            <BuiltFor />
            <DashboardPreview />
            <Security />
            <Pricing />
            <Testimonials />
            <FAQ />
            <FinalCTA />
            <Footer />
        </div>
    );
}
