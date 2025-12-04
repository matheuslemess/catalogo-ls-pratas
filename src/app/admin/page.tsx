'use client';
import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { db, auth } from '@/lib/firebase';
import { collection, deleteDoc, doc, getDocs, orderBy, query, updateDoc, addDoc, Timestamp } from 'firebase/firestore';

import Image from 'next/image';
import ConfirmationModal from '@/components/ConfirmationModal';
import ProductFormModal from '@/components/ProductFormModal';
import Button from '@/components/Button';

type Product = {
  id: string;
  name: string;
  price: string;
  image: string;
  stock?: number;
  inShowcase?: boolean;
};

type Sale = {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  totalPrice: number;
  date: Timestamp;
};

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'catalog' | 'inventory' | 'sales'>('catalog');
  const [sortBy, setSortBy] = useState<'name' | 'stock_asc' | 'stock_desc'>('name');
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; productId: string | null }>({
    isOpen: false,
    productId: null
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/admin/login');
    }
  }, [user, loading, router]);

  const fetchProducts = async () => {
    const q = query(collection(db, 'products'), orderBy('name'));
    const querySnapshot = await getDocs(q);
    const productsData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Product));
    setProducts(productsData);
  };

  const fetchSales = async () => {
    const q = query(collection(db, 'sales'), orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);
    const salesData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Sale));
    setSales(salesData);
  };

  useEffect(() => {
    if (user) {
      fetchProducts();
      fetchSales();
    }
  }, [user]);

  // Filter and Sort products
  const filteredProducts = useMemo(() => {
    let result = products.filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (activeTab === 'catalog') {
      result = result.filter(p => p.inShowcase === true);
    }

    if (activeTab === 'inventory') {
      result.sort((a, b) => {
        const stockA = a.stock || 0;
        const stockB = b.stock || 0;
        if (sortBy === 'stock_asc') return stockA - stockB;
        if (sortBy === 'stock_desc') return stockB - stockA;
        return a.name.localeCompare(b.name);
      });
    }

    return result;
  }, [products, searchTerm, activeTab, sortBy]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalProducts = products.length;
    const totalStock = products.reduce((acc, product) => acc + (product.stock || 0), 0);
    
    const totalInventoryValue = products.reduce((acc, product) => {
      const priceNumber = parseFloat(product.price.replace('R$', '').replace('.', '').replace(',', '.').trim());
      const stock = product.stock || 0;
      return acc + (isNaN(priceNumber) ? 0 : priceNumber * stock);
    }, 0);

    const totalRevenue = sales.reduce((acc, sale) => acc + sale.totalPrice, 0);

    return { 
      totalProducts, 
      totalStock,
      totalInventoryValue: totalInventoryValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      totalRevenue: totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    };
  }, [products, sales]);

  const handleAddNew = () => {
    setProductToEdit(null);
    setIsModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setProductToEdit(product);
    setIsModalOpen(true);
  };

  const handleModalSuccess = (message: string) => {
    fetchProducts();
    setToast({ message, type: 'success' });
    setTimeout(() => setToast(null), 3000);
  };

  const handleDelete = (id: string) => {
    setDeleteModal({ isOpen: true, productId: id });
  };

  const handleUpdateStock = async (product: Product, change: number) => {
    const currentStock = product.stock || 0;
    const newStock = Math.max(0, currentStock + change);
    
    try {
      await updateDoc(doc(db, 'products', product.id), { stock: newStock });
      // Optimistic update
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, stock: newStock } : p));
    } catch (error) {
      console.error("Erro ao atualizar estoque:", error);
      setToast({ message: 'Erro ao atualizar estoque.', type: 'error' });
    }
  };

  const handleRegisterSale = async (product: Product) => {
    if (!product.stock || product.stock <= 0) {
      setToast({ message: 'Produto sem estoque!', type: 'error' });
      return;
    }

    const quantity = 1;
    const priceNumber = parseFloat(product.price.replace('R$', '').replace('.', '').replace(',', '.').trim());
    const totalPrice = isNaN(priceNumber) ? 0 : priceNumber * quantity;

    try {
      // 1. Decrement Stock
      await handleUpdateStock(product, -quantity);

      // 2. Add Sale Record
      await addDoc(collection(db, 'sales'), {
        productId: product.id,
        productName: product.name,
        quantity,
        totalPrice,
        date: Timestamp.now()
      });

      setToast({ message: 'Venda registrada com sucesso!', type: 'success' });
      fetchSales(); // Refresh sales list
    } catch (error) {
      console.error("Erro ao registrar venda:", error);
      setToast({ message: 'Erro ao registrar venda.', type: 'error' });
    }
  };

  const handleToggleShowcase = async (product: Product) => {
    const newValue = !product.inShowcase;
    try {
      await updateDoc(doc(db, 'products', product.id), { inShowcase: newValue });
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, inShowcase: newValue } : p));
      setToast({ message: newValue ? 'Produto adicionado à vitrine!' : 'Produto removido da vitrine.', type: 'success' });
      setTimeout(() => setToast(null), 3000);
    } catch (error) {
      console.error("Erro ao atualizar vitrine:", error);
      setToast({ message: 'Erro ao atualizar status da vitrine.', type: 'error' });
    }
  };

  const confirmDelete = async () => {
    if (deleteModal.productId) {
      try {
        await deleteDoc(doc(db, 'products', deleteModal.productId));
        setToast({ message: 'Produto excluído com sucesso!', type: 'success' });
        fetchProducts();
      } catch (error) {
        console.error("Erro ao excluir:", error);
        setToast({ message: 'Erro ao excluir produto.', type: 'error' });
      } finally {
        setDeleteModal({ isOpen: false, productId: null });
        setTimeout(() => setToast(null), 3000);
      }
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f5f2]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-gray-200 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f5f2] relative font-sans">
      {/* Decorative Background Elements */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-[#5C3342]/5 blur-3xl"></div>
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full bg-[#1d599f]/5 blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-6 md:p-8">
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif text-[#5C3342]">Olá, Laureane Simões!</h1>
            <p className="text-gray-500 text-sm mt-1">Bem-vinda ao painel administrativo da LS Pratas.</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <Button 
              onClick={() => auth.signOut()}
              variant="ghost"
              className="text-red-600 hover:text-red-800 hover:bg-red-50 ml-auto"
            >
              Sair
            </Button>
          </div>
        </header>

        {/* DASHBOARD STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-10">
          <div className="bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-white/50 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-[#1d599f]/10 rounded-xl text-[#1d599f]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Produtos</p>
              <p className="text-xl font-serif text-gray-800">{stats.totalProducts}</p>
            </div>
          </div>
          <div className="bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-white/50 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-[#5C3342]/10 rounded-xl text-[#5C3342]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Estoque</p>
              <p className="text-xl font-serif text-gray-800">{stats.totalStock}</p>
            </div>
          </div>
          <div className="bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-white/50 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-green-600/10 rounded-xl text-green-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Valor Estoque</p>
              <p className="text-xl font-serif text-gray-800">{stats.totalInventoryValue}</p>
            </div>
          </div>
          <div className="bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-white/50 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-600/10 rounded-xl text-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Vendas Totais</p>
              <p className="text-xl font-serif text-gray-800">{stats.totalRevenue}</p>
            </div>
          </div>
        </div>

        {/* TABS NAVIGATION */}
        <div className="flex space-x-1 bg-white/50 p-1 rounded-xl mb-8 w-full md:w-fit backdrop-blur-sm overflow-x-auto whitespace-nowrap scrollbar-hide">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'catalog' 
                ? 'bg-white text-[#5C3342] shadow-sm' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
            }`}
          >
            Vitrine / Catálogo
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'inventory' 
                ? 'bg-white text-[#5C3342] shadow-sm' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
            }`}
          >
            Gestão de Estoque
          </button>
          <button
            onClick={() => setActiveTab('sales')}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'sales' 
                ? 'bg-white text-[#5C3342] shadow-sm' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
            }`}
          >
            Histórico de Vendas
          </button>
        </div>

        {/* TOAST NOTIFICATION */}
        {toast && (
          <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl text-white transition-all transform duration-500 flex items-center gap-3 ${
            toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}>
            {toast.type === 'success' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <span className="font-medium">{toast.message}</span>
          </div>
        )}

        <ConfirmationModal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, productId: null })}
          onConfirm={confirmDelete}
          title="Excluir Produto"
          message="Tem certeza que deseja excluir este produto? Essa ação não pode ser desfeita."
        />

        <ProductFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          productToEdit={productToEdit}
          onSuccess={handleModalSuccess}
        />

        {/* CONTENT AREA */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/50 overflow-hidden min-h-[500px] flex flex-col">
          <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <h2 className="text-xl font-serif text-gray-800 flex items-center gap-2">
              {activeTab === 'catalog' ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  Catálogo de Produtos
                </>
              ) : activeTab === 'inventory' ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Controle de Estoque
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  Histórico de Vendas
                </>
              )}
            </h2>
            
            <div className="flex gap-4 w-full md:w-auto">
              {/* Search Bar */}
              <div className="relative flex-1 md:w-64">
                <input
                  type="text"
                  placeholder="Buscar produto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-black pl-10 pr-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:border-[#5C3342] focus:ring-2 focus:ring-[#5C3342]/20 outline-none transition-all text-sm"
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

            
              {activeTab === 'inventory' && (
                <Button 
                  onClick={handleAddNew}
                  className="shadow-md hover:shadow-lg whitespace-nowrap"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Novo Produto
                </Button>
              )}
            </div>
            
          </div>
          
          {filteredProducts.length === 0 && activeTab !== 'sales' ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-gray-400">
              <div className="bg-gray-50 p-6 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <p className="text-lg font-medium text-gray-500">Nenhum produto encontrado</p>
              <p className="text-sm mt-1">
                {searchTerm ? `Não encontramos nada com "${searchTerm}"` : "Comece adicionando seu primeiro produto!"}
              </p>
              {!searchTerm && activeTab === 'inventory' && (
                <Button onClick={handleAddNew} variant="ghost" className="mt-4 text-[#1d599f]">
                  Adicionar agora
                </Button>
              )}
            </div>
          ) : (
            <>
              {activeTab === 'catalog' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
                  {filteredProducts.map((product) => (
                    <div key={product.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden group flex flex-col relative">
                      <div className="relative aspect-square w-full bg-gray-50 overflow-hidden">
                        {product.image ? (
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                        
                        {/* Ações flutuantes na imagem */}
                        <div className="absolute top-2 right-2 flex gap-2 opacity-100 translate-y-0 md:opacity-0 md:translate-y-2 md:group-hover:opacity-100 md:group-hover:translate-y-0 transition-all duration-300 z-10">
                          <button
                            onClick={() => handleEdit(product)}
                            className="bg-white text-blue-600 p-3 rounded-full shadow-lg hover:bg-blue-50 transition-colors active:scale-95"
                            title="Editar"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="bg-white text-red-600 p-3 rounded-full shadow-lg hover:bg-red-50 transition-colors active:scale-95"
                            title="Excluir"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      
                      <div className="p-4 flex flex-col flex-1">
                        <h3 className="font-serif font-semibold text-gray-800 truncate text-lg mb-1" title={product.name}>{product.name}</h3>
                        <p className="text-[#5C3342] font-medium text-lg">{product.price}</p>
                        <p className="text-xs text-gray-400 mt-2 font-mono">ID: {product.id.slice(0, 8)}...</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : activeTab === 'inventory' ? (
                <>
                  {/* Mobile Card View */}
                  <div className="md:hidden grid grid-cols-1 gap-4 p-4">
                    {filteredProducts.map((product) => {
                      const stock = product.stock || 0;
                      const price = parseFloat(product.price.replace('R$', '').replace('.', '').replace(',', '.').trim()) || 0;
                      const totalValue = (price * stock).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                      
                      let statusColor = 'bg-green-100 text-green-800';
                      let statusText = 'Em Estoque';
                      
                      if (stock === 0) {
                        statusColor = 'bg-red-100 text-red-800';
                        statusText = 'Esgotado';
                      } else if (stock < 3) {
                        statusColor = 'bg-yellow-100 text-yellow-800';
                        statusText = 'Baixo Estoque';
                      }

                      return (
                        <div key={product.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col gap-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                                {product.image && (
                                  <Image src={product.image} alt={product.name} fill className="object-cover" />
                                )}
                              </div>
                              <div>
                                <h3 className="font-medium text-gray-900">{product.name}</h3>
                                <p className="text-[#5C3342] font-medium">{product.price}</p>
                              </div>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${statusColor}`}>
                              {statusText}
                            </span>
                          </div>

                          <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500 uppercase font-bold">Vitrine</span>
                              <button
                                onClick={() => handleToggleShowcase(product)}
                                className={`mt-1 relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                                  product.inShowcase ? 'bg-[#5C3342]' : 'bg-gray-300'
                                }`}
                              >
                                <span className={`${product.inShowcase ? 'translate-x-4' : 'translate-x-1'} inline-block h-3 w-3 transform rounded-full bg-white transition-transform`} />
                              </button>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className="text-xs text-gray-500 uppercase font-bold">Total</span>
                              <span className="font-medium text-gray-700">{totalValue}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-3 pt-2 border-t border-gray-100">
                            <div className="flex items-center gap-2 bg-gray-100 rounded-full px-2 py-1">
                              <button onClick={() => handleUpdateStock(product, -1)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-gray-600 shadow-sm hover:text-red-600 active:scale-95">-</button>
                              <span className="w-8 text-center font-medium text-gray-700">{stock}</span>
                              <button onClick={() => handleUpdateStock(product, 1)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-gray-600 shadow-sm hover:text-green-600 active:scale-95">+</button>
                            </div>
                            <button
                              onClick={() => handleRegisterSale(product)}
                              className="flex-1 bg-green-600 text-white py-2 rounded-full text-sm font-bold shadow-md hover:bg-green-700 active:scale-95 transition-all"
                            >
                              VENDER
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                        <th className="p-4 cursor-pointer hover:text-gray-700" onClick={() => setSortBy('name')}>
                          Produto {sortBy === 'name' && '↓'}
                        </th>
                        <th className="p-4 text-center">Status</th>
                        <th className="p-4 text-center">Vitrine</th>
                        <th className="p-4 text-center cursor-pointer hover:text-gray-700" onClick={() => setSortBy(sortBy === 'stock_asc' ? 'stock_desc' : 'stock_asc')}>
                          Em Estoque {sortBy === 'stock_asc' ? '↑' : sortBy === 'stock_desc' ? '↓' : ''}
                        </th>
                        <th className="p-4 text-center">Valor Total</th>
                        <th className="p-4 text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredProducts.map((product) => {
                        const stock = product.stock || 0;
                        const price = parseFloat(product.price.replace('R$', '').replace('.', '').replace(',', '.').trim()) || 0;
                        const totalValue = (price * stock).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                        
                        let statusColor = 'bg-green-100 text-green-800';
                        let statusText = 'Em Estoque';
                        
                        if (stock === 0) {
                          statusColor = 'bg-red-100 text-red-800';
                          statusText = 'Esgotado';
                        } else if (stock < 3) {
                          statusColor = 'bg-yellow-100 text-yellow-800';
                          statusText = 'Baixo Estoque';
                        }

                        return (
                          <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-4">
                                <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                                  {product.image && (
                                    <Image
                                      src={product.image}
                                      alt={product.name}
                                      fill
                                      className="object-cover"
                                    />
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-800">{product.name}</p>
                                  <p className="text-xs text-gray-400 font-mono">{product.id.slice(0, 8)}...</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-center">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
                                {statusText}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <button
                                onClick={() => handleToggleShowcase(product)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#5C3342] focus:ring-offset-2 ${
                                  product.inShowcase ? 'bg-[#5C3342]' : 'bg-gray-200'
                                }`}
                                title={product.inShowcase ? 'Remover da Vitrine' : 'Adicionar à Vitrine'}
                              >
                                <span
                                  className={`${
                                    product.inShowcase ? 'translate-x-6' : 'translate-x-1'
                                  } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                                />
                              </button>
                            </td>
                            <td className="p-4 text-center">
                              <span className="font-medium text-gray-700">{stock} unid.</span>
                            </td>
                            <td className="p-4 text-center text-gray-600 font-medium">
                              {totalValue}
                            </td>
                            <td className="p-4">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleUpdateStock(product, -1)}
                                  className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
                                  title="Diminuir estoque"
                                >
                                  -
                                </button>
                                <button
                                  onClick={() => handleUpdateStock(product, 1)}
                                  className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:bg-green-50 hover:text-green-600 hover:border-green-200 transition-all"
                                  title="Aumentar estoque"
                                >
                                  +
                                </button>
                                <button
                                  onClick={() => handleRegisterSale(product)}
                                  className="ml-2 px-3 py-1 text-xs font-bold text-white bg-green-600 rounded-full hover:bg-green-700 transition-colors shadow-sm"
                                  title="Registrar Venda (Baixa 1 unidade)"
                                >
                                  VENDER
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                </>
              ) : (
                <>
                  {/* Mobile Card View */}
                  <div className="md:hidden grid grid-cols-1 gap-4 p-4">
                    {sales.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">Nenhuma venda registrada ainda.</div>
                    ) : (
                      sales.map((sale) => (
                        <div key={sale.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col gap-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium text-gray-900">{sale.productName}</h3>
                              <p className="text-xs text-gray-500">
                                {sale.date?.toDate().toLocaleDateString('pt-BR')} às {sale.date?.toDate().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                            <span className="text-green-600 font-bold bg-green-50 px-2 py-1 rounded-lg text-sm">
                              {sale.totalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </span>
                          </div>
                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50 text-sm text-gray-600">
                            <span>Quantidade:</span>
                            <span className="font-medium">{sale.quantity} unid.</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                        <th className="p-4">Data</th>
                        <th className="p-4">Produto</th>
                        <th className="p-4 text-center">Qtd</th>
                        <th className="p-4 text-center">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {sales.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="p-8 text-center text-gray-500">
                            Nenhuma venda registrada ainda.
                          </td>
                        </tr>
                      ) : (
                        sales.map((sale) => (
                          <tr key={sale.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="p-4 text-gray-500 text-sm">
                              {sale.date?.toDate().toLocaleDateString('pt-BR')} <span className="text-xs text-gray-400">{sale.date?.toDate().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                            </td>
                            <td className="p-4 font-medium text-gray-800">
                              {sale.productName}
                            </td>
                            <td className="p-4 text-center text-gray-600">
                              {sale.quantity}
                            </td>
                            <td className="p-4 text-center font-medium text-green-600">
                              {sale.totalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
