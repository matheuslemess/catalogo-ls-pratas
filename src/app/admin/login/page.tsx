'use client';
import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import Image from 'next/image';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.push('/admin');
    } catch (err) {
      setError('Credenciais inválidas. Tente novamente.');
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f5f2] relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-[#5C3342]/5 blur-3xl"></div>
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full bg-[#1d599f]/5 blur-3xl"></div>
      </div>

      <div className="bg-white/80 backdrop-blur-lg p-8 md:p-12 rounded-2xl shadow-xl w-full max-w-md z-10 border border-white/50 transition-all duration-500 hover:shadow-2xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-serif text-[#5C3342] mb-2">Bem-vindo</h1>
          <p className="text-gray-500 font-sans text-sm tracking-wide uppercase">Painel Administrativo</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-6 text-center border border-red-100 animate-pulse">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-black px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-[#5C3342] focus:ring-2 focus:ring-[#5C3342]/20 outline-none transition-all duration-300 placeholder-gray-400"
              placeholder="seu@email.com"
              required
            />
          </div>
          
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-black px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-[#5C3342] focus:ring-2 focus:ring-[#5C3342]/20 outline-none transition-all duration-300 placeholder-gray-400"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              fullWidth
              size="lg"
              isLoading={loading}
              className="shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
            >
              Acessar Painel
            </Button>
          </div>
        </form>
        
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} Laureane Simões. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
