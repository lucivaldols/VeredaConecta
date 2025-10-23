import React, { useContext, useState } from 'react';
import { AppContext, AppContextType } from '../App';
import { Card } from './Card';
import { SettingsType } from '../types';

export const Settings: React.FC = () => {
    const context = useContext(AppContext) as AppContextType;
    const { settings, updateSettings } = context;

    const [localSettings, setLocalSettings] = useState<SettingsType>(settings);

    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>, colorName: 'primary' | 'accent' | 'headerBgColor') => {
        setLocalSettings(prev => ({
            ...prev,
            themeColors: {
                ...prev.themeColors,
                [colorName]: e.target.value,
            }
        }));
    };

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, fieldName: 'headerTitle' | 'welcomeMessage') => {
        setLocalSettings(prev => ({
            ...prev,
            customTexts: {
                ...prev.customTexts,
                [fieldName]: e.target.value,
            }
        }));
    };
    
    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setLocalSettings(prev => ({
            ...prev,
            language: e.target.value as 'pt-BR' | 'en-US',
        }));
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setLocalSettings(prev => ({
                    ...prev,
                    logoUrl: reader.result as string
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'email' | 'phone') => {
        setLocalSettings(prev => ({
            ...prev,
            contactInfo: {
                ...prev.contactInfo,
                [fieldName]: e.target.value,
            }
        }));
    }

    const handleSaveChanges = () => {
        updateSettings(localSettings);
        alert('Configurações salvas com sucesso!');
    };
    
    const handleResetChanges = () => {
        setLocalSettings(settings);
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-primary-dark">Configurações Gerais</h1>
            <p className="text-gray-600">Personalize a aparência, idioma e comunicação do aplicativo.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <Card title="Identidade Visual">
                    <div className="space-y-6">
                        <div>
                            <label htmlFor="logoUpload" className="block text-sm font-medium text-gray-700 mb-2">Logo da Associação (.png)</label>
                            <input
                                type="file"
                                id="logoUpload"
                                accept=".png,image/png"
                                onChange={handleLogoChange}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                            />
                        </div>
                        {localSettings.logoUrl && (
                            <div>
                                <p className="text-sm text-gray-500 mb-2">Pré-visualização do Logo:</p>
                                <div className="p-4 border rounded-lg flex justify-center bg-gray-100">
                                    <img src={localSettings.logoUrl} alt="Pré-visualização do Logo" className="h-16 object-contain" />
                                </div>
                            </div>
                        )}
                    </div>
                </Card>
                <Card title="Aparência do Tema">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label htmlFor="primaryColor" className="font-medium text-gray-700">Cor Principal</label>
                            <div className="flex items-center gap-2 border p-1 rounded-md">
                               <span>{localSettings.themeColors.primary}</span>
                               <input
                                    type="color"
                                    id="primaryColor"
                                    value={localSettings.themeColors.primary}
                                    onChange={(e) => handleColorChange(e, 'primary')}
                                    className="w-8 h-8 border-none"
                                />
                            </div>
                        </div>
                         <div className="flex items-center justify-between">
                            <label htmlFor="accentColor" className="font-medium text-gray-700">Cor de Destaque</label>
                             <div className="flex items-center gap-2 border p-1 rounded-md">
                               <span>{localSettings.themeColors.accent}</span>
                                <input
                                    type="color"
                                    id="accentColor"
                                    value={localSettings.themeColors.accent}
                                    onChange={(e) => handleColorChange(e, 'accent')}
                                    className="w-8 h-8 border-none"
                                />
                            </div>
                        </div>
                         <div className="flex items-center justify-between">
                            <label htmlFor="headerBgColor" className="font-medium text-gray-700">Cor de Fundo do Cabeçalho</label>
                             <div className="flex items-center gap-2 border p-1 rounded-md">
                               <span>{localSettings.themeColors.headerBgColor}</span>
                                <input
                                    type="color"
                                    id="headerBgColor"
                                    value={localSettings.themeColors.headerBgColor}
                                    onChange={(e) => handleColorChange(e, 'headerBgColor')}
                                    className="w-8 h-8 border-none"
                                />
                            </div>
                        </div>
                         <div>
                            <p className="text-sm text-gray-500 mb-2">Pré-visualização:</p>
                            <div className="flex flex-col gap-2 p-4 border rounded-lg">
                                 <div className="w-full h-10 rounded" style={{ backgroundColor: localSettings.themeColors.headerBgColor }}></div>
                                <div className="flex gap-2">
                                     <div className="w-1/2 h-10 rounded" style={{ backgroundColor: localSettings.themeColors.primary }}></div>
                                     <div className="w-1/2 h-10 rounded" style={{ backgroundColor: localSettings.themeColors.accent }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
                <Card title="Idioma e Textos">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="language" className="block text-sm font-medium text-gray-700">Idioma da Interface</label>
                            <select 
                                id="language" 
                                value={localSettings.language}
                                onChange={handleLanguageChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light"
                            >
                                <option value="pt-BR">Português (Brasil)</option>
                                <option value="en-US">English (United States)</option>
                            </select>
                        </div>
                         <div>
                            <label htmlFor="headerTitle" className="block text-sm font-medium text-gray-700">Título Global (se não houver logo)</label>
                            <input
                                type="text"
                                id="headerTitle"
                                value={localSettings.customTexts.headerTitle}
                                onChange={(e) => handleTextChange(e, 'headerTitle')}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light"
                            />
                        </div>
                        <div>
                            <label htmlFor="welcomeMessage" className="block text-sm font-medium text-gray-700">Mensagem de Boas-vindas (Dashboard do Associado)</label>
                            <textarea
                                id="welcomeMessage"
                                rows={4}
                                value={localSettings.customTexts.welcomeMessage}
                                placeholder="Deixe em branco para usar a mensagem padrão."
                                onChange={(e) => handleTextChange(e, 'welcomeMessage')}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light"
                            />
                        </div>
                    </div>
                </Card>

                <Card title="Informações de Contato">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">Email Oficial da Associação</label>
                            <input
                                type="email"
                                id="contactEmail"
                                value={localSettings.contactInfo.email}
                                onChange={(e) => handleContactChange(e, 'email')}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light"
                            />
                        </div>
                        <div>
                            <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700">Telefone Oficial da Associação</label>
                            <input
                                type="tel"
                                id="contactPhone"
                                value={localSettings.contactInfo.phone}
                                onChange={(e) => handleContactChange(e, 'phone')}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light"
                            />
                        </div>
                    </div>
                </Card>
            </div>
             <div className="flex justify-end gap-4 mt-8">
                <button
                    onClick={handleResetChanges}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-lg transition duration-300"
                >
                    Descartar
                </button>
                <button
                    onClick={handleSaveChanges}
                    className="bg-success hover:bg-success/80 text-white font-bold py-2 px-6 rounded-lg transition duration-300"
                >
                    Salvar Alterações
                </button>
            </div>
        </div>
    );
};