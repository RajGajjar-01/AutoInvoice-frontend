import { createFileRoute } from '@tanstack/react-router';
import { Navbar } from '@/components/landing/Navbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { PainSection } from '@/components/landing/PainSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { FAQSection } from '@/components/landing/FAQSection';
import { CTASection } from '@/components/landing/CTASection';
import { Footer } from '@/components/landing/Footer';

export const Route = createFileRoute('/')({
    component: LandingPage,
})

function LandingPage() {
    return (
        <div className="bg-background text-foreground overflow-x-hidden">
            <Navbar />
            <HeroSection />
            <PainSection />
            <HowItWorksSection />
            <FeaturesSection />
            <TestimonialsSection />
            <PricingSection />
            <FAQSection />
            <CTASection />
            <Footer />
        </div>
    );
}
