export enum Role {
  Admin = 'Admin',
  ProjectManager = 'Gestor de Projeto',
  Member = 'Associado',
}

export enum ProjectStatus {
  InProgress = 'Em andamento',
  Completed = 'Concluído',
  Suspended = 'Suspenso',
}

export enum FeeStatus {
  Paid = 'Paga',
  Pending = 'Pendente',
}

export interface User {
  id: number;
  name: string;
  cpf: string;
  address: string;
  phone: string;
  email: string;
  joinDate: string;
  role: Role;
  avatarUrl: string;
  bannerUrl?: string;
  password?: string;
}

export interface MonthlyFee {
  month: string;
  year: number;
  status: FeeStatus;
  amount: number;
}

export interface MemberProfile extends User {
  fees: MonthlyFee[];
}

export interface Project {
  id: number;
  name: string;
  description: string;
  managerId: number;
  startDate: string;
  endDate: string;
  budget: number;
  status: ProjectStatus;
  files?: string[];
}

export interface Transaction {
  id: number;
  description: string;
  amount: number;
  type: 'Receita' | 'Despesa';
  category: string;
  date: string;
}

export interface BankAccount {
  id: number;
  name: string;
  agency: string;
  account: string;
  type: string;
}

export interface ChatMessage {
  id: number;
  senderId: number;
  senderName: string;
  senderAvatarUrl: string;
  text: string;
  timestamp: string;
}

export interface CreativeHistoryItem {
  id: number;
  type: 'text' | 'image';
  prompt: string;
  result: string; // for text content or base64 data URL for image
  timestamp: string;
}

export type Language = 'pt-BR' | 'en-US';

export interface SettingsType {
    themeColors: {
        primary: string;
        accent: string;
        headerBgColor: string;
    };
    language: Language;
    customTexts: {
        headerTitle: string;
        welcomeMessage: string;
    };
    logoUrl?: string;
    contactInfo: {
        email: string;
        phone: string;
    };
}