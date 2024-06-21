import { signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { fireAuth } from "../firebase";
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import { useState } from "react";



export const LoginForm: React.FC = () => {
  /**
   * googleでログインする
   */

  const signInWithGoogle = (): void => {
    // Google認証プロバイダを利用する
    const provider = new GoogleAuthProvider();

    // ログイン用のポップアップを表示
    signInWithPopup(fireAuth, provider)
      .then(res => {
        const user = res.user;
        alert("ログインユーザー: " + user.displayName);
      })
      .catch(err => {
        const errorMessage = err.message;
        alert(errorMessage);
      });
  };

  /**
   * ログアウトする
   */
  const signOutWithGoogle = (): void => {
    signOut(fireAuth).then(() => {
      alert("ログアウトしました");
    }).catch(err => {
      alert(err);
    });
  };

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div>
      <button onClick={signInWithGoogle}>
        Googleでログイン
      </button>
      <button onClick={signOutWithGoogle}>
        ログアウト
      </button>
    </div>
  );
};



type FormProps = {
  onSubmit: (email: string, password: string) => void;
};


type FormPropsFour = {
  onSubmitFour: (email: string, password: string, name:string, userid:string) => void;
};




export const Form: React.FC<FormPropsFour> = (props: FormPropsFour) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [userid, setUserid] = useState("");

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    props.onSubmitFour(email, password, name, userid);
  };

  return (
    <form className="form-container" onSubmit={submit}>
      <label>Email: </label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <label>password: </label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <label>name: </label>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <label>userid: </label>
      <input
        type="text"
        value={userid}
        onChange={(e) => setUserid(e.target.value)}
      />
      <button type="submit">新規登録</button>
    </form>
  );
};


// MailLoginForm Component
export const MailLoginForm: React.FC<FormProps> = (props: FormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    props.onSubmit(email, password);
  };

  return (
    <div className="form-wrapper">
      <form className="form-container" onSubmit={submit}>
        <label>Email: </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label>Password: </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">ログイン</button>
      </form>
    </div>
  );
};

type FormPropsOne = {
  onSubmit: (age: string) => void;
};

export const PostForm: React.FC<FormPropsOne> = (props: FormPropsOne) => {
  const [post, setPost] = useState("");

  const navigate = useNavigate();


  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    props.onSubmit(post);
    setTimeout(() => {
      navigate('/dashboard'); // 投稿後に0.2秒後に/postに遷移
    }, 200);
  };




  return (
    <form style={{ display: "flex", flexDirection: "column" }} onSubmit={submit}>
      <input
        type={"text"}
        style={{ marginBottom: 20, height: "100px" }}
        value={post}
        onChange={(e) => setPost(e.target.value)}
      ></input>
      <button type={"submit"}>投稿</button>
    </form>
  );
};
