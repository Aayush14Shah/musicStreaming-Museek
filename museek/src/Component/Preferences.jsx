import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Logo from '../Images/LogoFinalDarkModeFrameResized.png';
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
    <div className="min-h-screen bg-[#181818] text-white">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-[#0f0f0f] via-[#1a1a1a] to-[#0f0f0f] border-b border-[#333] py-6">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-center mb-4">
            <img src={Logo} alt="Brand Logo" className="w-40" />
          </div>
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-[#F5F5F5] mb-3 bg-gradient-to-r from-[#F5F5F5] to-[#cd7f32] bg-clip-text text-transparent">
              Set Your Preferences
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto leading-relaxed">
              Choose your favorite artists and languages to personalize your music experience
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-8 min-h-[calc(100vh-400px)]">
          {/* Left Section - Artists */}
          <div className="bg-[#0f0f0f] rounded-xl border border-[#333] flex flex-col shadow-lg">
            <div className="p-6 border-b border-[#333]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-[#F5F5F5]">Favorite Artists</h2>
                <span className="text-sm px-3 py-1 rounded-full bg-[#cd7f32]/20 text-[#cd7f32]">
                  {selectedArtists.length} selected
                </span>
              </div>
              
              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search artists..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 pl-10 bg-[#181818] border border-[#333] rounded-lg text-[#F5F5F5] placeholder-gray-400 focus:outline-none focus:border-[#cd7f32] transition-colors"
                />
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Artists Grid - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 pb-8">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {filteredArtists.map((artist) => {
                  const isSelected = selectedArtists.find(a => a.id === artist.id);
                  return (
                    <div
                      key={artist.id}
                      onClick={() => handleArtistSelect(artist)}
                      className={`group cursor-pointer p-4 rounded-lg border transition-all duration-300 hover:scale-105 ${
                        isSelected 
                          ? 'border-[#cd7f32] bg-[#cd7f32]/10 shadow-lg shadow-[#cd7f32]/20' 
                          : 'border-[#333] bg-[#181818] hover:border-[#cd7f32]/50 hover:bg-[#cd7f32]/5'
                      }`}
                    >
                      <div className="text-center">
                        {artist.image ? (
                          <img
                            src={artist.image}
                            alt={artist.name}
                            className="w-16 h-16 rounded-full mx-auto mb-3 object-cover border-2 border-gray-600 group-hover:border-[#cd7f32] transition-colors"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full mx-auto mb-3 bg-gradient-to-br from-[#cd7f32] to-[#b06f2d] flex items-center justify-center border-2 border-gray-600 group-hover:border-[#cd7f32] transition-colors">
                            <span className="text-2xl">🎵</span>
                          </div>
                        )}
                        <p className="text-[#F5F5F5] text-sm font-medium truncate group-hover:text-[#cd7f32] transition-colors">{artist.name}</p>
                        {artist.genres && artist.genres.length > 0 && (
                          <p className="text-gray-400 text-xs truncate mt-1">{artist.genres[0]}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Section - Languages */}
          <div className="bg-[#0f0f0f] rounded-xl border border-[#333] flex flex-col shadow-lg">
            <div className="p-6 border-b border-[#333]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-[#F5F5F5]">Languages</h2>
                <span className="text-sm px-3 py-1 rounded-full bg-[#cd7f32]/20 text-[#cd7f32]">
                  {selectedLanguages.length} selected
                </span>
              </div>
              <p className="text-gray-400 text-sm">Select languages you understand for better music recommendations</p>
            </div>

            {/* Languages Grid - Auto Height */}
            <div className="p-6 pb-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {languageOptions.map((langOption) => {
                  const isSelected = selectedLanguages.includes(langOption.value);
                  return (
                    <div
                      key={langOption.value}
                      onClick={() => handleLanguageSelect(langOption.value)}
                      className={`group cursor-pointer p-4 rounded-lg border transition-all duration-300 hover:scale-105 ${
                        isSelected 
                          ? 'border-[#cd7f32] bg-[#cd7f32]/10 shadow-lg shadow-[#cd7f32]/20' 
                          : 'border-[#333] bg-[#181818] hover:border-[#cd7f32]/50 hover:bg-[#cd7f32]/5'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">🌍</div>
                        <p className="text-[#F5F5F5] font-bold text-lg group-hover:text-[#cd7f32] transition-colors">{langOption.native}</p>
                        <p className="text-gray-400 text-sm mt-1">{langOption.label}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Continue Button */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
        <button
          disabled={loading}
          onClick={handleRegister}
          className="px-10 py-4 bg-gradient-to-r from-[#cd7f32] to-[#b06f2d] text-white rounded-full font-semibold text-lg hover:from-[#b06f2d] hover:to-[#cd7f32] transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {loading ? 'Registering...' : 'Continue Browsing'}
        </button>
      </div>

      {/* Floating Skip Button - Bottom Right */}
      <div className="fixed bottom-8 right-8 z-50">
        <button
          onClick={() => navigate('/Login')}
          className="border-[1px] border-gray-400 px-4 py-2 text-gray-400 hover:text-white text-sm font-medium transition-colors duration-200 rounded-lg hover:bg-gray-800/50"
        >
          Skip
        </button>
      </div>

      {/* Bottom Spacing */}
      <div className="h-24"></div>
    </div>
  );
};

export default Preferences;
