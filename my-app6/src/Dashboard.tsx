import React, { useState, useEffect, MouseEventHandler } from 'react';
import './App.css';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom'
import { fireAuth } from './firebaseAuth'; // 不要なインポートは削除
import likeImage from './images/like.png';
import likedImage from './images/liked.png';


interface User {
  id: string;
  name: string;
  email: string;
  userid: string;
}

interface Posts {
  id: number;
  user_id: string;
  content: string;
  created_at: Date;
}

const Contents: React.FC<{ signOut: () => void }> = ({ signOut }) => {
  const [loginUser, setLoginUser] = useState(fireAuth.currentUser);
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Posts[]>([]);
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const [userUid, setUserUid] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = fireAuth.onAuthStateChanged(user => {
      setLoginUser(user);
      if (user) {
        setUserUid(user.uid); // ログインユーザーのUIDをステートに設定
      } else {
        setUserUid(null);
      }
    });



    const fetchUsers = async () => {
      try {
        const response = await fetch("http://localhost:8000/users", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        console.error(err);
      }
    };

    const fetchPosts = async () => {
      try {
        const response = await fetch(
          "http://localhost:8000/posts",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        console.log('ここまでok')
        const postsWithDate = data.map((post: Posts) => ({
          ...post,
          created_at: new Date(post.created_at)
        }));
        setPosts(postsWithDate);
      } catch (err) {
        console.error(err);
      }
    };

    fetchPosts();
    fetchUsers();

    return () => unsubscribe();
  }, []);

  const navigate = useNavigate();

  const handlePostButtonClick = (e: any) => {
    e.preventDefault();
    console.log("navigate post")
    navigate('/post'); // '/post'ページに遷移
  };


  const handleLikeClick = (postId: number) => {
    setLikedPosts(prevLikedPosts => {
      const newLikedPosts = new Set(prevLikedPosts);
      if (newLikedPosts.has(postId)) {
        newLikedPosts.delete(postId);
      } else {
        newLikedPosts.add(postId);
      }
      return newLikedPosts;
    });
  };

  const getUserName = (userId: string) => {
    const user = users.find(user => user.id === userId);
    return user ? { name: user.name, userid: user.userid } : { name: "Unknown User", userid: "" };
  };

  const filteredAndSortedPosts = posts
    .filter(post => post.user_id === userUid)
    .sort((a, b) => b.created_at.getTime() - a.created_at.getTime()); // 時系列順にソート

  return (
    <div>
      <div className="App-header">
        <p>My posts</p>
        <button onClick={signOut}>
          ログアウト
        </button>
      </div>
      <div>
        <ul className="list" style={{ listStyleType: 'none', padding: 0 }}>
          {filteredAndSortedPosts.map(filteredPost => (
            <li key={filteredPost.id} className="listItem">
              {/* 投稿全体を囲むコンテナ */}
              <div className="postContainer">
                {/* ユーザー名を表示 */}
                <div className="userName">
                  {getUserName(filteredPost.user_id).name}
                  <span className="userId"> @{getUserName(filteredPost.user_id).userid}</span>
                </div>
                {/* コンテンツを表示 */}
                <div className="content">{filteredPost.content}</div>
                {/* 作成日時を表示（フォーマット） */}
                <div className='postedAt'>{filteredPost.created_at.toLocaleString()}</div>
                {/* ボタンとして画像を追加 */}
                <button className="likeButton" onClick={() => handleLikeClick(filteredPost.id)}>
                  <img
                    src={likedPosts.has(filteredPost.id) ? likedImage : likeImage}
                    alt="Like"
                    className="likeImage"
                  />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <a href="/post" title="post"><button className='post-button'>投稿</button></a>
    </div>
  );
};

export default Contents;