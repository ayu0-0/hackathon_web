import React, { useState, useEffect } from 'react';
import './App.css';
import { Form, MailLoginForm } from './components/LoginForm';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import { fireAuth, register, login, signOutWithMail } from './firebaseAuth';
import Contents from './Contents';
import PostPage from './PostPage';


interface User {
  id: string;
  name: string;
  email: string;
  userid: string;
}




const App = () => {
  const [loginUser, setLoginUser] = useState(fireAuth.currentUser);
  const [userUid, setUserUid] = useState<string | null>(null);
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);


  useEffect(() => {

    const unsubscribe = fireAuth.onAuthStateChanged(user => {
      setLoginUser(user);
    });


    const fetchData = async () => {
      try {
        const response = await fetch(
          "http://localhost:8000/users",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        setUsers(data);
        console.log(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();

    return () => unsubscribe();
  }, []);

  const unsubscribe = fireAuth.onAuthStateChanged(user => {
    setLoginUser(user);
    if (user) {
      setUserUid(user.uid); // ログインユーザーのUIDをステートに設定
    } else {
      setUserUid(null);
    }
  });

  const handleFormSubmit = (email: string, password: string) => {
    register(email, password);
  };

  const handleFormLogin = (email: string, password: string) => {
    login(email, password).then(() => {
      navigate('/dashboard');
    });
  };

  const handleSignOut = () => {
    signOutWithMail(navigate);
  };

  return (
    <>
      <Routes>
        <Route path="/" element={
          <>
            <Form onSubmitFour={handleFormSubmit} />
            <MailLoginForm onSubmit={handleFormLogin} />
            {loginUser ? (
              <div>
                ログイン中
                <div>UID: {userUid}</div> {/* UIDを表示 */}
              </div>
            ) : null}
          </>
        } />
        <Route path="/dashboard" element={<Contents signOut={handleSignOut} />} />
        <Route path="/post" element={<PostPage />} />
      </Routes>
    </>
  );
};

const AppWrapper = () => {
  return (
    <Router>
      <App />
    </Router>
  );
};

export default AppWrapper;