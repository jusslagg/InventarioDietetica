import { useState } from "react";
import CartContext from "./cart-context";
import useAlert from "../hooks/useAlert";

export const CartContextProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  const { showAlert } = useAlert();

  const addToCart = (product) => {
    if (product.stock > 0) {
      const exist = cart.some((element) => element.id === product.id);

      if (exist) {
        const updatedCart = cart.map((element) => {
          if (element.id === product.id) {
            return { ...element, quantity: product.quantity };
          }
          return element;
        });
        setCart(updatedCart);
        showAlert("Agregado al carrito", "success");
      } else {
        setCart([...cart, product]);
        showAlert("Agregado al carrito", "success");
      }
    } else {
      showAlert("No hay stock disponible", "error");
    }
  };

  const deleteProductById = (id) => {
    setCart((prevCart) => prevCart.filter((product) => product.id !== id));
    showAlert("Producto Eliminado", "error");
  };

  const getTotalAmount = () =>
    cart.reduce((acc, product) => acc + product.price * product.quantity, 0);

  const getTotalQuantity = () =>
    cart.reduce((acc, product) => acc + product.quantity, 0);

  const clearCart = () => {
    showAlert("Carrito Vacio", "warning");
    setCart([]);
  };

  const getTotalQuantityById = (id) => {
    const product = cart.find((element) => element.id === id);
    return product ? product.quantity : 1;
  };

  const value = {
    cart,
    addToCart,
    deleteProductById,
    getTotalAmount,
    getTotalQuantity,
    clearCart,
    getTotalQuantityById,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
