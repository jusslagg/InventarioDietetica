import CartWidget from "../../common/cartWidget/CartWidget";
import ThemeController from "../../common/themeController/ThemeController";
import { Link } from "react-router-dom";
import { categories } from "./categories";
import { LogoContext } from "../../../context/LogoContext.jsx";
import { useContext, useState } from "react";

const Navbar = () => {
  const { currentLogo } = useContext(LogoContext);
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  return (
    <div className="navbar bg-base-200">
      <div className="navbar-start">
        {/* ... (código existente del menú hamburguesa y logo) */}
      </div>
      <div className="navbar-center hidden lg:flex z-10">
        <ul className="menu menu-horizontal px-1">
          <li>
            <details className="font-bold">
              <summary className="text-base">Inventario de productos</summary>
              <ul className="p-2 bg-base-200 grid grid-cols-3 gap-2">
                {/* Render categories in 3 columns */}
                {categories.map(({ title, path }) => (
                  <li key={title} className="text-center">
                    <Link key={title} to={path} className="btn btn-ghost p-0">
                      {title}
                    </Link>
                  </li>
                ))}
              </ul>
            </details>
          </li>
        </ul>
      </div>
      <div className="navbar-end">
        <div className="flex items-center">
          <input
            type="text"
            className="input input-bordered w-full max-w-xs mr-2"
            placeholder="Buscar producto..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <button className="btn btn-ghost btn-sm">Buscar</button>
        </div>
        <ThemeController />
        <Link to="/Cart">
          <CartWidget />
        </Link>
      </div>
    </div>
  );
};

export default Navbar;
