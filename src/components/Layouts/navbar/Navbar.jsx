import CartWidget from "../../common/cartWidget/CartWidget";
import ThemeController from "../../common/themeController/ThemeController";
import { Link } from "react-router-dom";
import { categories } from "./categories";
import useLogoContext from "../../../hooks/useLogoContext";
import { useState } from "react";

const Navbar = () => {
  const { currentLogo } = useLogoContext();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };

  return (
    <div className="navbar bg-base-100 shadow-md">
      <div className="navbar-start flex items-center space-x-4">
        <Link to="/" className="flex flex-col items-center text-center">
          <img src={currentLogo} alt="logosphere" className="w-40" />
          <p className="font-bold text-base-content">GRANOLA POWERFIT</p>
        </Link>
      </div>

      <div className="navbar-center relative">
        <button
          onClick={toggleDropdown}
          className="text-base font-semibold cursor-pointer hover:text-gray-600"
        >
          Inventario de productos
        </button>
        {isDropdownOpen && (
          <ul className="absolute left-1/2 transform -translate-x-1/2 top-12 p-4 bg-base-200 shadow-lg rounded-lg max-w-screen-md w-screen grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 z-20">
            {categories.map(({ title, path }) => (
              <li key={title} className="text-center">
                <Link
                  to={path}
                  className="btn btn-ghost p-2 w-full text-center hover:bg-gray-300 transition"
                  onClick={closeDropdown}
                >
                  {title}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="navbar-end flex items-center space-x-4">
        <Link to="/finanzas" className="btn btn-outline btn-sm md:btn-md">
          Control Financiero
        </Link>
        <ThemeController />
        <Link to="/Cart">
          <CartWidget />
        </Link>
      </div>
    </div>
  );
};

export default Navbar;
