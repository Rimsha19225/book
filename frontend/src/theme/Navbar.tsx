
import React, { useState, useRef, useEffect } from 'react';
import OriginalNavbar from '@theme-original/Navbar';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from '../components/Auth/AuthModal';
import { syncAnonymousSessionsToUser } from '../services/sessionManagement';

const NavbarAuthComponent = () => {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoginView, setIsLoginView] = useState(true);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const openModal = () => {
    setIsModalOpen(true);
    setIsUserMenuOpen(false);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleAuthSuccess = async () => {
    if (user) {
      await syncAnonymousSessionsToUser(user.user_id);
    }
    setIsModalOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (loading) {
    return <div style={{ padding: '0 10px' }}>Loading...</div>;
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {isAuthenticated ? (
        <div className="navbar__item" ref={userMenuRef} style={{ position: 'relative' }}>
          <button
            className="navbar__link"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'white',
              fontSize: '1.2em',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            aria-label="User menu"
          >
            👤
          </button>
          {isUserMenuOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              backgroundColor: 'white',
              borderRadius: '4px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              zIndex: 1000,
              minWidth: '150px',
              marginTop: '4px'
            }}>
              <div
                onClick={() => setIsUserMenuOpen(false)}
                style={{
                  padding: '8px 12px',
                  borderBottom: '1px solid #eee',
                  fontWeight: 'bold',
                  color: '#333'
                }}
              >
                {user?.name}
              </div>
              <button
                onClick={() => {
                  alert('Chat history page would open here');
                  setIsUserMenuOpen(false);
                }}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: 'none',
                  background: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  color: '#333'
                }}
              >
                Chat History
              </button>
              <button
                onClick={handleLogout}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: 'none',
                  background: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  color: '#333'
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="navbar__link"
            onClick={openModal}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'white',
              fontSize: '14px',
              padding: '4px 8px'
            }}
          >
            Login
          </button>
          <button
            className="navbar__link"
            onClick={() => {
              setIsLoginView(false);
              openModal();
            }}
            style={{
              background: '#2563eb',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              color: 'white',
              fontSize: '14px',
              padding: '4px 12px'
            }}
          >
            Sign Up
          </button>
        </div>
      )}

      <AuthModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onAuthSuccess={handleAuthSuccess}
        isLoginView={isLoginView}
        onSwitchView={() => setIsLoginView(!isLoginView)}
      />
    </div>
  );
};

type NavbarProps = {
  [key: string]: any;
};

const Navbar: React.FC<NavbarProps> = (props) => {
  return (
    <OriginalNavbar {...props}>
      <NavbarAuthComponent />
      {props.children}
    </OriginalNavbar>
  );
};

export default Navbar;