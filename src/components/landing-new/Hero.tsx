export function Hero() {
  const businessImages = [
    {
      url: "https://images.unsplash.com/photo-1739066598279-1297113f5c6a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBraXJhbmElMjBzdG9yZSUyMG93bmVyJTIwbGFwdG9wfGVufDF8fHx8MTc3MTIzOTE1MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      alt: "Kirana store owner"
    },
    {
      url: "https://images.unsplash.com/photo-1762867408424-773ca7dce149?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB0ZXh0aWxlJTIwY2xvdGhpbmclMjByZXRhaWwlMjBzdG9yZXxlbnwxfHx8fDE3NzEyMzkxNTF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      alt: "Cloth retail store"
    },
    {
      url: "https://images.unsplash.com/photo-1611072965169-e1534f6f300c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaGFybWFjeSUyMG1lZGljYWwlMjBzdG9yZSUyMHNoZWx2ZXN8ZW58MXx8fHwxNzcxMjM5MTU3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      alt: "Medical store"
    },
    {
      url: "https://images.unsplash.com/photo-1640181637089-cce4a3040ed2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXRhaWwlMjBzaG93cm9vbSUyMGJ1c2luZXNzJTIwc3RhZmYlMjBpbmRpYXxlbnwxfHx8fDE3NzEyMzkxNTF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      alt: "Retail showroom"
    },
    {
      url: "https://images.unsplash.com/photo-1718248648359-2a3a5fc579c8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3YXJlaG91c2UlMjBpbmR1c3RyaWFsJTIwc3RvcmFnZSUyMGdvb2RzfGVufDF8fHx8MTc3MTIzOTE1OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      alt: "Warehouse"
    },
    {
      url: "https://images.unsplash.com/photo-1654262609484-76d1a8f3b016?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBhY2NvdW50YW50JTIwd29ya2luZyUyMGxhcHRvcCUyMGZpbmFuY2V8ZW58MXx8fHwxNzcxMjM5MTUyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      alt: "Accountant working"
    }
  ];

  return (
    <section className="bg-white pt-16 pb-24 overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-12 items-start mb-16">
          {/* Left Column - Content */}
          <div className="space-y-8">
            <h1 className="text-5xl lg:text-6xl font-semibold text-gray-900 leading-tight">
              From Small Shop to Smart Business — Automatically
            </h1>
            
            <p className="text-xl text-gray-600 leading-relaxed">
              Capture invoices from email, manage data your way, track payments, and get real-time insights — built for MSMEs and accountants.
            </p>

            <div className="flex flex-wrap gap-4">
              <button className="bg-[#0a4a5c] text-white px-8 py-4 rounded-lg hover:bg-[#083a48] transition-colors text-lg">
                Start Free
              </button>
              <button className="border-2 border-[#0a4a5c] text-[#0a4a5c] px-8 py-4 rounded-lg hover:bg-[#0a4a5c] hover:text-white transition-colors text-lg">
                Book Demo
              </button>
            </div>

            {/* Dashboard Preview Card */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg mt-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="h-3 w-24 bg-gray-300 rounded"></div>
                    <div className="h-2 w-16 bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-8 w-8 bg-[#0a4a5c] rounded"></div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="h-2 w-12 bg-gray-300 rounded mb-2"></div>
                    <div className="h-4 w-16 bg-[#0a4a5c] rounded"></div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="h-2 w-12 bg-gray-300 rounded mb-2"></div>
                    <div className="h-4 w-16 bg-[#d4a574] rounded"></div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="h-2 w-12 bg-gray-300 rounded mb-2"></div>
                    <div className="h-4 w-16 bg-gray-300 rounded"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-full bg-gray-200 rounded"></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-4/5 bg-gray-200 rounded"></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-3/4 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Curved Image Layout (Desktop only) */}
          <div className="hidden lg:block relative h-[600px]">
            {/* Images positioned in a flowing wave pattern */}
            {businessImages.map((image, index) => {
              // Create a more dynamic staggered wave layout
              const positions = [
                { top: '5%', left: '5%', rotate: '-3deg', scale: '1' },
                { top: '5%', right: '5%', rotate: '3deg', scale: '0.95' },
                { top: '28%', left: '20%', rotate: '2deg', scale: '1.05' },
                { top: '28%', right: '15%', rotate: '-2deg', scale: '0.98' },
                { top: '52%', left: '8%', rotate: '-4deg', scale: '1.02' },
                { top: '52%', right: '8%', rotate: '4deg', scale: '1' }
              ];

              return (
                <div
                  key={index}
                  className="absolute w-[200px] h-[200px] bg-white rounded-2xl shadow-2xl overflow-hidden transition-transform hover:scale-105 hover:z-10 hover:shadow-3xl duration-300"
                  style={{
                    ...positions[index],
                    transform: `rotate(${positions[index].rotate}) scale(${positions[index].scale})`,
                  }}
                >
                  <img
                    src={image.url}
                    alt={image.alt}
                    className="w-full h-full object-cover"
                  />
                  {/* Subtle overlay gradient for depth */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                </div>
              );
            })}
            
            {/* Decorative connecting lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" viewBox="0 0 500 600">
              <path
                d="M 50,80 Q 150,60 250,100 T 450,140 Q 350,180 250,200 T 50,280 Q 150,320 250,340 T 450,400 Q 350,440 250,480 T 50,540"
                stroke="#0a4a5c"
                strokeWidth="3"
                fill="none"
                strokeDasharray="8,8"
                opacity="0.5"
              />
              <path
                d="M 80,120 Q 200,90 300,140 T 420,200 Q 320,240 200,280 T 80,360 Q 200,400 300,440 T 420,500"
                stroke="#d4a574"
                strokeWidth="2"
                fill="none"
                strokeDasharray="6,6"
                opacity="0.4"
              />
              <circle cx="100" cy="100" r="3" fill="#0a4a5c" opacity="0.6" />
              <circle cx="400" cy="120" r="3" fill="#0a4a5c" opacity="0.6" />
              <circle cx="150" cy="240" r="3" fill="#d4a574" opacity="0.6" />
              <circle cx="380" cy="280" r="3" fill="#d4a574" opacity="0.6" />
              <circle cx="100" cy="400" r="3" fill="#0a4a5c" opacity="0.6" />
              <circle cx="400" cy="440" r="3" fill="#0a4a5c" opacity="0.6" />
            </svg>
          </div>
        </div>

        {/* Mobile Image Scroll */}
        <div className="lg:hidden">
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {businessImages.map((image, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-[180px] h-[180px] bg-white rounded-2xl shadow-lg overflow-hidden"
              >
                <img
                  src={image.url}
                  alt={image.alt}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}