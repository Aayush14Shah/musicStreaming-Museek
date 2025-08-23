import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Logo from '../Images/LogoFinalDarkModeFrameResized.png';

const languageOptions = [
  'English',
  'Tamil',
  'Telugu',
  'Malayalam',
  'Kannada',
  'Marathi',
  'Hindi',
  'Punjabi',
  'Bengali',
  'Gujarati',
  'Urdu',
  'Odia',
  'Assamese'
].map((lang) => ({ value: lang, label: lang }));

const Preferences = () => {
  const navigate = useNavigate();
  const { state: signupData } = useLocation(); // contains name, email, password, mobile
  const [artists, setArtists] = useState([]);
  const [selectedArtists, setSelectedArtists] = useState([]);
  const [artistOptions, setArtistOptions] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/top-artists');
        setArtists(data);
        setArtistOptions(data.map((a) => ({ value: a.name, label: a.name })));
      } catch (err) {
        console.error('Failed to fetch artists', err);
      }
    };
    fetchArtists();
  }, []);

  const handleLanguageChange = (vals) => {
    setSelectedLanguages(vals.map((v) => v.value));
  };

  const handleArtistChange = (vals) => {
    setSelectedArtists(vals.map((v) => v.value));
  };

  const handleRegister = async () => {
    if (!signupData) {
      alert('Signup data missing. Please fill sign up form again.');
      navigate('/Signup');
      return;
    }
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/auth/register', {
        ...signupData,
        favoriteArtists: selectedArtists,
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
    <div className="flex items-center justify-center min-h-screen bg-[#1c2b2d]">
      <div className="bg-[#243537] p-8 rounded-3xl shadow-2xl w-full max-w-2xl border" style={{ borderColor: '#b06f2d', borderWidth: '2px' }}>
        <div className="flex justify-center mb-4">
          <img src={Logo} alt="Brand Logo" className="w-[160px]" />
        </div>
        <h1 className="text-3xl font-semibold text-center mb-6 text-[#f5f5f5]">Tell us your Preferences</h1>

        {/* Languages */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1 text-[#f5f5f5]">Preferred Languages</label>
          <Select
            isMulti
            options={languageOptions}
            value={languageOptions.filter(o => selectedLanguages.includes(o.value))}
            onChange={handleLanguageChange}
            classNamePrefix="react-select"
            styles={{ menu: (base) => ({ ...base, zIndex: 9999 }) }}
          />
        </div>

        {/* Artists */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1 text-[#f5f5f5]">Select Your Favourite Artists</label>
          <Select
            isMulti
            options={artistOptions}
            value={artistOptions.filter(o => selectedArtists.includes(o.value))}
            onChange={handleArtistChange}
            classNamePrefix="react-select"
            styles={{ menu: (base) => ({ ...base, zIndex: 9999 }) }}
          />
        </div>

        <button
          disabled={loading}
          onClick={handleRegister}
          className="w-full py-3 bg-[#cd7f34] text-[#f5f5f5] rounded-lg font-semibold hover:bg-[#b06f2d] transition duration-200"
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </div>
    </div>
  );
};

export default Preferences;
