import React from "react";
import { LogoContext } from "../../../context/LogoContext";
import { useContext } from "react";

const Footer = () => {
  const { currentLogo } = useContext(LogoContext);
  return (
    <footer className="footer footer-center bg-base-300 p-10">
      <aside>
        <img src={currentLogo} alt="logosphere" className="w-20" />
        <p className="font-bold text-base-content">Granola Power fit</p>
        <p className="text-base-content">
          Copyright © {new Date().getFullYear()} - Todos los derechos reservados
        </p>
        {/* Aquí agregamos el texto de "Hecho con amor" con el corazón */}
        <p className="text-base-content mt-4">
          Hecho con{" "}
          <span role="img" aria-label="heart">
            💖
          </span>{" "}
          por Jesús Gil
        </p>
      </aside>
    </footer>
  );
};

export default Footer;
