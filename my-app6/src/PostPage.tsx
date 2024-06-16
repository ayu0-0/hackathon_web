import React, { useEffect, useState } from 'react';
import { PostForm } from './components/LoginForm'; // インポートパスが正しいことを確認してください
import { useNavigate } from 'react-router-dom';
import { StringifyOptions } from 'querystring';

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
  const navigate = useNavigate();
  


  const handleSubmit = async (content: string) => {
    const user_id = "00000000000000000000000001";
    
    if (content.length > 150) {
      alert("150文字以内の投稿を入力してください");
      return;
    }

  
    console.log("Content:", content);

    const fetchData = async () => {
      try {
        const postResponse = await fetch("http://localhost:8000/posts", {
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
        const getResponse = await fetch("http://localhost:8000/posts");
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
