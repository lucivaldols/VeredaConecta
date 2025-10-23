import React, { useState, useContext, useRef, useEffect } from 'react';
import { MemberProfile as MemberProfileType, FeeStatus } from '../types';
import { Card } from './Card';
import { Modal } from './Modal';
import { AppContext, AppContextType } from '../App';
import { PencilIcon } from './icons/PencilIcon';
import { CameraIcon } from './icons/CameraIcon';

interface MemberProfileProps {
  user: MemberProfileType;
}

const FeeStatusBadge = ({ status }: { status: FeeStatus }) => {
    const baseClasses = "px-3 py-1 text-sm font-semibold rounded-full";
    const statusClasses = {
        [FeeStatus.Paid]: "bg-success/20 text-success",
        [FeeStatus.Pending]: "bg-danger/20 text-danger",
    };
    return <span className={`${baseClasses} ${statusClasses[status]}`}>{status}</span>;
}

export const MemberProfile: React.FC<MemberProfileProps> = ({ user }) => {
    const context = useContext(AppContext) as AppContextType;
    const { updateUser, pixKey } = context;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedFee, setSelectedFee] = useState<{ month: string, amount: number } | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editableUser, setEditableUser] = useState<MemberProfileType>(user);

    const avatarInputRef = useRef<HTMLInputElement>(null);
    const bannerInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setEditableUser(user);
    }, [user]);

    const pendingFees = user.fees.filter(fee => fee.status === FeeStatus.Pending);
    const totalPendingAmount = pendingFees.reduce((sum, fee) => sum + fee.amount, 0);

    const handleGeneratePix = (month: string, amount: number) => {
        setSelectedFee({ month, amount });
        setIsModalOpen(true);
    };

    const handleGeneratePixForAll = () => {
        setSelectedFee({ month: 'Todas as Pendências', amount: totalPendingAmount });
        setIsModalOpen(true);
    };

    const handleEditToggle = () => {
        if (isEditing) {
            setEditableUser(user);
        }
        setIsEditing(!isEditing);
    };

    const handleSave = () => {
        updateUser(editableUser);
        setIsEditing(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEditableUser(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'avatarUrl' | 'bannerUrl') => {
        if (e.target.files && e.target.files[0]) {
            const fileUrl = URL.createObjectURL(e.target.files[0]);
            // Immediately update the global state, preserving any other unsaved edits in the form
            updateUser({ ...editableUser, [field]: fileUrl });
        }
    };

    const qrCodeData = selectedFee ? `Pagar R$${selectedFee.amount.toFixed(2)} para ${selectedFee.month} na chave PIX: ${pixKey}` : pixKey;

    return (
        <div className="space-y-8">
             <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Pagamento via PIX">
                <div className="text-center">
                    <p className="mb-2">Use o QR Code abaixo para pagar a mensalidade de <strong>{selectedFee?.month}</strong> no valor de <strong>R$ {selectedFee?.amount.toFixed(2)}</strong>.</p>
                     <p className="mb-4 break-all">
                        <strong>Chave PIX:</strong> <span className="text-primary-dark font-mono bg-gray-100 p-1 rounded">{pixKey}</span>
                    </p>
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeData)}`} alt="Simulated PIX QR Code" className="mx-auto" />
                    <p className="text-xs text-gray-500 mt-4">(Este é um QR Code de simulação e não possui valor real)</p>
                     <button 
                        onClick={() => setIsModalOpen(false)}
                        className="mt-6 w-full bg-primary hover:bg-primary-light text-white font-bold py-2 px-4 rounded-lg transition duration-300"
                    >
                        Fechar
                    </button>
                </div>
            </Modal>

            <div 
                className="relative bg-cover bg-center h-48 rounded-lg shadow-lg group"
                style={{ backgroundImage: `url(${editableUser.bannerUrl || 'https://picsum.photos/1000/300'})` }}
            >
                <div className="absolute inset-0 bg-black bg-opacity-30 rounded-lg flex items-end p-4">
                     <button 
                        onClick={() => bannerInputRef.current?.click()}
                        className="absolute top-4 right-4 bg-black bg-opacity-50 p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Change banner image"
                    >
                        <CameraIcon className="h-6 w-6"/>
                    </button>
                    <input type="file" accept="image/*" ref={bannerInputRef} onChange={(e) => handleFileChange(e, 'bannerUrl')} className="hidden" />
                    
                    <div className="relative flex items-end -mb-16">
                         <img src={editableUser.avatarUrl} alt={editableUser.name} className="w-28 h-28 rounded-full border-4 border-white shadow-lg" />
                         <button
                            onClick={() => avatarInputRef.current?.click()}
                            className="absolute bottom-1 right-1 bg-black bg-opacity-50 p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Change profile image"
                         >
                             <CameraIcon className="h-5 w-5"/>
                         </button>
                         <input type="file" accept="image/*" ref={avatarInputRef} onChange={(e) => handleFileChange(e, 'avatarUrl')} className="hidden" />
                    </div>
                </div>
            </div>
            
            <div className="pt-16">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-primary-dark">{editableUser.name}</h1>
                        <p className="text-secondary-dark">{editableUser.role}</p>
                    </div>
                    {isEditing && (
                        <button 
                            onClick={handleSave}
                            className="bg-success hover:bg-success/80 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
                        >
                            Salvar Alterações
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card title="Informações Pessoais">
                    <button onClick={handleEditToggle} className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors">
                        {isEditing ? <span className="text-sm font-semibold text-gray-700">Cancelar</span> : <PencilIcon className="h-5 w-5 text-gray-500" />}
                    </button>
                    {isEditing ? (
                         <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-600">Nome Completo</label>
                                <input type="text" name="name" value={editableUser.name} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-md"/>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">Endereço</label>
                                <input type="text" name="address" value={editableUser.address} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-md"/>
                            </div>
                             <div>
                                <label className="text-sm font-medium text-gray-600">Telefone</label>
                                <input type="text" name="phone" value={editableUser.phone} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-md"/>
                            </div>
                             <div>
                                <label className="text-sm font-medium text-gray-600">Email</label>
                                <input type="email" name="email" value={editableUser.email} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-md"/>
                            </div>
                         </div>
                    ) : (
                        <div className="space-y-2 text-gray-700">
                            <p><strong>CPF:</strong> {editableUser.cpf}</p>
                            <p><strong>Endereço:</strong> {editableUser.address}</p>
                            <p><strong>Telefone:</strong> {editableUser.phone}</p>
                            <p><strong>Email:</strong> {editableUser.email}</p>
                            <p><strong>Data de Entrada:</strong> {new Date(editableUser.joinDate).toLocaleDateString('pt-BR')}</p>
                        </div>
                    )}
                </Card>
                <Card title="Situação Financeira">
                    <ul className="space-y-3 max-h-60 overflow-y-auto pr-2">
                        {user.fees.map(fee => (
                            <li key={`${fee.month}-${fee.year}`} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                                <div>
                                    <p className="font-semibold">{fee.month} {fee.year}</p>
                                    <p className="text-sm text-gray-600">Valor: R$ {fee.amount.toFixed(2)}</p>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <FeeStatusBadge status={fee.status} />
                                    {fee.status === FeeStatus.Pending && (
                                        <button 
                                            onClick={() => handleGeneratePix(fee.month, fee.amount)}
                                            className="bg-accent hover:bg-accent/80 text-white font-bold py-1 px-3 rounded-lg text-sm transition duration-300"
                                        >
                                            Pagar com PIX
                                        </button>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                    {pendingFees.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200 bg-red-50 p-4 rounded-lg">
                            <div className="flex flex-col sm:flex-row justify-between items-center text-center sm:text-left">
                                <div className="mb-4 sm:mb-0">
                                    <p className="font-bold text-lg text-danger">Total Pendente:</p>
                                    <p className="font-bold text-2xl text-danger">R$ {totalPendingAmount.toFixed(2)}</p>
                                </div>
                                <button
                                    onClick={handleGeneratePixForAll}
                                    className="bg-danger hover:bg-danger/80 text-white font-bold py-2 px-4 rounded-lg transition duration-300 shadow-md whitespace-nowrap"
                                >
                                    Regularizar Pendências com PIX
                                </button>
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};