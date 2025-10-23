import React, { useState, useContext, FormEvent, useEffect } from 'react';
import { Modal } from './Modal';
import { AppContext, AppContextType } from '../App';
import { BankAccount } from '../types';

interface EditAccountModalProps {
    isOpen: boolean;
    onClose: () => void;
    account: BankAccount;
}

export const EditAccountModal: React.FC<EditAccountModalProps> = ({ isOpen, onClose, account }) => {
    const context = useContext(AppContext) as AppContextType;
    const { updateBankAccount } = context;

    const [formData, setFormData] = useState<BankAccount>(account);

    useEffect(() => {
        setFormData(account);
    }, [account]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        updateBankAccount(formData);
        onClose();
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Editar Conta Bancária">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome da Conta</label>
                    <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light" />
                </div>
                 <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700">Tipo da Conta</label>
                    <input type="text" name="type" id="type" value={formData.type} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="agency" className="block text-sm font-medium text-gray-700">Agência</label>
                        <input type="text" name="agency" id="agency" value={formData.agency} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light" />
                    </div>
                     <div>
                        <label htmlFor="account" className="block text-sm font-medium text-gray-700">Conta</label>
                        <input type="text" name="account" id="account" value={formData.account} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light" />
                    </div>
                </div>
                <div className="flex justify-end pt-4">
                    <button type="button" onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg mr-2 transition duration-300">Cancelar</button>
                    <button type="submit" className="bg-primary hover:bg-primary-light text-white font-bold py-2 px-4 rounded-lg transition duration-300">Salvar Alterações</button>
                </div>
            </form>
        </Modal>
    );
};