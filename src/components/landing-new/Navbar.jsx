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

export function Navbar() {
  const [open, setOpen] = useState(false);

  const navLinks = [
    { name: "Features", href: "#features" },
    { name: "For Accountants", href: "#for-accountants" },
    { name: "Pricing", href: "#pricing" },
    { name: "About", href: "#about" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#0a4a5c] to-[#0d6580]">
              AutomateHub
            </span>
          </Link>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="transition-colors hover:text-primary text-muted-foreground"
            >
              {link.name}
            </a>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <Button variant="ghost" asChild size="sm">
            <Link to="/login">Login</Link>
          </Button>
          <Button asChild size="sm" variant="default" className="bg-[#0a4a5c] hover:bg-[#083a48]">
            <Link to="/signup">Start Free</Link>
          </Button>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle className="text-left text-[#0a4a5c] font-bold">
                  AutomateHub
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-4 py-8">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="text-lg font-medium transition-colors hover:text-primary"
                  >
                    {link.name}
                  </a>
                ))}
                <div className="flex flex-col gap-2 pt-4">
                  <Button variant="outline" asChild size="default" className="w-full">
                    <Link to="/login" onClick={() => setOpen(false)}>
                      Login
                    </Link>
                  </Button>
                  <Button asChild variant="default" size="default" className="w-full bg-[#0a4a5c] hover:bg-[#083a48]">
                    <Link to="/signup" onClick={() => setOpen(false)}>
                      Start Free
                    </Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
