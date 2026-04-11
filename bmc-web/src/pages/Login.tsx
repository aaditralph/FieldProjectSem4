import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import './Login.css';

const Login = () => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [storedOtp, setStoredOtp] = useState('');
  
  const { login, sendOtp, isLoading, error, isAuthenticated, user, clearError } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user?.role === 'ADMIN') {
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    if (phone.length !== 10) {
      alert('Please enter a valid 10-digit phone number');
      return;
    }

    try {
      const otpCode = await sendOtp(phone);
      setStoredOtp(otpCode || '');
      setStep('otp');
      alert(`OTP sent: ${otpCode || '1234'} (In production, this will be sent via SMS)`);
    } catch (err) {
      // Error handled in store
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    if (otp.length !== 4) {
      alert('Please enter a valid 4-digit OTP');
      return;
    }

    try {
      await login({ phone, otp: storedOtp || otp });
      navigate('/');
    } catch (err) {
      // Error handled in store
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1>BMC E-Waste</h1>
          <p>Admin Dashboard</p>
        </div>

        {step === 'phone' ? (
          <form onSubmit={handleSendOtp} className="login-form">
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="Enter 10-digit phone number"
                maxLength={10}
                disabled={isLoading}
              />
            </div>
            
            {error && <div className="error-text">{error}</div>}
            
            <button type="submit" className="login-button" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send OTP'}
            </button>

            <div className="demo-info">
              <p><strong>Demo Credentials:</strong></p>
              <p>Admin: 9876543212</p>
              <p>OTP: 1234</p>
            </div>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label htmlFor="otp">Enter OTP</label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="Enter 4-digit OTP"
                maxLength={4}
                disabled={isLoading}
              />
            </div>
            
            {error && <div className="error-text">{error}</div>}
            
            <button type="submit" className="login-button" disabled={isLoading}>
              {isLoading ? 'Verifying...' : 'Login'}
            </button>
            
            <button
              type="button"
              className="back-button"
              onClick={() => {
                setStep('phone');
                setOtp('');
                clearError();
              }}
              disabled={isLoading}
            >
              Change Phone Number
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
