import { useContext } from "react";
import CartContext from "../context/cart-context";

const useCartContext = () => useContext(CartContext);

export default useCartContext;
