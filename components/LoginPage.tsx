import React, { useState, FormEvent } from 'react';
import { MemberProfile, Role } from '../types';

type LoginData = { email: string; password?: string };
type RegisterData = Omit<MemberProfile, 'id' | 'avatarUrl' | 'fees' | 'role' | 'joinDate'>;

interface LoginPageProps {
  onLogin: (data: LoginData) => boolean;
  onRegister: (data: RegisterData) => void;
  registrationSuccess: boolean;
  logoUrl?: string;
  headerTitle: string;
}

export const LoginPage: React.FC<LoginPageProps> = ({ 
  onLogin, 
  onRegister, 
  registrationSuccess, 
  logoUrl, 
  headerTitle 
}) => {
  const [view, setView] = useState<'login' | 'register'>('login');
  const [error, setError] = useState('');

  // LOGIN states
  const [loginEmail, setLoginEmail] = useState('admin@community.com');
  const [loginPassword, setLoginPassword] = useState('senha123');
  
  // REGISTER states
  const [registerData, setRegisterData] = useState({
    name: '',
    cpf: '',
    address: '',
    phone: '',
    email: '',
    password: ''
  });

  // ========== FUNÇÃO DE LOGIN ATUALIZADA ==========
 // ========== FUNÇÃO DE LOGIN CORRIGIDA ==========
const handleLoginSubmit = async (e: FormEvent) => {
  e.preventDefault();
  setError('');
  
  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: loginEmail, 
        senha: loginPassword // A API usa "senha", não "password"
      })
    });
    
    const data = await response.json();
    
    if (data.sucesso) {
      console.log('✅ Login bem-sucedido:', data.usuario);
      
      // Chamar onLogin com os dados corretos
      const success = onLogin({ email: loginEmail, password: loginPassword });
      
      if (!success) {
        // Se onLogin retornar false, mostrar erro
        setError('Erro ao processar login. Tente novamente.');
      }
      // Se success === true, o onLogin deve redirecionar automaticamente
    } else {
      setError(data.mensagem || 'Email ou senha inválidos');
    }
  } catch (erro) {
    console.error('Erro ao fazer login:', erro);
    setError('Erro ao conectar com servidor');
  }
};

  
  // ========== FUNÇÃO DE CADASTRO ATUALIZADA ==========
  const handleRegisterSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // Validações
    if (!registerData.name || !registerData.email || !registerData.password) {
      setError('Por favor, preencha nome, email e senha');
      return;
    }

    if (registerData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    try {
      const response = await fetch('/api/registrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: registerData.name,      // Mapear name → nome
          email: registerData.email,
          senha: registerData.password,  // Mapear password → senha
          cpf: registerData.cpf,
          endereco: registerData.address, // Mapear address → endereco
          telefone: registerData.phone    // Mapear phone → telefone
        })
      });

      const data = await response.json();

      if (data.sucesso) {
        alert('✅ ' + data.mensagem);
        console.log('Usuário criado:', data.usuario);
        
        // Resetar form e voltar para login
        setRegisterData({
          name: '',
          cpf: '',
          address: '',
          phone: '',
          email: '',
          password: ''
        });
        setView('login');
        setError('');
      } else {
        setError(data.mensagem || 'Erro ao criar conta');
      }
    } catch (erro) {
      console.error('Erro ao cadastrar:', erro);
      setError('Erro ao conectar com servidor');
    }
  };

  const handleRegisterInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterData(prev => ({ ...prev, [name]: value }));
  };

  // ========== RENDERIZAR LOGIN ==========
  const renderLogin = () => (
    <form onSubmit={handleLoginSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      <div>
        <label htmlFor="email-login" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input 
          type="email" 
          id="email-login" 
          value={loginEmail} 
          onChange={e => setLoginEmail(e.target.value)} 
          required 
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light" 
        />
      </div>
      
      <div>
        <label htmlFor="password-login" className="block text-sm font-medium text-gray-700">
          Senha
        </label>
        <input 
          type="password" 
          id="password-login" 
          value={loginPassword} 
          onChange={e => setLoginPassword(e.target.value)} 
          required 
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light" 
        />
      </div>
      
      <button 
        type="submit" 
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light"
      >
        Entrar
      </button>
      
      <p className="text-center text-sm">
        Não tem uma conta?{' '}
        <button 
          type="button" 
          onClick={() => { setView('register'); setError(''); }} 
          className="font-medium text-primary hover:text-primary-light"
        >
          Cadastre-se
        </button>
      </p>
    </form>
  );

  // ========== RENDERIZAR CADASTRO ==========
  const renderRegister = () => (
    <form onSubmit={handleRegisterSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {registrationSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          Cadastro realizado com sucesso! Faça login para continuar.
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Nome Completo *
        </label>
        <input 
          type="text" 
          id="name" 
          name="name"
          value={registerData.name} 
          onChange={handleRegisterInputChange}
          required 
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light" 
        />
      </div>

      <div>
        <label htmlFor="email-register" className="block text-sm font-medium text-gray-700">
          Email *
        </label>
        <input 
          type="email" 
          id="email-register" 
          name="email"
          value={registerData.email} 
          onChange={handleRegisterInputChange}
          required 
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light" 
        />
      </div>

      <div>
        <label htmlFor="password-register" className="block text-sm font-medium text-gray-700">
          Senha * (mín. 6 caracteres)
        </label>
        <input 
          type="password" 
          id="password-register" 
          name="password"
          value={registerData.password} 
          onChange={handleRegisterInputChange}
          required
          minLength={6}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light" 
        />
      </div>

      <div>
        <label htmlFor="cpf" className="block text-sm font-medium text-gray-700">
          CPF
        </label>
        <input 
          type="text" 
          id="cpf" 
          name="cpf"
          value={registerData.cpf} 
          onChange={handleRegisterInputChange}
          maxLength={14}
          placeholder="000.000.000-00"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light" 
        />
      </div>

      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700">
          Endereço
        </label>
        <input 
          type="text" 
          id="address" 
          name="address"
          value={registerData.address} 
          onChange={handleRegisterInputChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light" 
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
          Telefone
        </label>
        <input 
          type="tel" 
          id="phone" 
          name="phone"
          value={registerData.phone} 
          onChange={handleRegisterInputChange}
          maxLength={20}
          placeholder="(00) 00000-0000"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light" 
        />
      </div>

      <button 
        type="submit" 
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light"
      >
        Criar Conta
      </button>

      <p className="text-center text-sm">
        Já tem uma conta?{' '}
        <button 
          type="button" 
          onClick={() => { setView('login'); setError(''); }} 
          className="font-medium text-primary hover:text-primary-light"
        >
          Fazer login
        </button>
      </p>
    </form>
  );

  // ========== RENDER PRINCIPAL ==========
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light to-primary flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          {logoUrl && <img src={logoUrl} alt="Logo" className="mx-auto h-16 mb-4" />}
          <h1 className="text-3xl font-bold text-gray-900">{headerTitle}</h1>
          <p className="text-gray-600 mt-2">
            {view === 'login' ? 'Bem-vindo(a) de volta!' : 'Crie sua conta de associado'}
          </p>
        </div>

        {view === 'login' ? renderLogin() : renderRegister()}
      </div>
    </div>
  );
};
