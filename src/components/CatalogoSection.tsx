// components/CatalogoSection.tsx
'use client';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import Button from './Button';

// Definimos os tipos para o produto e para as props que o componente vai receber
type Product = {
  id: number | string;
  name: string;
  price: string;
  image: string;
};

type CatalogoProps = {
  handleAddToCart: (product: Product) => void;
  handleRemoveFromCart: (productId: number | string) => void;
  isInCart: (productId: number | string) => boolean;
};

// O componente agora recebe a lógica do carrinho de fora (via props)
export default function CatalogoSection({ handleAddToCart, handleRemoveFromCart, isInCart }: CatalogoProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = query(collection(db, 'products'), where('inShowcase', '==', true));
        const querySnapshot = await getDocs(q);
        const productsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Product));
        setProducts(productsData);
      } catch (error) {
        console.error("Erro ao buscar produtos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const openModal = (image: string) => {
    setSelectedImage(image);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  return (
    // Adicionamos um 'id' para que a navegação da página única encontre esta seção
    <section id="catalogo" className="bg-[#f8f5f2] min-h-screen p-8 md:p-16">
      <header className="text-center mb-16 relative">
        <span className="text-[#5C3342] font-sans text-sm tracking-[0.2em] uppercase block mb-3">Nossa Coleção</span>
        <h1 className="text-4xl md:text-5xl font-serif text-[#1d599f] relative inline-block">
          Catálogo Exclusivo
          <span className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-[#5C3342]/20 rounded-full"></span>
        </h1>
      </header>

      <main className="max-w-7xl mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-[#1d599f]/20 border-t-[#1d599f] rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 font-serif">Carregando joias...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
            <div className="w-24 h-24 bg-[#5C3342]/5 rounded-full flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[#5C3342]/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-2xl font-serif text-[#5C3342] mb-2">Estamos atualizando nosso estoque</h3>
            <p className="text-gray-500 max-w-md">Aguarde, em breve teremos novidades incríveis para você! ✨</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {products.map((product) => {
              const itemInCart = isInCart(product.id);

              return (
                <div key={product.id} className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                  {/* IMAGEM */}
                  <div 
                    className="relative aspect-[4/3] w-full cursor-pointer overflow-hidden bg-gray-50"
                    onClick={() => openModal(product.image)}
                  >
                    <Image
                      src={product.image}
                      alt={`Imagem do produto ${product.name}`}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-contain p-4 transition-transform duration-700 group-hover:scale-110"
                    />
                    {/* Overlay de Zoom */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <span className="bg-white/90 backdrop-blur text-[#5C3342] px-4 py-2 rounded-full text-xs font-bold tracking-wider uppercase shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                        Ver Detalhes
                      </span>
                    </div>
                  </div>

                  {/* DETALHES */}
                  <div className="p-6 flex flex-col flex-1 relative">
                    <div className="flex-1">
                      <h2 className="text-xl text-gray-800 font-serif mb-2 group-hover:text-[#1d599f] transition-colors">
                        {product.name}
                      </h2>
                      <p className="text-[#5C3342] font-medium text-lg">{product.price}</p>
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-gray-100">
                      {!itemInCart ? (
                        <Button
                          onClick={() => handleAddToCart(product)}
                          fullWidth
                          className="shadow-md hover:shadow-lg bg-[#1d599f] hover:bg-[#154070] text-white font-sans tracking-wide"
                        >
                          Adicionar à Sacola
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleRemoveFromCart(product.id)}
                          variant="secondary"
                          fullWidth
                          className="bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-red-500 border-0"
                        >
                          Remover da Sacola
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* MODAL / LIGHTBOX */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm animate-fade-in"
          onClick={closeModal}
        >
          <div className="relative w-full max-w-5xl h-full max-h-[90vh] flex items-center justify-center">
             <button
              onClick={closeModal}
              className="absolute -top-12 right-0 md:top-4 md:right-4 text-white/70 hover:text-white transition-colors z-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="relative w-full h-full rounded-lg overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <Image
                src={selectedImage}
                alt="Imagem expandida"
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}