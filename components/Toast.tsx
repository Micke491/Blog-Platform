"use client";

import { useState } from "react"

type ToastType = "success" | "error" | "info";

export function useToast() {
  const [message, setMessage] = useState<string | null>(null);
  const [type, setType] = useState<ToastType>("info");

  function toast(msg: string, toastType: ToastType = "info") {
    setMessage(msg);
    setType(toastType);
    setTimeout(() => setMessage(null), 3000);
  }

  const Toast = () =>
    message ? (
      <div
        className={`fixed bottom-6 right-6 z-50 rounded-2xl text-white px-6 py-4 shadow-2xl backdrop-blur-sm animate-[slideIn_0.3s_ease-out] ${
          type === "success"
            ? "bg-gradient-to-r from-green-600 to-emerald-600"
            : type === "error"
            ? "bg-gradient-to-r from-red-600 to-rose-600"
            : "bg-gradient-to-r from-purple-600 to-pink-600"
        }`}
      >
        <div className="flex items-center gap-3">
          {type === "success" && "✓"}
          {type === "error" && "✕"}
          {type === "info" && "ℹ"}
          <span>{message}</span>
        </div>
      </div>
    ) : null;

  return { toast, Toast };
}