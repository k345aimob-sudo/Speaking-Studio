import React from 'react';
import { UserRole } from '../types';
import { LoginScreen } from './LoginScreen';

interface LoginModalProps {
  isOpen: boolean;
  onLogin: (code: string, name: string, role: UserRole, avatar: string, grade: number) => void;
  currentCode?: string;
  onClose?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onLogin,
  currentCode = 'H901',
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <LoginScreen
      onLogin={onLogin}
      currentCode={currentCode}
      isModal={true}
      onCloseModal={onClose}
    />
  );
};
