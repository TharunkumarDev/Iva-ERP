
import React, { useState } from 'react';
import { UserRole } from '../types';
import { MockService } from '../services/mockData';
import { Button, Input, Card } from '../components/UI';
import { Shield, User, KeyRound, ArrowRight } from 'lucide-react';

interface AuthProps {
  onLogin: (user: any) => void;
  logoUrl?: string;
}

export const AuthScreen: React.FC<AuthProps> = ({ onLogin, logoUrl }) => {
  const [role, setRole] = useState<UserRole | null>(null); // Null means selecting role
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    setLoading(true);
    setError('');

    // Simulate Network Call
    try {
      // Pass password to verify credentials, trim username to avoid whitespace issues
      const user = await MockService.login(username.trim(), role!, password);
      
      if (user) {
        onLogin(user);
      } else {
        setError('Invalid credentials. Please check your username/ID and password.');
      }
    } catch (err) {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-100 min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-200 rounded-full mix-blend-multiply filter blur-[120px] opacity-40 animate-blob"></div>
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-200 rounded-full mix-blend-multiply filter blur-[120px] opacity-40 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-[-20%] left-[20%] w-[600px] h-[600px] bg-indigo-200 rounded-full mix-blend-multiply filter blur-[120px] opacity-40 animate-blob animation-delay-4000"></div>
        </div>

      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-[32px] shadow-2xl shadow-slate-200/50 relative z-10 overflow-hidden border border-white">
        {!role ? (
            <div className="flex flex-col items-center justify-center text-center p-8">
              <div className="mb-8 relative group">
                <div className="absolute -inset-4 bg-blue-400 rounded-full opacity-20 blur-xl animate-pulse group-hover:opacity-30 transition-opacity"></div>
                <img 
                    src={logoUrl || "https://placehold.co/400x400/3b82f6/ffffff?text=IVA+Logo"} 
                    alt="IVA Music Academy" 
                    className="relative w-32 h-32 object-contain drop-shadow-2xl transform group-hover:scale-105 transition-transform duration-300 rounded-2xl" 
                />
              </div>
              
              <h1 className="text-3xl font-bold text-slate-800 mb-2 tracking-tight">IVA Music Academy</h1>
              <p className="text-slate-500 mb-10 max-w-xs">Master your craft with the best digital learning platform.</p>

              <div className="w-full space-y-4">
                <div 
                    onClick={() => setRole(UserRole.STUDENT)}
                    className="flex items-center p-4 cursor-pointer bg-white rounded-2xl border-2 border-transparent hover:border-blue-200 hover:shadow-lg shadow-sm transition-all duration-200 group"
                >
                  <div className="bg-blue-50 p-3 rounded-xl mr-4 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <User size={24} />
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="font-bold text-slate-800">Student Login</h3>
                    <p className="text-xs text-slate-500">Access your dashboard</p>
                  </div>
                  <ArrowRight size={20} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                </div>

                <div 
                    onClick={() => setRole(UserRole.TEACHER)}
                    className="flex items-center p-4 cursor-pointer bg-white rounded-2xl border-2 border-transparent hover:border-purple-200 hover:shadow-lg shadow-sm transition-all duration-200 group"
                >
                  <div className="bg-purple-50 p-3 rounded-xl mr-4 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <User size={24} />
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="font-bold text-slate-800">Teacher Login</h3>
                    <p className="text-xs text-slate-500">Manage your classes</p>
                  </div>
                  <ArrowRight size={20} className="text-slate-300 group-hover:text-purple-500 transition-colors" />
                </div>

                <button 
                  onClick={() => setRole(UserRole.ADMIN)}
                  className="mt-8 text-sm text-slate-400 font-medium hover:text-blue-600 transition-colors flex items-center justify-center w-full py-2"
                >
                  <Shield size={14} className="mr-2" /> Admin Portal
                </button>
              </div>
            </div>
        ) : (
            <div className="flex flex-col p-8">
              <button onClick={() => { setRole(null); setError(''); setUsername(''); setPassword(''); }} className="self-start text-slate-400 mb-6 hover:text-slate-600 flex items-center text-sm font-medium transition-colors">
                ← Back to selection
              </button>

              <div className="mb-8">
                <h2 className="text-3xl font-bold text-slate-800 mb-2">
                  {role === UserRole.ADMIN ? 'Admin Access' : role === UserRole.TEACHER ? 'Teacher Portal' : 'Welcome Back!'}
                </h2>
                <p className="text-slate-500">
                  {role === UserRole.ADMIN ? 'System controls and management.' : 'Please enter your credentials to continue.'}
                </p>
              </div>

              <div className="space-y-6">
                <Input 
                  label={role === UserRole.ADMIN ? "Username" : "ID Card Number"}
                  placeholder={role === UserRole.ADMIN ? "ivamuc001" : "e.g. IVA-S2023"}
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (error) setError('');
                  }}
                  icon={User}
                />
                <Input 
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  icon={KeyRound}
                />

                {error && (
                  <div className="bg-red-50 text-red-600 text-sm p-4 rounded-xl border border-red-100 flex items-center animate-fade-in">
                    <Shield size={16} className="mr-2 flex-shrink-0" /> {error}
                  </div>
                )}

                <Button fullWidth onClick={handleLogin} variant="primary" className="mt-2">
                  {loading ? 'Authenticating...' : 'Sign In'}
                </Button>
                
                {role !== UserRole.ADMIN && (
                  <p className="text-center text-sm text-slate-400 mt-4">
                    Forgot password? <span className="text-blue-500 cursor-pointer hover:underline">Contact Admin</span>
                  </p>
                )}
              </div>
            </div>
        )}
      </div>
      
      <div className="absolute bottom-6 text-slate-400 text-xs font-medium">
        © 2024 IVA Music Academy. All rights reserved.
      </div>
    </div>
  );
};
