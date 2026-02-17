import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";

export function BuiltFor() {
    const [activeStage, setActiveStage] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    const stages = [
        {
            title: "Small Shop Owners",
            subtitle: "Start Simple, Scale Smart",
            description: "From kirana stores to medical shops—simple tools to track inventory, bills, and payments without complexity.",
            features: [
                "Easy billing & invoicing",
                "Basic inventory tracking",
                "Payment reminders",
                "GST-ready reports"
            ],
            image: "https://images.unsplash.com/photo-1761662826177-a50286fe7eef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFsbCUyMGJ1c2luZXNzJTIwb3duZXIlMjBlbnRyZXByZW5ldXIlMjBpbmRpYXxlbnwxfHx8fDE3NzEyMzkxNTJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
        },
        {
            title: "Retail Chains",
            subtitle: "Multi-Location Management",
            description: "Manage multiple locations, track sales across branches, and consolidate reporting in one central dashboard.",
            features: [
                "Multi-branch inventory sync",
                "Centralized reporting",
                "Role-based access control",
                "Real-time sales tracking"
            ],
            image: "https://images.unsplash.com/photo-1640181637089-cce4a3040ed2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXRhaWwlMjBzaG93cm9vbSUyMGJ1c2luZXNzJTIwc3RhZmYlMjBpbmRpYXxlbnwxfHx8fDE3NzEyMzkxNTE8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
        },
        {
            title: "Distributors",
            subtitle: "Bulk Operations at Scale",
            description: "Handle bulk orders, track supplier invoices, manage customer credit, and monitor inventory movement.",
            features: [
                "Bulk order processing",
                "Supplier invoice tracking",
                "Credit management",
                "Inventory movement analytics"
            ],
            image: "https://images.unsplash.com/photo-1552721358-aa7896d8f107?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaXN0cmlidXRpb24lMjB3YXJlaG91c2UlMjBidXNpbmVzcyUyMGluZGlhfGVufDF8fHx8MTc3MTIzOTE1M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
        },
        {
            title: "Accountants & CAs",
            subtitle: "Professional Client Management",
            description: "Manage multiple client books, generate GST reports, export data instantly, and maintain audit trails effortlessly.",
            features: [
                "Multi-client dashboard",
                "Automated GST reports",
                "One-click data export",
                "Complete audit trails"
            ],
            image: "https://images.unsplash.com/photo-1667430806405-70ef5bc4970f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhY2NvdW50YW50JTIwZGVzayUyMGNvbXB1dGVyJTIwd29ya3xlbnwxfHx8fDE3NzEyMzkxNTh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
        }
    ];

    // Auto-play functionality
    useEffect(() => {
        if (!isAutoPlaying) return;

        const interval = setInterval(() => {
            setActiveStage((prev) => (prev + 1) % stages.length);
        }, 5000); // Change slide every 5 seconds

        return () => clearInterval(interval);
    }, [isAutoPlaying, stages.length]);

    const nextSlide = () => {
        setIsAutoPlaying(false);
        setActiveStage((prev) => (prev + 1) % stages.length);
    };

    const prevSlide = () => {
        setIsAutoPlaying(false);
        setActiveStage((prev) => (prev - 1 + stages.length) % stages.length);
    };

    const goToSlide = (index: number) => {
        setIsAutoPlaying(false);
        setActiveStage(index);
    };

    return (
        <section id="for-accountants" className="relative bg-white py-24 overflow-hidden">
            {/* Section Header */}
            <div className="max-w-[1200px] mx-auto px-6 mb-16">
                <div className="text-center">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Built For Every Stage of Growth
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Whether you run one shop or manage 100 clients, we scale with you
                    </p>
                </div>
            </div>

            {/* Full-Width Carousel */}
            <div className="relative w-full">
                {/* Carousel Container */}
                <div className="relative h-[600px] md:h-[700px]">
                    {/* Slides */}
                    {stages.map((stage, index) => (
                        <div
                            key={index}
                            className={`
                                absolute inset-0 transition-all duration-700 ease-in-out
                                ${activeStage === index
                                    ? 'opacity-100 translate-x-0 z-10'
                                    : activeStage > index
                                        ? 'opacity-0 -translate-x-full z-0'
                                        : 'opacity-0 translate-x-full z-0'
                                }
                            `}
                        >
                            {/* Background Image */}
                            <div className="absolute inset-0">
                                <img
                                    src={stage.image}
                                    alt={stage.title}
                                    className="w-full h-full object-cover"
                                />
                                {/* Gradient Overlays */}
                                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                            </div>

                            {/* Content Overlay */}
                            <div className="relative h-full max-w-[1200px] mx-auto px-6 flex items-center">
                                <div className="max-w-2xl text-white">
                                    {/* Stage Number */}
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/40 mb-6">
                                        <span className="text-2xl font-bold">{index + 1}</span>
                                    </div>

                                    {/* Subtitle */}
                                    <p className="text-lg md:text-xl text-white/90 font-medium mb-3 tracking-wide uppercase">
                                        {stage.subtitle}
                                    </p>

                                    {/* Title */}
                                    <h3 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                                        {stage.title}
                                    </h3>

                                    {/* Description */}
                                    <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed max-w-xl">
                                        {stage.description}
                                    </p>

                                    {/* Features List */}
                                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                                        {stage.features.map((feature, fIndex) => (
                                            <li
                                                key={fIndex}
                                                className="flex items-center gap-3 text-white/90"
                                                style={{
                                                    animation: `fadeInUp 0.6s ease-out ${fIndex * 0.1}s both`
                                                }}
                                            >
                                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                                    <Check className="w-4 h-4 text-white" />
                                                </div>
                                                <span className="text-base md:text-lg">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    {/* CTA Button */}
                                    <button className="group px-8 py-4 bg-white text-[#0a4a5c] rounded-full font-semibold text-lg hover:bg-gray-100 transition-all duration-300 hover:scale-105 shadow-xl">
                                        <span className="flex items-center gap-2">
                                            Learn More
                                            <svg
                                                className="w-5 h-5 transform group-hover:translate-x-1 transition-transform"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Navigation Arrows */}
                <button
                    onClick={prevSlide}
                    className="absolute left-6 top-1/2 -translate-y-1/2 z-20 w-14 h-14 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300 hover:scale-110 group"
                    aria-label="Previous slide"
                >
                    <ChevronLeft className="w-7 h-7 group-hover:-translate-x-0.5 transition-transform" />
                </button>
                <button
                    onClick={nextSlide}
                    className="absolute right-6 top-1/2 -translate-y-1/2 z-20 w-14 h-14 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300 hover:scale-110 group"
                    aria-label="Next slide"
                >
                    <ChevronRight className="w-7 h-7 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* Progress Dots */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
                    {stages.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className="group relative"
                            aria-label={`Go to slide ${index + 1}`}
                        >
                            {/* Dot */}
                            <div
                                className={`
                                    h-3 rounded-full transition-all duration-300
                                    ${activeStage === index
                                        ? 'w-12 bg-white'
                                        : 'w-3 bg-white/50 group-hover:bg-white/70'
                                    }
                                `}
                            />
                            {/* Progress Bar for Active Slide */}
                            {activeStage === index && isAutoPlaying && (
                                <div
                                    className="absolute top-0 left-0 h-3 bg-white/40 rounded-full"
                                    style={{
                                        animation: 'progressBar 5s linear forwards'
                                    }}
                                />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* CSS Animations */}
            <style>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes progressBar {
                    from {
                        width: 0%;
                    }
                    to {
                        width: 100%;
                    }
                }
            `}</style>
        </section>
    );
}
