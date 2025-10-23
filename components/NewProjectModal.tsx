import React, { useState, useContext, FormEvent } from 'react';
import { Modal } from './Modal';
import { AppContext, AppContextType } from '../App';
import { Role, ProjectStatus } from '../types';

interface NewProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({ isOpen, onClose }) => {
    const context = useContext(AppContext) as AppContextType;
    if (!context) return null;
    const { users, addProject, updateUser } = context;

    const initialFormState = {
        name: '',
        description: '',
        managerId: 0,
        startDate: '',
        endDate: '',
        budget: 0,
        status: ProjectStatus.InProgress,
    };
    
    const [formData, setFormData] = useState(initialFormState);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'budget' || name === 'managerId' ? Number(value) : value }));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (new Date(formData.endDate) < new Date(formData.startDate)) {
            setError('A data final não pode ser anterior à data de início.');
            return;
        }
        if (formData.managerId === 0) {
            setError('Por favor, selecione um responsável pelo projeto.');
            return;
        }
        setError('');

        // Promote user to Project Manager if they are a Member
        const selectedManager = users.find(u => u.id === formData.managerId);
        if (selectedManager && selectedManager.role === Role.Member) {
            updateUser({ ...selectedManager, role: Role.ProjectManager });
        }

        addProject(formData);
        onClose();
        setFormData(initialFormState);
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Cadastrar Novo Projeto">
            <form onSubmit={handleSubmit} className="space-y-4">
                 {error && <p className="text-center text-sm text-danger bg-danger/10 p-2 rounded-md">{error}</p>}
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome do Projeto</label>
                    <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light" />
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descrição</label>
                    <textarea name="description" id="description" value={formData.description} onChange={handleChange} required rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light"></textarea>
                </div>
                <div>
                    <label htmlFor="managerId" className="block text-sm font-medium text-gray-700">Responsável</label>
                    <select name="managerId" id="managerId" value={formData.managerId} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light">
                        <option value={0} disabled>Selecione um associado</option>
                        {users.map(user => (
                            <option key={user.id} value={user.id}>{user.name}</option>
                        ))}
                    </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Data de Início</label>
                        <input type="date" name="startDate" id="startDate" value={formData.startDate} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light" />
                    </div>
                     <div>
                        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">Data de Fim</label>
                        <input type="date" name="endDate" id="endDate" value={formData.endDate} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light" />
                    </div>
                </div>
                <div>
                    <label htmlFor="budget" className="block text-sm font-medium text-gray-700">Orçamento (R$)</label>
                    <input type="number" name="budget" id="budget" value={formData.budget} onChange={handleChange} required min="0" step="0.01" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light" />
                </div>
                <div className="flex justify-end pt-4">
                    <button type="button" onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg mr-2 transition duration-300">Cancelar</button>
                    <button type="submit" className="bg-primary hover:bg-primary-light text-white font-bold py-2 px-4 rounded-lg transition duration-300">Cadastrar Projeto</button>
                </div>
            </form>
        </Modal>
    );
};