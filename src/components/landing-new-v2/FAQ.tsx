import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

export function FAQ() {
    const faqs = [
        {
            question: "How does the email invoice capture work?",
            answer: "Once you connect your email account (Gmail, Outlook, etc.), our AI scans incoming emails for invoices. It automatically extracts vendor details, line items, taxes, and totals, then organizes them into your dashboard without you lifting a finger.",
        },
        {
            question: "Is my data secure?",
            answer: "Absolutely. We use bank-grade encryption (AES-256) for all data at rest and TLS for data in transit. Your sensitive financial information is never shared with third parties, and we follow strict data privacy regulations.",
        },
        {
            question: "Can I export my data to other accounting software?",
            answer: "Yes! You can export all your data to Excel or CSV formats with one click. We also provide GST-ready reports that can be easily imported into popular accounting software like Tally, Zoho Books, or QuickBooks.",
        },
        {
            question: "What is the difference between the Advanced and Premium plans?",
            answer: "The Advanced plan is designed for individual businesses that need automation and custom fields. The Premium plan is built specifically for accountants and large firms who manage multiple clients and need white-label reporting and dedicated support.",
        },
        {
            question: "Is there a limit to how many invoices I can process?",
            answer: "The Free plan includes up to 50 invoices per month. Our Advanced and Premium plans offer unlimited invoice processing so you can scale your business without worrying about limits.",
        },
    ];

    return (
        <section id="faq" className="py-24 bg-white">
            <div className="container mx-auto px-6 max-w-4xl">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-gray-900 mb-4">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-xl text-muted-foreground">
                        Everything you need to know about AutomateHub
                    </p>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, index) => (
                        <AccordionItem key={index} value={`item-${index}`}>
                            <AccordionTrigger className="text-left text-lg font-semibold py-6">
                                {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-600 text-base leading-relaxed pb-6">
                                {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </section>
    );
}
