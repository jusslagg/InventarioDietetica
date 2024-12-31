import React, { createContext, useState, useContext } from "react";

// Creamos el contexto
const AlertContext = createContext();

// Hook para acceder al contexto
export const useAlert = () => useContext(AlertContext);

// Proveedor del contexto
export const AlertProvider = ({ children }) => {
  const [alertData, setAlertData] = useState({
    message: "",
    visible: false,
    type: "success", // Tipo de alerta: 'success', 'error', 'warning', etc.
  });

  const showAlert = (message, type = "success") => {
    setAlertData({ message, visible: true, type });

    // Oculta la alerta automáticamente después de 3 segundos
    setTimeout(() => {
      setAlertData({ ...alertData, visible: false });
    }, 3000);
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      <Alert
        visible={alertData.visible}
        message={alertData.message}
        type={alertData.type}
      />
    </AlertContext.Provider>
  );
};

const Alert = ({ visible, message, type }) => {
  const alertTypes = {
    success: "bg-green-500 text-white",
    error: "bg-red-500 text-white",
    warning: "bg-yellow-500 text-black",
    info: "bg-blue-500 text-white",
  };

  return (
    visible && (
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
        <div
          className={`p-4 rounded shadow-lg ${alertTypes[type]} transition-all`}
          role="alert"
        >
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d={
                  type === "success"
                    ? "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    : "M6 18L18 6M6 6l12 12"
                }
              />
            </svg>
            <span>{message}</span>
          </div>
        </div>
      </div>
    )
  );
};
