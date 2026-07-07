import { Link } from "react-router"
import { Button } from "@/components/ui/button"

export function Hero() {
  const businessImages = [
    {
      url: "/assets/images/NEERUS – Next Gen Indian Ethnic store by FRDC, Mumbai – India.jpg",
      alt: "Indian kirana store owner",
      gridArea: "img1",
    },
    {
      url: "/assets/images/Satika Threads.jpg",
      alt: "Indian textile shop",
      gridArea: "img2",
    },
    {
      url: "/assets/images/mehar chand and sons, spices and teas, new delhi_.jpg",
      alt: "Indian spices and teas shop",
      gridArea: "img3",
    },
    {
      url: "/assets/images/🛒 Transform Your Supermarket with Spazes Interior Design! 🛒.jpg",
      alt: "Indian supermarket interior",
      gridArea: "img4",
    },
    {
      url: "/assets/images/download.jpg",
      alt: "Indian retail store",
      gridArea: "img5",
    },
    {
      url: "/assets/images/138,188 Mobile Store Stock Photos, High-Res Pictures, and Images - Getty Images.jpg",
      alt: "Indian mobile store",
      gridArea: "img6",
    },
    {
      url: "/assets/images/Purani dukaan.jpg",
      alt: "Indian traditional shop",
      gridArea: "img7",
    },
    {
      url: "/assets/images/download (1).jpg",
      alt: "Indian business",
      gridArea: "img8",
    },
  ]

  return (
    <section className="bg-gradient-to-b from-gray-50 via-white to-gray-50 pb-12 overflow-hidden">
      {/* Hero with Image Background and Text Overlay */}
      <div className="relative min-h-[90vh] flex items-center">
        {/* Background Bento Grid - Desktop */}
        <div
          className="absolute inset-0 hidden lg:grid gap-3 p-6"
          style={{
            gridTemplateColumns: "repeat(4, 1fr)",
            gridTemplateRows: "repeat(3, 1fr)",
            gridTemplateAreas: `
              "img1 img1 img2 img3"
              "img1 img1 img4 img4"
              "img5 img6 img7 img8"
            `,
          }}
        >
          {businessImages.map((image, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-700 animate-fadeIn"
              style={{
                gridArea: image.gridArea,
                animationDelay: `${index * 100}ms`,
              }}
            >
              <img
                src={image.url}
                alt={image.alt}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:brightness-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          ))}
        </div>

        {/* Background Tablet Grid */}
        <div className="absolute inset-0 hidden md:grid lg:hidden grid-cols-2 auto-rows-[200px] gap-4 p-6">
          {businessImages.slice(0, 4).map((image, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-700 animate-fadeIn"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <img
                src={image.url}
                alt={image.alt}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
              />
            </div>
          ))}
        </div>

        {/* Background Mobile */}
        <div className="absolute inset-0 md:hidden">
          <img
            src={businessImages[0].url}
            alt={businessImages[0].alt}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>

        {/* Dark Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/70" />

        {/* Text Content Overlay - Centered */}
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 w-full">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div
              className="inline-block animate-fadeIn"
              style={{ animationDelay: "200ms" }}
            >
              <span className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium border border-white/30 hover:bg-white/30 transition-all duration-300">
                Trusted by Indian Businesses
              </span>
            </div>

            <h1
              className="text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.1] drop-shadow-2xl animate-fadeIn"
              style={{ animationDelay: "400ms" }}
            >
              From Small Shop to{" "}
              <span className="text-[#4ade80] inline-block hover:scale-110 transition-transform duration-300">
                Smart Business
              </span>{" "}
              — Automatically
            </h1>

            <p
              className="text-xl lg:text-2xl text-white/90 leading-relaxed max-w-3xl mx-auto drop-shadow-lg animate-fadeIn"
              style={{ animationDelay: "600ms" }}
            >
              Capture invoices from email, manage data your way, track payments,
              and get real-time insights — built for MSMEs and accountants.
            </p>

            <div
              className="flex flex-wrap gap-4 justify-center pt-4 animate-fadeIn"
              style={{ animationDelay: "800ms" }}
            >
              <Button
                asChild
                variant="default"
                size="lg"
                className="bg-white text-[#0a4a5c] hover:bg-gray-100 px-8 py-6 text-lg shadow-2xl hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                <Link to="/signup">Start Free Trial</Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-white bg-transparent text-white hover:text-white hover:bg-white/20 backdrop-blur-sm px-8 py-6 text-lg shadow-2xl hover:scale-105 transition-all duration-300"
              >
                Watch Demo
              </Button>
            </div>

            {/* Trust Indicators */}
            <div
              className="flex flex-wrap items-center justify-center gap-6 pt-6 text-sm text-white/90 animate-fadeIn"
              style={{ animationDelay: "1000ms" }}
            >
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                <svg
                  className="w-5 h-5 text-green-400 animate-pulse"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-medium">No credit card required</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                <svg
                  className="w-5 h-5 text-green-400 animate-pulse"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  style={{ animationDelay: "200ms" }}
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-medium">14-day free trial</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                <svg
                  className="w-5 h-5 text-green-400 animate-pulse"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  style={{ animationDelay: "400ms" }}
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-medium">Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
