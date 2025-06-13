import React, { useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import NotesApp from './components/NotesApp';

type AppPage = 'landing' | 'login' | 'signup' | 'app';

function App() {
  const [currentPage, setCurrentPage] = useState<AppPage>('landing');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  const handleNavigate = (page: AppPage) => {
    setCurrentPage(page);
  };

  const handleAuthModeSwitch = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setCurrentPage(mode);
  };

  const handleLogout = () => {
    setCurrentPage('landing');
  };

  return (
    <ThemeProvider>
      <div className="App">
        {currentPage === 'landing' && (
          <LandingPage onNavigate={handleNavigate} />
        )}
        {(currentPage === 'login' || currentPage === 'signup') && (
          <AuthPage
            mode={currentPage}
            onNavigate={handleNavigate}
            onSwitchMode={handleAuthModeSwitch}
          />
        )}
        {currentPage === 'app' && (
          <NotesApp onLogout={handleLogout} />
        )}
      </div>
    </ThemeProvider>
  );
}

export default App;