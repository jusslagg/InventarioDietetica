import { useState } from "react";
import Counter from "./Counter";

const CounterContainer = ({ addOn, stock, totalAdded }) => {
  const [contador, setContador] = useState(totalAdded);
  const [disabledSumar, setDisabledSumar] = useState(false);
  const [disabledRestar, setDisabledRestar] = useState(true);

  const sumar = () => {
    if (contador < stock) {
      const nextValue = contador + 1;
      setContador(nextValue);
      setDisabledRestar(false);
      setDisabledSumar(nextValue === stock);
    }
  };

  const restar = () => {
    if (contador > 1) {
      const nextValue = contador - 1;
      setContador(nextValue);
      setDisabledSumar(false);
      setDisabledRestar(nextValue === 1);
    }
  };

  const handleChangeCantidad = (value) => {
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed)) {
      return;
    }

    const cantidad = Math.max(1, Math.min(parsed, stock));
    setContador(cantidad);
    setDisabledRestar(cantidad === 1);
    setDisabledSumar(cantidad === stock);
  };

  return (
    <Counter
      contador={contador}
      sumar={sumar}
      restar={restar}
      addOn={addOn}
      disabledSumar={disabledSumar}
      disabledRestar={disabledRestar}
      handleChangeCantidad={handleChangeCantidad}
    />
  );
};

export default CounterContainer;
