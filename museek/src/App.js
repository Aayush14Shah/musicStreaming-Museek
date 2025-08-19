import './App.css';
import About from './Component/About';
import Home from './Component/homePage/Home';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './Component/Login';
import Signup from './Component/Signup';

function App() {
  return (
    // Added 'min-h-screen' and 'flex items-center justify-center'
//     bg-[#121212]
    <div className='bg-[#1c2b2d] min-h-screen flex items-center justify-center'>
    <Router>
      <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/Signup" element={<Signup />} />
          <Route path="/about" element={<About />} />
      </Routes>
    </Router>
  ); 
}

export default App;