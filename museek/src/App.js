import './App.css';
import Navbar from './Component/Navbar';
import Login from './Component/Login';
import Signup from './Component/Signup';
import { Routes, Route } from 'react-router-dom';

function App() {
  return (
    <div className='w-screen h-screen bg-[#121212]'>
    <Routes>
      <Route path="/" element={<Navbar />} />
      <Route path="/Login" element={<Login />} />
      <Route path="/Signup" element={<Signup />} />
    </Routes>      
    </div>
  );
}

export default App;
