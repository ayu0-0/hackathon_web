import React, { useState, useEffect } from 'react';
import './App.css';
import { Form, MailLoginForm } from './components/LoginForm';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import { fireAuth, register, login, signOutWithMail } from './firebaseAuth';
import Contents from './Dashboard';
import PostPage from './PostPage';
import ReplyPage from './ReplyPage';
import ReplyReplyPage2 from "./ReplyReplyPage2";
import Status from "./Status";
import ProtectedRoute from './ProtectedRoute';
import RedirectIfAuthenticated from './RedirectIfAuthenticated';
import Login from './Login';
import Resister from './Resister';
import Question from './Question';
import FollowDashboard from './FollowDashboard';
import downImage from './images/down.png';

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
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    const unsubscribe = fireAuth.onAuthStateChanged(user => {
      if (user) {
        setUserUid(user.uid);
        setLoginUser(user);
        console.log("ログインユーザーの情報をステートに設定");
      } else {
        setUserUid(null);
        setLoginUser(null);
      }
    });

    document.body.style.backgroundColor = "orange";
   

    return () => {unsubscribe();
      document.body.style.backgroundColor = '';}
  }, []);

  const handleFormSubmit = async (email: string, password: string, password2: string, name: string, userid: string) => {
    try {
      await register(email, password, name, userid);
      console.log("handleFormSubmit");

      const currentUser = fireAuth.currentUser;
      if (currentUser) {
        setUserUid(currentUser.uid);
        setLoginUser(currentUser);
        console.log("const currentUser:OK");
        console.log(currentUser.uid);

        try {
          const postResponse = await fetch("https://hackathon-api4-ldnwih7maq-uc.a.run.app/users", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ id: currentUser.uid, email, userid, name }),
          });
          if (!postResponse.ok) {
            throw new Error('データの送信に失敗しました');
          }
          console.log("POSTしました");

          const getResponse = await fetch("https://hackathon-api4-ldnwih7maq-uc.a.run.app/users");
          if (!getResponse.ok) {
            throw new Error('データの取得に失敗しました');
          }
          const getData = await getResponse.json();
          setUsers(getData);
        } catch (err) {
          console.error(err);
        }
      }
    } catch (error) {
      console.error("Error in handleFormSubmit:", error);
    }

    window.location.href = "/dashboard";
  };

  const handleFormLogin = async (email: string, password: string) => {
    try {
      await login(email, password);
      console.log("ログイン成功");
      navigate('/dashboard');
    } catch (error) {
      console.error("ログインエラー:", error);
      alert("ログインに失敗しました。再度お試しください。");
    }
  };

  const handleSignOut = () => {
    signOutWithMail(navigate);
  };

  return (
    <>
      <Routes>
        <Route path="/" element={

          <>

            <RedirectIfAuthenticated>
              {isRegistering ? (
                <>
                  <MailLoginForm onSubmit={handleFormLogin} />
                </>
              ) : (
                <>
                  <div className='start-header'>
                    <div className=''>ようこそ！</div>
                    <div className='border-box'>アカウントはお持ちですか？</div>
                    <div className="down-image-container">
                      <img src={downImage} alt="down" className="icon" />
                      <img src={downImage} alt="down" className="icon" />
                      <img src={downImage} alt="down" className="icon" />
                    </div>
                    <div className="three-button-container">
                    <a href='/login'><button className="three-button">登録済みの方は<br/>こちら</button></a>
                    <a href='/resister'><button className="three-button">まだ登録<br/>していない方は<br/>こちら</button></a>
                      <a href='/question'><button className="three-button">わからない方は<br/>こちら</button></a>
                    </div>
                  </div>
                </>
              )}

            </RedirectIfAuthenticated>
          </>
        } />
        <Route
          path="/login"
          element={

            <Login signOut={() => fireAuth.signOut()} />

          }
        />
        <Route
          path="/resister"
          element={
            <Resister signOut={() => fireAuth.signOut()} />
          }
        />
        <Route
          path="/question"
          element={
            <Question signOut={() => fireAuth.signOut()} />
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Contents signOut={() => fireAuth.signOut()} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/followdashboard"
          element={
            <ProtectedRoute>
              <FollowDashboard signOut={() => fireAuth.signOut()} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/post"
          element={
            <ProtectedRoute>
              <PostPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reply/:id"
          element={
            <ProtectedRoute>
              <ReplyPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/replyreply2/:id"
          element={
            <ProtectedRoute>
              <ReplyReplyPage2 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/status/:id"
          element={
            <ProtectedRoute>
              <Status signOut={handleSignOut} />
            </ProtectedRoute>
          }
        />
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