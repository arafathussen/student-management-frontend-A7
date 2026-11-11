"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminManageEntitiesRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard?tab=USERS");
  }, [router]);

  return null;
}
