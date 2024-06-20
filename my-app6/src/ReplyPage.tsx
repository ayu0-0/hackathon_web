import React, { useState, useEffect, MouseEventHandler } from 'react';
import './App.css';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { fireAuth } from './firebaseAuth';
import likeImage from './images/like.png';
import likedImage from './images/liked.png';
import commentImage from './images/comment.png';
import { useParams } from 'react-router-dom';
import './ReplyPage.css';
import leftImage from './images/left.png';


interface User {
    id: string;
    name: string;
    email: string;
    userid: string;
}


interface Post {
    id: string;
    user_id: String;
    content: string;
    created_at: Date;
    replyCount?: number;
}

interface Like {
    id: string;
    user_id: String;
    post_id: string;
    created_at: Date;

}

interface Reply {
    id: string;
    post_id: string;
    user_id: String;
    content: string;
    created_at: Date;
    replyCount?: number;
}


const ReplyPage = () => {
    const [loginUser, setLoginUser] = useState(fireAuth.currentUser);
    const [users, setUsers] = useState<User[]>([]);
    const [posts, setPosts] = useState<Post[]>([]);
    const [likes, setLikes] = useState<Like[]>([]);
    const [replies, setReplies] = useState<Reply[]>([]);
    const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
    const [userUid, setUserUid] = useState<string | null>(null);
    const [viewAllPosts, setViewAllPosts] = useState(false);
    const [viewAllUsers, setViewAllUsers] = useState(false);
    const [viewAllReplies, setViewAllReplies] = useState(false);
    const [showCommentForm, setShowCommentForm] = useState<string | null>(null);
    const [comment, setComment] = useState("");

    const { id } = useParams();

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

                // 投稿の返信数を取得
                const replyCountMap: { [key: string]: number } = {};
                replies.forEach((reply: { post_id: string }) => {
                    if (!replyCountMap[reply.post_id]) {
                        replyCountMap[reply.post_id] = 0;
                    }
                    replyCountMap[reply.post_id]++;
                });

                const postsWithCount = data.map((post: Post) => ({
                    ...post,
                    replyCount: replyCountMap[post.id] || 0,
                }));

                setPosts(postsWithCount);
            } catch (err) {
                console.error(err);
            }
        };

        const fetchReplies = async () => {
            try {
                const response = await fetch("http://localhost:8000/replies", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                const data = await response.json();

                const replyCountMap: { [key: string]: number } = {};
                data.forEach((reply: { post_id: string }) => {
                    if (!replyCountMap[reply.post_id]) {
                        replyCountMap[reply.post_id] = 0;
                    }
                    replyCountMap[reply.post_id]++;
                });

                const repliesWithCount = data.map((reply: Reply) => ({
                    ...reply,
                    replyCount: replyCountMap[reply.id] || 0,
                }));

                setReplies(repliesWithCount);
            } catch (err) {
                console.error(err);
            }
        };

        const fetchLikes = async () => {
            try {
                const response = await fetch("http://localhost:8000/likes", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                const data: Like[] = await response.json();

                const likeCountMap: { [key: string]: number } = {};

                data.forEach((like) => {
                    const key = `${like.user_id}_${like.post_id}`;
                    if (!likeCountMap[key]) {
                        likeCountMap[key] = 0;
                    }
                    likeCountMap[key]++;
                });

                const likedPostIds = new Set<string>();
                Object.keys(likeCountMap).forEach((key) => {
                    if (likeCountMap[key] % 2 === 1) {
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

        fetchUsers();
        fetchPosts(); // この行を追加して、postsデータを取得
        fetchLikes();
        fetchReplies();

        return () => unsubscribe();

    }, [userUid, replies]); // repliesを依存関係に追加

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

    };

    const filteredAndSortedPosts = posts
        .filter(post => viewAllPosts || post.id === id);

    const filteredAndSortedReplies = replies
        .filter(reply => viewAllReplies || reply.post_id === id);

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

    const isLikedByCurrentUser = (postId: string) => {
        if (!userUid) return false;
        return likedPosts.has(postId);

    };

    const handleCommentClick = (postId: string) => {
        setShowCommentForm(prevState => (prevState === postId ? null : postId)); // フォーム表示の切り替え
    };


    const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setComment(e.target.value);
    };

    const handleCommentSubmit = (e: React.FormEvent<HTMLFormElement>, postId: string) => {
        e.preventDefault();
        // コメントの送信処理をここに追加


        const fetchReplies = async () => {
            try {
                const response = await fetch("http://localhost:8000/replies", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                const data = await response.json();
                setReplies(data);
            } catch (err) {
                console.error(err);
            }
        };


        const fetchData = async () => {


            try {
                const replyResponse = await fetch("http://localhost:8000/replies", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ post_id: postId, user_id: userUid, content: comment }),
                });
                if (!replyResponse.ok) {
                    throw new Error('データの送信に失敗しました');
                }
                fetchReplies();
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
                //console.log(user_id)
                setPosts(getData);
            } catch (err) {
                console.error(err);
            }
        };

        fetchData();

        console.log(`Comment submitted for post ${postId}:`, comment);
        setComment("");
        setShowCommentForm(null);
    };




    return (
        <div>
            <header>
                <a href="/dashboard">
                    <img src={leftImage} alt="leftImage" className='left-image'></img>
                </a>
            </header>
            {/* idに基づいて内容を変更 */}
            <div>
                {filteredAndSortedPosts.map(post => {
                    const user = users.find(user => user.id === post.user_id);
                    return (
                        <div key={post.id} className="post">
                            <div className='user-info'>
                                <a href={user ? `/status/${user.id}` : '#'}>
                                    <p className='username'>{user ? user.name : "不明なユーザー"}</p>
                                    <p className='userid'>@{user ? user.userid : "不明なユーザー"}</p>
                                </a>
                            </div>
                            <div className='postcontent'>{post.content}</div>

                            <div className='post-created-at'>{post.created_at.toLocaleString()}</div>
                            <div className="post-actions">
                                <button className="reply-likeButton" onClick={(e) => {
                                    e.preventDefault(); // リンクのデフォルト動作を防止
                                    e.stopPropagation(); // イベントの伝播を停止
                                    handleLikeClick(post.id);
                                }}>
                                    <img
                                        src={isLikedByCurrentUser(post.id) ? likedImage : likeImage}
                                        alt="Like"
                                        className="likeImage"
                                    />
                                </button>
                                <button className="reply-likeButton" onClick={(e) => {
                                    e.preventDefault(); // リンクのデフォルト動作を防止
                                    e.stopPropagation(); // イベントの伝播を停止
                                    handleCommentClick(post.id);
                                }}>
                                    <img src={commentImage} alt="Comment" />
                                </button>
                                <div className="commentText">{post.replyCount} </div>
                            </div>
                            {showCommentForm === post.id && (
                                <form
                                    onSubmit={(e) => handleCommentSubmit(e, post.id)}
                                    onClick={(e) => {
                                        // リンクのデフォルト動作を防止
                                        e.stopPropagation(); // イベントの伝播を停止
                                    }}
                                >
                                    <textarea
                                        className="commentTextarea"
                                        value={comment}
                                        onChange={handleCommentChange}
                                        placeholder="投稿に返信する"
                                        onClick={(e) => {
                                            e.preventDefault(); // リンクのデフォルト動作を防止
                                            e.stopPropagation(); // イベントの伝播を停止
                                        }}
                                    />
                                    <button type="submit">
                                        返信
                                    </button>
                                </form>
                            )}


                        </div>
                    );
                })}



                <div className='post-container'>
                    {filteredAndSortedReplies.map(reply => {
                        const user = users.find(user => user.id === reply.user_id);
                        return (
                            <div key={reply.id} className="post">

                                <a href={`/replyreply2/${reply.id}`} className="postLink">

                                    <div className='user-info'>
                                    <a href={user ? `/status/${user.id}` : '#'}>
                                        <p className='username'>{user ? user.name : "不明なユーザー"}</p>
                                        <p className='userid'>@{user ? user.userid : "不明なユーザー"}</p>
                                        </a>
                                    </div>
                                    <div className='postcontent'>{reply.content}</div>

                                    <div className='post-created-at'>{reply.created_at.toLocaleString()}</div>
                                    <div className="post-actions">
                                        <button className="reply-likeButton" onClick={(e) => {
                                            e.preventDefault(); // リンクのデフォルト動作を防止
                                            e.stopPropagation(); // イベントの伝播を停止
                                            handleLikeClick(reply.id);
                                        }}>
                                            <img
                                                src={isLikedByCurrentUser(reply.id) ? likedImage : likeImage}
                                                alt="Like"
                                                className="likeImage"
                                            />
                                        </button>
                                        <button className="reply-likeButton" onClick={(e) => {
                                            e.preventDefault(); // リンクのデフォルト動作を防止
                                            e.stopPropagation(); // イベントの伝播を停止
                                            handleCommentClick(reply.id);
                                        }}>
                                            <img src={commentImage} alt="Comment" />
                                        </button>
                                        <div className="commentText">{reply.replyCount} </div>
                                    </div>

                                    {showCommentForm === reply.id && (
                                        <form
                                            onSubmit={(e) => handleCommentSubmit(e, reply.id)}
                                            onClick={(e) => {
                                                // リンクのデフォルト動作を防止
                                                e.stopPropagation(); // イベントの伝播を停止
                                            }}
                                        >
                                            <textarea
                                                className="commentTextarea"
                                                value={comment}
                                                onChange={handleCommentChange}
                                                placeholder="投稿に返信する"
                                                onClick={(e) => {
                                                    e.preventDefault(); // リンクのデフォルト動作を防止
                                                    e.stopPropagation(); // イベントの伝播を停止
                                                }}
                                            />
                                            <button type="submit">
                                                返信
                                            </button>
                                        </form>

                                    )}

                                </a>

                            </div>
                        );
                    })}


                </div>


            </div>




        </div >
    );
}

export default ReplyPage;