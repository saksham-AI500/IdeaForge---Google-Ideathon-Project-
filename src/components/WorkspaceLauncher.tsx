import React from 'react';
import { AuthWindow } from './AuthWindow';

interface WorkspaceLauncherProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'signin' | 'signup';
}

export const WorkspaceLauncher: React.FC<WorkspaceLauncherProps> = ({
  isOpen,
  onClose,
  defaultMode = 'signin',
}) => {
  return (
    <AuthWindow
      isOpen={isOpen}
      onClose={onClose}
      defaultMode={defaultMode}
    />
  );
};
