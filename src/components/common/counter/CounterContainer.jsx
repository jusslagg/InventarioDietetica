import { useState } from "react";
import Counter from "./Counter";

const CounterContainer = ({ addOn, stock, totalAdded }) => {
  const [contador, setContador] = useState(totalAdded);
  const [inputValue, setInputValue] = useState(String(totalAdded));

  const [disabledSumar, setDisabledSumar] = useState(false);
  const [disabledRestar, setDisabledRestar] = useState(false);

  const clamp = (num) => Math.max(0, Math.min(num, stock));

  const sumar = () => {
    if (contador < stock) {
      const nextValue = contador + 1;
      setContador(nextValue);
      setInputValue(String(nextValue));
      setDisabledRestar(nextValue === 0);
      setDisabledSumar(nextValue === stock);
    }
  };

  const restar = () => {
    if (contador > 0) {
      const nextValue = contador - 1;
      setContador(nextValue);
      setInputValue(String(nextValue));
      setDisabledSumar(nextValue === stock);
      setDisabledRestar(nextValue === 0);
    }
  };

  // cuando el usuario escribe en el input
  const handleChangeCantidad = (value) => {
    setInputValue(value); // dejamos que escriba libremente (incluso vacío)

    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed)) return;

    const cantidad = clamp(parsed);
    setContador(cantidad);
    setDisabledRestar(cantidad === 0);
    setDisabledSumar(cantidad === stock);
  };

  // cuando pierde foco, si está vacío lo dejamos en 0
  const handleBlur = () => {
    if (inputValue === "") {
      setInputValue("0");
      setContador(0);
      setDisabledRestar(true);
      setDisabledSumar(stock === 0);
    }
  };

  return (
    <Counter
      contador={contador}
      inputValue={inputValue}
      sumar={sumar}
      restar={restar}
      addOn={addOn}
      disabledSumar={disabledSumar}
      disabledRestar={disabledRestar}
      handleChangeCantidad={handleChangeCantidad}
      handleBlur={handleBlur}
      stock={stock}
    />
  );
};

export default CounterContainer;
