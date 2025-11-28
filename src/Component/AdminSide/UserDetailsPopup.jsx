import React, { useEffect } from "react";
import CloseIcon from "@mui/icons-material/Close";
import InfoIcon from "@mui/icons-material/Info";

const UserDetailsPopup = ({ user, setUser }) => {
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") setUser(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setUser]);

  if (!user) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center z-50">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setUser(null)}
      />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-[#282828]/80 backdrop-blur-md rounded-2xl shadow-2xl p-6 max-w-lg w-full border border-[#CD7F32]/30"
      >
        <button
          onClick={() => setUser(null)}
          className="absolute top-4 right-4 text-[#F5F5F5] hover:text-[#CD7F32]"
          aria-label="close"
        >
          <CloseIcon />
        </button>

        <div className="flex items-center gap-4 mb-4">
          <div className="bg-[#111] rounded-full h-14 w-14 flex items-center justify-center text-[#CD7F32] text-xl shadow-inner">
            {user.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#F5F5F5]">{user.name}</h2>
            <p className="text-sm text-[#F5F5F5]/70">{user.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm text-[#F5F5F5]/80">
          <div className="space-y-1">
            <p className="text-xs text-[#F5F5F5]/60">Role</p>
            <p className="font-medium">{user.role || "User"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-[#F5F5F5]/60">Status</p>
            <p className="font-medium">
              {user.status ? (
                <span className="inline-block px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400">
                  Active
                </span>
              ) : (
                <span className="inline-block px-2 py-1 rounded-full text-xs bg-red-500/20 text-red-300">
                  Inactive
                </span>
              )}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-[#F5F5F5]/60">Created</p>
            <p className="font-medium">
              {user.createdAt ? new Date(user.createdAt).toLocaleString() : "-"}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-[#F5F5F5]/60">Updated</p>
            <p className="font-medium">
              {user.updatedAt ? new Date(user.updatedAt).toLocaleString() : "-"}
            </p>
          </div>
        </div>

        {/* Optional extra info area */}
        <div className="mt-6 text-sm text-[#F5F5F5]/80 flex items-start gap-3">
          <InfoIcon className="text-[#CD7F32]/80" />
          <div>
            <p>
              Detailed stats for this user will appear here (playlists, plays,
              uploads etc). For now we show the fields available in the DB.
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => setUser(null)}
            className="px-4 py-2 rounded-lg bg-[#333] text-[#F5F5F5] hover:bg-[#3b3b3b]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserDetailsPopup;