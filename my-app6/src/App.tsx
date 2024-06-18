import React, { useState, useEffect } from 'react';
import './App.css';
import { Form, MailLoginForm } from './components/LoginForm';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import { fireAuth, register, login, signOutWithMail } from './firebaseAuth';
import Contents from './Dashboard';
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

    const unsubscribe = fireAuth.onAuthStateChanged(user => { // !
      if (user) {
        setUserUid(user.uid); // ログインユーザーのUIDをステートに設定
        setLoginUser(user); // ここを修正：ログインユーザーの情報をステートに設定
        console.log("ログインユーザーの情報をステートに設定")
      } else {
        setUserUid(null);
        setLoginUser(null); // ここを修正：ログインユーザーの情報をリセット
      }
    });

    


    return () => unsubscribe();
  }, []);

  

  const handleFormSubmit = async (email: string, password: string, name: string, userid: string) => {
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
          const postResponse = await fetch("http://localhost:8000/users", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ id: currentUser.uid, email, userid, name }), // ここを変更：ユーザー情報を送信
          });
          if (!postResponse.ok) {
            throw new Error('データの送信に失敗しました');
          }
          console.log("POSTしました");

          const getResponse = await fetch("http://localhost:8000/users");
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
            ) : 
              <div>
                ログインできていません
              </div>}
              <button onClick={handleSignOut}>
          ログアウト
        </button>
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