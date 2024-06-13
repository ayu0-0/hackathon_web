import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
//import { GreetJS } from './GreetJS'
import { GreetTS } from './GreetTS'
import Form from './Form'

interface User {
  id: number;
  name: string;
  age: number;
}


function App() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // マウント時の処理
    const fetchData = async () => {
      try {
        const response = await fetch(
          "http://localhost:8000/user",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();

    return () => {
      // アンマウント時のクリーンアップ処理
    };
  }, []);

  

  const handleSubmit = async (name: string, age: string) => {
    if (!name) {
      alert("Please enter a name");
      return;
    }
    if (name.length > 50) {
      alert("Please enter a name shorter than 50 characters");
      return;
    }
  
    // 年齢が数字かどうかをチェック
    if (isNaN(parseInt(age))) {
      alert("Please enter a valid age");
      return;
    }
  
    // 年齢が20から80の範囲内かどうかをチェック
    const ageNumber = parseInt(age);
    if (ageNumber < 20 || ageNumber > 80) {
      alert("Please enter an age between 20 and 80");
      return;
    }
    // フォームが送信されたときの処理を記述する（この例ではログに出力）
    console.log("Name:", name);
    console.log("Age:", age);
    const fetchData = async () => {
      try {
        const postResponse = await fetch(
          "http://localhost:8000/user",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ name, age: parseInt(age) }),

          }

        );
      } catch (err) {
        console.error(err);
      }

      const getResponse = await fetch("http://localhost:8000/user");
      const getData = await getResponse.json();
      setUsers(getData);

    };

    fetchData();
  };

  return (
    <div className="App">
      <header className="App-header">
        <p>
          User Register
        </p>
      </header>
      {/* Form コンポーネントに onSubmit プロパティを渡して、handleSubmit 関数を呼び出す */}
      <Form onSubmit={handleSubmit} />
      <ul className="list">
        {users.map(user => (
          <li key={user.id} className="listItem">
            {user.name} ,{user.age}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
