import React, { useState } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { supabase } from '../lib/supabaseClient';

export const Login: React.FC = () => {
  const { navigate } = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setError('');
    setSuccess('');

    // Basic validation
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });

      if (authError) {
        throw authError;
      }

      setSuccess('Successfully authenticated! Redirecting to dashboard...');
      setTimeout(() => {
        navigate('dashboard');
      }, 1500);
    } catch (err: any) {
      console.error('Login failed:', err);
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex-grow flex flex-col items-center w-full px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto pt-8 pb-16 gap-stack-xl">
      {/* Split Screen Hero */}
      <section className="w-full grid grid-cols-1 md:grid-cols-2 gap-gutter items-center min-h-[600px]">
        {/* Left: Login Form */}
        <div className="flex flex-col justify-center w-full max-w-[480px] mx-auto md:mx-0 order-2 md:order-1">
          <div className="bg-surface-container-lowest rounded-xl shadow-level-2 p-8 md:p-12 w-full border border-outline-variant/10">
            <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-stack-xs font-bold">Welcome Back</h1>
            <p className="font-body-md text-body-md text-on-surface-variant mb-6">Log in to manage your shipments and tracking.</p>
            
            {error && (
              <div className="p-4 mb-6 text-sm text-on-error-container bg-error-container rounded-lg flex items-center gap-2 border border-error/20">
                <span className="material-symbols-outlined text-[20px]">error</span>
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="p-4 mb-6 text-sm text-emerald-900 bg-emerald-50 rounded-lg flex items-center gap-2 border border-emerald-200">
                <span className="material-symbols-outlined text-[20px] text-emerald-600">check_circle</span>
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold" htmlFor="email">Email Address</label>
                <input 
                  className="h-14 bg-surface-bright rounded-lg px-4 border-none focus:ring-1 focus:ring-primary focus:bg-white shadow-sm border-b-2 border-transparent focus:border-primary transition-all text-on-surface font-body-md outline-none" 
                  id="email" 
                  placeholder="Enter your email" 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold" htmlFor="password">Password</label>
                  <button 
                    type="button"
                    onClick={() => alert('Password reset link sent to ' + (email || 'your email') + '!')}
                    className="font-label-sm text-label-sm text-secondary hover:text-primary transition-colors cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <input 
                  className="h-14 bg-surface-bright rounded-lg px-4 border-none focus:ring-1 focus:ring-primary focus:bg-white shadow-sm border-b-2 border-transparent focus:border-primary transition-all text-on-surface font-body-md outline-none" 
                  id="password" 
                  placeholder="Enter your password" 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-3 mt-2">
                <input 
                  className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary bg-surface-bright cursor-pointer" 
                  id="remember" 
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <label className="font-body-md text-body-md text-on-surface-variant cursor-pointer select-none" htmlFor="remember">Remember me</label>
              </div>
              <button 
                className="h-14 mt-4 bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:opacity-90 transition-opacity w-full flex items-center justify-center shadow-level-2 cursor-pointer font-semibold gap-2 disabled:opacity-50" 
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    <span>Logging In...</span>
                  </>
                ) : (
                  'Log In'
                )}
              </button>
            </form>
            <div className="mt-8 text-center">
              <span className="font-body-md text-body-md text-on-surface-variant">New here? </span>
              <button 
                onClick={() => navigate('signup')}
                className="font-label-md text-label-md text-primary font-semibold hover:text-secondary transition-colors underline-offset-4 hover:underline cursor-pointer"
              >
                Create an account
              </button>
            </div>
          </div>
        </div>
        {/* Right: Illustration */}
        <div className="w-full flex justify-center items-center p-8 bg-surface-container-low rounded-xl md:min-h-[600px] order-1 md:order-2 shadow-inner overflow-hidden relative border border-outline-variant/10">
          <div className="absolute inset-0 bg-gradient-to-tr from-surface-container-highest to-surface opacity-50"></div>
          <img 
            alt="Person tracking shipment on phone" 
            className="w-full max-w-[400px] h-auto object-contain relative z-10 rounded-lg drop-shadow-xl hover:scale-105 transition-transform duration-700" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCpPJLjsEvqWmJJUo0kzL8F3SbiTFVytRXz9ff1X-Yq6kHEpEgzsI8X5cGgvkHVWV723mDDO5M2vZ8wTbch9MDBO2nK6hSQmmii5BFm5SYRo_Wwttkp95zrnPxRQnaCUVncjn6cqSEnF1VLw6x-gpe5scQ9EgmEQHiPG9wcl_UwXfndgJ8E9X2tFNN7NOuzhKR7r6ectrZ-3HDogY1fl05x1-0ax_6WgIuL-oP1D8XKBuSWfkQ8j6dlJx1-XgPVzwP9OEe9LVXnb3L5"
          />
        </div>
      </section>

      {/* Trust / Benefit Badges */}
      <section className="w-full grid grid-cols-1 md:grid-cols-3 gap-gutter mt-4">
        <div className="bg-surface-container-lowest p-8 rounded-xl shadow-level-1 flex flex-col items-start gap-4 border border-outline-variant/10">
          <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>speed</span>
          </div>
          <div>
            <h3 className="font-label-md text-label-md text-on-surface mb-1 font-semibold">Fast Access</h3>
            <p className="font-body-md text-body-md text-on-surface-variant text-sm">Quick login process to get you straight to your dashboard.</p>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-8 rounded-xl shadow-level-1 flex flex-col items-start gap-4 border border-outline-variant/10">
          <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
          </div>
          <div>
            <h3 className="font-label-md text-label-md text-on-surface mb-1 font-semibold">Secure Login</h3>
            <p className="font-body-md text-body-md text-on-surface-variant text-sm">Enterprise-grade data encryption keeping your details safe.</p>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-8 rounded-xl shadow-level-1 flex flex-col items-start gap-4 border border-outline-variant/10">
          <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>history</span>
          </div>
          <div>
            <h3 className="font-label-md text-label-md text-on-surface mb-1 font-semibold">Continue Tracking</h3>
            <p className="font-body-md text-body-md text-on-surface-variant text-sm">Pick up right where you left off with saved tracking history.</p>
          </div>
        </div>
      </section>

      {/* Secondary Content */}
      <section className="w-full bg-surface-container-lowest rounded-xl shadow-level-1 p-8 md:p-16 flex flex-col md:flex-row items-center gap-stack-md border border-outline-variant/20">
        <div className="w-full md:w-1/2 space-y-4">
          <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">Access your dashboard</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Manage all your domestic shipments in one place. View real-time statuses, update delivery preferences, and streamline your logistics workflow effortlessly.</p>
          <button 
            onClick={() => alert('Shipping dashboards will display direct real-time delivery trackers, package weights, and delivery history.')}
            className="h-14 px-8 bg-surface-container-highest text-primary rounded-lg font-label-md text-label-md hover:bg-outline-variant/30 transition-colors shadow-sm cursor-pointer font-semibold"
          >
            Learn More
          </button>
        </div>
        <div className="w-full md:w-1/2 flex justify-center">
          <img 
            alt="User managing dashboard" 
            className="w-full max-w-[320px] h-auto object-contain rounded-lg drop-shadow-md" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCdkmD5erukgQMfyQBClWGnYYm9Tb5W5hXgzG0FVexLkHX-a5zrSWbzUAE4T7F70tMUxqCm0zUyml3LF3Wl2JjpkZkXCmuRo8FieAEqJvPm2jmAxVcVkG6ipmFCgzyi7r7RlTEdVNK5d_pQ6FSOYdOCu-XDKQADGlsRq5NL20IpHY6yfoeVAZ5aWzLlVlfEc3KAy1b79KsESatb6lm3oNqCrrOhEBKX5gDtwinVJDjZZ31_2Oo4Mjir_ES-4Pgeix8R5VgbtuggcplH"
          />
        </div>
      </section>
    </main>
  );
};
