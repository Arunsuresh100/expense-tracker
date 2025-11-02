import React from 'react';
// 1. Import the correct icons
import { Github, Linkedin } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    // The background and border colors are kept from your original design
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5"> {/* Adjusted padding for a cleaner look */}
        {/* This flex container handles the layout */}
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
          
          {/* 2. Updated Copyright Text */}
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Copyright © {currentYear} Arun Suresh
          </div>

          {/* 3. Added Social Media Icons */}
          <div className="flex items-center space-x-5">
            <a 
              href="https://github.com/Arunsuresh100" // IMPORTANT: Replace with your GitHub URL
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="Visit my GitHub profile"
              className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <Github size={20} />
            </a>
            <a 
              href="https://www.linkedin.com/in/arun-suresh-/" // IMPORTANT: Replace with your LinkedIn URL
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="Visit my LinkedIn profile"
              className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-500 transition-colors"
            >
              <Linkedin size={20} />
            </a>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;