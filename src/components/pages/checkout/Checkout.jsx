import { useContext, useState, useEffect } from "react";
import { CartContext } from "../../../context/CartContext";
import {
  addDoc,
  collection,
  updateDoc,
  doc,
  query,
  where,
  orderBy,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../../configFirebase";

const Checkout = () => {
  const [selectedSeller, setSelectedSeller] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(""); // Nuevo estado para el método de pago
  const [orderId, setOrderId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dailySales, setDailySales] = useState([]);
  const [last30DaysSales, setLast30DaysSales] = useState([]);

  const { cart, getTotalAmount, clearCart } = useContext(CartContext);

  // Función para obtener las ventas del día actual y de los últimos 30 días
  const getSales = async () => {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0)); // Inicio de hoy
    const startOf30DaysAgo = new Date(today.setDate(today.getDate() - 30)); // Hace 30 días

    // Consultas para obtener las ventas
    const salesRef = collection(db, "orders");

    // Ventas del día
    const dailyQuery = query(
      salesRef,
      where("createdAt", ">=", startOfDay),
      orderBy("createdAt", "desc")
    );

    // Ventas de los últimos 30 días
    const last30DaysQuery = query(
      salesRef,
      where("createdAt", ">=", startOf30DaysAgo),
      orderBy("createdAt", "desc")
    );

    try {
      const dailySnapshot = await getDocs(dailyQuery);
      const last30DaysSnapshot = await getDocs(last30DaysQuery);

      const dailySalesData = dailySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      const last30DaysSalesData = last30DaysSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setDailySales(dailySalesData);
      setLast30DaysSales(last30DaysSalesData);
    } catch (error) {
      console.error("Error al obtener las ventas:", error);
    }
  };

  // Llamar a la función getSales cuando el componente se monta
  useEffect(() => {
    getSales();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    let total = getTotalAmount();
    const order = {
      seller: selectedSeller,
      paymentMethod: selectedPaymentMethod, // Guardar el método de pago
      items: cart,
      total: total,
      createdAt: serverTimestamp(), // Agregar la fecha de la venta
    };

    // Guardar la orden en Firebase
    const refCollection = collection(db, "orders");
    addDoc(refCollection, order)
      .then((res) => {
        setOrderId(res.id);
        clearCart();
        getSales(); // Obtener ventas después de realizar la compra
      })
      .catch((error) => console.log(error))
      .finally(() => {
        setIsLoading(false);
      });

    // Actualizar el stock de los productos
    order.items.forEach((element) => {
      updateDoc(doc(db, "products", element.id), {
        stock: element.stock - element.quantity,
      });
    });
  };

  const handleChange = (e) => {
    const { value, name } = e.target;
    if (name === "seller") {
      setSelectedSeller(value);
    } else if (name === "paymentMethod") {
      setSelectedPaymentMethod(value);
    }
  };

  if (isLoading) {
    return <h2>cargando...</h2>;
  }

  return (
    <div className="h-dvh">
      {orderId ? (
        <h1>Gracias por tu compra, tu orden es: {orderId}</h1>
      ) : (
        <div className="h-fit my-4 flex justify-center">
          <div className="card bg-base-100 w-96 shadow-xl p-2 mx-1">
            <div className="card-title">
              <h1>Proceso de compra</h1>
            </div>
            <form onSubmit={handleSubmit}>
              <label className="input input-bordered flex items-center gap-2 my-1">
                <select
                  name="seller"
                  onChange={handleChange}
                  value={selectedSeller}
                  className="input input-bordered"
                >
                  <option value="" disabled>
                    Selecciona una vendedora
                  </option>
                  <option value="Yamila Gonzalez">Yamila Gonzalez</option>
                  <option value="Daniela Urbina">Daniela Urbina</option>
                  <option value="Otros">Otros</option>
                </select>
              </label>

              <label className="input input-bordered flex items-center gap-2 my-1">
                <select
                  name="paymentMethod"
                  onChange={handleChange}
                  value={selectedPaymentMethod}
                  className="input input-bordered"
                >
                  <option value="" disabled>
                    Selecciona un método de pago
                  </option>
                  <option value="MercadoPago">MercadoPago</option>
                  <option value="Transferencia Galicia">
                    Transferencia Galicia
                  </option>
                  <option value="Cuenta DNI">Cuenta DNI</option>
                </select>
              </label>

              <div className="card-actions justify-end">
                <button className="btn btn-primary">Comprar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="my-8">
        <h2 className="text-xl font-semibold">Ventas del día</h2>
        <ul>
          {dailySales.map((sale) => (
            <li key={sale.id}>
              <p>Vendedora: {sale.seller}</p>
              <p>Método de pago: {sale.paymentMethod}</p>
              <p>Total: ${sale.total}</p>
              <p>Fecha: {sale.createdAt.toDate().toLocaleString()}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="my-8">
        <h2 className="text-xl font-semibold">Ventas de los últimos 30 días</h2>
        <ul>
          {last30DaysSales.map((sale) => (
            <li key={sale.id}>
              <p>Vendedora: {sale.seller}</p>
              <p>Método de pago: {sale.paymentMethod}</p>
              <p>Total: ${sale.total}</p>
              <p>Fecha: {sale.createdAt.toDate().toLocaleString()}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Checkout;
