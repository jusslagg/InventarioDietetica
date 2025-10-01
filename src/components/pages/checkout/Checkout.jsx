import { useState, useEffect, useMemo } from "react";

import useCartContext from "../../../hooks/useCartContext";

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

  Timestamp,

} from "firebase/firestore";

import { db } from "../../../configFirebase";

import Swal from "sweetalert2"; // Importa SweetAlert2



const Checkout = () => {







  const [selectedSeller, setSelectedSeller] = useState("");







  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(""); // MÃ©todo de pago







  const [orderId, setOrderId] = useState(null);







  const [isLoading, setIsLoading] = useState(false);







  const [dailySales, setDailySales] = useState([]);







  const [totalSalesByMonth, setTotalSalesByMonth] = useState({}); // Total de ventas por mes







  const [last15DaysSales, setLast15DaysSales] = useState([]); // Ventas de los Ãºltimos 15 dÃ­as







  const [selectedDiscount, setSelectedDiscount] = useState(0); // Descuento seleccionado







  const [isAuthorized, setIsAuthorized] = useState(false); // Estado de autorizaciÃ³n















    const { cart, getTotalAmount, clearCart } = useCartContext();















  // Obtener ventas







  const getSales = async () => {







    const now = new Date();







    const startOfDay = new Date(now);







    startOfDay.setHours(0, 0, 0, 0);















    const startOf15DaysAgo = new Date(startOfDay);







    startOf15DaysAgo.setDate(startOfDay.getDate() - 15);















    const salesRef = collection(db, "orders");















    const dailyQuery = query(







      salesRef,







      where("createdAt", ">=", Timestamp.fromDate(startOfDay)),







      orderBy("createdAt", "desc")







    );















    const last15DaysQuery = query(







      salesRef,







      where("createdAt", ">=", Timestamp.fromDate(startOf15DaysAgo)),







      orderBy("createdAt", "desc")







    );















    try {







      const dailySnapshot = await getDocs(dailyQuery);







      const last15DaysSnapshot = await getDocs(last15DaysQuery);















      const dailySalesData = dailySnapshot.docs.map((docSnapshot) => ({







        id: docSnapshot.id,







        ...docSnapshot.data(),







      }));







      const last15DaysSalesData = last15DaysSnapshot.docs.map((docSnapshot) => ({







        id: docSnapshot.id,







        ...docSnapshot.data(),







      }));















      setDailySales(dailySalesData);







      setLast15DaysSales(last15DaysSalesData);







    } catch (error) {







      console.error("Error al obtener las ventas:", error);







    }







  };















  // Obtener el total de ventas por mes







  const getSalesByMonth = async () => {







    const salesRef = collection(db, "orders");















    const monthQuery = query(salesRef, orderBy("createdAt", "desc"));







    const monthSnapshot = await getDocs(monthQuery);















    const salesData = monthSnapshot.docs.map((doc) => ({







      id: doc.id,







      ...doc.data(),







    }));















    const totals = salesData.reduce((acc, sale) => {







      const month = new Date(sale.createdAt.seconds * 1000).toLocaleString(







        "default",







        { year: "numeric", month: "long" }







      );







      if (!acc[month]) {







        acc[month] = 0;







      }







      acc[month] += sale.total;







      return acc;







    }, {});















    setTotalSalesByMonth(totals);







  };















  useEffect(() => {







    getSales();







    getSalesByMonth();







  }, []);















  const handleSubmit = (e) => {







    e.preventDefault();







    setIsLoading(true);







    let total = getTotalAmount();







    const discountAmount = total * (selectedDiscount / 100);







    total -= discountAmount;















    const order = {







      seller: selectedSeller,







      paymentMethod: selectedPaymentMethod, // Guardar el mÃ©todo de pago







      items: cart.map((item) => ({







        id: item.id,







        title: item.title,







        category: item.category,







        imageUrl: item.imageUrl,







        price: item.price,







        quantity: item.quantity,







        stock: item.stock,







      })),







      total: total,







      createdAt: serverTimestamp(), // Agregar la fecha de la venta







    };















    // Guardar la orden en Firebase







    const refCollection = collection(db, "orders");







    addDoc(refCollection, order)







      .then((res) => {







        setOrderId(res.id);







        clearCart();







        getSales(); // Obtener ventas despuÃ©s de realizar la compra







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







    } else if (name === "discount") {







      setSelectedDiscount(Number(value));







    } else if (name === "paymentMethod") {







      setSelectedPaymentMethod(value); // Guardar el mÃ©todo de pago







    }







  };















  const totalAmount = getTotalAmount();







  const discountAmount = totalAmount * (selectedDiscount / 100);







  const totalWithDiscount = totalAmount - discountAmount;















  // Filtrado de ventas por mÃ©todo de pago en los Ãºltimos 15 dÃ­as







  const filteredSales = useMemo(() => {







    if (!selectedPaymentMethod) return last15DaysSales;







    return last15DaysSales.filter(







      (sale) => sale.paymentMethod === selectedPaymentMethod







    );







  }, [selectedPaymentMethod, last15DaysSales]);















  // Calcular el total de ventas del dÃ­a







  const totalDailySales = dailySales.reduce(







    (total, sale) => total + sale.total,







    0







  );















  // Filtrar solo las ventas del dÃ­a (para mostrar el total filtrado por dÃ­a)







  const filteredSalesToday = filteredSales.filter((sale) => {







    const saleDate = new Date(sale.createdAt.seconds * 1000);







    const today = new Date();







    return (







      saleDate.getDate() === today.getDate() &&







      saleDate.getMonth() === today.getMonth() &&







      saleDate.getFullYear() === today.getFullYear()







    );







  });















  // Calcular el total de ventas filtradas solo para hoy







  const totalFilteredSalesToday = filteredSalesToday.reduce(







    (total, sale) => total + sale.total,







    0







  );















  const handleUnlockSales = () => {







    Swal.fire({







      title: "Ingresa la clave",







      input: "password",







      inputPlaceholder: "Introduce la clave",







      showCancelButton: true,







      confirmButtonText: "Aceptar",







      cancelButtonText: "Cancelar",







    }).then((result) => {







      if (result.isConfirmed && result.value === "camicam1") {







        setIsAuthorized(true); // Habilitar acceso a ventas por mes







      } else {







        Swal.fire("Clave incorrecta", "", "error");







      }







    });







  };















  if (isLoading) {







    return <h2>cargando...</h2>;







  }















  return (







    <div className="h-dvh flex">







      <div className="w-3/4">







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







                    <option value="Diego">Diego</option>







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







                    <option value="">Selecciona un mÃ©todo de pago</option>







                    <option value="Efectivo">Efectivo</option>







                    <option value="Posnet">Posnet</option>







                    <option value="Galicia QR">Galicia QR</option>







                    <option value="Cuenta DNI">Cuenta DNI</option>







                    <option value="Mercado Pago Yami">Mercado Pago Yami</option>







                    <option value="OpenPay BBVA">OpenPay BBVA</option>







                  </select>







                </label>















                <label className="input input-bordered flex items-center gap-2 my-1">







                  <select







                    name="discount"







                    onChange={handleChange}







                    value={selectedDiscount}







                    className="input input-bordered"







                  >







                    <option value={0}>Sin descuento</option>







                    <option value={10}>10% de descuento</option>







                    <option value={20}>20% de descuento</option>







                    <option value={30}>30% de descuento</option>







                    <option value={100}>100% de descuento</option>







                  </select>







                </label>















                <div className="my-4">







                  <h2>Total a pagar: ${totalWithDiscount.toFixed(2)}</h2>







                </div>















                <div className="card-actions justify-end">







                  <button className="btn btn-primary">Comprar</button>







                </div>







              </form>







            </div>







          </div>







        )}















        {/* Registro de ventas de los Ãºltimos 15 dÃ­as */}







        <div className="my-8">







          <h2 className="text-xl font-semibold">







            Ventas de los Ãšltimos 15 DÃ­as







          </h2>







          <div className="overflow-x-auto">







            <table className="table w-full">







              <thead>







                <tr>







                  <th>Fecha</th>







                  <th>Hora</th>







                  <th>Vendedor</th>







                  <th>MÃ©todo de Pago</th>







                  <th>Total</th>







                  <th>Cantidad</th>







                  <th>Producto</th>







                </tr>







              </thead>







              <tbody>







                {filteredSales







                  .sort((a, b) => b.createdAt.seconds - a.createdAt.seconds) // Ordenar por fecha







                  .map((sale) => (







                    <tr key={sale.id}>







                      <td>







                        {new Date(







                          sale.createdAt.seconds * 1000







                        ).toLocaleDateString()}







                      </td>







                      <td>







                        {new Date(







                          sale.createdAt.seconds * 1000







                        ).toLocaleTimeString()}







                      </td>







                      <td>{sale.seller}</td>







                      <td>{sale.paymentMethod}</td>







                      <td>${sale.total.toFixed(2)}</td>







                      {sale.items.map((item, index) => (







                        <td key={index}>







                          {item.quantity} x {item.title}







                        </td>







                      ))}







                    </tr>







                  ))}







              </tbody>







            </table>







          </div>







        </div>







      </div>















      {/* Total de ventas por mes */}







      <div className="w-1/4 p-4">







        <h2 className="text-xl font-semibold">Ventas Totales por Mes</h2>







        <div>







          {isAuthorized ? (







            Object.entries(totalSalesByMonth).map(([month, total]) => (







              <p key={month}>







                {month}: ${total.toFixed(2)}







              </p>







            ))







          ) : (







            <button onClick={handleUnlockSales} className="btn btn-primary">







              Ver Ventas por Mes







            </button>







          )}







        </div>















        {/* Total de ventas del dÃ­a */}







        <div className="my-4">







          <h2 className="text-xl font-semibold">Ventas Totales del DÃ­a</h2>







          <p>${totalDailySales.toFixed(2)}</p>







        </div>















        {/* Botones de filtrado dentro del detalle de los Ãºltimos 15 dÃ­as */}







        <div className="my-4">







          <button







            className="btn btn-secondary mx-2"







            onClick={() => setSelectedPaymentMethod("Efectivo")}







          >







            Filtrar por Efectivo







          </button>







          <button







            className="btn btn-secondary mx-2"







            onClick={() => setSelectedPaymentMethod("Posnet")}







          >







            Filtrar por Posnet







          </button>







          <button







            className="btn btn-secondary mx-2"







            onClick={() => setSelectedPaymentMethod("Galicia QR")}







          >







            Filtrar por Galicia QR







          </button>







          <button







            className="btn btn-secondary mx-2"







            onClick={() => setSelectedPaymentMethod("Cuenta DNI")}







          >







            Filtrar por Cuenta DNI







          </button>







          <button







            className="btn btn-secondary mx-2"







            onClick={() => setSelectedPaymentMethod("Mercado Pago Yami")}







          >







            Filtrar por Mercado Pago Yami







          </button>







          <button







            className="btn btn-secondary mx-2"







            onClick={() => setSelectedPaymentMethod("OpenPay BBVA")}







          >







            Filtrar por OpenPay BBVA







          </button>







          <button







            className="btn btn-secondary mx-2"







            onClick={() => setSelectedPaymentMethod("")} // Limpiar el filtro







          >







            Limpiar Filtro







          </button>







        </div>















        {/* Cuadro con total del dÃ­a filtrado */}







        <div className="my-4 p-4 border border-gray-300 rounded-md bg-gray-50">







          <h3 className="font-semibold">Total de ventas del dÃ­a filtrado:</h3>







          <p className="text-xl font-bold">







            ${totalFilteredSalesToday.toFixed(2)}







          </p>







        </div>







      </div>







    </div>







  );







};















export default Checkout;







