import './App.css';
import Home from './Component/homePage/Home';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './Component/Login';
import Signup from './Component/Signup';

function App() {
  return (
    // Added 'min-h-screen' and 'flex items-center justify-center'
    <div className='bg-[#1c2b2d] min-h-screen flex items-center justify-center'>
      <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/Signup" element={<Signup />} />
      </Routes>
    </div>
  );
}

export default App;