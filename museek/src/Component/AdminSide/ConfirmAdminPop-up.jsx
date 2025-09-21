import React from "react";
import { Button } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

const ConfirmAdminPopup = ({ deleteAdmin, setDeleteAdmin, handleConfirm, loading, error }) => {
  if (!deleteAdmin) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center z-50">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setDeleteAdmin(null)}
      />

      {/* Modal Content */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-[#282828]/80 backdrop-blur-md rounded-2xl shadow-2xl p-6 max-w-sm w-full border border-[#CD7F32]/30 text-center"
      >
        {/* Close Button */}
        <button
          onClick={() => setDeleteAdmin(null)}
          className="absolute top-4 right-4 text-[#F5F5F5] hover:text-[#CD7F32]"
          aria-label="close"
        >
          <CloseIcon />
        </button>

        {/* Content */}
        <div className="flex flex-col items-center gap-3">
          <div className="bg-[#111] rounded-full p-3">
            <WarningAmberIcon style={{ fontSize: 36 }} className="text-[#CD7F32]" />
          </div>

          <h3 className="text-lg font-semibold text-[#F5F5F5]">Delete Admin?</h3>
          <p className="text-sm text-[#F5F5F5]/70">
            This action will permanently remove{" "}
            <span className="font-semibold text-[#CD7F32]">{deleteAdmin.name}</span>.
          </p>

          {error && <p className="text-xs text-red-300">{error}</p>}

          {/* Buttons */}
          <div className="w-full flex gap-3 mt-4">
            <Button
              onClick={() => setDeleteAdmin(null)}
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
              {loading ? "Processing..." : "Delete"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmAdminPopup;
