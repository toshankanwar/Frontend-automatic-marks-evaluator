"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUser } from "@/lib/auth";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const u = getUser();
    if (u) router.push(`/${u.user_id}/allevaluations`);
    else router.push("/login");
  }, [router]);

  return null;
}