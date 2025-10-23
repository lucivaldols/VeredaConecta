import React, { useContext, useState, FormEvent, useRef, useEffect } from 'react';
import { AppContext, AppContextType } from '../App';
import { ChatMessage } from '../types';

const ChatBubble = ({ message, isCurrentUser }: { message: ChatMessage, isCurrentUser: boolean }) => {
    const bubbleAlignment = isCurrentUser ? 'justify-end' : 'justify-start';
    const bubbleClasses = isCurrentUser 
        ? 'bg-primary text-white' 
        : 'bg-white text-text';
    const senderName = isCurrentUser ? 'Você' : message.senderName;
    const time = new Date(message.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    return (
        <div className={`flex items-end gap-2 ${bubbleAlignment}`}>
            {!isCurrentUser && (
                <img src={message.senderAvatarUrl} alt={message.senderName} className="w-8 h-8 rounded-full flex-shrink-0" />
            )}
            <div className="flex flex-col">
                 {!isCurrentUser && (
                    <span className="text-xs text-gray-500 ml-2">{senderName}</span>
                )}
                <div className={`max-w-xs md:max-w-md p-3 rounded-lg ${bubbleClasses}`}>
                    <p>{message.text}</p>
                </div>
                 <span className={`text-xs text-gray-400 mt-1 ${isCurrentUser ? 'text-right mr-2' : 'text-left ml-2'}`}>{time}</span>
            </div>
             {isCurrentUser && (
                <img src={message.senderAvatarUrl} alt={message.senderName} className="w-8 h-8 rounded-full flex-shrink-0" />
            )}
        </div>
    );
};

export const Chat: React.FC = () => {
    const context = useContext(AppContext) as AppContextType;
    const { currentUser, chatMessages, addChatMessage } = context;
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [chatMessages]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (newMessage.trim()) {
            addChatMessage(newMessage.trim());
            setNewMessage('');
        }
    };

    if (!currentUser) return null;

    return (
        <div className="flex flex-col h-[calc(100vh-180px)] bg-gray-50 rounded-lg shadow-md">
            <header className="p-4 border-b bg-white rounded-t-lg">
                <h1 className="text-xl font-bold text-primary-dark">Bate-papo Global</h1>
                <p className="text-sm text-gray-500">Converse com outros associados da comunidade.</p>
            </header>
            
            <main className="flex-1 p-4 space-y-4 overflow-y-auto">
                {chatMessages.map(msg => (
                    <ChatBubble key={msg.id} message={msg} isCurrentUser={msg.senderId === currentUser.id} />
                ))}
                <div ref={messagesEndRef} />
            </main>

            <footer className="p-4 bg-white border-t rounded-b-lg">
                <form onSubmit={handleSubmit} className="flex items-center gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Digite sua mensagem..."
                        className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light"
                        aria-label="New chat message"
                    />
                    <button
                        type="submit"
                        className="bg-primary hover:bg-primary-light text-white font-bold py-2 px-4 rounded-lg transition-colors"
                        aria-label="Send message"
                    >
                        Enviar
                    </button>
                </form>
            </footer>
        </div>
    );
};