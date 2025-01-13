const Counter = ({
  contador,
  sumar,
  restar,
  addOn,
  disabledSumar,
  disabledRestar,
  grams,
  setGrams,
  calculatePrice,
}) => {
  return (
    <div className="flex flex-row items-center">
      <button
        className="btn btn-warning"
        onClick={restar}
        disabled={disabledRestar}
      >
        <p className="font-bold text-xl">-</p>
      </button>
      <h2 className="text-xl px-3">Cantidad: {contador}</h2>
      <button
        className="btn btn-success"
        onClick={sumar}
        disabled={disabledSumar}
      >
        <p className="font-bold text-xl">+</p>
      </button>

      {/* Campo para ingresar gramos */}
      <div>
        <label className="font-semibold">Cantidad en gramos:</label>
        <input
          type="number"
          className="input input-bordered w-full max-w-xs"
          value={grams}
          onChange={(e) => setGrams(parseInt(e.target.value))}
        />
      </div>

      {/* Mostrar el precio calculado */}
      <h3 className="font-semibold mt-3">
        Precio por {grams} gramos: ${calculatePrice(grams)}
      </h3>

      <div>
        <button
          className="btn btn-primary ml-2 px-8"
          onClick={() => addOn(contador, grams)} // Pasar los gramos y cantidad al agregar al carrito
        >
          Agregar al carrito
        </button>
      </div>
    </div>
  );
};

export default Counter;
