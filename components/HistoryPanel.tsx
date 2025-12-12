import React from 'react';
import { useAppStore } from '../store';

const HistoryPanel: React.FC = () => {
  const model = useAppStore(state => state.model);
  const isHistoryPanelOpen = useAppStore(state => state.isHistoryPanelOpen);
  const toggleHistoryPanel = useAppStore(state => state.toggleHistoryPanel);
  const revertToVersion = useAppStore(state => state.revertToVersion);

  if (!isHistoryPanelOpen || !model) {
    return null;
  }

  const handleRevert = (historyId: string) => {
    if (window.confirm("Are you sure you want to revert to this version? This action will create a new entry in your history.")) {
      revertToVersion(historyId);
    }
  };

  const formatTimeAgo = (isoString: string) => {
    const date = new Date(isoString);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
  };


  const history = model.history || [];

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/60 z-30 transition-opacity ${isHistoryPanelOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={toggleHistoryPanel}
      />
      <div 
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl z-40 transform transition-transform duration-300 ease-in-out ${isHistoryPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Model History</h2>
            <button 
              onClick={toggleHistoryPanel}
              className="p-2 text-gray-400 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          
          <div className="flex-grow overflow-y-auto p-4">
            {history.length > 0 ? (
              <ul className="space-y-4">
                {history.map(entry => (
                  <li key={entry.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">{entry.description}</p>
                    <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400" title={new Date(entry.timestamp).toLocaleString()}>
                            {formatTimeAgo(entry.timestamp)}
                        </span>
                        <button 
                            onClick={() => handleRevert(entry.id)}
                            className="px-3 py-1 text-xs font-semibold rounded-md bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                        >
                            Revert
                        </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400 py-16">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No history yet</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Changes to the model will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default HistoryPanel;
