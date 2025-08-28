import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Logo from '../Images/LogoFinalLightModeFrameResized.png';
import loginSideImage from '../Images/login_side_image.jpg';

const languageOptions = [
  { value: 'English', label: 'English', native: 'English' },
  { value: 'Tamil', label: 'Tamil', native: 'தமிழ்' },
  { value: 'Telugu', label: 'Telugu', native: 'తెలుగు' },
  { value: 'Malayalam', label: 'Malayalam', native: 'മലയാളം' },
  { value: 'Kannada', label: 'Kannada', native: 'ಕನ್ನಡ' },
  { value: 'Marathi', label: 'Marathi', native: 'मराठी' },
  { value: 'Hindi', label: 'Hindi', native: 'हिन्दी' },
  { value: 'Punjabi', label: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { value: 'Bengali', label: 'Bengali', native: 'বাংলা' },
  { value: 'Gujarati', label: 'Gujarati', native: 'ગુજરાતી' },
  { value: 'Urdu', label: 'Urdu', native: 'اردو' },
  { value: 'Odia', label: 'Odia', native: 'ଓଡ଼ିଆ' },
  { value: 'Assamese', label: 'Assamese', native: 'অসমীয়া' }
];

const Preferences = () => {
  const navigate = useNavigate();
  const { state: signupData } = useLocation(); // contains name, email, password, mobile
  const [artists, setArtists] = useState([]);
  const [selectedArtists, setSelectedArtists] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/spotify/popular-artists');
        setArtists(data);
      } catch (err) {
        console.error('Failed to fetch artists', err);
        // Fallback to existing endpoint if new one fails
        try {
          const { data } = await axios.get('http://localhost:5000/api/top-artists');
          setArtists(data.map(artist => ({
            id: artist.id,
            name: artist.name,
            image: null,
            genres: [],
            popularity: 0
          })));
        } catch (fallbackErr) {
          console.error('Fallback fetch also failed', fallbackErr);
        }
      }
    };
    fetchArtists();
  }, []);

  const handleLanguageChange = (vals) => {
    setSelectedLanguages(vals.map((v) => v.value));
  };

  const handleArtistSelect = (artist) => {
    if (selectedArtists.find(a => a.id === artist.id)) {
      setSelectedArtists(selectedArtists.filter(a => a.id !== artist.id));
    } else {
      setSelectedArtists([...selectedArtists, artist]);
    }
  };

  const handleLanguageSelect = (language) => {
    if (selectedLanguages.includes(language)) {
      setSelectedLanguages(selectedLanguages.filter(l => l !== language));
    } else {
      setSelectedLanguages([...selectedLanguages, language]);
    }
  };

  const filteredArtists = artists.filter(artist => 
    artist.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRegister = async () => {
    if (!signupData) {
      alert('Signup data missing. Please fill sign up form again.');
      navigate('/Signup');
      return;
    }
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/auth/register', {
        name: `${signupData.firstName} ${signupData.lastName}`,
        email: signupData.email,
        password: signupData.password,
        mobile: signupData.mobile || '',
        favoriteArtists: selectedArtists.map(a => a.name),
        languages: selectedLanguages,
      });
      alert('Registered successfully!');
      navigate('/Login');
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="w-screen h-screen bg-[#121212] flex items-center justify-center overflow-hidden">
      <div className="flex w-full h-full bg-gradient-to-br from-[#121212] via-[#1a1a1a] to-[#0e0e0e] overflow-hidden">

        {/* Preferences Form */}
        <div className="w-full bg-[#181818] p-4 lg:p-8 flex flex-col justify-center relative overflow-y-auto">
          <div className="max-w-2xl mx-auto w-full">
            {/* Logo positioned above preferences text */}
            <div className="flex justify-center mb-6">
              <img src={Logo} alt="Brand Logo" className="w-32" />
            </div>
            
            <h2 className="text-3xl font-bold text-center mb-8 text-[#F5F5F5]">Your Preferences</h2>

            {/* Two Column Layout */}
            <div className="grid lg:grid-cols-2 gap-6 mb-6">
              {/* Left Section - Artists */}
              <div className="bg-[#0e0e0e] p-6 rounded-2xl border-2 border-gray-600 shadow-lg hover:shadow-xl transition-all duration-300">
            
                {/* Search Bar */}
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Search artists..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 bg-[#181818] border-2 border-gray-600 rounded-xl text-[#F5F5F5] placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-[#CD7F32]/20 focus:border-[#CD7F32] transition-all duration-300 shadow-sm hover:shadow-md"
                  />
                </div>

                {/* Selected Artists Count */}
                <div className="mb-4">
                  <span className="text-[#CD7F32] font-semibold">
                    {selectedArtists.length} artist{selectedArtists.length !== 1 ? 's' : ''} selected
                  </span>
                </div>

                {/* Artists Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-80 overflow-y-auto">
                  {filteredArtists.map((artist) => {
                    const isSelected = selectedArtists.find(a => a.id === artist.id);
                    return (
                      <div
                        key={artist.id}
                        onClick={() => handleArtistSelect(artist)}
                        className={`cursor-pointer p-3 rounded-xl border-2 transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md ${
                          isSelected 
                            ? 'border-[#CD7F32] bg-[#CD7F32]/20 shadow-lg' 
                            : 'border-gray-600 bg-[#181818] hover:border-[#CD7F32]'
                        }`}
                      >
                        <div className="text-center">
                          {artist.image ? (
                            <img
                              src={artist.image}
                              alt={artist.name}
                              className="w-14 h-14 rounded-full mx-auto mb-2 object-cover border-2 border-gray-100"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-full mx-auto mb-2 bg-[#CD7F32] flex items-center justify-center border-2 border-gray-100">
                              <span className="text-xl">🎵</span>
                            </div>
                          )}
                          <p className="text-[#F5F5F5] text-sm font-semibold truncate">{artist.name}</p>
                          {artist.genres && artist.genres.length > 0 && (
                            <p className="text-gray-400 text-xs truncate">{artist.genres[0]}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Section - Languages */}
              <div className="bg-[#0e0e0e] p-6 rounded-2xl border-2 border-gray-600 shadow-lg hover:shadow-xl transition-all duration-300">
            
                {/* Selected Languages Count */}
                <div className="mb-4">
                  <span className="text-[#CD7F32] font-semibold">
                    {selectedLanguages.length} language{selectedLanguages.length !== 1 ? 's' : ''} selected
                  </span>
                </div>

                {/* Languages Grid */}
                <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto">
                  {languageOptions.map((langOption) => {
                    const isSelected = selectedLanguages.includes(langOption.value);
                    return (
                      <div
                        key={langOption.value}
                        onClick={() => handleLanguageSelect(langOption.value)}
                        className={`cursor-pointer p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md ${
                          isSelected 
                            ? 'border-[#CD7F32] bg-[#CD7F32]/20 shadow-lg' 
                            : 'border-gray-600 bg-[#181818] hover:border-[#CD7F32]'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-2xl mb-2">🎶</div>
                          <p className="text-[#F5F5F5] font-bold text-lg">{langOption.native}</p>
                          <p className="text-gray-400 text-sm">{langOption.label}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Register Button */}
            <div className="text-center mt-8">
              <button
                disabled={loading}
                onClick={handleRegister}
                className="w-full py-4 bg-gradient-to-r from-[#CD7F32] to-[#b06f2d] text-white rounded-xl font-bold text-lg hover:from-[#b06f2d] hover:to-[#CD7F32] transform hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-xl active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? 'Registering...' : 'Complete Registration'}
              </button>
              <p className="text-gray-400 text-sm mt-3">
                You can complete registration without selecting preferences
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Preferences;
