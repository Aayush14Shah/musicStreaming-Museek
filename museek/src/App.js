import './App.css';
import About from './Component/About';
import Home from './Component/homePage/Home';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './Component/Login';
import Preferences from './Component/Preferences';
import Signup from './Component/Signup';
import SpotifyAuthSuccess from './Component/SpotifyAuthSuccess';
import UserProfile from './Component/UserProfile';
import Settings from './Component/Settings';
import Forgot from './Component/Forgot';
import AdminDashboard from './Component/AdminSide/Dashboard';
import ManageUser from './Component/AdminSide/ManageUser';
import ManageAdmins from './Component/AdminSide/ManageAdmins';
import ManageSongs from './Component/AdminSide/ManageSongs';
import AddSong from './Component/AdminSide/AddSong';
import Analytics from './Component/AdminSide/Analytics';
import AdminSettings from './Component/AdminSide/Settings';

function App() {
  return (
    // Added 'min-h-screen' and 'flex items-center justify-center'
    // bg-[#121212]
    // flex items-center justify-center
    <div className='bg-[#1c2b2d] min-h-screen'>
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/Login" element={<Login />} />
            <Route path="/Signup" element={<Signup />} />
            <Route path="/Forgot" element={<Forgot />} />
            <Route path="/preferences" element={<Preferences />} />
            <Route path="/about" element={<About />} />
            <Route path="/spotify-auth-success" element={<SpotifyAuthSuccess />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/settings" element={<Settings />} />

            {/* Admin URLs */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/manageUser" element={<ManageUser />} />
            <Route path="/admin/manageAdmin" element={<ManageAdmins />} />
            <Route path="/admin/songs" element={<ManageSongs />} />
            <Route path="/admin/songs/add" element={<AddSong />} />
            <Route path="/admin/analytics" element={<Analytics />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
        </Routes>
    </div>
  ); 
}

export default App;