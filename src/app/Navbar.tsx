"use client";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [underlineStyle, setUnderlineStyle] = useState({
    transform: "translateX(0px)",
    width: "130px"
  });
  const pathname = usePathname();
  const [isContactSectionVisible, setIsContactSectionVisible] = useState(false);
  
  // Refs dla linków
  const homeRef = useRef<HTMLLIElement>(null);
  const productRef = useRef<HTMLLIElement>(null);
  const contactRef = useRef<HTMLLIElement>(null);
  const ulRef = useRef<HTMLUListElement>(null);

  // Intersection Observer dla sekcji kontaktowej
  useEffect(() => {
    let observer: IntersectionObserver | null = null;
    
    const setupObserver = () => {
      const contactSection = document.getElementById('kontakt');
      if (contactSection) {
        observer = new IntersectionObserver(
          ([entry]) => {
            setIsContactSectionVisible(entry.isIntersecting);
          },
          { 
            threshold: 0.3,
            rootMargin: '-20% 0px -20% 0px'
          }
        );
        
        observer.observe(contactSection);
      }
    };

    // Poczekaj na załadowanie DOM
    const timer = setTimeout(() => {
      setupObserver();
    }, 100);

    return () => {
      clearTimeout(timer);
      if (observer) {
        observer.disconnect();
      }
    };
  }, [pathname]); // Dodaj pathname jako dependency, żeby observer był resetowany przy zmianie strony

  // Sprawdzanie szerokości okna (czy desktop)
  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 768);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  // Scroll effect tylko na desktopie
  React.useEffect(() => {
    if (!isDesktop) {
      setScrolled(false);
      return;
    }
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [isDesktop]);

  // Funkcja do obliczania pozycji i szerokości podkreślenia
  const updateUnderlinePosition = () => {
    let targetRef: React.RefObject<HTMLLIElement | null> | null = null;
    
    if (pathname === "/" && isContactSectionVisible) {
      targetRef = contactRef;
    } else if (pathname === "/") {
      targetRef = homeRef;
    } else if (pathname === "/product") {
      targetRef = productRef;
    } else {
      targetRef = homeRef; // domyślnie
    }

    if (targetRef?.current && ulRef.current) {
      const linkElement = targetRef.current;
      const linkRect = linkElement.getBoundingClientRect();
      const ulRect = ulRef.current.getBoundingClientRect();
      const relativeLeft = linkRect.left - ulRect.left;
      const width = linkRect.width;
      setUnderlineStyle({
        transform: `translateX(${relativeLeft}px)`,
        width: `${width}px`
      });
    }
  };

  // Aktualizuj pozycję podkreślenia przy zmianie ścieżki lub rozmiaru okna
  useEffect(() => {
    updateUnderlinePosition();
    
    const handleResize = () => {
      updateUnderlinePosition();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [pathname, isContactSectionVisible]);

  return (
    <header className={`fixed top-0 left-0 w-full z-50 flex items-center justify-between px-4 md:px-10 py-6 transition-colors duration-300 ${isDesktop && scrolled ? 'bg-white/80 backdrop-blur shadow' : 'bg-transparent'}`}>
      <nav className="flex items-center gap-6 md:gap-10 w-full lg:px-32">
        <Link href="/">
          <Image src="/logo.png" alt="Young Coco logo" width={90} height={40} className="mr-4" />
        </Link>
        {/* Desktop menu */}
        <div className="hidden md:flex gap-8 text-lg font-normal text-[#131313] justify-center">
          <ul className="flex gap-8 relative inline-flex" ref={ulRef}>
            <li ref={homeRef}><Link href="/" className="pb-1 transition-colors hover:text-grey-700">Strona Główna</Link></li>
            <li ref={productRef}><Link href="/product" className="pb-1 transition-colors hover:text-grey-700">Woda kokosowa</Link></li>
            <li ref={contactRef}><Link href="/#kontakt" className="pb-1 transition-colors hover:text-grey-700">Kontakt</Link></li>
            {/* Animowane podkreślenie */}
            <div 
              className="absolute bottom-0 h-0.5 bg-[#A1C63A] transition-all duration-300 ease-in-out"
              style={underlineStyle}
            ></div>
          </ul>
        </div>
        {/* Hamburger icon mobile */}
        <button
          className="md:hidden ml-auto text-green-700 text-3xl focus:outline-none"
          aria-label="Otwórz menu"
          onClick={() => setMenuOpen(true)}
        >
          <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
        </button>
        {/* Koszyk 
        <div className="relative ml-4">
          <button className="text-green-700 text-2xl p-0 m-0 bg-transparent border-none">
            <Image src="/icons/shopping_cart.png" alt="Koszyk" width={28} height={28} />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></span>
          </button>
        </div>*/}
      </nav>
      {/* Mobile menu overlay */}
      {menuOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 flex md:hidden" onClick={() => setMenuOpen(false)}>
          <nav
            className="bg-white w-4/5 max-w-xs h-full shadow-xl p-8 flex flex-col gap-8 animate-slide-in relative"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 text-2xl text-gray-500 hover:text-green-700"
              aria-label="Zamknij menu"
              onClick={() => setMenuOpen(false)}
            >
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            </button>
            <ul className="flex flex-col gap-6 text-xl font-normal mt-8 text-[#131313]">
              <li><Link href="/" className={`transition-colors hover:text-green-700 ${pathname === "/" ? "text-green-700 border-b-2 border-[#A1C63A] pb-1" : ""}`} onClick={() => setMenuOpen(false)}>Strona Główna</Link></li>
              <li><Link href="/product" className={`transition-colors hover:text-green-700 ${pathname === "/product" ? "text-green-700 border-b-2 border-[#A1C63A] pb-1" : ""}`} onClick={() => setMenuOpen(false)}>Woda kokosowa</Link></li>
              <li><a href="#kontakt" className="transition-colors hover:text-green-700" onClick={() => setMenuOpen(false)}>Kontakt</a></li>
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
} 