
import React, { useState, useRef } from 'react';
import { ModelSummary, ModelId, DigitalModel } from '../types';
import { useAppStore } from '../store';

interface ModelListViewProps {
  // All props removed, will use store
}

const ModelTypeBadge: React.FC<{ type: number }> = ({ type }) => {
    const isDecision = type === 1;
    const bgColor = isDecision ? 'bg-blue-100 dark:bg-blue-900' : 'bg-purple-100 dark:bg-purple-900';
    const textColor = isDecision ? 'text-blue-800 dark:text-blue-300' : 'text-purple-800 dark:text-purple-300';
    const text = isDecision ? 'Decision Making' : 'Performance Review';

    return (
        <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${bgColor} ${textColor}`}>
            {text}
        </span>
    );
};

const ModelCard: React.FC<{ model: ModelSummary, onLoad: (id: ModelId) => void, onDelete: (id: ModelId) => void, onExport: (id: ModelId) => void }> = ({ model, onLoad, onDelete, onExport }) => {
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card's onLoad from firing
        setIsConfirmingDelete(true);
    };
    
    const confirmDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete(model.id);
        setIsConfirmingDelete(false);
    };

    const cancelDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsConfirmingDelete(false);
    }
    
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col border border-tandt-border dark:border-gray-700">
            <div className="p-6">
                <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold text-tandt-dark dark:text-gray-100">{model.name}</h3>
                    <ModelTypeBadge type={model.type} />
                </div>
                <p className="mt-2 text-sm text-tandt-secondary dark:text-gray-400 h-16">{model.description}</p>
            </div>
            <div className="mt-auto p-4 bg-tandt-light dark:bg-gray-800/50 border-t dark:border-gray-700 rounded-b-lg flex justify-between items-center">
                <div className="flex items-center space-x-1">
                    <button onClick={handleDeleteClick} title="Delete Model" className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full">
                        <TrashIcon />
                    </button>
                    <button onClick={() => onExport(model.id)} title="Export Model" className="text-gray-400 hover:text-blue-500 transition-colors p-2 rounded-full">
                        <DownloadIcon />
                    </button>
                </div>
                {isConfirmingDelete ? (
                    <div className="flex items-center space-x-2">
                        <span className="text-xs text-red-500 font-semibold">Delete?</span>
                        <button onClick={confirmDelete} className="px-3 py-1 text-xs font-semibold rounded-md bg-red-600 text-white hover:bg-red-700">Yes</button>
                        <button onClick={cancelDelete} className="px-3 py-1 text-xs font-semibold rounded-md bg-gray-300 dark:bg-gray-600">No</button>
                    </div>
                ) : (
                    <button
                        onClick={() => onLoad(model.id)}
                        className="px-4 py-2 text-sm font-semibold rounded-md bg-tandt-primary text-white hover:bg-blue-700 transition-colors"
                    >
                        Load Model
                    </button>
                )}
            </div>
        </div>
    );
};

const NewModelCard: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <button onClick={onClick} className="bg-white dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-tandt-primary dark:hover:border-blue-500 transition-colors duration-300 flex flex-col items-center justify-center text-center p-6 text-tandt-secondary dark:text-gray-400">
        <PlusIcon />
        <span className="mt-2 text-lg font-semibold">Create New Model</span>
    </button>
);


const ModelListView: React.FC<ModelListViewProps> = () => {
    const { 
        models, 
        isLoading, 
        onLoadModel, 
        onDeleteModel,
        onExportModel,
        onImportModel,
        onNewModel, 
        theme, 
        onToggleTheme 
    } = useAppStore(state => ({
        models: state.availableModels,
        isLoading: state.isLoading,
        onLoadModel: state.loadModel,
        onDeleteModel: state.deleteModel,
        onExportModel: state.exportModel,
        onImportModel: state.importModel,
        onNewModel: () => state.setIsCreatingModel(true),
        theme: state.theme,
        onToggleTheme: state.toggleTheme
    }));

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const fileContent = await file.text();
        try {
            const modelJson = JSON.parse(fileContent);
            await onImportModel(modelJson as DigitalModel);
            alert(`Model "${modelJson.DigitalTopic}" imported successfully!`);
        } catch (error) {
            console.error("Failed to import model:", error);
            alert("Failed to import model. Please ensure it is a valid JSON file exported from this application.");
        }

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };


    return (
        <div className="min-h-screen bg-tandt-bg dark:bg-gray-900">
            <div className="max-w-screen-xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold text-tandt-dark dark:text-white">Your Models</h1>
                    <div className="flex items-center space-x-2">
                         <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
                         <button onClick={handleImportClick} className="flex items-center px-3 py-2 text-sm font-semibold rounded-md bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                            <UploadIcon />
                            <span className="ml-2 hidden sm:inline">Import Model</span>
                        </button>
                        <button onClick={onToggleTheme} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
                        </button>
                    </div>
                </div>
                <p className="text-lg text-tandt-secondary dark:text-gray-400 mb-12 max-w-2xl">
                    Select a model to begin your analysis or create a new one. All your work is saved automatically in your browser.
                </p>

                {isLoading && models.length === 0 ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-tandt-primary"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {models.map(model => <ModelCard key={model.id} model={model} onLoad={onLoadModel} onDelete={onDeleteModel} onExport={onExportModel} />)}
                        <NewModelCard onClick={onNewModel} />
                    </div>
                )}
            </div>
        </div>
    );
};

// Icons
const SunIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-2.12 6.536a1 1 0 01-1.414 0l-.707-.707a1 1 0 011.414-1.414l.707.707a1 1 0 010 1.414zM4.95 6.364a1 1 0 00-1.414 1.414l.707.707a1 1 0 001.414-1.414l-.707-.707zM3 11a1 1 0 100-2H2a1 1 0 100 2h1zM6.364 15.05a1 1 0 010-1.414l.707-.707a1 1 0 011.414 1.414l-.707.707a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>;
const MoonIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;
const UploadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l4-4m0 0l4 4m-4-4v12" /></svg>;

export default ModelListView;