import React, { useContext, useState } from "react";
import Cart from "./Cart";
import { CartContext } from "../../../context/CartContext";

const CartContainer = () => {
  const {
    cart,
    deleteProductById,
    getTotalQuantity,
    getTotalAmount,
    clearCart,
  } = useContext(CartContext);

  const [discount, setDiscount] = useState(0); // Estado para el descuento

  let total = getTotalAmount();
  let totalQuantity = getTotalQuantity();

  // Función para calcular el total con descuento
  const calculateTotalWithDiscount = () => {
    return total - (total * discount) / 100;
  };

  const totalWithDiscount = calculateTotalWithDiscount();

  // Manejar el cambio en el select de descuento
  const handleDiscountChange = (event) => {
    setDiscount(parseInt(event.target.value));
  };

  return (
    <Cart
      cart={cart}
      deleteProductById={deleteProductById}
      clearCart={clearCart}
      total={totalWithDiscount} // Pasamos el total con descuento
      totalQuantity={totalQuantity}
      discount={discount} // Pasamos el descuento seleccionado
      handleDiscountChange={handleDiscountChange} // Pasamos la función para manejar el cambio del descuento
    />
  );
};

export default CartContainer;
