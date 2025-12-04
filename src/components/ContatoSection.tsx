// components/ContatoSection.tsx

export default function ContatoSection() {
  return (
    <section
      id="contato"
      className="relative py-24 bg-[#1a1a1a] text-white overflow-hidden"
    >
      {/* Elementos Decorativos de Fundo */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20 pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-[#5C3342] blur-[120px]"></div>
        <div className="absolute bottom-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-[#1d599f] blur-[100px]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Lado Esquerdo: Título e Texto */}
          <div className="space-y-8 text-center lg:text-left">
            <div>
              <span className="text-yellow-500 font-sans text-sm tracking-[0.3em] uppercase block mb-4">Fale Conosco</span>
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white leading-tight">
                Vamos criar algo <span className="italic text-[#5C3342]">único</span> juntos?
              </h2>
            </div>
            <p className="text-gray-400 text-lg font-light max-w-md mx-auto lg:mx-0 leading-relaxed">
              Estamos à disposição para tirar suas dúvidas, ajudar na escolha da joia perfeita ou ouvir suas sugestões.
            </p>
          </div>

          {/* Lado Direito: Cards de Contato */}
          <div className="grid grid-cols-1 gap-6">
            {/* Card Instagram */}
            <a 
              href="https://www.instagram.com/llspratas?igsh=bGZhYnB1MXBtdjBv" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl flex items-center gap-6 hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-[#5C3342]/20"
            >
              <div className="w-12 h-12 rounded-full bg-[#5C3342]/20 flex items-center justify-center text-[#5C3342] group-hover:bg-[#5C3342] group-hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Siga-nos</p>
                <p className="text-xl font-serif text-white">@llspratas</p>
              </div>
              <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </a>

            {/* Card WhatsApp */}
            <a 
              href="https://wa.me/5567991116421" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl flex items-center gap-6 hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-green-500/20"
            >
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 group-hover:bg-green-500 group-hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Converse Conosco</p>
                <p className="text-xl font-serif text-white">(67) 99111-6421</p>
              </div>
              <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </a>

          </div>
        </div>

        {/* Rodapé Simples */}
        <div className="mt-24 pt-8 border-t border-white/10 text-center text-gray-500 text-sm font-sans">
          <p>&copy; {new Date().getFullYear()} Laureane Simões Pratas. Todos os direitos reservados.</p>
        </div>
      </div>
    </section>
  );
}