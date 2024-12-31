import { useContext, useState } from "react";
import { CartContext } from "../../../context/CartContext";
import { addDoc, collection, updateDoc, doc } from "firebase/firestore";
import { db } from "../../../configFirebase";

const Checkout = () => {
  const [user, setUser] = useState({
    name: "",
    phone: "",
    email: "",
  });

  const { cart, getTotalAmount, clearCart } = useContext(CartContext);
  const [orderId, setOrderId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({}); // Para manejar errores de validación

  const validateForm = () => {
    const newErrors = {};
    if (!user.name) {
      newErrors.name = "El nombre es obligatorio.";
    }
    if (!user.phone) {
      newErrors.phone = "El teléfono es obligatorio.";
    } else if (!/^\d+$/.test(user.phone)) {
      newErrors.phone = "El teléfono debe contener solo números.";
    }
    if (!user.email) {
      newErrors.email = "El email es obligatorio.";
    } else if (!/\S+@\S+\.\S+/.test(user.email)) {
      newErrors.email = "El email no es válido.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Retorna true si no hay errores
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return; // Validar antes de continuar

    setIsLoading(true);
    let total = getTotalAmount();
    const order = {
      buyer: user,
      items: cart,
      total: total,
    };

    // Guardar la orden en Firebase
    let refCollection = collection(db, "orders");
    addDoc(refCollection, order)
      .then((res) => {
        setOrderId(res.id);
        clearCart();
      })
      .catch((error) => console.log(error))
      .finally(() => {
        setIsLoading(false);
      });

    order.items.forEach((element) => {
      updateDoc(doc(db, "products", element.id), {
        stock: element.stock - element.quantity,
      });
    });
  };

  const handleChange = (e) => {
    const { value, name } = e.target;
    setUser({ ...user, [name]: value });
    setErrors({ ...errors, [name]: "" }); // Limpiar el error correspondiente al cambiar el valor
  };

  if (isLoading) {
    return <h2>Cargando...</h2>;
  }

  return (
    <div className="h-dvh">
      {orderId ? (
        <h1>Gracias por tu compra, tu número de pedido es: {orderId}</h1>
      ) : (
        <div className="h-fit my-4 flex justify-center">
          <div className="card bg-base-100 w-96 shadow-xl p-2 mx-1">
            <div className="card-title">
              <h1>Proceso de compra</h1>
            </div>
            <form onSubmit={handleSubmit}>
              <label className="input input-bordered flex items-center gap-2 my-1">
                <input
                  type="text"
                  placeholder="Nombre"
                  onChange={handleChange}
                  name="name"
                />
                {errors.name && (
                  <span className="text-red-500">{errors.name}</span>
                )}
              </label>
              <label className="input input-bordered flex items-center gap-2 my-1">
                <input
                  type="text"
                  placeholder="Teléfono"
                  onChange={handleChange}
                  name="phone"
                />
                {errors.phone && (
                  <span className="text-red-500">{errors.phone}</span>
                )}
              </label>
              <label className="input input-bordered flex items-center gap-2 my-1">
                <input
                  type="text"
                  placeholder="Email"
                  onChange={handleChange}
                  name="email"
                />
                {errors.email && (
                  <span className="text-red-500">{errors.email}</span>
                )}
              </label>
              <div className="card-actions justify-end">
                <button className="btn btn-primary">Comprar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
