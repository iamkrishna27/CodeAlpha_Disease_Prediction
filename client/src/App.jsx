import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './views/Dashboard';
import DiabetesForm from './DiabetesForm';
import HeartForm from './HeartForm';
import KidneyForm from './KidneyForm';
import ParkinsonsForm from './ParkinsonsForm';
import Auth from './views/Auth';
import './index.css';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Main Internal Dashboard (Keeps existing state-based routing intact)
const MainDashboard = () => {
  const [activeModule, setActiveModule] = useState('dashboard');

  return (
    <Layout activeModule={activeModule} setActiveModule={setActiveModule}>
      {activeModule === 'dashboard' && <Dashboard setActiveModule={setActiveModule} />}
      {activeModule === 'diabetes' && <DiabetesForm />}
      {activeModule === 'heart' && <HeartForm />}
      {activeModule === 'kidney' && <KidneyForm />}
      {activeModule === 'parkinsons' && <ParkinsonsForm />}
      {(activeModule === 'history' || activeModule === 'settings') && (
        <div className="flex flex-col items-center justify-center h-[60vh] text-gray-500">
          <div className="text-4xl mb-4">🚧</div>
          <h2 className="text-xl font-bold text-gray-300">Module Under Construction</h2>
          <p className="text-sm mt-2">Check back in future updates.</p>
        </div>
      )}
    </Layout>
  );
};

// Main App Router
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Auth />} />
        
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <MainDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;