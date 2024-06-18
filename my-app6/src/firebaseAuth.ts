import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile} from "firebase/auth";
import { NavigateFunction } from 'react-router-dom';

export const fireAuth = getAuth();

export const register = async (email: string, password: string, name: string, userid: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(fireAuth, email, password);
    const user = userCredential.user;

    // ユーザーの名前やその他のプロファイル情報を更新
    await updateProfile(user, {
      displayName: name,
    });

    console.log(userCredential);
    alert("Registration successful. You are now logged in.");

  } catch (error) {
    if (error instanceof Error) {
      alert(error.message);
      console.error(error);
    } else {
      alert("An unknown error occurred.");
      console.error(error);
    }
  }
};




export const login = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(fireAuth, email, password);
    console.log(userCredential);
    alert("ログインユーザー: " + email);
  } catch (error) {
    if (error instanceof Error) {
      alert(error.message);
      console.error(error);
    } else {
      alert("An unknown error occurred.");
      console.error(error);
    }
  }
};

export const signOutWithMail = async (navigate: NavigateFunction) => {
  try {
    await signOut(fireAuth);
    alert("ログアウトしました");
    navigate('/');
  } catch (error) {
    if (error instanceof Error) {
      alert(error.message);
      console.error(error);
    } else {
      alert("An unknown error occurred.");
      console.error(error);
    }
  }
};