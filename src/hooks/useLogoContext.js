import { useContext } from "react";
import LogoContext from "../context/logo-context";

const useLogoContext = () => useContext(LogoContext);

export default useLogoContext;
