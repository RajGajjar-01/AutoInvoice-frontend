import { Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Testimonials() {
  const testimonials = [
    {
      quote: "Before AutomateHub, I was spending 3 hours every evening updating Excel. Now everything happens automatically. I actually have time to grow my business.",
      name: "Ramesh Kumar",
      business: "Kumar Medical Store, Pune",
      image: "https://images.unsplash.com/photo-1695398170358-99749f64c887?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBidXNpbmVzcyUyMG93bmVyJTIwcHJvZmVzc2lvbmFsJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzcxMjM5MTUzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    },
    {
      quote: "Managing 47 clients was a nightmare. Now I can see every client's books in one place, generate GST reports instantly, and my clients are happier than ever.",
      name: "Priya Sharma",
      business: "Chartered Accountant, Delhi",
      image: "https://images.unsplash.com/photo-1753913354998-2a1a053085af?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB3b21hbiUyMGVudHJlcHJlbmV1ciUyMGJ1c2luZXNzJTIwb3duZXJ8ZW58MXx8fHwxNzcxMjM5MTU0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    },
    {
      quote: "We were losing lakhs because of missed payment follow-ups. The automatic reminders alone paid for the subscription in the first month. Game changer for our cash flow.",
      name: "Vikram Patel",
      business: "Patel Distributors, Ahmedabad",
      image: "https://images.unsplash.com/photo-1650110002977-3ee8cc5eac91?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBidXNpbmVzc21hbiUyMHByb2Zlc3Npb25hbCUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MTIzOTE1NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    }
  ];

  return (
    <section className="bg-gray-50/50 py-24">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-gray-900 mb-4">
            Trusted by Business Owners Across India
          </h2>
          <p className="text-xl text-muted-foreground">
            Real stories from real businesses
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-shadow bg-white">
              <CardContent className="pt-8">
                <Quote className="w-10 h-10 text-[#0a4a5c] opacity-20 mb-6" />

                <p className="text-gray-700 leading-relaxed mb-8 italic text-lg">
                  "{testimonial.quote}"
                </p>

                <div className="flex items-center gap-4 pt-6 border-t border-gray-100">
                  <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                    <AvatarImage src={testimonial.image} alt={testimonial.name} className="object-cover" />
                    <AvatarFallback>{testimonial.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-bold text-gray-900">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.business}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
