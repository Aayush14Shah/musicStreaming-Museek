import './App.css';
import About from './Component/About';
import Home from './Component/homePage/Home';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './Component/Login';
import Preferences from './Component/Preferences';
import Signup from './Component/Signup';

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
            <Route path="/preferences" element={<Preferences />} />
            <Route path="/about" element={<About />} />
        </Routes>
    </div>
  ); 
}

export default App;