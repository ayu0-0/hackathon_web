import { signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { fireAuth } from "../firebase";
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import { useState } from "react";
import '../App.css';



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
  onSubmitFour: (email: string, password: string, name: string, userid: string) => void;
};

type FormPropsFive = {
  onSubmitFive: (email: string, password: string, password2: string, name: string, userid: string) => void;
};




export const Form: React.FC<FormPropsFive> = (props: FormPropsFive) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [name, setName] = useState("");
  const [userid, setUserid] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!password2) {
      setError("パスワードは2回入力してください");
      return; // ページ遷移を防ぐ
    }

    if (!(password === password2)) {
      setError("パスワードが異なります");
      return; // ページ遷移を防ぐ
    }

    const alphanumericRegex = /^[a-zA-Z0-9-_]+$/;
    if (!alphanumericRegex.test(userid)) {
      setError("User IDは英数文字、-、_でなければなりません");
      return; // ページ遷移を防ぐ
    }

    if (userid.length <= 5 || 16 <=userid.length) {
      setError("User IDは6文字〜15文字にしてください");
      return; // ページ遷移を防ぐ
    }

    if (!name || !userid) {
      setError("NameとUser IDは必須です");
      return; // ページ遷移を防ぐ
    }

    setError(null); // エラーメッセージをクリア
    props.onSubmitFive(email, password, password2, name, userid);
  };



  return (
    <form className="form-container" onSubmit={submit}>
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
      <label>メールアドレスを設定: </label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <label>パスワードを設定: </label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <label>パスワード(もう一度入力してください): </label>
      <input
        type="password"
        value={password2}
        onChange={(e) => setPassword2(e.target.value)}
      />
      <label>表示される名前: </label>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <label>ユーザid: </label>
      <label>(アルファベットと数字で、6文字〜15文字の好きな文字を設定) </label>
      <input
        type="text"
        value={userid}
        onChange={(e) => setUserid(e.target.value)}
      />
      <button type="submit" className="submit-button">新規登録</button>
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
        <label>メールアドレス: </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label>パスワード: </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="submit-button">ログイン</button>
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

export const Confirm: React.FC<FormPropsOne> = (props: FormPropsOne) => {
  const [email, setEmail] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // if (!password2) {
    //   setError("パスワードは2回入力してください");
    //   return; // ページ遷移を防ぐ
    // }

    
    setError(null); // エラーメッセージをクリア
    props.onSubmit(email);
  };



  return (
    <form className="form-container" onSubmit={submit}>
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
      <label>確認したいメールアドレス: </label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      
      <button type="submit" className="submit-button">新規登録</button>
    </form>
  );
};