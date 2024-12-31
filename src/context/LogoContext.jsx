import { createContext, useState } from "react";
import logo from "/logosphere.png";
import logoSecondary from "/logosphere.svg";
import kannel from "/sphere.png";
import kannelSecondary from "/sphere.png";

export const LogoContext = createContext();

export const LogoContextProvider = ({ children }) => {
  const [currentLogo, setCurrentLogo] = useState(logo);
  const [currentKannel, setCurrentKannel] = useState(kannelSecondary);

  const toggleLogo = (isChecked) => {
    setCurrentLogo(isChecked ? logoSecondary : logo);
  };

  const toggleKannel = (isChecked) => {
    setCurrentKannel(isChecked ? kannel : kannelSecondary);
  };

  return (
    <LogoContext.Provider
      value={{ currentLogo, currentKannel, toggleLogo, toggleKannel }}
    >
      {children}
    </LogoContext.Provider>
  );
};
