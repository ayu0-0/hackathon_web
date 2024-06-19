import React, { useState, useEffect, MouseEventHandler } from 'react';
import './App.css';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { fireAuth } from './firebaseAuth';
import likeImage from './images/like.png';
import likedImage from './images/liked.png';

interface User {
  id: string;
  name: string;
  email: string;
  userid: string;
}

interface Post {
  id: string;
  user_id: string;
  content: string;
  created_at: Date;
}

interface Like {
  user_id: string;
  post_id: string;
}

const Contents: React.FC<{ signOut: () => void }> = ({ signOut }) => {
  const [loginUser, setLoginUser] = useState(fireAuth.currentUser);
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [userUid, setUserUid] = useState<string | null>(null);
  const [viewAllPosts, setViewAllPosts] = useState(false);

  useEffect(() => {
    const unsubscribe = fireAuth.onAuthStateChanged(user => {
      setLoginUser(user);
      if (user) {
        setUserUid(user.uid);
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
        const response = await fetch("http://localhost:8000/posts", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        const postsWithDate = data.map((post: Post) => ({
          ...post,
          created_at: new Date(post.created_at)
        }));
        setPosts(postsWithDate);
      } catch (err) {
        console.error(err);
      }
    };

    const fetchLikes = async () => { // likesデータを別途取得
      try {
        const response = await fetch("http://localhost:8000/likes", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data: Like[] = await response.json();

        const likeCountMap: { [key: string]: number } = {};

        // 各likeデータの出現回数をカウント
        data.forEach((like) => {
          const key = `${like.user_id}_${like.post_id}`;
          if (!likeCountMap[key]) {
            likeCountMap[key] = 0;
          }
          likeCountMap[key]++;
        });

        const likedPostIds = new Set<string>();
        Object.keys(likeCountMap).forEach((key) => {
          if (likeCountMap[key] % 2 === 1) { // 奇数回
            const [user_id, post_id] = key.split("_");
            if (user_id === userUid) {
              likedPostIds.add(post_id);
            }
          }
        });

        setLikedPosts(likedPostIds);

      } catch (err) {
        console.error(err);
      }
    };

    fetchPosts();
    fetchUsers();
    if (userUid) {
      fetchLikes();
    }

    return () => unsubscribe();

  }, [userUid]);



  const navigate = useNavigate();



  const handlePostButtonClick = (e: any) => {
    e.preventDefault();
    navigate('/post');
  };

  const handleLikeClick = (postId: string) => {
    setLikedPosts(prevLikedPosts => {
      const newLikedPosts = new Set(prevLikedPosts);
      if (newLikedPosts.has(postId)) {
        newLikedPosts.delete(postId);
      } else {
        newLikedPosts.add(postId);
      }
      return newLikedPosts;
    });

    fetchLike(postId);
  };

  const fetchLike = async (postId: string) => {
    try {
      const postResponse = await fetch("http://localhost:8000/likes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: userUid, post_id: postId }),
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
      const postsWithDate = getData.map((post: Post) => ({
        ...post,
        created_at: new Date(post.created_at)
      }));
      setPosts(postsWithDate);
    } catch (err) {
      console.error(err);
    }
  };

  const getUserName = (userId: string) => {
    const user = users.find(user => user.id === userId);
    return user ? { name: user.name, userid: user.userid } : { name: "Unknown User", userid: "" };
  };

  const filteredAndSortedPosts = posts
    .filter(post => viewAllPosts || post.user_id === userUid)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const isLikedByCurrentUser = (postId: string) => {
    if (!userUid) return false;
    return likedPosts.has(postId);

  };


  return (
    <div>
      <div className="App-header">
        <button className="to-my-posts-button" onClick={() => setViewAllPosts(false)}>自分の投稿</button>
        <button className="to-friends-posts-button" onClick={() => setViewAllPosts(true)}>友達の投稿</button>
        <button onClick={signOut}>ログアウト</button>
      </div>
      <div>
        <ul className="list" style={{ listStyleType: 'none', padding: 0 }}>
          {filteredAndSortedPosts.map(filteredPost => (
            <li key={filteredPost.id} className="listItem">
              <div className="postContainer">
                <div className="userName">
                  {getUserName(filteredPost.user_id).name}
                  <span className="userId"> @{getUserName(filteredPost.user_id).userid}</span>
                </div>
                <div className="content">{filteredPost.content}</div>
                <div className='postedAt'>{filteredPost.created_at.toLocaleString()}</div>
                <button className="likeButton" onClick={() => handleLikeClick(filteredPost.id)}>
                  <img
                    src={isLikedByCurrentUser(filteredPost.id) ? likedImage : likeImage}
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