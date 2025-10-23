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

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onRegister, registrationSuccess, logoUrl, headerTitle }) => {
  const [view, setView] = useState<'login' | 'register'>('login');
  const [error, setError] = useState('');

  // Form states
  const [loginEmail, setLoginEmail] = useState('admin@community.com');
  const [loginPassword, setLoginPassword] = useState('password123');
  
  const initialRegisterState = {
      name: '',
      cpf: '',
      address: '',
      phone: '',
      email: '',
      password: ''
  };
  const [registerData, setRegisterData] = useState<RegisterData>(initialRegisterState);

  const handleLoginSubmit = (e: FormEvent) => {
    e.preventDefault();
    const success = onLogin({ email: loginEmail, password: loginPassword });
    if (!success) {
      setError('Email ou senha inválidos. Tente novamente.');
    } else {
      setError('');
    }
  };
  
  const handleRegisterSubmit = (e: FormEvent) => {
    e.preventDefault();
    if(registerData.password && registerData.password.length < 6) {
        setError('A senha deve ter pelo menos 6 caracteres.');
        return;
    }
    onRegister(registerData);
    setRegisterData(initialRegisterState);
    setView('login');
    setError('');
  };

  const handleRegisterInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setRegisterData(prev => ({ ...prev, [name]: value }));
  }

  const renderLogin = () => (
    <form onSubmit={handleLoginSubmit} className="space-y-4">
      <div>
        <label htmlFor="email-login" className="block text-sm font-medium text-gray-700">Email</label>
        <input type="email" id="email-login" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light" />
      </div>
      <div>
        <label htmlFor="password-login" className="block text-sm font-medium text-gray-700">Senha</label>
        <input type="password" id="password-login" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light" />
      </div>
      <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light">
        Entrar
      </button>
      <p className="text-center text-sm">
        Não tem uma conta?{' '}
        <button type="button" onClick={() => { setView('register'); setError(''); }} className="font-medium text-primary hover:text-primary-light">
          Cadastre-se
        </button>
      </p>
    </form>
  );

  const renderRegister = () => (
    <form onSubmit={handleRegisterSubmit} className="space-y-3">
        <input type="text" name="name" placeholder="Nome Completo" value={registerData.name} onChange={handleRegisterInputChange} required className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light" />
        <input type="email" name="email" placeholder="Email" value={registerData.email} onChange={handleRegisterInputChange} required className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light" />
        <input type="password" name="password" placeholder="Senha (mín. 6 caracteres)" value={registerData.password} onChange={handleRegisterInputChange} required className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light" />
        <input type="text" name="cpf" placeholder="CPF" value={registerData.cpf} onChange={handleRegisterInputChange} required className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light" />
        <input type="text" name="address" placeholder="Endereço" value={registerData.address} onChange={handleRegisterInputChange} required className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light" />
        <input type="tel" name="phone" placeholder="Telefone" value={registerData.phone} onChange={handleRegisterInputChange} required className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light" />
        
        <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent hover:bg-accent/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent">
            Criar Conta
        </button>
        <p className="text-center text-sm">
            Já tem uma conta?{' '}
            <button type="button" onClick={() => { setView('login'); setError(''); }} className="font-medium text-primary hover:text-primary-light">
            Faça login
            </button>
        </p>
    </form>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 space-y-6">
        <div className="text-center">
            <div className="flex flex-col justify-center items-center gap-2 mb-4">
                {logoUrl && (
                    <img src={logoUrl} alt="Logo da Associação" className="h-12 object-contain"/>
                )}
                <h1 className="text-3xl font-bold text-primary-dark">{headerTitle}</h1>
            </div>
            <p className="text-gray-500 mt-2">
                {view === 'login' ? 'Bem-vindo(a) de volta!' : 'Crie sua conta de associado'}
            </p>
        </div>
        
        {error && <p className="text-center text-sm text-danger bg-danger/10 p-2 rounded-md">{error}</p>}
        {registrationSuccess && view === 'login' && <p className="text-center text-sm text-success bg-success/10 p-2 rounded-md">Cadastro realizado com sucesso! Faça login para continuar.</p>}

        {view === 'login' ? renderLogin() : renderRegister()}
      </div>
    </div>
  );
  // src/components/Login.jsx (exemplo React)
async function handleLogin(e) {
  e.preventDefault();
  
  const response = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      email: loginEmail, 
      senha: loginPassword 
    })
  });

  const data = await response.json();
  
  if (data.sucesso) {
    console.log('Login bem-sucedido:', data.usuario);
    // Redirecionar ou salvar sessão
    localStorage.setItem('usuario', JSON.stringify(data.usuario));
    window.location.href = '/dashboard';
  } else {
    alert(data.mensagem);
  }
}

};