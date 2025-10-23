import React, { useState, createContext, useContext, useEffect } from 'react';
import { HomeIcon } from './components/icons/HomeIcon';
import { UserIcon } from './components/icons/UserIcon';
import { ProjectIcon } from './components/icons/ProjectIcon';
import { FinanceIcon } from './components/icons/FinanceIcon';
import { UsersIcon } from './components/icons/UsersIcon';
import { ChatIcon } from './components/icons/ChatIcon';
import { SparklesIcon } from './components/icons/SparklesIcon';
import { CogIcon } from './components/icons/CogIcon';
import { Dashboard } from './components/Dashboard';
import { MemberProfile } from './components/MemberProfile';
import { Projects } from './components/Projects';
import { Financials } from './components/Financials';
import { Members } from './components/Members';
import { Chat } from './components/Chat';
import { Creative } from './components/Creative';
import { Settings } from './components/Settings';
import { Role, MemberProfile as MemberProfileType, FeeStatus, Project, BankAccount, Transaction, ChatMessage, CreativeHistoryItem, SettingsType, Language } from './types';
import { INITIAL_USERS, INITIAL_PROJECTS, INITIAL_BANK_ACCOUNTS, INITIAL_TRANSACTIONS, INITIAL_CHAT_MESSAGES } from './constants';
import { LoginPage } from './components/LoginPage';
import { getTranslator } from './lib/i18n';


type Page = 'dashboard' | 'profile' | 'projects' | 'financials' | 'members' | 'chat' | 'creative' | 'settings';

type LoginData = { email: string; password?: string };
type RegisterData = Omit<MemberProfileType, 'id' | 'avatarUrl' | 'fees' | 'role' | 'joinDate'>;

export interface AppContextType {
  currentUser: MemberProfileType | null;
  setCurrentUser: (user: MemberProfileType | null) => void;
  users: MemberProfileType[];
  addUser: (user: Omit<MemberProfileType, 'id' | 'avatarUrl' | 'fees' | 'password'>) => void;
  updateUser: (updatedUser: MemberProfileType) => void;
  projects: Project[];
  addProject: (project: Omit<Project, 'id' | 'files'>) => void;
  updateProject: (updatedProject: Project) => void;
  bankAccounts: BankAccount[];
  updateBankAccount: (updatedAccount: BankAccount) => void;
  membershipFeeAmount: number;
  updateMembershipFeeAmount: (newAmount: number) => void;
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  pixKey: string;
  updatePixKey: (newKey: string) => void;
  chatMessages: ChatMessage[];
  addChatMessage: (text: string) => void;
  creativeHistory: CreativeHistoryItem[];
  addCreativeHistoryItem: (item: Omit<CreativeHistoryItem, 'id' | 'timestamp'>) => void;
  setActivePage: (page: Page) => void;
  settings: SettingsType;
  updateSettings: (newSettings: Partial<SettingsType>) => void;
  t: (key: string) => string;
}

export const AppContext = createContext<AppContextType | null>(null);

const NavItem = ({ icon, label, isActive, onClick }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) => (
    <button onClick={onClick} className={`flex flex-col items-center justify-center space-y-1 w-full md:w-auto md:flex-row md:space-y-0 md:space-x-2 md:px-4 py-2 rounded-lg transition-colors duration-200 ${isActive ? 'bg-primary-light text-white' : 'text-gray-300 hover:bg-primary-light/50 hover:text-white'}`}>
        {icon}
        <span className="text-xs md:text-sm font-medium">{label}</span>
    </button>
);

// Helper to convert hex to RGB values
const hexToRgb = (hex: string): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}` : '0 0 0';
};

const App: React.FC = () => {
    const [users, setUsers] = useState<MemberProfileType[]>(INITIAL_USERS);
    const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
    const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(INITIAL_BANK_ACCOUNTS);
    const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
    const [creativeHistory, setCreativeHistory] = useState<CreativeHistoryItem[]>([]);
    const [membershipFeeAmount, setMembershipFeeAmount] = useState<number>(50);
    const [pixKey, setPixKey] = useState<string>('financeiro@community.com');
    const [currentUser, setCurrentUser] = useState<MemberProfileType | null>(null);
    const [activePage, setActivePage] = useState<Page>('dashboard');
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [registrationSuccess, setRegistrationSuccess] = useState<boolean>(false);
    
    const [settings, setSettings] = useState<SettingsType>({
        themeColors: {
            primary: '#005f73',
            accent: '#ee9b00',
            headerBgColor: '#003e4d',
        },
        language: 'pt-BR',
        customTexts: {
            headerTitle: 'Community Connect',
            welcomeMessage: '',
        },
        logoUrl: undefined,
        contactInfo: {
            email: 'contato@associacao.com',
            phone: '(00) 12345-6789',
        }
    });

    useEffect(() => {
        const root = document.documentElement;
        root.style.setProperty('--color-primary', hexToRgb(settings.themeColors.primary));
        root.style.setProperty('--color-primary-light', hexToRgb('#0a9396')); // This could be calculated for more dynamic themes
        root.style.setProperty('--color-primary-dark', hexToRgb('#003e4d')); // This could be calculated
        root.style.setProperty('--color-accent', hexToRgb(settings.themeColors.accent));
    }, [settings.themeColors]);
    
    const t = getTranslator(settings.language, settings.customTexts);

    const updateSettings = (newSettings: Partial<SettingsType>) => {
        setSettings(prev => ({
            ...prev,
            ...newSettings,
            themeColors: { ...prev.themeColors, ...newSettings.themeColors },
            customTexts: { ...prev.customTexts, ...newSettings.customTexts },
            contactInfo: { ...prev.contactInfo, ...newSettings.contactInfo },
        }));
    };

    const handleLogin = (data: LoginData): boolean => {
        // ✅ CORREÇÃO: Não validar novamente - a API já validou
        const tempUser: MemberProfileType = {
            id: Date.now(),
            name: data.email.split('@')[0],
            email: data.email,
            password: data.password || '',
            cpf: '',
            address: '',
            phone: '',
role: data.role || Role.Member,  // ⭐ USAR role da API            joinDate: new Date().toISOString().split('T')[0],
            avatarUrl: `https://ui-avatars.com/api/?name=${data.email}&background=0a9396&color=fff`,
            bannerUrl: 'https://picsum.photos/1000/300',
            fees: []
        };
        
        setCurrentUser(tempUser);
        setIsAuthenticated(true);
        setActivePage('dashboard');
        setRegistrationSuccess(false);
console.log('✅ Usuário autenticado com role:', tempUser.role);        return true;
    };

    const handleLogout = () => {
        setCurrentUser(null);
        setIsAuthenticated(false);
    };

    const handleRegister = (newUserData: RegisterData) => {
        const newUser: MemberProfileType = {
            ...newUserData,
            id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
            role: Role.Member,
            joinDate: new Date().toISOString().split('T')[0],
            avatarUrl: `https://picsum.photos/seed/member${Date.now()}/200`,
            bannerUrl: `https://picsum.photos/seed/banner${Date.now()}/1000/300`,
            fees: [
                { month: 'Janeiro', year: 2024, status: FeeStatus.Pending, amount: membershipFeeAmount },
                { month: 'Fevereiro', year: 2024, status: FeeStatus.Pending, amount: membershipFeeAmount },
                { month: 'Março', year: 2024, status: FeeStatus.Pending, amount: membershipFeeAmount },
            ],
        };
        setUsers(prevUsers => [...prevUsers, newUser]);
        setRegistrationSuccess(true);
    };
    
    const addUser = (newUserData: Omit<MemberProfileType, 'id' | 'avatarUrl' | 'fees' | 'password'>) => {
        const newUser: MemberProfileType = {
            ...newUserData,
            id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
            password: 'password123', // Admin-created users get a default password
            avatarUrl: `https://picsum.photos/seed/member${Date.now()}/200`,
             bannerUrl: `https://picsum.photos/seed/banner${Date.now()}/1000/300`,
            fees: [
                { month: 'Janeiro', year: 2024, status: FeeStatus.Pending, amount: membershipFeeAmount },
                { month: 'Fevereiro', year: 2024, status: FeeStatus.Pending, amount: membershipFeeAmount },
                { month: 'Março', year: 2024, status: FeeStatus.Pending, amount: membershipFeeAmount },
            ],
        };
        setUsers(prevUsers => [...prevUsers, newUser]);
    };

     const updateUser = (updatedUser: MemberProfileType) => {
        setUsers(prevUsers => 
            prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u)
        );
        if (currentUser && currentUser.id === updatedUser.id) {
            setCurrentUser(updatedUser);
        }
    };
    
    const addProject = (newProjectData: Omit<Project, 'id' | 'files'>) => {
        const newProject: Project = {
            ...newProjectData,
            id: projects.length > 0 ? Math.max(...projects.map(p => p.id)) + 1 : 1,
            files: [],
        };
        setProjects(prevProjects => [...prevProjects, newProject]);
    };

    const updateProject = (updatedProject: Project) => {
        setProjects(prevProjects => 
            prevProjects.map(p => p.id === updatedProject.id ? updatedProject : p)
        );
    };

    const updateBankAccount = (updatedAccount: BankAccount) => {
        setBankAccounts(prevAccounts =>
            prevAccounts.map(acc => acc.id === updatedAccount.id ? updatedAccount : acc)
        );
    };
    
    const addTransaction = (newTransactionData: Omit<Transaction, 'id'>) => {
        const newTransaction: Transaction = {
            ...newTransactionData,
            id: transactions.length > 0 ? Math.max(...transactions.map(t => t.id)) + 1 : 1,
        };
        setTransactions(prevTransactions => [...prevTransactions, newTransaction]);
    };

    const addChatMessage = (text: string) => {
        if (!currentUser) return;
        const newMessage: ChatMessage = {
            id: chatMessages.length > 0 ? Math.max(...chatMessages.map(m => m.id)) + 1 : 1,
            senderId: currentUser.id,
            senderName: currentUser.name,
            senderAvatarUrl: currentUser.avatarUrl,
            text,
            timestamp: new Date().toISOString(),
        };
        setChatMessages(prevMessages => [...prevMessages, newMessage]);
    };

    const addCreativeHistoryItem = (item: Omit<CreativeHistoryItem, 'id' | 'timestamp'>) => {
        const newHistoryItem: CreativeHistoryItem = {
            ...item,
            id: creativeHistory.length > 0 ? Math.max(...creativeHistory.map(h => h.id)) + 1 : 1,
            timestamp: new Date().toISOString(),
        };
        setCreativeHistory(prev => [newHistoryItem, ...prev]);
    };

    const updateMembershipFeeAmount = (newAmount: number) => {
        setMembershipFeeAmount(newAmount);
    };

    const updatePixKey = (newKey: string) => {
        setPixKey(newKey);
    };

    const renderContent = () => {
        if (!currentUser) {
            return <div className="text-center p-8">Por favor, faça login para continuar.</div>
        }
        switch (activePage) {
            case 'dashboard':
                return <Dashboard />;
            case 'profile':
                return <MemberProfile user={currentUser} />;
            case 'projects':
                return <Projects currentUser={currentUser} />;
            case 'financials':
                return <Financials />;
            case 'members':
                return <Members currentUser={currentUser} />;
            case 'chat':
                return <Chat />;
            case 'creative':
                return <Creative />;
            case 'settings':
                return <Settings />;
            default:
                return <Dashboard />;
        }
    };
    
    if (!isAuthenticated) {
        return <LoginPage onLogin={handleLogin} onRegister={handleRegister} registrationSuccess={registrationSuccess} logoUrl={settings.logoUrl} headerTitle={settings.customTexts.headerTitle} />;
    }

    const hasAdminAccess = currentUser?.role === Role.Admin;
    const hasManagerAccess = hasAdminAccess || currentUser?.role === Role.ProjectManager;

    return (
        <AppContext.Provider value={{ currentUser, setCurrentUser, users, addUser, updateUser, projects, addProject, updateProject, bankAccounts, updateBankAccount, membershipFeeAmount, updateMembershipFeeAmount, transactions, addTransaction, pixKey, updatePixKey, chatMessages, addChatMessage, creativeHistory, addCreativeHistoryItem, setActivePage, settings, updateSettings, t }}>
            <div className="min-h-screen flex flex-col">
                <header className="shadow-md p-4 text-white" style={{ backgroundColor: settings.themeColors.headerBgColor }}>
                    <div className="container mx-auto flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                            {settings.logoUrl && (
                                <img src={settings.logoUrl} alt="Logo da Associação" className="h-10 object-contain"/>
                            )}
                            <h1 className="text-2xl font-bold">{settings.customTexts.headerTitle}</h1>
                        </div>
                        {currentUser && (
                            <div className="flex items-center space-x-4">
                                <div className="text-right hidden sm:block">
                                    <p className="font-semibold">{currentUser.name}</p>
                                    <p className="text-sm text-gray-300">{currentUser.role}</p>
                                </div>
                                <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-10 h-10 rounded-full"/>
                                 <button 
                                    onClick={handleLogout}
                                    className="bg-danger hover:bg-danger/80 text-white font-bold py-2 px-3 rounded-lg text-sm transition duration-300"
                                >
                                    Sair
                                </button>
                            </div>
                        )}
                    </div>
                </header>
                
                <div className="flex-grow flex flex-col md:flex-row">
                    <nav className="bg-primary p-2 md:p-4 md:w-64 order-last md:order-first">
                       <div className="md:space-y-2 flex justify-around md:flex-col">
                            {currentUser && <NavItem icon={<HomeIcon />} label={t('nav.dashboard')} isActive={activePage === 'dashboard'} onClick={() => setActivePage('dashboard')} />}
                            {currentUser && <NavItem icon={<UserIcon />} label={t('nav.profile')} isActive={activePage === 'profile'} onClick={() => setActivePage('profile')} />}
                            {currentUser && <NavItem icon={<ChatIcon />} label={t('nav.chat')} isActive={activePage === 'chat'} onClick={() => setActivePage('chat')} />}
                            {hasAdminAccess && <NavItem icon={<UsersIcon />} label={t('nav.members')} isActive={activePage === 'members'} onClick={() => setActivePage('members')} />}
                            {hasManagerAccess && <NavItem icon={<ProjectIcon />} label={t('nav.projects')} isActive={activePage === 'projects'} onClick={() => setActivePage('projects')} />}
                            {hasManagerAccess && <NavItem icon={<SparklesIcon />} label={t('nav.creative')} isActive={activePage === 'creative'} onClick={() => setActivePage('creative')} />}
                            {hasAdminAccess && <NavItem icon={<FinanceIcon />} label={t('nav.financials')} isActive={activePage === 'financials'} onClick={() => setActivePage('financials')} />}
                            {hasAdminAccess && <NavItem icon={<CogIcon />} label={t('nav.settings')} isActive={activePage === 'settings'} onClick={() => setActivePage('settings')} />}
                       </div>
                    </nav>
                    
                    <main className="flex-grow p-4 md:p-8 bg-gray-100">
                        <div className="container mx-auto">
                           {renderContent()}
                        </div>
                    </main>
                </div>
            </div>
        </AppContext.Provider>
    );
};

export default App;
