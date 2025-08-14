import React from 'react';
import { Navigate } from 'react-router-dom';
import './Signup'; 

const Login = ({}) => {
    const shouldRedirect = false; 
    if (shouldRedirect) {
    return <Navigate to="/Signup" replace />;
  }
  return (
    <div className="bg-[#1c2b2e] p-8 rounded-lg shadow-2xl w-full max-w-md border border-[#ffd180]">
      <h2 className="text-3xl font-bold text-center text-[#f5f5f5] mb-6">Login</h2>
      <form className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[#f5f5f5]">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="mt-1 block w-full px-4 py-2 bg-[#242527] border border-[#ffd180] rounded-md text-[#f5f5f5] focus:ring-[#ffd180] focus:border-[#ffd180] transition-colors"
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-[#f5f5f5]">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="mt-1 block w-full px-4 py-2 bg-[#242527] border border-[#ffd180] rounded-md text-[#f5f5f5] focus:ring-[#ffd180] focus:border-[#ffd180] transition-colors"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full py-3 px-4 bg-[#ffd180] text-[#1c2b2e] font-semibold rounded-md shadow-lg hover:bg-opacity-80 transition-all duration-300 transform hover:scale-105"
        >
          Sign In
        </button>
      </form>
      <div className="mt-6 text-center">
        <p className="text-sm text-[#f5f5f5]">
          Don't have an account?{' '}
          <button
            onClick={(shouldRedirect = true) => onPageChange('signup')}
            className="text-[#ffd180] hover:underline focus:outline-none"
          >
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;