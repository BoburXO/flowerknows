"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiLock, FiArrowLeft, FiCheck, FiEye, FiEyeOff } from "react-icons/fi";

export default function AdminLoginPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [checking, setChecking] = useState(false);

  // already logged in? go straight to the panel
  useEffect(() => {
    fetch("/api/admin/session")
      .then((r) => r.json())
      .then((d) => d.authenticated && router.replace("/admin"))
      .catch(() => {});
  }, [router]);

  // the password is checked on the SERVER; the browser only receives a signed httpOnly cookie
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (checking || success || !password.trim()) return;
    setChecking(true);
    setError(false);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => router.push("/admin"), 500);
      } else {
        setErrorText(data.error || "Неверный пароль! Попробуйте снова.");
        setError(true);
        setPassword("");
      }
    } catch (err) {
      setErrorText("Ошибка подключения к серверу");
      setError(true);
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] flex flex-col justify-between p-4 sm:p-6">
      {/* Top back button */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-[#7E6F62] hover:text-[#D47A75] font-semibold"
        >
          <FiArrowLeft />
          <span>На главную</span>
        </Link>
        <span className="text-[11px] font-semibold text-[#8C7A6B]">Admin</span>
      </div>

      {/* Center login card */}
      <div className="max-w-sm w-full mx-auto bg-white rounded-3xl p-8 border border-[#EFE6DC] shadow-xl text-center space-y-6">
        <div className="space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[#FAF3EC] text-[#D47A75] border border-[#E8DDD0] flex items-center justify-center mx-auto shadow-inner">
            <FiLock size={24} />
          </div>
          <span className="text-xl font-serif-vintage tracking-[0.2em] font-bold uppercase text-[#3D332A] block">
            Flower Knows
          </span>
          <h2 className="text-sm font-semibold text-[#66584C]">Вход в Панель Управления</h2>
          <p className="text-[11px] text-[#8C7A6B]">Введите пароль администратора</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              autoFocus
              autoComplete="current-password"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              placeholder="Пароль"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              className={`w-full text-center text-sm py-3 pl-4 pr-11 bg-[#FAF6F0] border rounded-xl focus:outline-hidden transition ${
                error
                  ? "border-red-400"
                  : success
                  ? "border-emerald-400"
                  : "border-[#E8DDD0] focus:border-[#D47A75]"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C7A6B] hover:text-[#D47A75] transition"
            >
              {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
            </button>
          </div>

          {error && (
            <p className="text-xs text-red-500 font-semibold">
              {errorText || "Неверный пароль! Попробуйте снова."}
            </p>
          )}

          {success && (
            <p className="text-xs text-emerald-600 font-bold flex items-center justify-center gap-1">
              <FiCheck />
              <span>Доступ разрешен! Вход...</span>
            </p>
          )}

          <button
            type="submit"
            disabled={checking || success || !password.trim()}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#D47A75] to-[#E8A598] text-white text-xs font-bold shadow-md hover:shadow-lg transition disabled:opacity-50"
          >
            {checking ? "Проверка..." : "Войти"}
          </button>
        </form>
      </div>

      <div className="text-center text-[11px] text-[#A69788]">
        Flower Knows Security System • 2026
      </div>
    </div>
  );
}
