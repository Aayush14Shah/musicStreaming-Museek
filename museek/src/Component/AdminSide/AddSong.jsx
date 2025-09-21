import React, { useState } from "react";
import { Button, TextField, MenuItem, FormControl, InputLabel, Select, Box, Typography } from "@mui/material";
import { ArrowBack as ArrowBackIcon, CloudUpload as CloudUploadIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "./AdminNavbar";

const AddSong = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    artist: "",
    album: "",
    genre: "",
    releaseDate: "",
    duration: "",
    description: "",
    audioFile: null,
    coverImage: null,
  });

  const genres = [
    "Pop", "Rock", "Hip Hop", "Electronic", "Jazz", "Classical", 
    "Country", "R&B", "Folk", "Reggae", "Blues", "Punk", 
    "Metal", "Alternative", "Indie", "Ambient", "Synthwave", 
    "Chillwave", "Indie Rock", "Acoustic"
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e, fileType) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file types
      if (fileType === 'audioFile') {
        const validAudioTypes = ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/mp3'];
        if (!validAudioTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.mp3')) {
          alert('Please select a valid audio file (MP3, WAV, FLAC)');
          return;
        }
      } else if (fileType === 'coverImage') {
        const validImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
        if (!validImageTypes.includes(file.type)) {
          alert('Please select a valid image file (JPG, PNG, WEBP)');
          return;
        }
      }
      
      setFormData(prev => ({
        ...prev,
        [fileType]: file
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Create FormData for file upload
      const submitData = new FormData();
      
      // Add text fields
      submitData.append('title', formData.title);
      submitData.append('artist', formData.artist);
      submitData.append('album', formData.album);
      submitData.append('genre', formData.genre);
      submitData.append('releaseDate', formData.releaseDate);
      submitData.append('duration', formData.duration);
      submitData.append('description', formData.description);
      
      // Add files
      if (formData.audioFile) {
        submitData.append('audioFile', formData.audioFile);
      }
      if (formData.coverImage) {
        submitData.append('coverImage', formData.coverImage);
      }
      
      console.log('Submitting song data...');
      
      // Submit to backend API
      const response = await fetch('http://localhost:5000/api/custom-songs', {
        method: 'POST',
        body: submitData, // Don't set Content-Type header, let browser set it for FormData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload song');
      }
      
      const result = await response.json();
      console.log('Song uploaded successfully:', result);
      
      // Show success message (you can add a toast notification here)
      alert('Song uploaded successfully!');
      
      // Navigate back to manage songs
      navigate('/admin/songs');
      
    } catch (error) {
      console.error('Error uploading song:', error);
      alert('Error uploading song: ' + error.message);
    }
  };

  const handleCancel = () => {
    navigate("/admin/songs");
  };

  return (
    <div className="flex h-screen bg-[#181818] text-[#F5F5F5]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminNavbar />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
              
              {/* Header */}
              <div className="flex items-center gap-4 mb-8">
                <Button
                  onClick={handleCancel}
                  variant="outlined"
                  startIcon={<ArrowBackIcon />}
                  sx={{
                    borderColor: "#CD7F32",
                    color: "#F5F5F5",
                    "&:hover": { 
                      borderColor: "#b46f2a",
                      backgroundColor: "#CD7F32/10"
                    },
                    textTransform: "none",
                  }}
                >
                  Back
                </Button>
                <div>
                  <h2 className="text-3xl font-bold">Add New Song</h2>
                  <p className="text-[#F5F5F5]/70 mt-1">
                    Add a new song to your offline music library
                  </p>
                </div>
              </div>

              {/* Form */}
              <div className="bg-[#181818] border border-[#CD7F32]/20 rounded-lg p-8 shadow-lg">
                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* Basic Information */}
                  <div>
                    <Typography variant="h6" className="mb-4 text-[#CD7F32] font-semibold">
                      Basic Information
                    </Typography>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <TextField
                        name="title"
                        label="Song Title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            color: '#F5F5F5',
                            '& fieldset': {
                              borderColor: '#CD7F32/30',
                            },
                            '&:hover fieldset': {
                              borderColor: '#CD7F32',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#CD7F32',
                            },
                            backgroundColor: '#2a2a2a',
                          },
                          '& .MuiInputLabel-root': {
                            color: '#F5F5F5/70',
                            '&.Mui-focused': {
                              color: '#CD7F32',
                            },
                          },
                        }}
                      />
                      <TextField
                        name="artist"
                        label="Artist Name"
                        value={formData.artist}
                        onChange={handleInputChange}
                        required
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            color: '#F5F5F5',
                            '& fieldset': {
                              borderColor: '#CD7F32/30',
                            },
                            '&:hover fieldset': {
                              borderColor: '#CD7F32',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#CD7F32',
                            },
                            backgroundColor: '#2a2a2a',
                          },
                          '& .MuiInputLabel-root': {
                            color: '#F5F5F5/70',
                            '&.Mui-focused': {
                              color: '#CD7F32',
                            },
                          },
                        }}
                      />
                      <TextField
                        name="album"
                        label="Album Name"
                        value={formData.album}
                        onChange={handleInputChange}
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            color: '#F5F5F5',
                            '& fieldset': {
                              borderColor: '#CD7F32/30',
                            },
                            '&:hover fieldset': {
                              borderColor: '#CD7F32',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#CD7F32',
                            },
                            backgroundColor: '#2a2a2a',
                          },
                          '& .MuiInputLabel-root': {
                            color: '#F5F5F5/70',
                            '&.Mui-focused': {
                              color: '#CD7F32',
                            },
                          },
                        }}
                      />
                      <FormControl fullWidth>
                        <InputLabel 
                          sx={{ 
                            color: '#F5F5F5/70',
                            '&.Mui-focused': { color: '#CD7F32' }
                          }}
                        >
                          Genre
                        </InputLabel>
                        <Select
                          name="genre"
                          value={formData.genre}
                          onChange={handleInputChange}
                          required
                          sx={{
                            color: '#F5F5F5',
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#CD7F32/30',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#CD7F32',
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#CD7F32',
                            },
                            backgroundColor: '#2a2a2a',
                            '& .MuiSvgIcon-root': {
                              color: '#F5F5F5',
                            },
                          }}
                        >
                          {genres.map((genre) => (
                            <MenuItem key={genre} value={genre}>
                              {genre}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <TextField
                        name="releaseDate"
                        label="Release Date"
                        type="date"
                        value={formData.releaseDate}
                        onChange={handleInputChange}
                        fullWidth
                        InputLabelProps={{
                          shrink: true,
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            color: '#F5F5F5',
                            '& fieldset': {
                              borderColor: '#CD7F32/30',
                            },
                            '&:hover fieldset': {
                              borderColor: '#CD7F32',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#CD7F32',
                            },
                            backgroundColor: '#2a2a2a',
                          },
                          '& .MuiInputLabel-root': {
                            color: '#F5F5F5/70',
                            '&.Mui-focused': {
                              color: '#CD7F32',
                            },
                          },
                        }}
                      />
                      <TextField
                        name="duration"
                        label="Duration (mm:ss)"
                        placeholder="3:45"
                        value={formData.duration}
                        onChange={handleInputChange}
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            color: '#F5F5F5',
                            '& fieldset': {
                              borderColor: '#CD7F32/30',
                            },
                            '&:hover fieldset': {
                              borderColor: '#CD7F32',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#CD7F32',
                            },
                            backgroundColor: '#2a2a2a',
                          },
                          '& .MuiInputLabel-root': {
                            color: '#F5F5F5/70',
                            '&.Mui-focused': {
                              color: '#CD7F32',
                            },
                          },
                        }}
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <TextField
                      name="description"
                      label="Description (Optional)"
                      value={formData.description}
                      onChange={handleInputChange}
                      multiline
                      rows={3}
                      fullWidth
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          color: '#F5F5F5',
                          '& fieldset': {
                            borderColor: '#CD7F32/30',
                          },
                          '&:hover fieldset': {
                            borderColor: '#CD7F32',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#CD7F32',
                          },
                          backgroundColor: '#2a2a2a',
                        },
                        '& .MuiInputLabel-root': {
                          color: '#F5F5F5/70',
                          '&.Mui-focused': {
                            color: '#CD7F32',
                          },
                        },
                      }}
                    />
                  </div>

                  {/* File Uploads */}
                  <div>
                    <Typography variant="h6" className="mb-4 text-[#CD7F32] font-semibold">
                      File Uploads
                    </Typography>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Audio File Upload */}
                      <div>
                        <Typography variant="body2" className="mb-2 text-[#F5F5F5]/70">
                          Audio File *
                        </Typography>
                        <Box
                          sx={{
                            border: '2px dashed #CD7F32/30',
                            borderRadius: '8px',
                            padding: '2rem',
                            textAlign: 'center',
                            backgroundColor: '#2a2a2a',
                            '&:hover': {
                              borderColor: '#CD7F32',
                              backgroundColor: '#CD7F32/5',
                            },
                            cursor: 'pointer',
                          }}
                          onClick={() => document.getElementById('audio-file-input').click()}
                        >
                          <CloudUploadIcon sx={{ fontSize: 48, color: '#CD7F32', mb: 2 }} />
                          <Typography variant="body2" className="text-[#F5F5F5]/70">
                            {formData.audioFile ? formData.audioFile.name : 'Click to upload audio file'}
                          </Typography>
                          <Typography variant="caption" className="text-[#F5F5F5]/50">
                            Supported formats: MP3, WAV, FLAC
                          </Typography>
                        </Box>
                        <input
                          id="audio-file-input"
                          type="file"
                          accept=".mp3,.wav,.flac"
                          onChange={(e) => handleFileChange(e, 'audioFile')}
                          style={{ display: 'none' }}
                          required
                        />
                      </div>

                      {/* Cover Image Upload */}
                      <div>
                        <Typography variant="body2" className="mb-2 text-[#F5F5F5]/70">
                          Cover Image (Optional)
                        </Typography>
                        <Box
                          sx={{
                            border: '2px dashed #CD7F32/30',
                            borderRadius: '8px',
                            padding: '2rem',
                            textAlign: 'center',
                            backgroundColor: '#2a2a2a',
                            '&:hover': {
                              borderColor: '#CD7F32',
                              backgroundColor: '#CD7F32/5',
                            },
                            cursor: 'pointer',
                          }}
                          onClick={() => document.getElementById('cover-image-input').click()}
                        >
                          <CloudUploadIcon sx={{ fontSize: 48, color: '#CD7F32', mb: 2 }} />
                          <Typography variant="body2" className="text-[#F5F5F5]/70">
                            {formData.coverImage ? formData.coverImage.name : 'Click to upload cover image'}
                          </Typography>
                          <Typography variant="caption" className="text-[#F5F5F5]/50">
                            Supported formats: JPG, PNG, WEBP
                          </Typography>
                        </Box>
                        <input
                          id="cover-image-input"
                          type="file"
                          accept=".jpg,.jpeg,.png,.webp"
                          onChange={(e) => handleFileChange(e, 'coverImage')}
                          style={{ display: 'none' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-6 border-t border-[#CD7F32]/20">
                    <Button
                      type="submit"
                      variant="contained"
                      sx={{
                        backgroundColor: "#CD7F32",
                        "&:hover": { backgroundColor: "#b46f2a" },
                        fontWeight: "bold",
                        borderRadius: "0.5rem",
                        padding: "0.75rem 2rem",
                        textTransform: "none",
                      }}
                    >
                      Add Song
                    </Button>
                    <Button
                      type="button"
                      onClick={handleCancel}
                      variant="outlined"
                      sx={{
                        borderColor: "#CD7F32/50",
                        color: "#F5F5F5/70",
                        "&:hover": { 
                          borderColor: "#CD7F32",
                          backgroundColor: "#CD7F32/10"
                        },
                        fontWeight: "bold",
                        borderRadius: "0.5rem",
                        padding: "0.75rem 2rem",
                        textTransform: "none",
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AddSong;
