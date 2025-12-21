import { useState } from 'react';
import { syncAnonymousSessionsToUser } from '../services/sessionManagement';

export const useAuthModal = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleAuthSuccess = async (user: any) => {
    // Sync anonymous sessions to the authenticated user
    if (user) {
      await syncAnonymousSessionsToUser(user.user_id);
    }
    setIsModalOpen(false);
  };

  return {
    isModalOpen,
    openModal,
    closeModal,
    handleAuthSuccess
  };
};