// src/pages/UsersPage.tsx
import { useEffect, useState } from "react";

interface User {
  userId: number;
  name: string;
  email: string;
  nickname?: string;
  age?: number;
  gender?: "M" | "F";
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // 목록 조회
  useEffect(() => {
    fetch("/api/user")
      .then((res) => {
        if (!res.ok) throw new Error("서버 오류");
        return res.json();
      })
      .then((data) => setUsers(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // 생성 (POST)
  const addUser = async () => {
    const newUser = {
      name: "홍길동",
      password: "asd",
      email: "hong@test.com",
      nickname: "길동이",
      age: 25,
      gender: "M",
    };

    const res = await fetch("/api/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    });

    if (res.ok) {
      const created = await res.json();
      setUsers((prev) => [...prev, created]); // 화면에 반영
    }
  };

  if (loading) return <div>불러오는 중...</div>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">유저 목록</h1>
      <button onClick={addUser} className="border px-2 py-1 rounded-md my-2">
        유저 추가
      </button>
      <ul>
        {users.map((u) => (
          <li key={u.userId}>
            {u.name} ({u.email})
          </li>
        ))}
      </ul>
    </div>
  );
}
