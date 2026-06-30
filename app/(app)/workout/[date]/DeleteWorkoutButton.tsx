"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Trash } from "@phosphor-icons/react";
import { Button } from "@/components/ui/Button";

interface DeleteWorkoutButtonProps {
  logId: string;
  isReadOnly?: boolean;
}

export function DeleteWorkoutButton({ logId, isReadOnly = false }: DeleteWorkoutButtonProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  if (isReadOnly) return null;

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this workout log?")) {
      return;
    }

    setDeleting(true);
    const supabase = createClient();

    try {
      const { error } = await supabase
        .from("workout_logs")
        .delete()
        .eq("id", logId);

      if (error) {
        alert("Failed to delete workout log: " + error.message);
      } else {
        router.push("/workout");
        router.refresh();
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Button
      size="sm"
      variant="danger"
      onClick={handleDelete}
      disabled={deleting}
      className="flex items-center gap-1"
    >
      <Trash size={14} />
      {deleting ? "Deleting..." : "Delete Log"}
    </Button>
  );
}
