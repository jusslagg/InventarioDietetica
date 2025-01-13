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

  // Verificar si el producto es de una categoría de tipo "frutos secos" o "harinas"
  const isCategoryRelevant =
    category === "frutos secos" || category === "harinas";

  // Precio por kilo (unitPrice es el precio por kilo)
  const pricePerKilo = unitPrice; // Por ejemplo, 5800 por kilo
  const pricePerGram = pricePerKilo / 1000; // Precio por gramo

  // Calcular el precio en función de la cantidad
  const calculatePrice = (contador) => {
    if (isCategoryRelevant) {
      return (contador * pricePerGram).toFixed(2); // Calculamos el precio en base a la cantidad si es relevante
    } else {
      return (unitPrice * contador).toFixed(2); // Si no es relevante, se mantiene el precio original
    }
  };

  // Sumar la cantidad
  const sumar = () => {
    if (contador < stock) {
      setContador(contador + 1);
      setDisabledRestar(false);
    }
    if (contador + 1 === stock) {
      setDisabledSumar(true);
    }
  };

  // Restar la cantidad
  const restar = () => {
    if (contador > 1) {
      setContador(contador - 1);
      setDisabledSumar(false);
    }
    if (contador - 1 === 1) {
      setDisabledRestar(true);
    }
  };

  // Manejar el cambio manual en el input de cantidad
  const handleChangeCantidad = (value) => {
    const cantidad = Math.max(1, Math.min(parseInt(value), stock)); // Asegurarse de que la cantidad esté entre 1 y el stock
    setContador(cantidad);
    setDisabledRestar(cantidad === 1);
    setDisabledSumar(cantidad === stock);
  };

  // Pasar solo las propiedades relevantes al componente hijo
  let childProps = {
    contador,
    sumar,
    restar,
    addOn,
    disabledSumar,
    disabledRestar,
    calculatePrice, // No pasamos más gramos, solo el cálculo con la cantidad
    handleChangeCantidad, // Pasamos la función para el cambio manual
  };

  return <Counter {...childProps} />;
};

export default CounterContainer;
