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
import { FinalCTA } from '@/components/landing-new/FinalCTA';
import { Footer } from '@/components/landing-new/Footer';

export const Route = createFileRoute('/')({
    component: LandingPage,
})

function LandingPage() {
    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            <Hero />
            <TrustedBy />
            <ProblemSolution />
            <Features />
            <BuiltFor />
            <DashboardPreview />
            <Security />
            <Pricing />
            <FinalCTA />
            <Footer />
        </div>
    );
}
