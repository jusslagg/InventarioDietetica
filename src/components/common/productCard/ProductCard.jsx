import { Link } from "react-router-dom";
import CounterContainer from "../counter/CounterContainer";
import useCartContext from "../../../hooks/useCartContext";

const ProductCard = ({ id, title, price, stock, imageUrl, category }) => {
  const { addToCart, getTotalQuantityById } = useCartContext();
  const totalAdded = getTotalQuantityById(id);

  const addOn = (quantity) => {
    const product = { id, title, price, stock, imageUrl, category, quantity };
    addToCart(product);
  };

  return (
    <div className="card card-side md:card card-compact bg-base-100 w-64 md:w-72 shadow-xl">
      <div className="card-body">
        <h2 className="card-title text-lg xl:text-xl">{title}</h2>
        <p className="font-bold xl:text-lg">${price} Pesos</p>
        <p className="font-semibold">Stock: {stock}</p>
        <div className="card-actions justify-between">
          <div className="badge badge-outline capitalize">{category}</div>
          <Link to={`/ProductDetail/${id}`}>
            <button className="btn btn-primary">Ver más</button>
          </Link>
        </div>
        <CounterContainer stock={stock} addOn={addOn} totalAdded={totalAdded} />
      </div>
    </div>
  );
};

export default ProductCard;
