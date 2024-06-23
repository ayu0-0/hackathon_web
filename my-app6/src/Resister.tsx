import React, { useState, useEffect, MouseEventHandler } from 'react';
import './App.css';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Form, MailLoginForm } from './components/LoginForm';
import likeImage from './images/like.png';
import likedImage from './images/liked.png';
import commentImage from './images/comment.png';
import { fireAuth, register, login, signOutWithMail } from './firebaseAuth';
import ProtectedRoute from './ProtectedRoute';
import RedirectIfAuthenticated from './RedirectIfAuthenticated';

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
    replyCount?: number;
    post_id: string;
}

interface Like {
    user_id: string;
    post_id: string;
}

interface Reply {
    id: string;
    post_id: string;
    user_id: string;
    content: string;
    created_at: Date;
    replyCount?: number;
}



const Resister: React.FC<{ signOut: () => void }> = ({ signOut }) => {
    const [loginUser, setLoginUser] = useState(fireAuth.currentUser);
    const [users, setUsers] = useState<User[]>([]);
    const [posts, setPosts] = useState<Post[]>([]);
    const [replies, setReplies] = useState<Reply[]>([]);
    const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
    const [userUid, setUserUid] = useState<string | null>(null);
    const [viewAllPosts, setViewAllPosts] = useState(true);
    const [showCommentForm, setShowCommentForm] = useState<string | null>(null);
    const [comment, setComment] = useState("");
    const [isRegistering, setIsRegistering] = useState(true);


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
                const response = await fetch("https://hackathon-api4-ldnwih7maq-uc.a.run.app/users", {
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


        const fetchReplies = async () => {
            try {
                const response = await fetch("https://hackathon-api4-ldnwih7maq-uc.a.run.app/replies", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                const data = await response.json();
                setReplies(data);

                const repliesResponse = await fetch("https://hackathon-api4-ldnwih7maq-uc.a.run.app/replies", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                const repliesData = await repliesResponse.json();

                const replyCountMap: { [key: string]: number } = {};
                repliesData.forEach((reply: { post_id: string }) => {
                    if (!replyCountMap[reply.post_id]) {
                        replyCountMap[reply.post_id] = 0;
                    }
                    replyCountMap[reply.post_id]++;
                });

                const repliesWithDate = data.map((reply: Reply) => ({
                    ...reply,
                    created_at: new Date(reply.created_at),
                    replyCount: replyCountMap[reply.id] || 0,
                }));

                setReplies(repliesWithDate);
            } catch (err) {
                console.error(err);
            }
        };



        const fetchPosts = async () => {
            try {
                const response = await fetch("https://hackathon-api4-ldnwih7maq-uc.a.run.app/posts", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                const data = await response.json();

                // 投稿の返信数を取得
                const repliesResponse = await fetch("https://hackathon-api4-ldnwih7maq-uc.a.run.app/replies", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                const repliesData = await repliesResponse.json();

                const replyCountMap: { [key: string]: number } = {};
                repliesData.forEach((reply: { post_id: string }) => {
                    if (!replyCountMap[reply.post_id]) {
                        replyCountMap[reply.post_id] = 0;
                    }
                    replyCountMap[reply.post_id]++;
                });

                const postsWithDate = data.map((post: Post) => ({
                    ...post,
                    created_at: new Date(post.created_at),
                    replyCount: replyCountMap[post.id] || 0,
                }));

                setPosts(postsWithDate);
            } catch (err) {
                console.error(err);
            }
        };

        const fetchLikes = async () => { // likesデータを別途取得
            try {
                const response = await fetch("https://hackathon-api4-ldnwih7maq-uc.a.run.app/likes", {
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
        fetchReplies();

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

    const handleCommentClick = (postId: string) => {
        setShowCommentForm(prevState => (prevState === postId ? null : postId)); // フォーム表示の切り替え
    };

    const handleFormSubmit = async (email: string, password: string, password2: string, name: string, userid: string) => {
        try {

            const isUserIdExist = users.some(user => user.userid === userid);
            if (isUserIdExist) {
                alert('このユーザーIDは他の人に使用されています。別のユーザーIDを設定してください。');
                return;
            }

            await register(email, password, name, userid);
            console.log("handleFormSubmit");



            const currentUser = fireAuth.currentUser;
            if (currentUser) {
                setUserUid(currentUser.uid);
                setLoginUser(currentUser);


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


    const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setComment(e.target.value);
    };

    const handleCommentSubmit = (e: React.FormEvent<HTMLFormElement>, postId: string) => {
        e.preventDefault();
        // コメントの送信処理をここに追加

        const fetchData = async () => {
            try {
                const replyResponse = await fetch("https://hackathon-api4-ldnwih7maq-uc.a.run.app/replies", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ post_id: postId, user_id: userUid, content: comment }),
                });
                if (!replyResponse.ok) {
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
                //console.log(user_id)
                setPosts(getData);
                window.location.reload();
            } catch (err) {
                console.error(err);
            }
        };



        fetchData();

        console.log(`Comment submitted for post ${postId}:`, comment);
        setComment("");
        setShowCommentForm(null);
    };

    const fetchLike = async (postId: string) => {
        try {
            const postResponse = await fetch("https://hackathon-api4-ldnwih7maq-uc.a.run.app/likes", {
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
            const getResponse = await fetch("https://hackathon-api4-ldnwih7maq-uc.a.run.app/posts");
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

        const fetchPosts = async () => {
            try {
                const response = await fetch("https://hackathon-api4-ldnwih7maq-uc.a.run.app/posts", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                const data = await response.json();

                // 投稿の返信数を取得
                const repliesResponse = await fetch("https://hackathon-api4-ldnwih7maq-uc.a.run.app/replies", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                const repliesData = await repliesResponse.json();

                const replyCountMap: { [key: string]: number } = {};
                repliesData.forEach((reply: { post_id: string }) => {
                    if (!replyCountMap[reply.post_id]) {
                        replyCountMap[reply.post_id] = 0;
                    }
                    replyCountMap[reply.post_id]++;
                });

                const postsWithDate = data.map((post: Post) => ({
                    ...post,
                    created_at: new Date(post.created_at),
                    replyCount: replyCountMap[post.id] || 0,
                }));

                setPosts(postsWithDate);
            } catch (err) {
                console.error(err);
            }
        };

        fetchPosts();
    };

    const getUserName = (userId: string) => {
        const user = users.find(user => user.id === userId);
        return user ? { name: user.name, userid: user.userid } : { name: "Unknown User", userid: "" };
    };



    const getPostUserName = (postId: string) => {
        const post = posts.find(post => post.id === postId);
        const reply = replies.find(reply => reply.id === postId);
        console.log(post);
        return post ? { user: post.user_id } : reply ? { user: reply.user_id } : { user: "Unknown User" };
    };



    const filteredAndSortedPosts = posts
        .filter(post => viewAllPosts || post.user_id === userUid)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());



    const postsWithType = posts.map(post => ({ ...post, type: 'reply' }));

    const repliesWithType = replies
        .map(reply => ({
            ...reply,
            type: 'replyreply2',
            post_id: reply.post_id  // ここで post_id を追加
        }));

    const filteredAndSortedPostsAndReplies = [...postsWithType, ...repliesWithType]
        .filter(item => viewAllPosts || item.user_id === userUid)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());


    const isLikedByCurrentUser = (postId: string) => {
        if (!userUid) return false;
        return likedPosts.has(postId);

    };


    return (
        <div>
            <>
                <header className='start-header'>
                    <div>まだ登録していない人のページです</div>
                    <div className='header-small-text'>既に登録している方は<a href='/login'>こちら</a></div>
                    <div className='header-small-text'>わからない方は<a href='/question'>こちら</a></div>
                </header>
                <RedirectIfAuthenticated>
                    {isRegistering ? (
                        <>
                            <div className="page-container">
                                <div className="form-wrapper">
                                    <Form onSubmitFive={handleFormSubmit} />
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="page-container">
                                <div className="form-wrapper">
                                    <MailLoginForm onSubmit={handleFormLogin} />
                                    <button className='center-button' onClick={() => setIsRegistering(true)}>まだアカウントを作っていませんか？：<div className='blue-text'>新規登録する</div></button>
                                </div>
                            </div>
                        </>
                    )}
                    {/* {loginUser ? (
                <div>
                  ログイン中
                  <div>UID: {userUid}</div>
                </div>
              ) :
                <div>
                  ログインできていません
                </div>}
              <button onClick={handleSignOut}>
                ログアウト
              </button> */}
                </RedirectIfAuthenticated>
            </>
        </div>
    );
};

export default Resister;