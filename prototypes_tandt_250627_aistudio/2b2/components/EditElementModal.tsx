
import React, { useState } from 'react';
import { DigitalElement } from '../types';

interface EditElementModalProps {
  element: DigitalElement;
  onClose: () => void;
  onSave: (updatedElement: DigitalElement) => void;
}

const EditElementModal: React.FC<EditElementModalProps> = ({ element, onClose, onSave }) => {
  const [displayName, setDisplayName] = useState(element.DisplayName);
  const [description, setDescription] = useState(element.Description || '');

  const handleSave = () => {
    onSave({
      ...element,
      DisplayName: displayName,
      Description: description,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-lg transform transition-all">
        <div className="p-5 border-b dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-bold text-tandt-dark dark:text-gray-100">Edit Element</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-2xl">&times;</button>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Display Name
            </label>
            <input
              type="text"
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-tandt-dark dark:text-white rounded-md shadow-sm focus:ring-tandt-primary focus:border-tandt-primary"
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-tandt-dark dark:text-white rounded-md shadow-sm focus:ring-tandt-primary focus:border-tandt-primary"
            />
          </div>
        </div>
        
        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t dark:border-gray-700 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 font-semibold rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm bg-tandt-primary text-white font-semibold rounded-md hover:bg-blue-700 transition"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditElementModal;
