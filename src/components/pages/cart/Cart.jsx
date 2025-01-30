import { LogoContext } from "../../../context/LogoContext.jsx";
import { useContext, useState } from "react";
import { Link } from "react-router-dom";

const Cart = ({ cart, deleteProductById, totalQuantity, total, clearCart }) => {
  const { currentKannel } = useContext(LogoContext);

  // Estado para manejar el descuento seleccionado
  const [discount, setDiscount] = useState(0);

  // Función para calcular el total con descuento
  const calculateTotalWithDiscount = () => {
    return total - (total * discount) / 100;
  };

  // Manejar el cambio en el select de descuento
  const handleDiscountChange = (event) => {
    setDiscount(parseInt(event.target.value));
  };

  const totalWithDiscount = calculateTotalWithDiscount();

  return (
    <div className="mx-auto my-3">
      {total > 0 ? (
        <div className="flex flex-col-reverse lg:flex-row lg:space-x-6 justify-evenly lg:items-start">
          {/* Acciones del carrito */}
          <div className="lg:order-last lg:w-1/2 my-4 lg:my-0 flex flex-col items-center">
            <h2 className="lg:text-2xl font-semibold mb-3 text-center">
              Acciones del carrito
            </h2>
            <div className="flex flex-col items-center">
              <Link to="/checkout" className="btn btn-success mb-4">
                Pagar
              </Link>
              <button className="btn btn-warning mb-5" onClick={clearCart}>
                Vaciar Carrito
              </button>
            </div>

            {/* Selector de descuento */}
            {/* <div className="mb-3">
              <label className="font-semibold mb-2">
                Selecciona un descuento:
              </label>
              <select
                className="select select-bordered w-full max-w-xs"
                value={discount}
                onChange={handleDiscountChange}
              >
                <option value={0}>Ninguno</option>
                <option value={10}>10%</option>
                <option value={20}>20%</option>
                <option value={50}>50%</option>
                <option value={80}>80%</option>
              </select>
            </div> */}

            <h2 className="lg:text-2xl font-semibold mb-3 text-center">
              Total de productos: {totalQuantity}
            </h2>
            <h2 className="lg:text-2xl font-semibold mb-3 text-center">
              Total a pagar: ${totalWithDiscount.toFixed(2)}
            </h2>
          </div>

          {/* Listado de productos */}
          <div className="w-80 lg:w-1/2 h-dvh overflow-auto mx-auto">
            <h2 className="lg:text-2xl font-semibold text-center mb-3">
              Listado de productos
            </h2>
            {cart.map((product) => (
              <div
                key={product.id}
                className="card card-side card-compact bg-base-300 mb-4 shadow-xl"
              >
                <figure>
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="lg:w-48"
                  />
                </figure>
                <div className="card-body">
                  <h2 className="card-title">{product.title}</h2>
                  <p className="font-semibold lg:text-xl">
                    Precio: ${product.price.toFixed(2)}
                  </p>
                  {/* Mostrar la cantidad en unidades o gramos */}
                  <p className="font-semibold lg:text-xl">
                    Cantidad: {product.quantity}{" "}
                    {product.grams ? `(${product.grams} gramos)` : ""}
                  </p>
                  {/* Mostrar el subtotal calculado según la cantidad y el precio */}
                  <p className="font-semibold lg:text-xl">
                    Subtotal: ${(product.price * product.quantity).toFixed(2)}
                  </p>
                  <div className="card-actions justify-end">
                    <button
                      className="btn btn-warning"
                      onClick={() => deleteProductById(product.id)}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        // Cuando no hay productos en el carrito
        <div className="flex h-dvh flex-col items-center text-center mx-auto">
          <div>
            <Link to="/" className="btn btn-link">
              <img src={currentKannel} alt="logo Kannel" className="h-96" />
            </Link>
          </div>
          <div>
            <h2 className="lg:text-2xl font-semibold mb-3">
              Toca a Granol para buscar productos
            </h2>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
