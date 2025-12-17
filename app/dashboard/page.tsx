"use client";

import { useRouter } from "next/navigation";

export default function Test() {

const router = useRouter();

const logout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };
  
  return (
    <button onClick={logout}>Logout</button>
  )
}