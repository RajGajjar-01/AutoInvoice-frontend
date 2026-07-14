import { Logo } from "@/components/Common/Logo"
import factoryImg from "@/assets/images/collage/factory.png"
import smallShopImg from "@/assets/images/collage/small_shop.png"
import officeImg from "@/assets/images/collage/office.png"
import warehouseImg from "@/assets/images/collage/warehouse.png"

const sectors = [
  {
    src: factoryImg,
    alt: "Industrial Factory",
    label: "Industrial",
  },
  {
    src: smallShopImg,
    alt: "Retail Shop",
    label: "Retail",
  },
  {
    src: officeImg,
    alt: "Corporate Office",
    label: "Business",
  },
  {
    src: warehouseImg,
    alt: "Logistics Warehouse",
    label: "Logistics",
  },
]

export function BusinessCollage() {
  return (
    <div className="relative w-full h-full min-h-[400px] overflow-hidden bg-zinc-950 flex items-center justify-center p-4">
      {/* Grid of images */}
      <div className="grid grid-cols-2 grid-rows-2 h-full w-full gap-4 max-w-2xl aspect-square">
        {sectors.map((img, i) => (
          <div
            key={i}
            className="group relative overflow-hidden rounded-2xl shadow-lg transition-all duration-500 hover:shadow-2xl hover:-translate-y-1"
          >
            <img
              src={img.src}
              alt={img.alt}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-100"
            />
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-6">
              <div className="transform translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                <span className="text-white font-semibold text-xs tracking-widest uppercase">
                  {img.label}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Center Badge */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <div className="bg-white/10 backdrop-blur-xl p-6 lg:p-10 rounded-3xl border border-white/20 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-500">
          <Logo variant="full" className="h-12 lg:h-16" asLink={false} />
          <div className="h-px w-12 bg-white/30" />
          <p className="text-white/90 text-center text-sm lg:text-base font-medium font-outfit max-w-[200px] leading-relaxed">
            One workspace for <span className="text-[#10b981] font-bold italic">every</span> business.
          </p>
        </div>
      </div>

      {/* Subtle patterns/decorations */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#10b981]/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#10b981]/5 blur-[100px] rounded-full pointer-events-none" />
    </div>
  )
}
