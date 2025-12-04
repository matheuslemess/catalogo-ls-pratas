"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import CatalogoSection from "@/components/CatalogoSection";
import ContatoSection from "@/components/ContatoSection";
import Button from "@/components/Button";

type Product = { id: number | string; name: string; price: string; image: string };

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? "bg-white/90 backdrop-blur-md shadow-sm py-2" : "bg-transparent py-4"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          <div className={`flex-shrink-0 text-xl font-serif tracking-widest transition-colors ${
            scrolled ? "text-[#5C3342]" : "text-white"
          }`}>
            <a href="#home">L.S. PRATAS</a>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8 font-sans text-sm tracking-wide uppercase">
              <a
                href="#home"
                className={`transition-colors hover:text-yellow-500 ${scrolled ? "text-gray-600" : "text-white/90"}`}
              >
                Home
              </a>
              <a
                href="#catalogo"
                className={`transition-colors hover:text-yellow-500 ${scrolled ? "text-gray-600" : "text-white/90"}`}
              >
                Catálogo
              </a>
              <a
                href="#contato"
                className={`transition-colors hover:text-yellow-500 ${scrolled ? "text-gray-600" : "text-white/90"}`}
              >
                Contato
              </a>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default function HomePage() {
  const WHATSAPP_NUMBER = "5567991116421";
  const [cart, setCart] = useState<Product[]>([]);

  const handleAddToCart = (product: Product) =>
    setCart((prev) => [...prev, product]);
  const handleRemoveFromCart = (productId: number | string) =>
    setCart((prev) => prev.filter((item) => item.id !== productId));
  const isInCart = (productId: number | string) =>
    cart.some((item) => item.id === productId);

  const handleSendWhatsApp = () => {
    let message = "Olá Lali!! Tenho interesse nos seguintes produtos:\n\n";
    cart.forEach((item) => {
      message += `- ${item.name} (${item.price})\n`;
    });
    message += "\nAguardo o contato!";
    const encodedMessage = encodeURIComponent(message);
    const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    window.open(whatsappLink, "_blank");
  };

  return (
    <>
      <Navbar />
      <main>
        <section
          id="home"
          className="relative flex flex-col items-center justify-center min-h-screen text-center text-white overflow-hidden"
        >
          {/* Imagem de Fundo com Parallax suave (via CSS fixo ou JS) */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/pra1.svg"
              alt="Modelo de fundo da coleção"
              fill
              priority
              className="object-cover object-center scale-105 animate-slow-zoom" // Adicionei uma animação lenta se possível, ou apenas scale
            />
            {/* Gradiente de Sobreposição para Leitura */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/60"></div>
          </div>

          {/* Conteúdo de Texto */}
          <div className="relative z-20 p-4 max-w-4xl mx-auto flex flex-col items-center animate-fade-in-up">
            <p className="text-yellow-200 font-sans tracking-[0.2em] text-sm md:text-base uppercase mb-4">
              Elegância & Sofisticação
            </p>
            <h2 className="text-5xl sm:text-7xl md:text-8xl text-white font-serif font-medium tracking-tight mb-6">
              Laureane Simões
            </h2>
            <div className="h-px w-24 bg-yellow-400/50 mb-6"></div>
            <p className="text-lg md:text-xl font-light text-gray-100 max-w-lg mx-auto mb-10 leading-relaxed">
              Descubra a beleza atemporal da nossa coleção exclusiva de Prata 925.
            </p>
            
            <Link
              href="#catalogo"
              className="group relative inline-flex items-center justify-center px-8 py-3 overflow-hidden font-medium tracking-tighter text-white bg-transparent border border-white/30 rounded-full hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
            >
              <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-white rounded-full group-hover:w-56 group-hover:h-56 opacity-10"></span>
              <span className="relative font-sans tracking-widest uppercase text-sm">Explorar Coleção</span>
            </Link>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
            <svg className="w-6 h-6 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </section>



        <CatalogoSection
          handleAddToCart={handleAddToCart}
          handleRemoveFromCart={handleRemoveFromCart}
          isInCart={isInCart}
        />



        <ContatoSection />
      </main>

      {/* Botão Flutuante do Carrinho Premium */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
          <button
            onClick={handleSendWhatsApp}
            className="group flex items-center gap-3 bg-[#1d599f] text-white pl-4 pr-6 py-3 rounded-full shadow-2xl hover:bg-[#154070] transition-all duration-300 hover:-translate-y-1 hover:shadow-[#1d599f]/30"
          >
            <div className="relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="absolute -top-2 -right-2 bg-yellow-400 text-[#1d599f] text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {cart.length}
              </span>
            </div>
            <div className="text-left">
              <p className="text-xs text-blue-200 font-medium uppercase tracking-wider">Finalizar</p>
              <p className="text-sm font-bold leading-none">Pedido via WhatsApp</p>
            </div>
          </button>
        </div>
      )}
    </>
  );
}
