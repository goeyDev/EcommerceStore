import Link from "next/link";
import React from "react";
import CapitalizeFirst from "./CapitalizeFirst";

const Footer = () => {
  return (
    <footer className="border-t-2 border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Logo and Tagline */}
          <div className="text-center md:text-left mb-4 md:mb-0">
            <h2 className="text-lg font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 bg-clip-text text-transparent">
              goeyDev Ecommerce
            </h2>
            <p className="text-gray-600 text-sm">
              <CapitalizeFirst>
                {" "}
                goeyDev Ecommerce is an initial release created for hobby and
                learning purposes.
              </CapitalizeFirst>
            </p>
          </div>

          {/* Navigation Links */}
          <div className="flex space-x-4">
            <Link
              href="/"
              className="text-gray-700 hover:text-purple-600 text-sm font-medium"
            >
              Home
            </Link>
            <Link
              href="/about"
              className="text-gray-700 hover:text-purple-600 text-sm font-medium"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-gray-700 hover:text-purple-600 text-sm font-medium"
            >
              Contact
            </Link>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} goeyDev Ecommerce All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
