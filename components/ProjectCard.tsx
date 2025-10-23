import React, { useContext, useRef } from 'react';
import { Project, ProjectStatus, Role, User } from '../types';
import { AppContext, AppContextType } from '../App';
import { UploadIcon } from './icons/UploadIcon';

const ProjectStatusBadge = ({ status }: { status: ProjectStatus }) => {
    const baseClasses = "px-3 py-1 text-sm font-semibold rounded-full whitespace-nowrap";
    const statusClasses = {
        [ProjectStatus.InProgress]: "bg-blue-200 text-blue-800",
        [ProjectStatus.Completed]: "bg-green-200 text-green-800",
        [ProjectStatus.Suspended]: "bg-yellow-200 text-yellow-800",
    };
    return <span className={`${baseClasses} ${statusClasses[status]}`}>{status}</span>;
};

interface ProjectCardProps {
    project: Project;
    currentUser: User;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, currentUser }) => {
    const context = useContext(AppContext) as AppContextType;
    const { users, updateProject } = context;
    const fileInputRef = useRef<HTMLInputElement>(null);

    const manager = users.find(u => u.id === project.managerId);

    const startDate = new Date(project.startDate).getTime();
    const endDate = new Date(project.endDate).getTime();
    const now = new Date().getTime();
    
    const totalDuration = endDate > startDate ? endDate - startDate : 1;
    const elapsedDuration = now - startDate;
    let progress = Math.max(0, Math.min(100, (elapsedDuration / totalDuration) * 100));
    
    if (project.status === ProjectStatus.Completed || now > endDate) {
        progress = 100;
    }

    const canManageThisProject = currentUser.role === Role.Admin || currentUser.id === project.managerId;

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const fileName = e.target.files[0].name;
            const updatedProject = {
                ...project,
                files: [...(project.files || []), fileName],
            };
            updateProject(updatedProject);
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value as ProjectStatus;
        updateProject({ ...project, status: newStatus });
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col">
            <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-primary-dark">{project.name}</h3>
                <ProjectStatusBadge status={project.status} />
            </div>
            <p className="text-gray-600 mb-4 h-20 overflow-y-auto flex-grow">{project.description}</p>
            
            <div className="mt-auto">
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                    <div 
                        className={`h-2.5 rounded-full ${project.status === ProjectStatus.Suspended ? 'bg-yellow-500' : progress >= 90 ? 'bg-danger' : 'bg-success'}`}
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
                <p className="text-xs text-right text-gray-500 mb-4">{Math.round(progress)}% concluído (prazo)</p>

                <div className="text-sm text-gray-500 border-t pt-4 mt-4 space-y-2">
                    <p><strong>Responsável:</strong> {manager?.name || 'N/A'}</p>
                    <p><strong>Período:</strong> {new Date(project.startDate).toLocaleDateString('pt-BR')} - {new Date(project.endDate).toLocaleDateString('pt-BR')}</p>
                    <p><strong>Orçamento:</strong> R$ {project.budget.toFixed(2)}</p>
                </div>

                {canManageThisProject && (
                    <div className="border-t pt-4 mt-4">
                        <label htmlFor={`status-${project.id}`} className="text-sm font-semibold text-gray-700 mb-2 block">Gerenciar Status</label>
                        <select
                            id={`status-${project.id}`}
                            value={project.status}
                            onChange={handleStatusChange}
                            className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-light transition"
                        >
                            <option value={ProjectStatus.InProgress}>Em andamento</option>
                            <option value={ProjectStatus.Completed}>Concluído</option>
                            <option value={ProjectStatus.Suspended}>Suspenso</option>
                        </select>
                    </div>
                )}

                <div className="border-t pt-4 mt-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Arquivos Anexados:</h4>
                    {project.files && project.files.length > 0 ? (
                        <ul className="text-sm text-blue-600 space-y-1 max-h-20 overflow-y-auto">
                            {project.files.map((file, index) => <li key={index} className="truncate hover:underline cursor-pointer">{file}</li>)}
                        </ul>
                    ) : (
                        <p className="text-xs text-gray-400">Nenhum arquivo anexado.</p>
                    )}
                </div>

                {canManageThisProject && (
                    <div className="flex justify-end space-x-2 mt-4">
                        <input 
                            type="file" 
                            accept=".pdf"
                            ref={fileInputRef} 
                            onChange={handleFileUpload}
                            className="hidden" 
                        />
                        <button onClick={handleUploadClick} className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-3 rounded-lg flex items-center space-x-2">
                            <UploadIcon />
                            <span>Anexar PDF</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};