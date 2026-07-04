import React, { useState, useEffect } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { supabase, supabaseAdmin } from '../lib/supabaseClient';

export const Signup: React.FC = () => {
  const { navigate } = useNavigation();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [terms, setTerms] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<'none' | 'weak' | 'medium' | 'strong'>('none');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);


  // Password strength checker effect
  useEffect(() => {
    if (!password) {
      setPasswordStrength('none');
      return;
    }
    
    if (password.length < 5) {
      setPasswordStrength('weak');
    } else if (password.length < 8) {
      setPasswordStrength('medium');
    } else {
      // Strong requires letters and numbers or symbols
      const hasNumber = /\D/.test(password) && /\d/.test(password);
      const hasSpecial = /[^A-Za-z0-9]/.test(password);
      if (hasNumber || hasSpecial) {
        setPasswordStrength('strong');
      } else {
        setPasswordStrength('medium');
      }
    }
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setError('');
    setSuccess('');

    // Field Validations
    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!phone.trim()) {
      setError('Please enter your phone number.');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (phone.replace(/\D/g, '').length < 10) {
      setError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    if (!password) {
      setError('Please specify a password.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!terms) {
      setError('You must accept the Terms of Service and Privacy Policy to continue.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. SignUp through Supabase Auth
      const { data, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            full_name: fullName.trim(),
            phone_number: `+91 ${phone.trim()}`
          }
        }
      });

      if (authError) {
        throw authError;
      }

      // 2. Insert profile record into public 'users' table
      const userId = data.user?.id || `usr-${Date.now()}`;
      const { error: dbError } = await supabaseAdmin.from('users').insert({
        id: userId,
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: `+91 ${phone.trim()}`,
        signup_date: new Date().toISOString().substring(0, 10),
        shipment_count: 0,
        status: 'Active'
      });

      if (dbError) {
        console.warn('Could not insert user profile in database table:', dbError);
      }

      setSuccess('Account created successfully! Welcome to one.shefaro India.');
      setTimeout(() => {
        navigate('home');
      }, 2000);
    } catch (err: any) {
      console.error('Registration failed:', err);
      setError(err.message || 'An error occurred during registration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex-grow flex flex-col lg:flex-row w-full max-w-[1600px] mx-auto">
      {/* Left Side: Form */}
      <section className="w-full lg:w-1/2 flex items-center justify-center px-margin-mobile lg:px-[120px] py-12 lg:py-16">
        <div className="w-full max-w-[480px] bg-surface-container-lowest rounded-xl shadow-level-2 p-8 md:p-12 border border-outline-variant/10">
          <h1 className="font-headline-lg-mobile md:font-headline-lg text-primary mb-stack-xs font-bold">Create an account</h1>
          <p className="font-body-md text-on-surface-variant mb-6">Start booking parcels across India with ease.</p>

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

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="sr-only" htmlFor="fullName">Full Name</label>
                <input 
                  className="input-field outline-none" 
                  id="fullName" 
                  placeholder="Full Name" 
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div>
                <label className="sr-only" htmlFor="email">Email Address</label>
                <input 
                  className="input-field outline-none" 
                  id="email" 
                  placeholder="Email Address" 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="sr-only" htmlFor="phone">Phone Number</label>
                <div className="flex">
                  <div className="h-14 bg-[#F8FAFC] rounded-l-lg px-4 flex items-center justify-center font-body-md text-on-surface-variant border-r border-surface-container-highest">
                    +91
                  </div>
                  <input 
                    className="input-field rounded-l-none outline-none" 
                    id="phone" 
                    placeholder="Phone Number" 
                    maxLength={10}
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
              </div>
              <div>
                <label className="sr-only" htmlFor="password">Password</label>
                <div className="relative">
                  <input 
                    className="input-field pr-12 outline-none" 
                    id="password" 
                    placeholder="Password" 
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button 
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors cursor-pointer" 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? 'visibility' : 'visibility_off'}
                    </span>
                  </button>
                </div>
                {/* Password Strength */}
                {password && (
                  <div className="mt-3">
                    <div className="flex gap-2 mb-1">
                      <div className={`strength-bar ${passwordStrength !== 'none' ? (passwordStrength === 'weak' ? 'active-weak' : passwordStrength === 'medium' ? 'active-medium' : 'bg-emerald-500') : ''}`}></div>
                      <div className={`strength-bar ${passwordStrength === 'medium' ? 'active-medium' : passwordStrength === 'strong' ? 'bg-emerald-500' : ''}`}></div>
                      <div className={`strength-bar ${passwordStrength === 'strong' ? 'bg-emerald-500' : ''}`}></div>
                    </div>
                    <p className="font-label-sm text-on-surface-variant capitalize">
                      {passwordStrength === 'weak' && 'Weak strength'}
                      {passwordStrength === 'medium' && 'Medium strength'}
                      {passwordStrength === 'strong' && 'Strong strength'}
                    </p>
                  </div>
                )}
              </div>
              <div>
                <label className="sr-only" htmlFor="confirmPassword">Confirm Password</label>
                <input 
                  className="input-field outline-none" 
                  id="confirmPassword" 
                  placeholder="Confirm Password" 
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex items-center h-6">
                <input 
                  className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary focus:ring-offset-surface-container-lowest bg-[#F8FAFC] cursor-pointer" 
                  id="terms" 
                  type="checkbox"
                  checked={terms}
                  onChange={(e) => setTerms(e.target.checked)}
                />
              </div>
              <div className="text-sm">
                <label className="font-body-md text-on-surface-variant select-none cursor-pointer" htmlFor="terms">
                  I agree to the <a className="text-primary font-semibold hover:underline underline-offset-4" href="#" onClick={(e) => {e.preventDefault(); alert('Terms and Conditions are governed by Indian parcel regulations.');}}>Terms of Service</a> and <a className="text-primary font-semibold hover:underline underline-offset-4" href="#" onClick={(e) => {e.preventDefault(); alert('Privacy Policies guarantee 100% encryption of individual address and courier tracking logs.');}}>Privacy Policy</a>.
                </label>
              </div>
            </div>
            <button 
              className="btn-primary mt-stack-sm cursor-pointer flex justify-center items-center gap-2 disabled:opacity-50" 
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>Creating Account...</span>
                </>
              ) : (
                'Create Account'
              )}
            </button>
            <p className="text-center font-body-md text-on-surface-variant mt-6">
              Already have an account? <button type="button" onClick={() => navigate('login')} className="text-primary font-semibold hover:underline underline-offset-4 cursor-pointer">Log in</button>
            </p>
          </form>
        </div>
      </section>
      {/* Right Side: Illustration & Benefits */}
      <section className="w-full lg:w-1/2 bg-surface-container px-margin-mobile py-12 lg:p-margin-desktop flex flex-col justify-center items-center relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #d3e4fe 0%, transparent 70%)' }}></div>
        <div className="relative z-10 w-full max-w-[600px] flex flex-col items-center">
          {/* Main Illustration */}
          <div className="w-full max-w-[400px] aspect-square mb-stack-md relative">
            <img 
              alt="Sign up success illustration" 
              className="w-full h-full object-contain drop-shadow-2xl" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAlnnCCBVav1nXq1_STVJOz7cyHDyIP4kxSBVTmDR8Bl7KAV1-i3tVpAr9WZ0_eGA9PVQ0xskRexIPeTwHZVPipf-QLUctlaEI8AJCOQvTeC35D1MJQ8kkX-B4TvhQirhjyZ8Bx8Wlh-mbkbh9On93BZknpTSf2lakj9kgeoayODN51dTLdCCE5xs6B2XMXco7ujXRfm-WuDITnExi09WnnUthzBcNw3In_WWDICcAJaG0sjbrZwHvCuU3JubZ0LWwrnF3NI9ElJN0-"
            />
          </div>
          {/* Benefits Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            <div className="bg-surface-container-lowest/80 backdrop-blur-sm p-6 rounded-xl shadow-level-1 flex flex-col items-center text-center border border-outline-variant/10">
              <div className="w-12 h-12 rounded-full bg-surface-variant flex items-center justify-center mb-4 text-primary">
                <span className="material-symbols-outlined">bolt</span>
              </div>
              <h3 className="font-label-md text-primary mb-1 font-semibold">Quick Signup</h3>
              <p className="font-label-sm text-on-surface-variant">Under 2 minutes</p>
            </div>
            <div className="bg-surface-container-lowest/80 backdrop-blur-sm p-6 rounded-xl shadow-level-1 flex flex-col items-center text-center border border-outline-variant/10">
              <div className="w-12 h-12 rounded-full bg-surface-variant flex items-center justify-center mb-4 text-primary">
                <span className="material-symbols-outlined">shield_lock</span>
              </div>
              <h3 className="font-label-md text-primary mb-1 font-semibold">Secure Account</h3>
              <p className="font-label-sm text-on-surface-variant">Data encrypted</p>
            </div>
            <div className="bg-surface-container-lowest/80 backdrop-blur-sm p-6 rounded-xl shadow-level-1 flex flex-col items-center text-center border border-outline-variant/10">
              <div className="w-12 h-12 rounded-full bg-surface-variant flex items-center justify-center mb-4 text-primary">
                <span className="material-symbols-outlined">box</span>
              </div>
              <h3 className="font-label-md text-primary mb-1 font-semibold">Easy Booking</h3>
              <p className="font-label-sm text-on-surface-variant">Seamless process</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};
