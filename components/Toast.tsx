"use client";

import { useState } from "react"


export function useToast() {
const [message, setMessage] = useState<string | null>(null)


function toast(msg: string) {
setMessage(msg)
setTimeout(() => setMessage(null), 3000)
}


const Toast = () =>
    message ? (
      <div className="fixed bottom-6 right-6 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 shadow-2xl backdrop-blur-sm animate-[slideIn_0.3s_ease-out]">
        {message}
      </div>
    ) : null


return { toast, Toast }
}