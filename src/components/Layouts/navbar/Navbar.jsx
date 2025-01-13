import CartWidget from "../../common/cartWidget/CartWidget";
import ThemeController from "../../common/themeController/ThemeController";
import { Link } from "react-router-dom";
import { categories } from "./categories";
import { LogoContext } from "../../../context/LogoContext.jsx";
import { useContext, useState } from "react";

const Navbar = () => {
  const { currentLogo } = useContext(LogoContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Estado para controlar el menú desplegable

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };

  return (
    <div className="navbar bg-base-100 shadow-md">
      {/* Inicio del Navbar: Logo */}
      <div className="navbar-start flex items-center space-x-4">
        <Link to="/" className="flex flex-col items-center text-center">
          <img src={currentLogo} alt="logosphere" className="w-40" />
          <p className="font-bold text-base-content">GRANOLA POWERFIT</p>
        </Link>
      </div>

      {/* Centro del Navbar */}
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
                  onClick={closeDropdown} // Cierra el desplegable al hacer clic
                >
                  {title}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Final del Navbar */}
      <div className="navbar-end flex items-center space-x-4">
        <input
          type="text"
          className="input input-bordered w-full max-w-xs"
          placeholder="Buscar producto..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <button className="btn btn-ghost btn-sm">Buscar</button>
        <ThemeController />
        <Link to="/Cart">
          <CartWidget />
        </Link>
      </div>
    </div>
  );
};

export default Navbar;
