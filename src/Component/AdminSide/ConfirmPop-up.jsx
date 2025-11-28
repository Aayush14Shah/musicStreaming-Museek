import React, { useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { Button } from "@mui/material";

export default function ConfirmPopup({ user, setUser, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") setUser(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setUser]);

  if (!user) return null;

  const handleConfirm = async () => {
    setError("");
    setLoading(true);
    try {
      // set status to false (inactive)
      const res = await fetch(`/api/users/${user._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: false }),
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || "Failed to update status");
      }
      const updated = await res.json();
      setUser(null);
      if (onSuccess) onSuccess(updated);
    } catch (err) {
      console.error(err);
      setError(err.message || "Action failed");
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
        className="relative bg-[#282828]/80 backdrop-blur-md rounded-2xl shadow-2xl p-6 max-w-sm w-full border border-[#CD7F32]/30 text-center"
      >
        <button
          onClick={() => setUser(null)}
          className="absolute top-4 right-4 text-[#F5F5F5] hover:text-[#CD7F32]"
          aria-label="close"
        >
          <CloseIcon />
        </button>

        <div className="flex flex-col items-center gap-3">
          <div className="bg-[#111] rounded-full p-3">
            <WarningAmberIcon style={{ fontSize: 36 }} className="text-[#CD7F32]" />
          </div>
          <h3 className="text-lg font-semibold text-[#F5F5F5]">
            Deactivate user?
          </h3>
          <p className="text-sm text-[#F5F5F5]/70">
            This will mark the user as inactive. They will not be deleted.
          </p>

          {error && <p className="text-xs text-red-300">{error}</p>}

          <div className="w-full flex gap-3 mt-4">
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
              onClick={handleConfirm}
              fullWidth
              sx={{
                backgroundColor: "#CD7F32",
                "&:hover": { backgroundColor: "#b46f2a" },
                borderRadius: "0.75rem",
              }}
              variant="contained"
              disabled={loading}
            >
              {loading ? "Processing..." : "Deactivate"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
