import React, { useState } from 'react';
import { useAppStore } from '../store';

interface CreateNewModelModalProps {
    // All props removed, will use store
}

const CreateNewModelModal: React.FC<CreateNewModelModalProps> = () => {
    const setIsCreatingModel = useAppStore(state => state.setIsCreatingModel);
    const onCreate = useAppStore(state => state.createModel);
    const onClose = () => setIsCreatingModel(false);

    const [creationMode, setCreationMode] = useState<'manual' | 'ai'>('manual');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<number>(1);
    const [error, setError] = useState('');

    const handleSubmit = () => {
        setError('');
        if (creationMode === 'manual') {
            if (!name.trim()) {
                setError('Model name cannot be empty.');
                return;
            }
            onCreate({ name, type, useAi: false });
        } else {
            if (!description.trim()) {
                setError('Please describe your goal for the AI.');
                return;
            }
            onCreate({ description, type, useAi: true });
        }
    };

    const TabButton: React.FC<{mode: 'manual' | 'ai', children: React.ReactNode}> = ({ mode, children }) => (
        <button
            onClick={() => setCreationMode(mode)}
            className={`px-4 py-2 text-sm font-semibold w-full rounded-md transition-colors ${
                creationMode === mode
                ? 'bg-tandt-primary text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
        >
            {children}
        </button>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-lg transform transition-all">
                <div className="p-5 border-b dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-tandt-dark dark:text-gray-100">Create New Model</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-2xl">&times;</button>
                </div>
                
                <div className="p-6">
                    <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 dark:bg-gray-900 rounded-lg mb-6">
                        <TabButton mode="manual">Start from Scratch</TabButton>
                        <TabButton mode="ai">Generate with AI</TabButton>
                    </div>

                    {creationMode === 'manual' ? (
                        <div>
                            <label htmlFor="modelName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Model Name / Topic
                            </label>
                            <input
                                type="text"
                                id="modelName"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g., Choose new office location"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-tandt-dark dark:text-white rounded-md shadow-sm focus:ring-tandt-primary focus:border-tandt-primary"
                            />
                        </div>
                    ) : (
                         <div>
                            <label htmlFor="modelDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Describe your Goal
                            </label>
                            <textarea
                                id="modelDescription"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                placeholder="e.g., I need to decide on the best new car for my family, considering safety, price, and fuel economy."
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-tandt-dark dark:text-white rounded-md shadow-sm focus:ring-tandt-primary focus:border-tandt-primary"
                            />
                         </div>
                    )}

                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Model Type
                        </label>
                        <div className="space-y-2">
                            <RadioOption id="type-decision" value={1} checked={type===1} onChange={setType} label="Decision Making" description="For clear YES/NO outcomes with a dominance hierarchy." />
                            <RadioOption id="type-performance" value={2} checked={type===2} onChange={setType} label="Performance Review" description="To evaluate status and trends, prioritizing actions." />
                        </div>
                    </div>
                     {error && <p className="text-sm text-red-600 mt-4">{error}</p>}
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t dark:border-gray-700 flex justify-end space-x-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 font-semibold rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition">
                        Cancel
                    </button>
                    <button onClick={handleSubmit} className="px-4 py-2 text-sm bg-tandt-primary text-white font-semibold rounded-md hover:bg-blue-700 transition">
                       {creationMode === 'ai' ? 'Generate & Create' : 'Create Model'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const RadioOption: React.FC<{id: string, value: number, checked: boolean, onChange: (value: number) => void, label: string, description: string}> = ({ id, value, checked, onChange, label, description }) => (
    <label htmlFor={id} className={`flex items-start p-3 rounded-lg border-2 cursor-pointer transition ${checked ? 'border-tandt-primary bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
        <input id={id} type="radio" name="modelType" checked={checked} onChange={() => onChange(value)} className="mt-1 h-4 w-4 text-tandt-primary border-gray-300 focus:ring-tandt-primary" />
        <div className="ml-3 text-sm">
            <span className="font-medium text-gray-900 dark:text-gray-100">{label}</span>
            <p className="text-gray-500 dark:text-gray-400">{description}</p>
        </div>
    </label>
);


export default CreateNewModelModal;
