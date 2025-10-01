import { useContext } from "react";
import AlertContext from "../context/alert-context";

const useAlert = () => useContext(AlertContext);

export default useAlert;
