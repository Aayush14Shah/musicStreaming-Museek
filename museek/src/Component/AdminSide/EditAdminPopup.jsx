import React, { useState } from "react";
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
    name: admin?.name || "",
    email: admin?.email || "",
    role: admin?.role || "Admin",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    console.log("Updated Admin:", form);
    setAdmin(null);
  };

  return (
    <Dialog
      open={!!admin}
      onClose={() => setAdmin(null)}
      fullWidth
      maxWidth="sm"
      BackdropProps={{
        style: { backdropFilter: "blur(6px)" },
      }}
      PaperProps={{
        style: { backgroundColor: "#181818", color: "#F5F5F5", borderRadius: "1rem" },
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
          <TextField
            fullWidth
            label="Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            variant="outlined"
            InputLabelProps={{ style: { color: "#aaa" } }}
            InputProps={{ style: { color: "#F5F5F5" } }}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#CD7F32" },
                "&:hover fieldset": { borderColor: "#b46f2a" },
              },
            }}
          />

          <TextField
            fullWidth
            label="Email"
            name="email"
            value={form.email}
            onChange={handleChange}
            variant="outlined"
            InputLabelProps={{ style: { color: "#aaa" } }}
            InputProps={{ style: { color: "#F5F5F5" } }}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#CD7F32" },
                "&:hover fieldset": { borderColor: "#b46f2a" },
              },
            }}
          />

          <TextField
            fullWidth
            label="Role"
            name="role"
            value={form.role}
            onChange={handleChange}
            variant="outlined"
            InputLabelProps={{ style: { color: "#aaa" } }}
            InputProps={{ style: { color: "#F5F5F5" } }}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#CD7F32" },
                "&:hover fieldset": { borderColor: "#b46f2a" },
              },
            }}
          />
        </div>
      </DialogContent>

      <DialogActions>
        <Button onClick={() => setAdmin(null)} sx={{ color: "#aaa", fontWeight: "bold" }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          sx={{
            backgroundColor: "#CD7F32",
            "&:hover": { backgroundColor: "#b46f2a" },
            fontWeight: "bold",
          }}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditAdminPopup;
