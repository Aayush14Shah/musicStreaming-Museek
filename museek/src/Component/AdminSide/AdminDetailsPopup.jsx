import React from "react";
import { Dialog, DialogTitle, DialogContent, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const AdminDetailsPopup = ({ admin, setAdmin }) => {
  if (!admin) return null;

  return (
    <Dialog
      open={!!admin}
      onClose={() => setAdmin(null)}
      fullWidth
      maxWidth="md"
      BackdropProps={{
        style: { backdropFilter: "blur(6px)" },
      }}
      PaperProps={{
        style: {
          backgroundColor: "#181818",
          color: "#F5F5F5",
          borderRadius: "1rem",
          padding: "0.5rem",
        },
      }}
    >
      <DialogTitle className="flex justify-between items-center text-xl font-bold text-[#CD7F32]">
        Admin Profile
        <IconButton onClick={() => setAdmin(null)} sx={{ color: "#F5F5F5" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <div className="grid grid-cols-2 gap-6">
          {/* Left section - profile details */}
          <div className="space-y-4">
            <div>
              <p className="font-semibold text-gray-400">Name</p>
              <p className="text-lg">{admin.name}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-400">Email</p>
              <p>{admin.email}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-400">Role</p>
              <p>{admin.role || "Admin"}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-400">Status</p>
              <p className={admin.status ? "text-green-400" : "text-red-400"}>
                {admin.status ? "Active" : "Inactive"}
              </p>
            </div>
            <div>
              <p className="font-semibold text-gray-400">Created At</p>
              <p>{new Date(admin.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Right section - stats placeholder */}
          <div className="p-4 bg-[#222] rounded-lg border border-[#CD7F32]/30 shadow-md">
            <h3 className="text-lg font-semibold mb-3 text-[#CD7F32]">
              Admin Stats
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>✔ Managed 15 Users</li>
              <li>✔ Approved 4 Requests</li>
              <li>✔ Last Login: 2 days ago</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminDetailsPopup;
