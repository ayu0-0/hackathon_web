import React, { useState, useEffect, MouseEventHandler } from 'react';
import './App.css';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { fireAuth } from './firebaseAuth';
import likeImage from './images/like.png';
import likedImage from './images/liked.png';
import commentImage from './images/comment.png';
import { useParams } from 'react-router-dom';
import leftWhiteImage from './images/left-white.png';
import pencilImage from './images/pencil.png';

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

interface Follow {
    id: string;
    follow_user_id: string;
    followed_user_id: string;
    created_at: Date;
    replyCount?: number;
}



const Status: React.FC<{ signOut: () => void }> = ({ signOut }) => {
    const [loginUser, setLoginUser] = useState(fireAuth.currentUser);
    const [users, setUsers] = useState<User[]>([]);
    const [posts, setPosts] = useState<Post[]>([]);
    const [replies, setReplies] = useState<Reply[]>([]);
    const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
    const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set());
    const [userUid, setUserUid] = useState<string | null>(null);
    const [viewAllPosts, setViewAllPosts] = useState(false);
    const [showCommentForm, setShowCommentForm] = useState<string | null>(null);
    const [comment, setComment] = useState("");
    const [showPencilForm, setShowPencilForm] = useState(false);


    const { id } = useParams();
    const userId = id || "";

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

        const fetchFollows = async () => {
            try {
                const response = await fetch("https://hackathon-api4-ldnwih7maq-uc.a.run.app/follows", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                const data: Follow[] = await response.json();

                const followCountMap: { [key: string]: number } = {};

                // 各likeデータの出現回数をカウント
                data.forEach((follow) => {
                    const key = `${follow.follow_user_id}_${follow.followed_user_id}`;
                    if (!followCountMap[key]) {
                        followCountMap[key] = 0;
                    }
                    followCountMap[key]++;
                });

                const followedUserIds = new Set<string>();
                Object.keys(followCountMap).forEach((key) => {
                    if (followCountMap[key] % 2 === 1) { // 奇数回
                        const [follow_user_id, followed_user_id] = key.split("_");
                        if (follow_user_id === userUid) {
                            followedUserIds.add(followed_user_id);
                        }
                    }
                });

                setFollowedUsers(followedUserIds);

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
        fetchFollows();


        return () => {
            unsubscribe();
        }

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


    const handleFollowClick = (followedId: string) => {
        setFollowedUsers(prevFollowedUsers => {
            const newFollowedUsers = new Set(prevFollowedUsers);
            if (newFollowedUsers.has(followedId)) {
                newFollowedUsers.delete(followedId);
            } else {
                newFollowedUsers.add(followedId);
            }
            return newFollowedUsers;
        });

        fetchFollow(followedId);
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


    const fetchFollow = async (followedId: string) => {
        try {
            const postResponse = await fetch("https://hackathon-api4-ldnwih7maq-uc.a.run.app/follows", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ follow_user_id: userUid, followed_user_id: followedId }),
            });
            if (!postResponse.ok) {
                throw new Error('データの送信に失敗しました');
            }
        } catch (err) {
            console.error(err);
            return;
        }


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
        .filter(item => viewAllPosts || item.user_id === userId)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());


    const isLikedByCurrentUser = (postId: string) => {
        if (!userUid) return false;
        return likedPosts.has(postId);

    };

    const isFollowedByCurrentUser = (followedId: string) => {
        if (!userUid) return false;
        return followedUsers.has(followedId);

    };

    const userInfo = getUserName(userId);

    const togglePencilForm = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setShowPencilForm(prevState => !prevState);
    };


    return (
        <div>
            <div className="status-header">
                <a href="/dashboard">
                    <img src={leftWhiteImage} alt="leftImage" className='left-image' />
                </a>
                <div className="status-user-info">
                    <div>{userInfo.name}</div>
                    <div>@{userInfo.userid}</div>
                </div>
                <div className="button-container">
                    {/* <button className='logout-button' onClick={signOut}>ログアウト！！</button> */}
                    {userId !== userUid && (
                        <button
                            className={`followButton ${isFollowedByCurrentUser(userId) ? 'followed-button' : 'follow-button'}`} // 動的にクラスを変更
                            onClick={(e) => {
                                e.preventDefault(); // リンクのデフォルト動作を防止
                                e.stopPropagation(); // イベントの伝播を停止
                                handleFollowClick(userId);
                            }}
                        >
                            {isFollowedByCurrentUser(userId) ? 'フォロー済' : 'フォロー'}
                        </button>
                    )}
                </div>
            </div>
            <div className='white-background' >
                <ul className="list" style={{ listStyleType: 'none', padding: 0 }}>
                    {filteredAndSortedPostsAndReplies.map(item => (
                        <li key={item.id} className="listItem">
                            <a href={`/${item.type}/${item.id}`} className="postLink">
                                <div className="postContainer">
                                    <div className="userName">
                                        {getUserName(item.user_id).name}
                                        <span className="userId"> @{getUserName(item.user_id).userid}</span>
                                    </div>
                                    <div className="content">
                                        {item.type === 'replyreply2' && (
                                            <div
                                                className="replyLink"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation(); // クリックイベントの伝播を停止
                                                    window.location.href = `/status/${getPostUserName(item.post_id).user}`;
                                                }}
                                            >
                                                <span className="blue-text">@{getUserName(getPostUserName(item.post_id).user).userid}</span>
                                                <span className="black-text">に返信</span>
                                                <br />
                                            </div>
                                        )}
                                        {item.content}</div>
                                    <div className='postedAt'>{new Date(item.created_at).toLocaleString()}</div>
                                    <div className="commentContainer">
                                        <button className="likeButton" onClick={(e) => {
                                            e.preventDefault(); // リンクのデフォルト動作を防止
                                            e.stopPropagation(); // イベントの伝播を停止
                                            handleLikeClick(item.id);
                                        }}>
                                            <img
                                                src={isLikedByCurrentUser(item.id) ? likedImage : likeImage}
                                                alt="Like"
                                                className="likeImage"
                                            />
                                        </button>
                                        <button className="commentButton" onClick={(e) => {
                                            e.preventDefault(); // リンクのデフォルト動作を防止
                                            e.stopPropagation(); // イベントの伝播を停止
                                            handleCommentClick(item.id);
                                        }}>
                                            <img src={commentImage} alt="Comment" className="commentImage" />
                                        </button>
                                        <div className="commentText">{item.replyCount}</div>
                                    </div>
                                    {showCommentForm === item.id && (
                                        <form
                                            onSubmit={(e) => handleCommentSubmit(e, item.id)}
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
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
            <a href="/post" title="post"><button className='post-button'>投稿</button></a>
        </div>
    );
};

export default Status;