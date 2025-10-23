import React, { useState, useContext } from 'react';
import { Role, User } from '../types';
import { AppContext, AppContextType } from '../App';
import { ProjectCard } from './ProjectCard';
import { NewProjectModal } from './NewProjectModal';

interface ProjectsProps {
    currentUser: User;
}

export const Projects: React.FC<ProjectsProps> = ({ currentUser }) => {
    const context = useContext(AppContext) as AppContextType;
    const { projects } = context;

    const [isModalOpen, setIsModalOpen] = useState(false);

    const canManage = currentUser.role === Role.Admin || currentUser.role === Role.ProjectManager;

    return (
        <>
            <NewProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
            <div className="space-y-8">
                <div className="flex flex-wrap gap-4 justify-between items-center">
                    <h1 className="text-3xl font-bold text-primary-dark">Gestão de Projetos</h1>
                    {canManage && (
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="bg-primary hover:bg-primary-light text-white font-bold py-2 px-4 rounded-lg transition duration-300"
                        >
                            + Novo Projeto
                        </button>
                    )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map(project => (
                        <ProjectCard key={project.id} project={project} currentUser={currentUser} />
                    ))}
                </div>
            </div>
        </>
    );
};