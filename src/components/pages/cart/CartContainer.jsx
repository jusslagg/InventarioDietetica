import React, { useContext, useState } from "react";
import Cart from "./Cart";
import { CartContext } from "../../../context/CartContext";

const CartContainer = () => {
  const {
    cart,
    addProductToCart,
    deleteProductById,
    getTotalQuantity,
    getTotalAmount,
    clearCart,
  } = useContext(CartContext);

  const [discount, setDiscount] = useState(0); // Estado para el descuento

  // Función para calcular el total con descuento
  const calculateTotalWithDiscount = () => {
    return getTotalAmount() - (getTotalAmount() * discount) / 100;
  };

  const totalWithDiscount = calculateTotalWithDiscount();

  // Función para agregar el producto al carrito
  const handleAddProductToCart = (contador, grams) => {
    const pricePerKg = 5000; // Supón que el precio por kilogramo es 5000

    // Si se está agregando por gramos
    if (grams > 0) {
      const pricePerGram = pricePerKg / 1000; // Precio por gramo
      const priceInGrams = pricePerGram * grams;
      const productWithGrams = {
        id: 1,
        title: "Producto",
        quantity: grams, // Se usa gramos como cantidad
        price: priceInGrams, // Precio calculado en gramos
        grams: grams, // Guardamos los gramos
      };
      addProductToCart(productWithGrams);
    } else {
      // Si se está agregando por unidades
      const productWithUnits = {
        id: 1,
        title: "Producto",
        quantity: contador, // Se usa la cantidad de unidades
        price: pricePerKg, // Precio sin cambiar
        grams: 0, // No se usan gramos
      };
      addProductToCart(productWithUnits);
    }
  };

  // Manejar el cambio en el select de descuento
  const handleDiscountChange = (event) => {
    setDiscount(parseInt(event.target.value));
  };

  return (
    <Cart
      cart={cart}
      deleteProductById={deleteProductById}
      clearCart={clearCart}
      total={totalWithDiscount} // Total con descuento
      totalQuantity={getTotalQuantity()}
      discount={discount} // Descuento seleccionado
      handleDiscountChange={handleDiscountChange}
      handleAddProductToCart={handleAddProductToCart} // Pasamos la función aquí
    />
  );
};

export default CartContainer;
