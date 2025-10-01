import Cart from "./Cart";
import useCartContext from "../../../hooks/useCartContext";

const CartContainer = () => {
  const { cart, deleteProductById, getTotalQuantity, getTotalAmount, clearCart } =
    useCartContext();

  return (
    <Cart
      cart={cart}
      deleteProductById={deleteProductById}
      clearCart={clearCart}
      total={getTotalAmount()}
      totalQuantity={getTotalQuantity()}
    />
  );
};

export default CartContainer;
