import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Activity, Lock, Mail, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('Male');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const endpoint = isLogin ? '/login' : '/signup';
    
    try {
      const payload = isLogin 
        ? { email, password } 
        : { email, password, first_name: firstName, last_name: lastName, gender };

      const response = await fetch(`https://medcore-os.onrender.com${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Authentication failed');
      }

      if (isLogin) {
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('userProfile', JSON.stringify({
          firstName: data.first_name,
          lastName: data.last_name,
          gender: data.gender,
          email: data.email
        }));
        navigate('/dashboard');
      } else {
        // If signup is successful, switch to login
        setIsLogin(true);
        setError("Account created successfully! Please sign in.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070B14] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-[#070B14] to-[#070B14] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-card border border-gray-800 shadow-[0_0_30px_rgba(6,182,212,0.2)] mb-4">
            <Activity className="text-primary animate-pulse" size={32} />
          </div>
          <h1 className="text-2xl font-black text-white tracking-widest uppercase">MED-CORE OS</h1>
          <p className="text-sm text-gray-500 mt-2 uppercase tracking-widest">Secure Healthcare Gateway</p>
        </div>

        <div className="bg-card border border-gray-800 rounded-2xl shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
          
          <div className="p-8">
            <div className="flex bg-gray-900 rounded-xl p-1 mb-8">
              <button 
                type="button"
                onClick={() => { setIsLogin(true); setError(null); }}
                className={`flex-1 py-2 text-sm font-bold uppercase tracking-wider rounded-lg transition-all ${isLogin ? 'bg-card text-primary shadow-md' : 'text-gray-500 hover:text-gray-300'}`}
              >
                Sign In
              </button>
              <button 
                type="button"
                onClick={() => { setIsLogin(false); setError(null); }}
                className={`flex-1 py-2 text-sm font-bold uppercase tracking-wider rounded-lg transition-all ${!isLogin ? 'bg-card text-primary shadow-md' : 'text-gray-500 hover:text-gray-300'}`}
              >
                Create Account
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <AnimatePresence>
                {!isLogin && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-5 overflow-hidden"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">First Name</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                          <input 
                            type="text" 
                            required={!isLogin}
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="w-full bg-[#0b101a] border border-gray-700 rounded-xl pl-12 pr-4 py-3 text-gray-100 placeholder-gray-600 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all"
                            placeholder="John"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Last Name</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                          <input 
                            type="text" 
                            required={!isLogin}
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="w-full bg-[#0b101a] border border-gray-700 rounded-xl pl-12 pr-4 py-3 text-gray-100 placeholder-gray-600 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all"
                            placeholder="Doe"
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Gender</label>
                      <select 
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full bg-[#0b101a] border border-gray-700 rounded-xl px-4 py-3 text-gray-100 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all appearance-none"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#0b101a] border border-gray-700 rounded-xl pl-12 pr-4 py-3 text-gray-100 placeholder-gray-600 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all"
                    placeholder="doctor@medcore.os"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Secure Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#0b101a] border border-gray-700 rounded-xl pl-12 pr-4 py-3 text-gray-100 placeholder-gray-600 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {error && (
                <div className={`p-3 rounded-lg text-sm font-medium text-center ${error.includes('successfully') ? 'bg-success/10 text-success border border-success/20' : 'bg-danger/10 text-danger border border-danger/20'}`}>
                  {error}
                </div>
              )}

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full relative overflow-hidden py-4 rounded-xl bg-primary text-background font-bold uppercase tracking-widest mt-6 hover:bg-[#08c5e6] transition-colors shadow-[0_0_20px_rgba(6,182,212,0.3)] disabled:opacity-50"
              >
                {isLoading ? 'Authenticating...' : isLogin ? 'Access System' : 'Register Terminal'}
              </button>
            </form>
          </div>
          <div className="bg-gray-900 px-8 py-4 flex items-center justify-center gap-2 text-xs text-gray-500 font-medium">
            <ShieldCheck size={14} className="text-success" /> End-to-End Encrypted Session
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
