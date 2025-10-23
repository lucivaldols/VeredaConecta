import React, { useContext } from 'react';
import { Modal } from './Modal';
import { MemberProfile, FeeStatus, Project } from '../types';
import { AppContext, AppContextType } from '../App';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  membersWithDues: MemberProfile[];
  projectsNearDeadline: Project[];
}

const MemberNotificationItem: React.FC<{ member: MemberProfile }> = ({ member }) => {
    const context = useContext(AppContext) as AppContextType;
    const { settings } = context;
    const associationName = settings.customTexts.headerTitle;
    const contactInfo = settings.contactInfo;

    const pendingFeesCount = member.fees.filter(f => f.status === FeeStatus.Pending).length;
    
    const whatsappMessage = encodeURIComponent(`Olá ${member.name}, notamos que você possui ${pendingFeesCount} mensalidade(s) pendente(s) com a associação ${associationName}. Por favor, acesse o portal para regularizar sua situação.\n\nQualquer dúvida, entre em contato pelo telefone: ${contactInfo.phone}`);
    const whatsappLink = `https://wa.me/${member.phone.replace(/\D/g, '')}?text=${whatsappMessage}`;

    const emailSubject = encodeURIComponent(`Lembrete de Pendência Financeira - ${associationName}`);
    const emailBody = encodeURIComponent(`Olá ${member.name},\n\nEste é um lembrete amigável de que você possui ${pendingFeesCount} mensalidade(s) em aberto com a associação ${associationName}.\n\nPara facilitar, você pode acessar o portal e regularizar sua situação financeira.\n\nAgradecemos a sua atenção.\n\nAtenciosamente,\n${associationName}\nEmail: ${contactInfo.email}\nTelefone: ${contactInfo.phone}`);
    const emailLink = `mailto:${member.email}?subject=${emailSubject}&body=${emailBody}`;


    return (
        <li className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
            <div className="flex items-center space-x-3">
                <img src={member.avatarUrl} alt={member.name} className="w-12 h-12 rounded-full" />
                <div>
                    <p className="font-semibold text-primary-dark">{member.name}</p>
                    <p className="text-sm text-danger">{pendingFeesCount} pendência(s)</p>
                </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
                <a 
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-3 rounded-lg text-sm transition duration-300 text-center"
                >
                    WhatsApp
                </a>
                 <a 
                    href={emailLink}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded-lg text-sm transition duration-300 text-center"
                >
                    Email
                </a>
            </div>
        </li>
    );
};

const ProjectNotificationItem: React.FC<{ project: Project }> = ({ project }) => {
    const endDate = new Date(project.endDate).toLocaleDateString('pt-BR');
    return (
        <li className="flex items-center justify-between p-3 bg-yellow-50 rounded-md">
            <div>
                <p className="font-semibold text-primary-dark">{project.name}</p>
                <p className="text-sm text-amber-700">Prazo final em: <strong>{endDate}</strong></p>
            </div>
             <button className="bg-secondary hover:bg-secondary/80 text-primary-dark font-bold py-1 px-3 rounded-lg text-sm transition duration-300">
                Ver Projeto
            </button>
        </li>
    );
};


export const NotificationsModal: React.FC<NotificationsModalProps> = ({ isOpen, onClose, membersWithDues, projectsNearDeadline }) => {
  const hasMemberNotifications = membersWithDues.length > 0;
  const hasProjectNotifications = projectsNearDeadline.length > 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Central de Notificações">
      <div className="space-y-4">
        {hasMemberNotifications && (
            <div>
                <h3 className="font-semibold text-lg text-primary-dark mb-2">Pendências Financeiras</h3>
                <p className="text-sm text-gray-600 mb-3">
                    Abaixo estão os associados com mensalidades pendentes. Use os botões para enviar lembretes.
                </p>
                <ul className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {membersWithDues.map(member => (
                        <MemberNotificationItem key={member.id} member={member} />
                    ))}
                </ul>
            </div>
        )}

        {hasProjectNotifications && (
            <div className={hasMemberNotifications ? 'mt-6 pt-4 border-t' : ''}>
                 <h3 className="font-semibold text-lg text-primary-dark mb-2">Alertas de Projetos</h3>
                 <p className="text-sm text-gray-600 mb-3">
                    Estes projetos estão com o prazo próximo do fim.
                </p>
                <ul className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {projectsNearDeadline.map(project => (
                        <ProjectNotificationItem key={project.id} project={project} />
                    ))}
                </ul>
            </div>
        )}

        {!hasMemberNotifications && !hasProjectNotifications && (
            <div className="text-center py-8 bg-gray-100 rounded-lg">
                <p className="font-semibold text-gray-700">Tudo em ordem!</p>
                <p className="text-sm text-gray-500">Nenhuma notificação encontrada.</p>
            </div>
        )}
        
        <button 
            onClick={onClose}
            className="mt-6 w-full bg-primary hover:bg-primary-light text-white font-bold py-2 px-4 rounded-lg transition duration-300"
        >
            Fechar
        </button>
      </div>
    </Modal>
  );
};