import React, { useState, useContext, FormEvent } from 'react';
import { Modal } from './Modal';
import { AppContext, AppContextType } from '../App';
import { Transaction } from '../types';

interface NewTransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const NewTransactionModal: React.FC<NewTransactionModalProps> = ({ isOpen, onClose }) => {
    const context = useContext(AppContext) as AppContextType;
    if (!context) return null;
    const { addTransaction } = context;

    const initialFormState = {
        description: '',
        amount: 0,
        type: 'Receita' as 'Receita' | 'Despesa',
        category: '',
        date: new Date().toISOString().split('T')[0],
    };
    
    const [formData, setFormData] = useState<Omit<Transaction, 'id'>>(initialFormState);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'amount' ? Number(value) : value }));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        addTransaction(formData);
        onClose();
        setFormData(initialFormState);
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Adicionar Nova Transação">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descrição</label>
                    <input type="text" name="description" id="description" value={formData.description} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Valor (R$)</label>
                        <input type="number" name="amount" id="amount" value={formData.amount} onChange={handleChange} required min="0.01" step="0.01" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light" />
                    </div>
                    <div>
                        <label htmlFor="type" className="block text-sm font-medium text-gray-700">Tipo</label>
                        <select name="type" id="type" value={formData.type} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light">
                            <option value="Receita">Receita</option>
                            <option value="Despesa">Despesa</option>
                        </select>
                    </div>
                </div>

                 <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">Categoria</label>
                    <input type="text" name="category" id="category" value={formData.category} onChange={handleChange} required placeholder="Ex: Mensalidades, Doações, Projetos..." className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light" />
                </div>
                
                <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700">Data</label>
                    <input type="date" name="date" id="date" value={formData.date} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light" />
                </div>

                <div className="flex justify-end pt-4">
                    <button type="button" onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg mr-2 transition duration-300">Cancelar</button>
                    <button type="submit" className="bg-primary hover:bg-primary-light text-white font-bold py-2 px-4 rounded-lg transition duration-300">Adicionar Transação</button>
                </div>
            </form>
        </Modal>
    );
};