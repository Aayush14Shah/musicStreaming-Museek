import './App.css';
import Home from './Component/homePage/Home';
// import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <div className='bg-[#121212]'>
      {/* <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<div>About Page</div>} />
      </Routes> */}
      <Home />
    </div>
  );
}

export default App;
