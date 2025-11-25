import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const EditAdminPopup = ({ admin, setAdmin }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "Admin",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Keep form synced when admin prop changes
  useEffect(() => {
    if (admin) {
      setForm({
        name: admin.name || "",
        email: admin.email || "",
        role: admin.role || "Admin",
      });
      setError("");
    }
  }, [admin]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!form.name?.trim()) {
      setError("Name cannot be empty");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await fetch(`http://localhost:5000/api/admins/${admin._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name.trim() }),
      });

      const data = await res.json(); // parse body once

      if (!res.ok) {
        throw new Error(data?.error || `Server returned ${res.status}`);
      }

      // ✅ success
      console.log("Updated admin:", data);
      setAdmin(null); // close popup
    } catch (err) {
      setError(err.message || "Failed to update admin");
    } finally {
      setLoading(false);
    }
  };

  if (!admin) return null;

  return (
    <Dialog
      open={!!admin}
      onClose={() => setAdmin(null)}
      fullWidth
      maxWidth="sm"
      BackdropProps={{ style: { backdropFilter: "blur(6px)" } }}
      PaperProps={{
        style: {
          backgroundColor: "#181818",
          color: "#F5F5F5",
          borderRadius: "1rem",
        },
      }}
    >
      <DialogTitle className="flex justify-between items-center text-xl font-bold text-[#CD7F32]">
        Edit Admin
        <IconButton onClick={() => setAdmin(null)} sx={{ color: "#F5F5F5" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <div className="space-y-4">
          {/* Editable Name */}
          <TextField
            fullWidth
            label="Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            variant="outlined"
            InputLabelProps={{ sx: { color: "#aaa" } }}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#CD7F32" },
                "&:hover fieldset": { borderColor: "#b46f2a" },
              },
              "& .MuiInputBase-input": { color: "#F5F5F5" },
            }}
          />

          {/* Disabled Email - white text even when disabled */}
          <TextField
            fullWidth
            label="Email"
            name="email"
            value={form.email}
            disabled
            variant="outlined"
            InputLabelProps={{ sx: { color: "#aaa" } }}
            sx={{
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "#CD7F32" },
              // Force white text for disabled state across browsers
              "& .MuiInputBase-input.Mui-disabled": {
                color: "#adb5bd",
                WebkitTextFillColor: "#adb5bd",
              },
              "& .MuiInputLabel-root.Mui-disabled": {
                color: "#aaa",
              },
            }}
          />

          {/* Disabled Role - white text */}
          <TextField
            fullWidth
            label="Role"
            name="role"
            value={form.role}
            disabled
            variant="outlined"
            InputLabelProps={{ sx: { color: "#aaa" } }}
            sx={{
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "#CD7F32" },
              "& .MuiInputBase-input.Mui-disabled": {
                color: "#adb5bd",
                WebkitTextFillColor: "#adb5bd",
              },
              "& .MuiInputLabel-root.Mui-disabled": {
                color: "#aaa",
              },
            }}
          />

          {error && <p className="text-red-400 text-sm">{error}</p>}
        </div>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={() => setAdmin(null)}
          sx={{ color: "#aaa", fontWeight: "bold" }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={loading}
          sx={{
            backgroundColor: "#CD7F32",
            "&:hover": { backgroundColor: "#b46f2a" },
            fontWeight: "bold",
          }}
        >
          {loading ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditAdminPopup;
