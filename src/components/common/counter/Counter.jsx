const Counter = ({
  contador,
  sumar,
  restar,
  addOn,
  disabledSumar,
  disabledRestar,
  handleChangeCantidad,
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
          onClick={() => addOn(contador)}
        >
          Agregar al carrito
        </button>
      </div>
    </div>
  );
};

export default Counter;
