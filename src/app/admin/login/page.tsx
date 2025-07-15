"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      router.push("/admin");
    } else {
      const data = await res.json();
      setError(data.error || "Błąd logowania");
    }
  }

  return (
    <div className="max-w-md mx-auto pt-40 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-6">Logowanie do panelu admina</h1>
      <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
        <input
          type="password"
          placeholder="Hasło"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="border rounded-lg px-4 py-3 w-full"
        />
        <button type="submit" className="bg-[#23611C] text-white rounded py-3 font-semibold text-base">
          Zaloguj
        </button>
        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
      </form>
    </div>
  );
} 