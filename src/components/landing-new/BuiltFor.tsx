import { ArrowRight } from "lucide-react";

export function BuiltFor() {
    const segments = [
        {
            title: "Small Shop Owners",
            description: "From kirana stores to medical shops—simple tools to track inventory, bills, and payments without complexity.",
            image: "https://images.unsplash.com/photo-1761662826177-a50286fe7eef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFsbCUyMGJ1c2luZXNzJTIwb3duZXIlMjBlbnRyZXByZW5ldXIlMjBpbmRpYXxlbnwxfHx8fDE3NzEyMzkxNTJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
        },
        {
            title: "Retail Chains",
            description: "Manage multiple locations, track sales across branches, and consolidate reporting in one central dashboard.",
            image: "https://images.unsplash.com/photo-1640181637089-cce4a3040ed2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXRhaWwlMjBzaG93cm9vbSUyMGJ1c2luZXNzJTIwc3RhZmYlMjBpbmRpYXxlbnwxfHx8fDE3NzEyMzkxNTE8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
        },
        {
            title: "Distributors",
            description: "Handle bulk orders, track supplier invoices, manage customer credit, and monitor inventory movement.",
            image: "https://images.unsplash.com/photo-1552721358-aa7896d8f107?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaXN0cmlidXRpb24lMjB3YXJlaG91c2UlMjBidXNpbmVzcyUyMGluZGlhfGVufDF8fHx8MTc3MTIzOTE1M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
        },
        {
            title: "Accountants & CAs",
            description: "Manage multiple client books, generate GST reports, export data instantly, and maintain audit trails effortlessly.",
            image: "https://images.unsplash.com/photo-1667430806405-70ef5bc4970f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhY2NvdW50YW50JTIwZGVzayUyMGNvbXB1dGVyJTIwd29ya3xlbnwxfHx8fDE3NzEyMzkxNTh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
        }
    ];

    return (
        <section id="for-accountants" className="bg-white py-20">
            <div className="max-w-[1200px] mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-semibold text-gray-900 mb-4">
                        Built For Every Stage of Growth
                    </h2>
                    <p className="text-xl text-gray-600">
                        Whether you run one shop or manage 100 clients
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {segments.map((segment, index) => (
                        <div
                            key={index}
                            className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow group"
                        >
                            <div className="h-48 overflow-hidden">
                                <img
                                    src={segment.image}
                                    alt={segment.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                            </div>
                            <div className="p-6 space-y-3">
                                <h3 className="text-xl font-semibold text-gray-900">
                                    {segment.title}
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {segment.description}
                                </p>
                                <a
                                    href="#"
                                    className="inline-flex items-center gap-1 text-[#0a4a5c] hover:gap-2 transition-all group"
                                >
                                    <span className="text-sm font-medium">Learn more</span>
                                    <ArrowRight className="w-4 h-4" />
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
