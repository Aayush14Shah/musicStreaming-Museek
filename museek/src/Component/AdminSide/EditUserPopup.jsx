import React, { useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { TextField, Button } from "@mui/material";

export default function EditUserPopup({ user, setUser, onSuccess }) {
  const [name, setName] = useState(user?.name || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setName(user?.name || "");
  }, [user]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") setUser(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setUser]);

  if (!user) return null;

  const handleSubmit = async () => {
    setError("");
    if (!name.trim()) {
      setError("Name cannot be empty");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${user._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || "Failed to update user");
      }
      const updated = await res.json();
      setUser(null);
      if (onSuccess) onSuccess(updated);
    } catch (err) {
      console.error(err);
      setError(err.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center z-50">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setUser(null)}
      />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-[#282828]/80 backdrop-blur-md rounded-2xl shadow-2xl p-6 max-w-sm w-full border border-[#CD7F32]/30"
      >
        <button
          onClick={() => setUser(null)}
          className="absolute top-4 right-4 text-[#F5F5F5] hover:text-[#CD7F32]"
          aria-label="close"
        >
          <CloseIcon />
        </button>

        <h3 className="text-xl font-semibold text-[#F5F5F5] mb-3">Edit User</h3>
        <p className="text-sm text-[#F5F5F5]/70 mb-4">
          Change the display name for <strong>{user.email}</strong>
        </p>

        <div className="space-y-3">
          <TextField
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            InputProps={{ style: { color: "#F5F5F5" } }}
            InputLabelProps={{ style: { color: "#aaa" } }}
          />
          {error && <p className="text-xs text-red-300">{error}</p>}

          <div className="flex gap-3 mt-4">
            <Button
              onClick={() => setUser(null)}
              fullWidth
              sx={{
                backgroundColor: "#444",
                "&:hover": { backgroundColor: "#555" },
                borderRadius: "0.75rem",
              }}
              variant="contained"
              disabled={loading}
            >
              Cancel
            </Button>

            <Button
              onClick={handleSubmit}
              fullWidth
              sx={{
                backgroundColor: "#CD7F32",
                "&:hover": { backgroundColor: "#b46f2a" },
                borderRadius: "0.75rem",
              }}
              variant="contained"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
