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
  const [contador, setContador] = useState(1); // Contador de unidades
  const [grams, setGrams] = useState(0); // Gramos del producto

  const pricePerKg = 5000; // Precio por kilogramo (ejemplo)

  // Función para calcular el total con descuento
  const calculateTotalWithDiscount = () => {
    return getTotalAmount() - (getTotalAmount() * discount) / 100;
  };

  const totalWithDiscount = calculateTotalWithDiscount();

  // Manejar el cambio en el select de descuento
  const handleDiscountChange = (event) => {
    setDiscount(parseInt(event.target.value));
  };

  // Función para agregar el producto al carrito
  const handleAddProductToCart = () => {
    // Si se está agregando por gramos
    if (grams > 0) {
      const pricePerGram = pricePerKg / 1000; // Precio por gramo
      const priceInGrams = pricePerGram * grams;
      const productWithGrams = {
        id: Date.now(), // Usamos un ID único temporal
        title: "Producto", // Nombre del producto
        quantity: grams, // Se usa gramos como cantidad
        price: priceInGrams, // Precio calculado en gramos
        grams: grams, // Guardamos los gramos
      };
      addProductToCart(productWithGrams);
    } else {
      // Si se está agregando por unidades
      const productWithUnits = {
        id: Date.now(), // Usamos un ID único temporal
        title: "Producto", // Nombre del producto
        quantity: contador, // Se usa la cantidad de unidades
        price: pricePerKg, // Precio sin cambiar
        grams: 0, // No se usan gramos
      };
      addProductToCart(productWithUnits);
    }
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
      setGrams={setGrams}
      setContador={setContador}
    />
  );
};

export default CartContainer;
