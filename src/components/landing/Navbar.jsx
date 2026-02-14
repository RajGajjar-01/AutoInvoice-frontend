import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from '@tanstack/react-router';
import {
  Check,
  Link2,
  Smartphone,
  BarChart3,
  Coffee,
  ArrowRight,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Appearance } from '@/components/Common/Appearance';
import { isLoggedIn } from '@/hooks/useAuth';

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      // If we're not on landing page, navigate there first
      navigate({ to: '/' });
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
    setMenuOpen(false);
  };

  const navLinks = [
    ['features', 'Features'],
    ['how-it-works', 'Kaise Kaam Karta Hai'],
    ['pricing', 'Price'],
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
        ? 'bg-background/97 backdrop-blur-md border-b border-border'
        : 'bg-transparent border-b border-transparent'
        }`}
    >
      <div className="max-w-[1200px] mx-auto px-7 flex items-center justify-between h-[68px]">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 no-underline">
          <div>
            <div className="text-[22px] font-extrabold text-foreground leading-tight">
              AutoInvoice
            </div>
            <div className="text-[9px] text-primary font-medium tracking-wider">
              APKA HISAAB-KITAAB
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={(e) => scrollTo(e, id)}
              className="text-muted-foreground font-medium text-sm hover:text-primary transition-colors"
            >
              {label}
            </a>
          ))}
          <Appearance />
          {isLoggedIn() ? (
            <Button
              onClick={() => navigate({ to: '/dashboard' })}
              className="font-medium h-10 px-6 rounded-xl"
            >
              Go to Dashboard <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={() => navigate({ to: '/login' })}
                className="font-medium h-10 px-4 rounded-xl"
              >
                Login
              </Button>
              <Button
                onClick={() => navigate({ to: '/signup' })}
                className="font-medium h-10 px-6 rounded-xl"
              >
                Sign Up
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden bg-transparent border-none text-foreground p-1"
          aria-label="menu"
        >
          {menuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="bg-background px-7 py-5 pb-7 border-t border-border shadow-lg md:hidden">
          {navLinks.map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={(e) => scrollTo(e, id)}
              className="block py-3.5 text-foreground font-medium no-underline border-b border-border"
            >
              {label}
            </a>
          ))}
          <div className="flex justify-between items-center py-3.5 border-b border-border">
            <span className="font-medium text-foreground">Theme</span>
            <Appearance />
          </div>
          {isLoggedIn() ? (
            <Button
              onClick={() => navigate({ to: '/dashboard' })}
              className="w-full mt-5 font-medium h-12 text-base rounded-xl"
            >
              Go to Dashboard
            </Button>
          ) : (
            <div className="flex flex-col gap-3 mt-5">
              <Button
                variant="outline"
                onClick={() => navigate({ to: '/login' })}
                className="w-full font-medium h-12 text-base rounded-xl border-border"
              >
                Login
              </Button>
              <Button
                onClick={() => navigate({ to: '/signup' })}
                className="w-full font-medium h-12 text-base rounded-xl"
              >
                Sign Up
              </Button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
