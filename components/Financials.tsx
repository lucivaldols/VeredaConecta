import React, { useState, useContext } from 'react';
import { Transaction, BankAccount } from '../types';
import { Card } from './Card';
import { Modal } from './Modal';
import { AppContext, AppContextType } from '../App';
import { PencilIcon } from './icons/PencilIcon';
import { EditAccountModal } from './EditAccountModal';
import { NewTransactionModal } from './NewTransactionModal';

export const Financials: React.FC = () => {
    const context = useContext(AppContext) as AppContextType;
    const { 
        bankAccounts, 
        membershipFeeAmount, 
        updateMembershipFeeAmount, 
        transactions,
        pixKey,
        updatePixKey
    } = context;

    const [isPixModalOpen, setIsPixModalOpen] = useState(false);
    const [isEditAccountModalOpen, setIsEditAccountModalOpen] = useState(false);
    const [isNewTransactionModalOpen, setIsNewTransactionModalOpen] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);

    const [isEditingFee, setIsEditingFee] = useState(false);
    const [newFeeAmount, setNewFeeAmount] = useState(membershipFeeAmount);

    const [isEditingPixKey, setIsEditingPixKey] = useState(false);
    const [newPixKey, setNewPixKey] = useState(pixKey);

    const totalRevenue = transactions.filter(t => t.type === 'Receita').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === 'Despesa').reduce((sum, t) => sum + t.amount, 0);
    const balance = totalRevenue - totalExpenses;

    const handleEditAccount = (account: BankAccount) => {
        setSelectedAccount(account);
        setIsEditAccountModalOpen(true);
    };

    const handleFeeEditToggle = () => {
        if (isEditingFee) {
            setNewFeeAmount(membershipFeeAmount);
        }
        setIsEditingFee(!isEditingFee);
    };

    const handleFeeSave = () => {
        updateMembershipFeeAmount(Number(newFeeAmount));
        setIsEditingFee(false);
    }

    const handlePixKeyEditToggle = () => {
        if (isEditingPixKey) {
            setNewPixKey(pixKey);
        }
        setIsEditingPixKey(!isEditingPixKey);
    };

    const handlePixKeySave = () => {
        updatePixKey(newPixKey);
        setIsEditingPixKey(false);
    }

    const TransactionRow = ({ transaction }: { transaction: Transaction }) => {
        const isRevenue = transaction.type === 'Receita';
        return (
            <tr className="border-b hover:bg-gray-50">
                <td className="p-3">{new Date(transaction.date).toLocaleDateString('pt-BR')}</td>
                <td className="p-3">{transaction.description}</td>
                <td className="p-3">{transaction.category}</td>
                <td className={`p-3 font-semibold ${isRevenue ? 'text-success' : 'text-danger'}`}>
                    {isRevenue ? '+' : '-'} R$ {transaction.amount.toFixed(2)}
                </td>
            </tr>
        );
    };

    return (
        <div className="space-y-8">
            <Modal isOpen={isPixModalOpen} onClose={() => setIsPixModalOpen(false)} title="Gerar QR Code PIX">
                 <div className="text-center">
                    <p className="mb-2">Este QR Code pode ser usado para receber doações e outros pagamentos para a associação.</p>
                    <p className="mb-4 break-all">
                        <strong>Chave PIX:</strong> <span className="text-primary-dark font-mono bg-gray-100 p-1 rounded">{pixKey}</span>
                    </p>
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pixKey)}`} alt="Simulated PIX QR Code" className="mx-auto" />
                    <p className="text-xs text-gray-500 mt-4">(Este é um QR Code de simulação e não possui valor real)</p>
                     <button 
                        onClick={() => setIsPixModalOpen(false)}
                        className="mt-6 w-full bg-primary hover:bg-primary-light text-white font-bold py-2 px-4 rounded-lg transition duration-300"
                    >
                        Fechar
                    </button>
                </div>
            </Modal>
            {selectedAccount && (
                <EditAccountModal 
                    isOpen={isEditAccountModalOpen} 
                    onClose={() => setIsEditAccountModalOpen(false)} 
                    account={selectedAccount} 
                />
            )}
            <NewTransactionModal isOpen={isNewTransactionModalOpen} onClose={() => setIsNewTransactionModalOpen(false)} />

            <div className="flex flex-wrap justify-between items-center gap-4">
                <h1 className="text-3xl font-bold text-primary-dark">Gestão Financeira</h1>
                <div className="flex gap-2">
                    <button onClick={() => setIsPixModalOpen(true)} className="bg-accent hover:bg-accent/80 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
                        Gerar PIX para Recebimento
                    </button>
                    <button onClick={() => setIsNewTransactionModalOpen(true)} className="bg-primary hover:bg-primary-light text-white font-bold py-2 px-4 rounded-lg transition duration-300">
                        + Nova Transação
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="bg-green-100 p-6 rounded-lg shadow">
                    <h3 className="text-lg text-green-800">Total de Receitas</h3>
                    <p className="text-3xl font-bold text-green-900">R$ {totalRevenue.toFixed(2)}</p>
                </div>
                <div className="bg-red-100 p-6 rounded-lg shadow">
                    <h3 className="text-lg text-red-800">Total de Despesas</h3>
                    <p className="text-3xl font-bold text-red-900">R$ {totalExpenses.toFixed(2)}</p>
                </div>
                 <div className="bg-blue-100 p-6 rounded-lg shadow">
                    <h3 className="text-lg text-blue-800">Saldo Atual</h3>
                    <p className={`text-3xl font-bold ${balance >= 0 ? 'text-blue-900' : 'text-red-900'}`}>
                        R$ {balance.toFixed(2)}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Card title="Últimas Transações">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-100 text-gray-600">
                                    <tr>
                                        <th className="p-3 font-semibold">Data</th>
                                        <th className="p-3 font-semibold">Descrição</th>
                                        <th className="p-3 font-semibold">Categoria</th>
                                        <th className="p-3 font-semibold">Valor</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.slice(0).reverse().map(t => <TransactionRow key={t.id} transaction={t} />)}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
                <div className="space-y-8">
                     <Card title="Contas Bancárias">
                        <div className="space-y-4">
                            {bankAccounts.map(acc => (
                                <div key={acc.id} className="bg-gray-50 p-4 rounded-md relative group">
                                    <p className="font-bold text-primary">{acc.name}</p>
                                    <p className="text-sm text-gray-600">{acc.type}</p>
                                    <p className="text-sm text-gray-600">Ag: {acc.agency} / CC: {acc.account}</p>
                                    <button 
                                        onClick={() => handleEditAccount(acc)}
                                        className="absolute top-2 right-2 p-2 rounded-full hover:bg-gray-200 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <PencilIcon className="h-4 w-4 text-gray-600" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </Card>
                     <Card title="Configuração PIX">
                        {isEditingPixKey ? (
                            <div className="space-y-3">
                                <label htmlFor="pixKey" className="text-sm font-medium text-gray-700">Definir chave PIX principal:</label>
                                <input
                                    type="text"
                                    id="pixKey"
                                    value={newPixKey}
                                    onChange={(e) => setNewPixKey(e.target.value)}
                                    className="w-full p-2 border rounded-md"
                                />
                                <div className="flex justify-end space-x-2">
                                    <button onClick={handlePixKeyEditToggle} className="text-sm font-semibold text-gray-600 px-3 py-1 rounded-md hover:bg-gray-200">Cancelar</button>
                                    <button onClick={handlePixKeySave} className="text-sm bg-success text-white font-bold px-3 py-1 rounded-md hover:bg-success/80">Salvar</button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-gray-600">Chave Principal:</p>
                                    <p className="text-lg font-bold text-primary-dark break-all">{pixKey}</p>
                                </div>
                                <button onClick={handlePixKeyEditToggle} className="p-2 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0">
                                     <PencilIcon className="h-5 w-5 text-gray-500" />
                                </button>
                            </div>
                        )}
                    </Card>
                    <Card title="Gestão de Mensalidades">
                        {isEditingFee ? (
                            <div className="space-y-3">
                                <label htmlFor="feeAmount" className="text-sm font-medium text-gray-700">Definir novo valor da mensalidade (R$):</label>
                                <input
                                    type="number"
                                    id="feeAmount"
                                    value={newFeeAmount}
                                    onChange={(e) => setNewFeeAmount(Number(e.target.value))}
                                    className="w-full p-2 border rounded-md"
                                    min="0"
                                    step="0.01"
                                />
                                <div className="flex justify-end space-x-2">
                                    <button onClick={handleFeeEditToggle} className="text-sm font-semibold text-gray-600 px-3 py-1 rounded-md hover:bg-gray-200">Cancelar</button>
                                    <button onClick={handleFeeSave} className="text-sm bg-success text-white font-bold px-3 py-1 rounded-md hover:bg-success/80">Salvar</button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-gray-600">Valor Padrão Atual:</p>
                                    <p className="text-2xl font-bold text-primary-dark">R$ {membershipFeeAmount.toFixed(2)}</p>
                                </div>
                                <button onClick={handleFeeEditToggle} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                                     <PencilIcon className="h-5 w-5 text-gray-500" />
                                </button>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
};