import React, { useState, useContext } from 'react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from 'recharts';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Card } from './Card';
import { ProjectStatus, FeeStatus, Role } from '../types';
import { NotificationsModal } from './NotificationsModal';
import { AppContext, AppContextType } from '../App';

const MetricCard = ({ title, value, subtext }: { title: string; value: string | number; subtext: string }) => (
    <div className="bg-white p-6 rounded-lg shadow-md text-center">
        <h3 className="text-lg text-gray-500">{title}</h3>
        <p className="text-4xl font-bold text-primary-dark my-2">{value}</p>
        <p className="text-sm text-gray-400">{subtext}</p>
    </div>
);

export const Dashboard: React.FC = () => {
    const context = useContext(AppContext) as AppContextType;
    const { currentUser, users, projects, setActivePage, transactions, t } = context;

    const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);

    const isAdmin = currentUser?.role === Role.Admin;

    const activeProjects = projects.filter(p => p.status === ProjectStatus.InProgress).length;
    const totalMembers = users.length;
    const totalRevenue = transactions.filter(t => t.type === 'Receita').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === 'Despesa').reduce((sum, t) => sum + t.amount, 0);
    
    const membersWithPendingFees = users.filter(user => user.fees.some(fee => fee.status === FeeStatus.Pending));
    const pendingFeesCount = users.flatMap(u => u.fees).filter(f => f.status === FeeStatus.Pending).length;

    const projectsNearDeadline = projects.filter(project => {
        if (project.status !== ProjectStatus.InProgress) return false;

        const startDate = new Date(project.startDate).getTime();
        const endDate = new Date(project.endDate).getTime();
        if (endDate < Date.now() || startDate > Date.now()) return false;
        
        const totalDuration = endDate - startDate;
        const elapsedDuration = Date.now() - startDate;
        const progress = totalDuration > 0 ? (elapsedDuration / totalDuration) * 100 : 0;
        
        return progress >= 90;
    });

    const financialData = [
        { name: 'Jan', Receitas: 1200, Despesas: 150 },
        { name: 'Fev', Receitas: 150, Despesas: 250 },
        { name: 'Mar', Receitas: 100, Despesas: 800 },
    ];

    const generatePdfReport = () => {
        const doc = new jsPDF();
        
        // Header
        doc.setFontSize(18);
        doc.text("Relatório Financeiro - Community Connect", 14, 22);
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Data de Emissão: ${new Date().toLocaleDateString('pt-BR')}`, 14, 30);

        // Summary Section
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text("Resumo Geral", 14, 45);
        const summaryY = 52;
        doc.setFontSize(10);
        doc.text(`- Total de Associados: ${totalMembers}`, 14, summaryY);
        doc.text(`- Projetos Ativos: ${activeProjects}`, 14, summaryY + 7);
        doc.text(`- Total de Receitas: R$ ${totalRevenue.toFixed(2)}`, 14, summaryY + 14);
        doc.text(`- Total de Despesas: R$ ${totalExpenses.toFixed(2)}`, 14, summaryY + 21);
        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.text(`- Saldo Final: R$ ${(totalRevenue - totalExpenses).toFixed(2)}`, 14, summaryY + 28);
        doc.setFont(undefined, 'normal');
        
        // Table of Transactions
        const tableColumn = ["Data", "Descrição", "Categoria", "Tipo", "Valor (R$)"];
        const tableRows: (string|number)[][] = [];

        transactions.forEach(transaction => {
            const transactionData = [
                new Date(transaction.date).toLocaleDateString('pt-BR'),
                transaction.description,
                transaction.category,
                transaction.type,
                `${transaction.type === 'Receita' ? '+' : '-'} ${transaction.amount.toFixed(2)}`
            ];
            tableRows.push(transactionData);
        });

        (doc as any).autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: summaryY + 40,
            theme: 'striped',
            headStyles: { fillColor: [0, 95, 115] }, // Cor primária: #005f73
        });
        
        // Footer with page numbers
        const pageCount = (doc as any).internal.getNumberOfPages();
        for(var i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(9);
            doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
        }

        // Save the PDF
        doc.save(`relatorio-financeiro_${new Date().toISOString().slice(0, 10)}.pdf`);
    };

    return (
        <>
            {isAdmin && (
                 <NotificationsModal 
                    isOpen={isNotificationsModalOpen} 
                    onClose={() => setIsNotificationsModalOpen(false)} 
                    membersWithDues={membersWithPendingFees}
                    projectsNearDeadline={projectsNearDeadline}
                />
            )}
            <div className="space-y-8">
                <h1 className="text-3xl font-bold text-primary-dark">{isAdmin ? 'Painel Administrativo' : 'Dashboard da Comunidade'}</h1>
                <div className={`grid grid-cols-1 md:grid-cols-2 ${isAdmin ? 'lg:grid-cols-5' : 'lg:grid-cols-2'} gap-6`}>
                    <MetricCard title="Associados" value={totalMembers} subtext="Total de membros" />
                    <MetricCard title="Projetos Ativos" value={activeProjects} subtext="Em andamento" />
                    {isAdmin && (
                        <>
                            <MetricCard title="Receitas" value={`R$ ${totalRevenue.toFixed(2)}`} subtext="Total arrecadado" />
                            <MetricCard title="Despesas" value={`R$ ${totalExpenses.toFixed(2)}`} subtext="Total gasto" />
                            <MetricCard title="Pendências" value={pendingFeesCount} subtext="Mensalidades em aberto" />
                        </>
                    )}
                </div>
                {isAdmin && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Card title="Desempenho Financeiro (Últimos 3 Meses)" className="lg:col-span-2">
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={financialData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="Receitas" fill="#2a9d8f" />
                                        <Bar dataKey="Despesas" fill="#e76f51" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                        <Card title="Acesso Rápido">
                            <div className="space-y-3">
                                <button 
                                    onClick={generatePdfReport}
                                    className="w-full bg-primary hover:bg-primary-light text-white font-bold py-2 px-4 rounded-lg transition duration-300">
                                    Gerar Relatório Financeiro
                                </button>
                                <button onClick={() => setIsNotificationsModalOpen(true)} className="w-full bg-secondary hover:bg-secondary/80 text-primary-dark font-bold py-2 px-4 rounded-lg transition duration-300">
                                    Verificar Notificações
                                </button>
                                <button onClick={() => setActivePage('projects')} className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg transition duration-300">
                                    Cadastrar Novo Projeto
                                </button>
                            </div>
                        </Card>
                    </div>
                )}
                 {!isAdmin && (
                     <Card title={`Bem-vindo(a) à ${context.settings.customTexts.headerTitle}!`}>
                        <p className="text-gray-600">
                           {t('dashboard.memberWelcomeMessage')}
                        </p>
                    </Card>
                 )}
            </div>
        </>
    );
};