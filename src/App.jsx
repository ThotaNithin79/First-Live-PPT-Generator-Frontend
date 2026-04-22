import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import MediaDashboard from './pages/MediaDashboard';
import PptGenerator from './pages/PptGenerator';
import VerifyAccount from './pages/VerifyAccount';

// NEW IMPORTS HERE:
import UserManagement from './pages/UserManagement';
import AuditLogs from './pages/AuditLogs';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Toaster position="top-right" /> 
                
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/verify-account" element={<VerifyAccount />} />

                    {/* Shared Routes */}
                    <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'EDITOR', 'VIEWER']} />}>
                        <Route element={<Layout />}>
                            <Route path="/" element={<MediaDashboard />} />
                            <Route path="/ppt-generator" element={<PptGenerator />} />
                            
                            {/* ADMIN ONLY ROUTES */}
                            <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                                <Route path="/users" element={<UserManagement />} />
                                <Route path="/audit" element={<AuditLogs />} />
                            </Route>
                        </Route>
                    </Route>
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;