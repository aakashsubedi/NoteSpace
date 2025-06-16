import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Notes from './components/Notes';
import AuthPage from './components/AuthPage';
import LandingPage from './components/LandingPage';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/auth" />;
};

const App: React.FC = () => {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route
                path="/notes"
                element={
                  <PrivateRoute>
                    <Notes />
                  </PrivateRoute>
                }
              />
            </Routes>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;