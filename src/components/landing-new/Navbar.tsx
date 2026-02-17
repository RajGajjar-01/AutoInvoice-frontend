import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "#features", label: "Features" },
    { href: "#for-accountants", label: "For Accountants" },
    { href: "#pricing", label: "Pricing" },
    { href: "#about", label: "About" },
    { href: "#contact", label: "Contact" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex items-center justify-between h-[72px]">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-gradient-to-br from-[#0a4a5c] to-[#0d6580] rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-white font-bold text-sm">AH</span>
              </div>
              <span className="text-xl font-bold text-[#0a4a5c]">AutomateHub</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-gray-700 hover:text-[#0a4a5c] transition-colors font-medium relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#0a4a5c] group-hover:w-full transition-all duration-300"></span>
              </a>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/login"
              className="text-gray-700 hover:text-[#0a4a5c] transition-colors font-medium"
            >
              Login
            </Link>
            <Button
              asChild
              variant="default"
              size="default"
              className="bg-gradient-to-r from-[#0a4a5c] to-[#0d6580] text-white hover:from-[#0d6580] hover:to-[#0a4a5c] shadow-md hover:shadow-lg transition-all"
            >
              <Link to="/signup">Start Free</Link>
            </Button>
          </div>

          {/* Mobile Menu - shadcn Sheet */}
          <div className="md:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-gray-700">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader className="">
                  <SheetTitle className="text-left">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-[#0a4a5c] to-[#0d6580] rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">AH</span>
                      </div>
                      <span className="text-xl font-bold text-[#0a4a5c]">AutomateHub</span>
                    </div>
                  </SheetTitle>
                </SheetHeader>

                <Separator className="my-6" />

                {/* Mobile Navigation Links */}
                <div className="flex flex-col space-y-4">
                  {navLinks.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-gray-700 hover:text-[#0a4a5c] transition-colors font-medium py-2 px-4 rounded-lg hover:bg-gray-50"
                    >
                      {link.label}
                    </a>
                  ))}

                  <Separator className="my-4" />

                  {/* Mobile CTA Buttons */}
                  <div className="flex flex-col space-y-3 pt-2">
                    <Button
                      asChild
                      variant="outline"
                      size="lg"
                      className="w-full"
                    >
                      <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                        Login
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="default"
                      size="lg"
                      className="w-full bg-gradient-to-r from-[#0a4a5c] to-[#0d6580] text-white hover:from-[#0d6580] hover:to-[#0a4a5c]"
                    >
                      <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                        Start Free Trial
                      </Link>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
