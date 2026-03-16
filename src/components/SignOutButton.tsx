"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Props {
  variant?: "button" | "link";
}

export default function SignOutButton({ variant = "button" }: Props) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  if (variant === "link") {
    return (
      <button
        onClick={handleSignOut}
        className="text-xs text-gray-400 hover:text-gray-600"
      >
        Sign out
      </button>
    );
  }

  return (
    <button
      onClick={handleSignOut}
      className="text-sm text-gray-600 hover:text-gray-900"
    >
      Sign out
    </button>
  );
}
