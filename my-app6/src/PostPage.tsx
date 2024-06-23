import React, { useEffect, useId, useState } from 'react';
import { PostForm } from './components/LoginForm'; // インポートパスが正しいことを確認してください
import { useNavigate } from 'react-router-dom';
import { StringifyOptions } from 'querystring';
import { fireAuth, register, login, signOutWithMail } from './firebaseAuth';

interface User {
  id: string;
  name: string;
  email: string;
  userid: string;
}


interface Post {
  id: number;
  user_id: String;
  content: string;
}


const PostPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [userUid, setUserUid] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {

    const unsubscribe = fireAuth.onAuthStateChanged(user => { // !
      if (user) {
        setUserUid(user.uid); // ログインユーザーのUIDをステートに設定
      } else {
        setUserUid(null);
      }
    });

    


    return () => unsubscribe();
  }, []);
  


  const handleSubmit = async (content: string) => {
    const user_id = userUid;
    
    if (content.length > 150) {
      alert("150文字以内の投稿を入力してください");
      return;
    }

  
    console.log("Content:", content);

    const fetchData = async () => {
      try {
        const postResponse = await fetch("https://hackathon-api4-ldnwih7maq-uc.a.run.app/posts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user_id, content }),
        });
        if (!postResponse.ok) {
          throw new Error('データの送信に失敗しました');
        }
      } catch (err) {
        console.error(err);
        return;
      }

      try {
        const getResponse = await fetch("https://hackathon-api4-ldnwih7maq-uc.a.run.app/posts");
        if (!getResponse.ok) {
          throw new Error('データの取得に失敗しました');
        }
        const getData = await getResponse.json();
        console.log(user_id)
        setPosts(getData);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  };

  const handleBackButtonClick = () => {
    navigate('/dashboard');
  };

  console.log("post test ..");

  return (
    <div>
      <h1>新しい投稿</h1>
      
      <p>ここで新しい投稿を作成できます。</p>
      
       <PostForm onSubmit={handleSubmit} />
      <a href="/dashboard" title="dashboard"><button className='back-button'>戻る</button></a>
    </div>
  );
};

export default PostPage;
