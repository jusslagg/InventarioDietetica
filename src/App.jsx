import { BrowserRouter, Routes, Route } from "react-router-dom";
import ItemListContainer from "./components/pages/itemListComponents/ItemListContainer";
import Navbar from "./components/Layouts/navbar/Navbar";
import CartContainer from "./components/pages/cart/CartContainer";
import ItemDetailContainer from "./components/pages/itemDetail/ItemDetailContainer";
import Page404 from "./components/pages/404/Page404";
import Footer from "./components/Layouts/navbar/Footer";
import { CartContextProvider } from "./context/CartContext";
import { LogoContextProvider } from "./context/LogoContext";
import { AlertProvider } from "./context/AlertContext";
import Checkout from "./components/pages/checkout/Checkout";
import FinancialDashboard from "./components/pages/financial/FinancialDashboard";

function App() {
  return (
    <BrowserRouter>
      <AlertProvider>
        <CartContextProvider>
          <LogoContextProvider>
            <Navbar />
            <Routes>
              <Route path={"/"} element={<ItemListContainer />} />
              <Route
                path={"/Category/:categoryName"}
                element={<ItemListContainer />}
              />
              <Route
                path={"/ProductDetail/:id"}
                element={<ItemDetailContainer />}
              />
              <Route path={"/Cart"} element={<CartContainer />} />
              <Route path={"/checkout"} element={<Checkout />} />
              <Route path={"/finanzas"} element={<FinancialDashboard />} />
              <Route path={"*"} element={<Page404 />} />
            </Routes>
            <Footer />
          </LogoContextProvider>
        </CartContextProvider>
      </AlertProvider>
    </BrowserRouter>
  );
}

export default App;
