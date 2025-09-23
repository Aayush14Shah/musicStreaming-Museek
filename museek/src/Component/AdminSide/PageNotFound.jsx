import React from "react";
import { useNavigate } from "react-router-dom";

const PageNotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#121212] via-[#1a1a1a] to-[#0e0e0e]">
      <div className="bg-[#181818] rounded-2xl shadow-2xl p-10 flex flex-col items-center max-w-md w-full">
        <img
          src="https://placehold.co/200x200?text=404"
          alt="404 Not Found"
          className="mb-6 rounded-xl shadow-lg"
        />
        <h1 className="text-5xl font-bold text-[#CD7F32] mb-4">404</h1>
        <h2 className="text-2xl font-bold text-[#F5F5F5] mb-2">Page Not Found</h2>
        <p className="text-gray-300 mb-6 text-center">
          Oops! The page you are looking for does not exist.<br />
          You might have followed a broken link or mistyped the address.
        </p>
        <button
          onClick={() => navigate("/")}
          className="bg-gradient-to-r from-[#CD7F32] to-[#b06f2d] text-white font-bold py-3 px-8 rounded-lg hover:from-[#b06f2d] hover:to-[#CD7F32] transition-colors duration-300"
        >
          Go to Home
        </button>
      </div>
    </div>
  );
};

export default PageNotFound;