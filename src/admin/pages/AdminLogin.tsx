import React, { useState } from 'react';
import { Shield, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { supabase, supabaseAdmin } from '../../lib/supabaseClient';

interface AdminLoginProps {
  onLoginSuccess: (email: string) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Hardcoded test credentials (as solid safety fallbacks)
  const TEST_EMAIL = 'admin@oneshefaro.in';
  const TEST_PASS = 'Admin@123';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Quick client-side validation
    if (!email) {
      setError('Please provide your admin email address.');
      return;
    }
    if (!password) {
      setError('Password is required to sign in.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Attempt standard Supabase Auth Login
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password
      });

      // 2. If Auth is successful, verify against the admins table
      if (!authError && data?.user) {
        const { data: adminUser, error: dbError } = await supabaseAdmin
          .from('admins')
          .select('*')
          .eq('email', email.trim().toLowerCase())
          .maybeSingle();

        if (dbError) {
          console.warn('Could not query admins table:', dbError);
        }

        if (adminUser) {
          // Admin found and verified in remote database
          setIsLoading(false);
          onLoginSuccess(email.trim().toLowerCase());
          return;
        } else {
          // If the auth was successful but they aren't in the admins table,
          // let's check if they are the special fallback super admin
          if (email.trim().toLowerCase() === TEST_EMAIL.toLowerCase()) {
            setIsLoading(false);
            onLoginSuccess(email.trim().toLowerCase());
            return;
          }

          // Otherwise deny access
          await supabase.auth.signOut();
          setIsLoading(false);
          setError('Access denied. This account does not possess administrator privileges.');
          return;
        }
      }

      // 3. Fallback check for offline/mock development
      if (email.trim().toLowerCase() === TEST_EMAIL.toLowerCase() && password === TEST_PASS) {
        setIsLoading(false);
        onLoginSuccess(email.trim().toLowerCase());
        return;
      }

      // If both Supabase auth failed and fallback credentials failed, reject
      setIsLoading(false);
      setError(authError?.message || 'Invalid credentials. Please verify your admin username and security key.');
    } catch (err: any) {
      console.error('Admin login error:', err);
      // Fallback in case of network issues
      if (email.trim().toLowerCase() === TEST_EMAIL.toLowerCase() && password === TEST_PASS) {
        setIsLoading(false);
        onLoginSuccess(email.trim().toLowerCase());
      } else {
        setIsLoading(false);
        setError('Authentication service error. Please try again or use demo credentials.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Header */}
        <div className="flex justify-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-indigo-500/30">
              S
            </div>
            <div>
              <span className="font-semibold text-xl tracking-tight text-white block">one.shefaro</span>
              <span className="text-[10px] uppercase tracking-wider text-indigo-400 font-extrabold block">Super Admin Portal</span>
            </div>
          </div>
        </div>

        <h2 className="mt-8 text-center text-3xl font-extrabold text-white tracking-tight">
          Sign In to Portal
        </h2>
        <p className="mt-2 text-center text-xs text-slate-400">
          Secure restricted area. Authorized personnel only.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-slate-800 py-8 px-6 shadow-2xl rounded-2xl border border-slate-700/50">
          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            {/* Error Notification */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-200 p-3 rounded-xl flex items-start gap-2.5 text-xs font-semibold animate-shake">
                <AlertCircle className="w-4.5 h-4.5 text-red-400 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Admin Email Address
              </label>
              <div className="mt-2.5 relative rounded-xl shadow-sm">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="admin@oneshefaro.in"
                  className="block w-full h-11 px-4 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-colors"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Security Password Key
              </label>
              <div className="mt-2.5 relative rounded-xl shadow-sm">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="••••••••"
                  className="block w-full h-11 pl-4 pr-12 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 focus:outline-none min-h-[44px] cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Sign In Trigger Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 flex justify-center items-center px-4 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 transition-colors shadow-lg shadow-indigo-600/20 focus:outline-none min-h-[44px] cursor-pointer"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Establishing session...</span>
                  </div>
                ) : (
                  <span>Verify and Sign In</span>
                )}
              </button>
            </div>
          </form>

          {/* Helper Credentials Badge */}
          <div className="mt-6 pt-5 border-t border-slate-700/50 text-center">
            <p className="text-[11px] text-slate-400 font-medium">
              Demo Access: <span className="text-indigo-400 font-bold">admin@oneshefaro.in</span> / <span className="text-indigo-400 font-bold">Admin@123</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
