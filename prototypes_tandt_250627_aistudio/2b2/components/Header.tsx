
import React from 'react';
import { AppMode } from '../types';

interface HeaderProps {
  currentMode: AppMode;
  onSetMode: (mode: AppMode) => void;
  onLoadModel: (modelName: 'performance' | 'habitat') => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const ModeButton: React.FC<{
  label: AppMode;
  currentMode: AppMode;
  onClick: (mode: AppMode) => void;
  icon: React.ReactNode;
}> = ({ label, currentMode, onClick, icon }) => (
  <button
    onClick={() => onClick(label)}
    className={`flex items-center px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-200 ${
      currentMode === label
        ? 'bg-tandt-primary text-white shadow'
        : 'text-tandt-secondary dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
    }`}
  >
    {icon}
    <span className="ml-2">{label}</span>
  </button>
);

const Header: React.FC<HeaderProps> = ({ currentMode, onSetMode, onLoadModel, theme, onToggleTheme }) => {
  return (
    <header className="bg-tandt-light dark:bg-gray-800 shadow-md sticky top-0 z-20 border-b border-tandt-border dark:border-gray-700">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <span className="text-2xl font-bold text-tandt-dark dark:text-white tracking-wider">TandT</span>
          </div>
          <div className="flex-1 flex justify-center px-8">
             <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-900 p-1 rounded-lg">
                <ModeButton
                label={AppMode.Modeling}
                currentMode={currentMode}
                onClick={onSetMode}
                icon={<PencilSquareIcon />}
                />
                <ModeButton
                label={AppMode.Analyzing}
                currentMode={currentMode}
                onClick={onSetMode}
                icon={<MagnifyingGlassIcon />}
                />
                <ModeButton
                label={AppMode.Structuring}
                currentMode={currentMode}
                onClick={onSetMode}
                icon={<ChartBarIcon />}
                />
            </div>
          </div>
          <div className="flex items-center space-x-4">
             <span className="text-sm font-medium text-tandt-secondary dark:text-gray-400 hidden sm:inline">Load Model:</span>
             <button onClick={() => onLoadModel('performance')} className="text-sm font-semibold text-tandt-primary hover:underline">Performance Review</button>
             <button onClick={() => onLoadModel('habitat')} className="text-sm font-semibold text-tandt-primary hover:underline">Habitat Decision</button>
             <button onClick={onToggleTheme} className="ml-4 p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
             </button>
          </div>
        </div>
      </div>
    </header>
  );
};

// Icons
const PencilSquareIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>;
const MagnifyingGlassIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>;
const ChartBarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm5 2a1 1 0 00-1 1v10a1 1 0 102 0V6a1 1 0 00-1-1zm5-2a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;
const SunIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-2.12 6.536a1 1 0 01-1.414 0l-.707-.707a1 1 0 011.414-1.414l.707.707a1 1 0 010 1.414zM4.95 6.364a1 1 0 00-1.414 1.414l.707.707a1 1 0 001.414-1.414l-.707-.707zM3 11a1 1 0 100-2H2a1 1 0 100 2h1zM6.364 15.05a1 1 0 010-1.414l.707-.707a1 1 0 011.414 1.414l-.707.707a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>;
const MoonIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>;

export default Header;
