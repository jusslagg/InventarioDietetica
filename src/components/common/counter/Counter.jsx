const Counter = ({
  contador,
  sumar,
  restar,
  addOn,
  disabledSumar,
  disabledRestar,
  calculatePrice,
  productType, // Tipo de producto (condimento, fruto seco, harina, etc.)
  pricePerKg, // Precio por kilogramo
  handleChangeCantidad, // Función para manejar el cambio manual en la cantidad
}) => {
  // Función para calcular el precio en base a la cantidad
  const calculatePricePerUnit = (contador) => {
    const pricePerGram = pricePerKg / 1000; // Precio por gramo
    return pricePerGram * contador; // Calculamos el precio según la cantidad
  };

  return (
    <div className="flex flex-row items-center">
      <button
        className="btn btn-warning"
        onClick={restar}
        disabled={disabledRestar}
      >
        <p className="font-bold text-xl">-</p>
      </button>

      <input
        type="number"
        value={contador}
        onChange={(e) => handleChangeCantidad(e.target.value)}
        className="text-xl text-center px-3 w-16"
        min="1"
      />

      <button
        className="btn btn-success"
        onClick={sumar}
        disabled={disabledSumar}
      >
        <p className="font-bold text-xl">+</p>
      </button>

      <div>
        <button
          className="btn btn-primary ml-2 px-8"
          onClick={() => addOn(contador)} // Pasar solo la cantidad al agregar al carrito
        >
          Agregar al carrito
        </button>
      </div>
    </div>
  );
};

export default Counter;
