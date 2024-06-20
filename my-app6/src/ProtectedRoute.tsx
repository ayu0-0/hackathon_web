import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { fireAuth } from './firebaseAuth';

const ProtectedRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = fireAuth.onAuthStateChanged(user => {
      setIsAuthenticated(!!user);
    });

    return () => unsubscribe();
  }, []);

  if (isAuthenticated === null) {
    return children; // ローディング中でも元の画面を表示
  }

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;