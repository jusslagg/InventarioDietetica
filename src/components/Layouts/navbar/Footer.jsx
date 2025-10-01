import useLogoContext from "../../../hooks/useLogoContext";

const Footer = () => {
  const { currentLogo } = useLogoContext();
  return (
    <footer className="footer footer-center bg-base-300 p-10">
      <aside>
        <img src={currentLogo} alt="logosphere" className="w-20" />
        <p className="font-bold text-base-content">Granola Power fit</p>
        <p className="text-base-content">
          Copyright © {new Date().getFullYear()} - Todos los derechos reservados
        </p>
        <p className="text-base-content mt-4">
          Hecho con amor por Jesús Gil
        </p>
      </aside>
    </footer>
  );
};

export default Footer;
