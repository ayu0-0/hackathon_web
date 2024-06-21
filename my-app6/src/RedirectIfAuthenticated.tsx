import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { fireAuth } from './firebaseAuth';

interface RedirectIfAuthenticatedProps {
  children: ReactNode;
}

const RedirectIfAuthenticated: React.FC<RedirectIfAuthenticatedProps> = ({ children }) => {
  const user = fireAuth.currentUser;

  if (user) {
    // ユーザーがログインしている場合は /dashboard にリダイレクト
    return <Navigate to="/dashboard" />;
  }

  // ユーザーがログインしていない場合は子コンポーネントを表示
  return <>{children}</>;
};

export default RedirectIfAuthenticated;