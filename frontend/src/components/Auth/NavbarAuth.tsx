import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AuthModal from '../Auth/AuthModal';
import { syncAnonymousSessionsToUser } from '../../services/sessionManagement';

const NavbarAuth = () => {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleAuthSuccess = async () => {
    // Sync anonymous sessions to the authenticated user
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
    return <div className="navbar__item">Loading...</div>;
  }

  return (
    <>
      {isAuthenticated ? (
        <div className="navbar__item navbar__user-menu" ref={userMenuRef}>
          <button
            className="navbar__link"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white' }}
          >
            👤 {user?.name}
          </button>
          {isUserMenuOpen && (
            <div className="navbar__user-dropdown" style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              backgroundColor: 'white',
              borderRadius: '4px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              zIndex: 1000,
              minWidth: '150px'
            }}>
              <button
                onClick={handleLogout}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: 'none',
                  background: 'none',
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      ) : (
        <button
          className="navbar__item navbar__link"
          onClick={openModal}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white' }}
        >
          Sign In
        </button>
      )}

      <AuthModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onAuthSuccess={handleAuthSuccess}
      />
    </>
  );
};

export default NavbarAuth;