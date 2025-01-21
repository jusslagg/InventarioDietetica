import { useContext, useState, useEffect, useMemo } from "react";
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
  const [totalSalesMonth, setTotalSalesMonth] = useState(0); // Total de ventas por mes
  const [selectedDate, setSelectedDate] = useState(""); // Estado para fecha seleccionada
  const [salesByPaymentMethod, setSalesByPaymentMethod] = useState({}); // Ventas por método de pago

  const { cart, getTotalAmount, clearCart } = useContext(CartContext);

  // Función para obtener las ventas de los últimos 30 días y ventas diarias
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

  // Función para obtener el total de ventas acumuladas por mes
  const getSalesByMonth = async (month) => {
    const salesRef = collection(db, "orders");

    const monthStart = new Date(month);
    const monthEnd = new Date(monthStart);
    monthEnd.setMonth(monthEnd.getMonth() + 1); // Fin del mes seleccionado

    const monthQuery = query(
      salesRef,
      where("createdAt", ">=", monthStart),
      where("createdAt", "<", monthEnd),
      orderBy("createdAt", "desc")
    );

    const monthSnapshot = await getDocs(monthQuery);
    const monthSalesData = monthSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const total = monthSalesData.reduce((acc, sale) => acc + sale.total, 0);
    setTotalSalesMonth(total);
  };

  // Función para obtener ventas por método de pago
  const getSalesByPayment = async () => {
    const salesRef = collection(db, "orders");

    const paymentMethods = [
      "Efectivo",
      "Posnet",
      "Galicia QR",
      "Cuenta DNI",
      "Mercado Pago Dani",
      "Mercado Pago Yami",
    ];
    let salesByPayment = {};

    for (let method of paymentMethods) {
      const paymentQuery = query(
        salesRef,
        where("paymentMethod", "==", method),
        orderBy("createdAt", "desc")
      );

      const paymentSnapshot = await getDocs(paymentQuery);
      const paymentSalesData = paymentSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const total = paymentSalesData.reduce((acc, sale) => acc + sale.total, 0);
      salesByPayment[method] = total;
    }

    setSalesByPaymentMethod(salesByPayment);
  };

  useEffect(() => {
    getSales();
    getSalesByPayment();
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

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleMonthChange = (e) => {
    const month = new Date(e.target.value);
    getSalesByMonth(month);
  };

  // Calcular el total de ventas por día
  const totalSalesByDay = useMemo(() => {
    const totals = {};
    dailySales.forEach((sale) => {
      const date = sale.createdAt.toDate().toLocaleDateString();
      if (!totals[date]) {
        totals[date] = 0;
      }
      totals[date] += sale.total;
    });
    return totals;
  }, [dailySales]);

  // Calcular el total de ventas por mes
  const totalSalesByMonth = useMemo(() => {
    const totals = {};
    last30DaysSales.forEach((sale) => {
      const month = sale.createdAt
        .toDate()
        .toLocaleString("default", { month: "long", year: "numeric" });
      if (!totals[month]) {
        totals[month] = 0;
      }
      totals[month] += sale.total;
    });
    return totals;
  }, [last30DaysSales]);

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
                  <option value="Efectivo">Efectivo</option>
                  <option value="Posnet">Posnet</option>
                  <option value="Galicia QR">Galicia QR</option>
                  <option value="Cuenta DNI">Cuenta DNI</option>
                  <option value="Mercado Pago Dani">Mercado Pago Dani</option>
                  <option value="Mercado Pago Yami">Mercado Pago Yami</option>
                </select>
              </label>

              <div className="card-actions justify-end">
                <button className="btn btn-primary">Comprar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex justify-between mt-8">
        <div className="w-1/3">
          <h2 className="text-xl font-semibold">Ventas por Fecha</h2>
          <input
            type="date"
            onChange={handleDateChange}
            value={selectedDate}
            className="input input-bordered w-full"
          />
          {/* Mostrar las ventas del día seleccionado */}
        </div>

        <div className="w-1/3">
          <h2 className="text-xl font-semibold">Ventas por Método de Pago</h2>
          {Object.keys(salesByPaymentMethod).map((method) => (
            <div key={method}>
              <p>
                {method}: ${salesByPaymentMethod[method]}
              </p>
            </div>
          ))}
        </div>

        <div className="w-1/3">
          <h2 className="text-xl font-semibold">Ventas por Mes</h2>
          <input
            type="month"
            onChange={handleMonthChange}
            className="input input-bordered w-full"
          />
          <p>Total ventas: ${totalSalesMonth}</p>
        </div>
      </div>

      {/* Mostrar total de ventas por día */}
      <div className="my-8">
        <h2 className="text-xl font-semibold">Total de ventas por día</h2>
        <ul>
          {Object.entries(totalSalesByDay).map(([date, total]) => (
            <li key={date}>
              <p>Fecha: {date}</p>
              <p>Total: ${total.toFixed(2)}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* Mostrar total de ventas por mes */}
      <div className="my-8">
        <h2 className="text-xl font-semibold">Total de ventas por mes</h2>
        <ul>
          {Object.entries(totalSalesByMonth).map(([month, total]) => (
            <li key={month}>
              <p>Mes: {month}</p>
              <p>Total: ${total.toFixed(2)}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* Mostrar ventas del día */}
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

      {/* Mostrar ventas de los últimos 30 días */}
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
