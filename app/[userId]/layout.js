"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getToken, getUser, logout } from "@/lib/auth";

const LOGIN_PATH = "/login";

const parseJwt = (token) => {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
};

const isTokenExpired = (token) => {
  if (!token) return true;
  const payload = parseJwt(token);
  if (!payload || !payload.exp) return true; // if no exp, treat as invalid
  const now = Math.floor(Date.now() / 1000);
  return now >= payload.exp;
};

export default function UserLayout({ children }) {
  const router = useRouter();
  const params = useParams();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = getToken();
    const user = getUser();

    // no token => redirect
    if (!token) {
      logout();
      router.replace(LOGIN_PATH);
      return;
    }

    // expired token => redirect
    if (isTokenExpired(token)) {
      logout();
      router.replace(LOGIN_PATH);
      return;
    }

    // If userId in URL doesn't match logged user => fix URL
    const urlUserId = params?.userId;
    if (user?.user_id && urlUserId && user.user_id !== urlUserId) {
      router.replace(`/${user.user_id}/profile`);
      return;
    }

    setReady(true);
  }, [params, router]);

  if (!ready) return null;

  return <>{children}</>;
}