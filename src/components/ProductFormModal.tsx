import React, { useState, useEffect } from 'react';
import { db, storage } from '@/lib/firebase';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Image from 'next/image';
import Button from './Button';

type Product = {
  id: string;
  name: string;
  price: string;
  image: string;
};

type ProductFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  productToEdit: Product | null;
  onSuccess: (message: string) => void;
};

export default function ProductFormModal({ isOpen, onClose, productToEdit, onSuccess }: ProductFormModalProps) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (productToEdit) {
        setName(productToEdit.name);
        setPrice(productToEdit.price);
        setImage(productToEdit.image);
      } else {
        setName('');
        setPrice('');
        setImage('');
      }
      setImageFile(null);
      setIsSaving(false);
    }
  }, [isOpen, productToEdit]);

  const formatCurrency = (value: string) => {
    const numericValue = value.replace(/\D/g, "");
    const floatValue = Number(numericValue) / 100;
    return floatValue.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPrice(formatCurrency(value));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      let imageUrl = image;

      if (imageFile) {
        const storageRef = ref(storage, `products/${Date.now()}_${imageFile.name}`);
        const snapshot = await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      if (productToEdit) {
        await updateDoc(doc(db, 'products', productToEdit.id), {
          name,
          price,
          image: imageUrl
        });
        onSuccess('Produto atualizado com sucesso!');
      } else {
        await addDoc(collection(db, 'products'), {
          name,
          price,
          image: imageUrl,
          inShowcase: false,
          createdAt: new Date()
        });
        onSuccess('Produto adicionado com sucesso!');
      }
      onClose();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar produto"); // Fallback, though parent handles toast usually
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-xl font-serif text-[#5C3342] flex items-center gap-2">
            {productToEdit ? 'Editar Produto' : 'Novo Produto'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 ml-1">Nome do Produto</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-black w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-[#5C3342] focus:ring-2 focus:ring-[#5C3342]/20 outline-none transition-all duration-300"
                placeholder="Ex: Anel Solitário"
                required
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 ml-1">Preço</label>
              <input
                type="text"
                value={price}
                onChange={handlePriceChange}
                placeholder="R$ 0,00"
                className="w-full text-black px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-[#5C3342] focus:ring-2 focus:ring-[#5C3342]/20 outline-none transition-all duration-300"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 ml-1">Imagem</label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#5C3342]/10 file:text-[#5C3342] hover:file:bg-[#5C3342]/20 cursor-pointer"
                  required={!productToEdit && !image}
                />
              </div>
              {image && !imageFile && (
                <div className="mt-2 relative h-40 w-full rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                  <Image src={image} alt="Preview" fill className="object-contain" />
                </div>
              )}
            </div>

            <div className="pt-4 flex gap-3">
              <Button
                type="button"
                onClick={onClose}
                variant="ghost"
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                isLoading={isSaving}
                className="flex-1 shadow-lg hover:shadow-xl"
              >
                {productToEdit ? 'Salvar Alterações' : 'Adicionar Produto'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
