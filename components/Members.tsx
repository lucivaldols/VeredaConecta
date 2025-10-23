import React, { useState, useContext, ChangeEvent, FormEvent } from 'react';
import { AppContext, AppContextType } from '../App';
import { Modal } from './Modal';
import { Role, MemberProfile as MemberProfileType, FeeStatus } from '../types';

interface MemberCardProps {
    member: MemberProfileType;
    currentUser: MemberProfileType;
    onRegularize: (member: MemberProfileType) => void;
    onRoleChange: (memberId: number, newRole: Role) => void;
}

const MemberCard = ({ member, currentUser, onRegularize, onRoleChange }: MemberCardProps) => {
    const pendingFeesCount = member.fees.filter(f => f.status === FeeStatus.Pending).length;
    const canManageRole = currentUser.role === Role.Admin && currentUser.id !== member.id;

    return (
        <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col justify-between">
            <div>
                <div className="flex items-center space-x-4">
                    <img src={member.avatarUrl} alt={member.name} className="w-16 h-16 rounded-full flex-shrink-0" />
                    <div className="flex-grow">
                        <h3 className="font-bold text-primary-dark">{member.name}</h3>
                        <p className="text-sm text-gray-600">{member.email}</p>
                        <p className="text-sm text-gray-500">{member.role}</p>
                    </div>
                    <div className="flex flex-col items-end space-y-2 flex-shrink-0">
                        {pendingFeesCount > 0 ? (
                            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-danger/20 text-danger">
                                {pendingFeesCount} pendência(s)
                            </span>
                        ) : (
                             <span className="px-3 py-1 text-xs font-semibold rounded-full bg-success/20 text-success">
                                Em dia
                            </span>
                        )}
                        {pendingFeesCount > 0 && (
                             <button
                                onClick={() => onRegularize(member)}
                                className="bg-accent hover:bg-accent/80 text-white font-bold py-1 px-3 rounded-lg text-sm transition duration-300 whitespace-nowrap"
                            >
                                Regularizar
                            </button>
                        )}
                    </div>
                </div>
            </div>
            {canManageRole && (
                 <div className="mt-4 pt-4 border-t">
                    <label htmlFor={`role-${member.id}`} className="text-xs font-semibold text-gray-500 mb-1 block">
                        Gerenciar Permissão
                    </label>
                    <select
                        id={`role-${member.id}`}
                        value={member.role}
                        onChange={(e) => onRoleChange(member.id, e.target.value as Role)}
                        className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-sm focus:outline-none focus:ring-1 focus:ring-primary-light"
                    >
                        <option value={Role.Member}>Associado</option>
                        <option value={Role.ProjectManager}>Gestor de Projeto</option>
                        <option value={Role.Admin}>Admin</option>
                    </select>
                </div>
            )}
        </div>
    )
}

export const Members: React.FC<{ currentUser: MemberProfileType }> = ({ currentUser }) => {
    const context = useContext(AppContext) as AppContextType;
    const [isModalOpen, setIsModalOpen] = useState(false);

    const initialFormState = {
        name: '',
        cpf: '',
        address: '',
        phone: '',
        email: '',
        role: Role.Member,
    };

    const [newMemberData, setNewMemberData] = useState(initialFormState);

    if (!context) {
        return <div>Carregando...</div>;
    }
    const { users, addUser, setCurrentUser, setActivePage, updateUser } = context;

    const handleRegularizePayment = (memberToView: MemberProfileType) => {
        setCurrentUser(memberToView);
        setActivePage('profile');
    };
    
    const handleRoleChange = (memberId: number, newRole: Role) => {
        const userToUpdate = users.find(u => u.id === memberId);
        if (userToUpdate) {
            updateUser({ ...userToUpdate, role: newRole });
        }
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewMemberData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const memberPayload = {
            ...newMemberData,
            joinDate: new Date().toISOString().split('T')[0],
        }
        addUser(memberPayload);
        setIsModalOpen(false);
        setNewMemberData(initialFormState);
    };

    const canManage = currentUser.role === Role.Admin;

    return (
        <div className="space-y-8">
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Cadastrar Novo Associado">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome Completo</label>
                        <input type="text" name="name" id="name" value={newMemberData.name} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="cpf" className="block text-sm font-medium text-gray-700">CPF</label>
                        <input type="text" name="cpf" id="cpf" value={newMemberData.cpf} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light sm:text-sm" />
                    </div>
                     <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700">Endereço</label>
                        <input type="text" name="address" id="address" value={newMemberData.address} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light sm:text-sm" />
                    </div>
                     <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Telefone</label>
                        <input type="tel" name="phone" id="phone" value={newMemberData.phone} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light sm:text-sm" />
                    </div>
                     <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                        <input type="email" name="email" id="email" value={newMemberData.email} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light sm:text-sm" />
                    </div>
                    <div>
                         <label htmlFor="role" className="block text-sm font-medium text-gray-700">Permissão</label>
                         <select name="role" id="role" value={newMemberData.role} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light sm:text-sm">
                            <option value={Role.Member}>Associado</option>
                            <option value={Role.ProjectManager}>Gestor de Projeto</option>
                            <option value={Role.Admin}>Admin</option>
                         </select>
                    </div>
                    <div className="flex justify-end pt-4">
                         <button type="button" onClick={() => setIsModalOpen(false)} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg mr-2 transition duration-300">Cancelar</button>
                         <button type="submit" className="bg-primary hover:bg-primary-light text-white font-bold py-2 px-4 rounded-lg transition duration-300">Cadastrar</button>
                    </div>
                </form>
            </Modal>

            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-primary-dark">Lista de Associados</h1>
                {canManage && (
                    <button onClick={() => setIsModalOpen(true)} className="bg-primary hover:bg-primary-light text-white font-bold py-2 px-4 rounded-lg transition duration-300">
                        + Novo Associado
                    </button>
                )}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {users.map(member => (
                    <MemberCard 
                        key={member.id} 
                        member={member} 
                        currentUser={currentUser}
                        onRegularize={handleRegularizePayment} 
                        onRoleChange={handleRoleChange}
                    />
                ))}
            </div>
        </div>
    );
};