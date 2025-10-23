import React, { useState, useContext } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { Card } from './Card';
import { AppContext, AppContextType } from '../App';
import { CreativeHistoryItem } from '../types';
import { HistoryIcon } from './icons/HistoryIcon';
import { CopyIcon } from './icons/CopyIcon';
import { ShareIcon } from './icons/ShareIcon';

const API_KEY = process.env.API_KEY;
const isApiConfigured = !!API_KEY;

let ai: GoogleGenAI | null = null;
if (isApiConfigured) {
    ai = new GoogleGenAI({ apiKey: API_KEY! });
} else {
    console.warn("API_KEY environment variable not set. AI features will be disabled.");
}

const LoadingSpinner = () => (
    <div className="flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
);

const ApiWarningBanner = () => (
    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6" role="alert">
        <p className="font-bold">Aviso de Configuração</p>
        <p>A funcionalidade de IA está desativada. A chave de API do Google AI não foi configurada no ambiente.</p>
    </div>
);

export const Creative: React.FC = () => {
    const context = useContext(AppContext) as AppContextType;
    const { creativeHistory, addCreativeHistoryItem } = context;

    // State for Text Generation
    const [textPrompt, setTextPrompt] = useState('');
    const [generatedText, setGeneratedText] = useState('');
    const [isGeneratingText, setIsGeneratingText] = useState(false);
    const [textError, setTextError] = useState('');

    // State for Image Generation
    const [imagePrompt, setImagePrompt] = useState('');
    const [generatedImageUrl, setGeneratedImageUrl] = useState('');
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const [imageError, setImageError] = useState('');
    const [copied, setCopied] = useState(false);

    const handleGenerateText = async () => {
        if (!textPrompt.trim() || !ai) return;
        setIsGeneratingText(true);
        setGeneratedText('');
        setTextError('');
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: textPrompt,
            });
            const resultText = response.text;
            setGeneratedText(resultText);
            addCreativeHistoryItem({ type: 'text', prompt: textPrompt, result: resultText });
        } catch (error) {
            console.error('Error generating text:', error);
            setTextError('Ocorreu um erro ao gerar o texto. Por favor, tente novamente.');
        } finally {
            setIsGeneratingText(false);
        }
    };

    const dataUrlToBlob = async (dataUrl: string) => {
        const res = await fetch(dataUrl);
        return await res.blob();
    };

    const handleCopyImage = async () => {
        if (!generatedImageUrl) return;
        try {
            const blob = await dataUrlToBlob(generatedImageUrl);
            await navigator.clipboard.write([
                new ClipboardItem({
                    [blob.type]: blob,
                }),
            ]);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy image:', error);
            alert('Falha ao copiar imagem. Seu navegador pode não suportar esta ação.');
        }
    };

    const handleShareImage = async () => {
        if (!navigator.share || !generatedImageUrl) return;
        try {
            const blob = await dataUrlToBlob(generatedImageUrl);
            const extension = blob.type.split('/')[1] || 'png';
            const file = new File([blob], `imagem-gerada-ia.${extension}`, { type: blob.type });

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                 await navigator.share({
                    title: 'Imagem Gerada por IA',
                    text: `Imagem criada na plataforma Community Connect com o prompt: "${imagePrompt}"`,
                    files: [file],
                });
            } else {
                 alert('Seu navegador não suporta o compartilhamento deste tipo de arquivo.');
            }
        } catch (error) {
            console.error('Error sharing image:', error);
            if ((error as DOMException).name !== 'AbortError') {
                 alert('Ocorreu um erro ao compartilhar a imagem.');
            }
        }
    };

    const handleGenerateImage = async () => {
        if (!imagePrompt.trim() || !ai) return;
        setIsGeneratingImage(true);
        setGeneratedImageUrl('');
        setImageError('');
        setCopied(false);
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts: [{ text: imagePrompt }] },
                config: {
                    responseModalities: [Modality.IMAGE],
                },
            });
            
            const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);

            if (imagePart?.inlineData) {
                const base64ImageBytes = imagePart.inlineData.data;
                const imageUrl = `data:${imagePart.inlineData.mimeType};base64,${base64ImageBytes}`;
                setGeneratedImageUrl(imageUrl);
                addCreativeHistoryItem({ type: 'image', prompt: imagePrompt, result: imageUrl });
            } else {
                const fallbackText = response.text;
                if (fallbackText) {
                     throw new Error(`A API retornou uma mensagem: "${fallbackText}"`);
                }
                throw new Error("Nenhuma imagem foi retornada pela API. A resposta não continha dados de imagem válidos.");
            }
        } catch (error) {
            console.error('Error generating image:', error);
            const errorMessage = (error instanceof Error) ? error.message : 'Ocorreu um erro ao gerar a imagem. Por favor, tente novamente.';
            setImageError(errorMessage);
        } finally {
            setIsGeneratingImage(false);
        }
    };

    const handleReuse = (item: CreativeHistoryItem) => {
        if (item.type === 'text') {
            setTextPrompt(item.prompt);
            setGeneratedText(item.result);
            setTextError('');
        } else if (item.type === 'image') {
            setImagePrompt(item.prompt);
            setGeneratedImageUrl(item.result);
            setImageError('');
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-primary-dark">Hub Criativo com IA</h1>
            <p className="text-gray-600">Use as ferramentas abaixo para gerar textos e imagens para seus projetos e comunicados.</p>
            
            {!isApiConfigured && <ApiWarningBanner />}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Text Generator Card */}
                <Card title="Gerador de Texto" className="flex flex-col">
                    <div className="flex-grow space-y-4">
                        <textarea
                            value={textPrompt}
                            onChange={(e) => setTextPrompt(e.target.value)}
                            placeholder="Ex: Escreva um convite para a festa junina da comunidade..."
                            className="w-full p-2 border rounded-md h-32 focus:outline-none focus:ring-2 focus:ring-primary-light"
                            disabled={isGeneratingText || !isApiConfigured}
                        />
                         <div className="bg-gray-100 p-4 rounded-md min-h-[150px] overflow-y-auto whitespace-pre-wrap">
                            {isGeneratingText ? <LoadingSpinner /> : (
                                textError ? <p className="text-danger">{textError}</p> : <p>{generatedText}</p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={handleGenerateText}
                        disabled={isGeneratingText || !textPrompt.trim() || !isApiConfigured}
                        className="mt-4 w-full bg-primary hover:bg-primary-light text-white font-bold py-2 px-4 rounded-lg transition duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {isGeneratingText ? 'Gerando...' : 'Gerar Texto'}
                    </button>
                </Card>

                {/* Image Generator Card */}
                <Card title="Gerador de Imagem" className="flex flex-col">
                    <div className="flex-grow space-y-4">
                        <textarea
                            value={imagePrompt}
                            onChange={(e) => setImagePrompt(e.target.value)}
                            placeholder="Ex: Uma horta comunitária vibrante em um dia ensolarado, estilo aquarela..."
                            className="w-full p-2 border rounded-md h-32 focus:outline-none focus:ring-2 focus:ring-primary-light"
                            disabled={isGeneratingImage || !isApiConfigured}
                        />
                         <div className="bg-gray-100 p-4 rounded-md min-h-[150px] flex justify-center items-center">
                            {isGeneratingImage ? <LoadingSpinner /> : (
                                imageError ? <p className="text-danger text-center">{imageError}</p> : (
                                    generatedImageUrl ? (
                                        <div className="relative group">
                                            <img src={generatedImageUrl} alt="Imagem gerada por IA" className="max-h-48 w-auto rounded-md" />
                                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 rounded-md flex justify-center items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <button onClick={handleCopyImage} className="text-white p-3 rounded-full bg-black/50 hover:bg-black/70 transition-colors" title="Copiar Imagem">
                                                    <CopyIcon />
                                                </button>
                                                {navigator.share && (
                                                    <button onClick={handleShareImage} className="text-white p-3 rounded-full bg-black/50 hover:bg-black/70 transition-colors" title="Compartilhar Imagem">
                                                        <ShareIcon />
                                                    </button>
                                                )}
                                            </div>
                                            {copied && <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded animate-pulse">Copiado!</div>}
                                        </div>
                                    ) : <p className="text-gray-400">A imagem gerada aparecerá aqui</p>
                                )
                            )}
                        </div>
                    </div>
                    <button
                        onClick={handleGenerateImage}
                        disabled={isGeneratingImage || !imagePrompt.trim() || !isApiConfigured}
                        className="mt-4 w-full bg-accent hover:bg-accent/80 text-white font-bold py-2 px-4 rounded-lg transition duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                         {isGeneratingImage ? 'Gerando...' : 'Gerar Imagem'}
                    </button>
                </Card>

                {creativeHistory.length > 0 && (
                     <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-bold text-primary-dark mb-4 flex items-center gap-2">
                                <HistoryIcon />
                                Histórico Criativo
                            </h2>
                            <ul className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                                {creativeHistory.map(item => (
                                    <li key={item.id} className="p-4 bg-gray-50 rounded-lg flex flex-col sm:flex-row gap-4 items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${item.type === 'text' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                                                    {item.type === 'text' ? 'Texto' : 'Imagem'}
                                                </span>
                                                <p className="text-xs text-gray-500">{new Date(item.timestamp).toLocaleString('pt-BR')}</p>
                                            </div>
                                            <p className="font-semibold truncate text-sm text-gray-700" title={item.prompt}>
                                                <strong>Prompt:</strong> {item.prompt}
                                            </p>
                                            <div className="mt-2 p-2 bg-white rounded border max-h-28 overflow-y-auto">
                                                {item.type === 'text' ? (
                                                    <p className="text-sm whitespace-pre-wrap">{item.result}</p>
                                                ) : (
                                                    <img src={item.result} alt="Imagem gerada" className="h-24 w-auto rounded" />
                                                )}
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleReuse(item)} 
                                            className="bg-secondary hover:bg-secondary/80 text-primary-dark font-bold py-2 px-3 rounded-lg transition duration-300 self-center flex-shrink-0 mt-2 sm:mt-0"
                                        >
                                            Reutilizar
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};