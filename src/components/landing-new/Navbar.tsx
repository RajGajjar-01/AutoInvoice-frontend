import { Menu } from "lucide-react";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex items-center justify-between h-[72px]">
          {/* Logo */}
          <div className="flex-shrink-0">
            <span className="text-xl font-semibold text-[#0a4a5c]">AutomateHub</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-700 hover:text-[#0a4a5c] transition-colors">
              Features
            </a>
            <a href="#for-accountants" className="text-gray-700 hover:text-[#0a4a5c] transition-colors">
              For Accountants
            </a>
            <a href="#pricing" className="text-gray-700 hover:text-[#0a4a5c] transition-colors">
              Pricing
            </a>
            <a href="#about" className="text-gray-700 hover:text-[#0a4a5c] transition-colors">
              About
            </a>
            <a href="#contact" className="text-gray-700 hover:text-[#0a4a5c] transition-colors">
              Contact
            </a>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/login" className="text-gray-700 hover:text-[#0a4a5c] transition-colors">
              Login
            </Link>
            <Button asChild variant="default" size="default" className="bg-[#0a4a5c] text-white hover:bg-[#083a48]">
              <Link to="/signup">
                Start Free
              </Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <a href="#features" className="text-gray-700 hover:text-[#0a4a5c]">
                Features
              </a>
              <a href="#for-accountants" className="text-gray-700 hover:text-[#0a4a5c]">
                For Accountants
              </a>
              <a href="#pricing" className="text-gray-700 hover:text-[#0a4a5c]">
                Pricing
              </a>
              <a href="#about" className="text-gray-700 hover:text-[#0a4a5c]">
                About
              </a>
              <a href="#contact" className="text-gray-700 hover:text-[#0a4a5c]">
                Contact
              </a>
              <div className="flex flex-col space-y-2 pt-2">
                <Link to="/login" className="text-gray-700 hover:text-[#0a4a5c]">
                  Login
                </Link>
                <Button asChild variant="default" size="default" className="bg-[#0a4a5c] text-white hover:bg-[#083a48]">
                  <Link to="/signup">
                    Start Free
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
