import React, { useState } from "react";
import Counter from "./Counter";

const CounterContainer = ({
  addOn,
  stock,
  totalAdded,
  unitPrice,
  category,
}) => {
  const [contador, setContador] = useState(totalAdded);
  const [disabledSumar, setDisabledSumar] = useState(false);
  const [disabledRestar, setDisabledRestar] = useState(true);
  const [grams, setGrams] = useState(100); // Definir la cantidad en gramos por defecto

  // Verificar si el producto es de una categoría de tipo "frutos secos" o "harinas"
  const isCategoryRelevant =
    category === "frutos secos" || category === "harinas";

  // Precio por kilo (unitPrice es el precio por kilo)
  const pricePerKilo = unitPrice; // Por ejemplo, 5800 por kilo
  const pricePerGram = pricePerKilo / 1000; // Precio por gramo

  // Calcular el precio en función de los gramos
  const calculatePrice = (grams) => {
    if (isCategoryRelevant) {
      return (grams * pricePerGram).toFixed(2); // Calculamos el precio en base a gramos si es relevante
    } else {
      return (unitPrice * contador).toFixed(2); // Si no es relevante, se mantiene el precio original
    }
  };

  // Sumar la cantidad en gramos
  const sumar = () => {
    if (contador < stock) {
      setContador(contador + 1);
      setDisabledRestar(false);
    }
    if (contador + 1 === stock) {
      setDisabledSumar(true);
    }
  };

  // Restar la cantidad en gramos
  const restar = () => {
    if (contador > 1) {
      setContador(contador - 1);
      setDisabledSumar(false);
    }
    if (contador - 1 === 1) {
      setDisabledRestar(true);
    }
  };

  // Pasar el total de gramos y el precio calculado al componente hijo
  let childProps = {
    contador,
    sumar,
    restar,
    addOn,
    disabledSumar,
    disabledRestar,
    grams,
    setGrams, // Permitir que el usuario ingrese la cantidad en gramos
    calculatePrice,
  };

  return <Counter {...childProps} />;
};

export default CounterContainer;
