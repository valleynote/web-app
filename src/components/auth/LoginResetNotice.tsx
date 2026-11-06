"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

export function LoginResetNotice() {
  const params = useSearchParams();

  useEffect(() => {
    if (params.get("reset") !== "1") return;
    toast.success("Password updated — you can log in now.");
  }, [params]);

  return null;
}
