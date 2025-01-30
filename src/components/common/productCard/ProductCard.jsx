import { Link } from "react-router-dom";
import { useContext, useState } from "react";
import CounterContainer from "../counter/CounterContainer";
import { CartContext } from "../../../context/CartContext";

const ProductCard = ({ id, title, price, stock, imageUrl, category }) => {
  const { addToCart, getTotalQuantityById } = useContext(CartContext);
  const totalAdded = getTotalQuantityById(id);

  const addOn = (quantity) => {
    const product = { id, title, price, stock, imageUrl, category, quantity };
    addToCart(product);
  };

  return (
    <div className="card card-side md:card card-compact bg-base-100 w-64 md:w-72 shadow-xl">
      <figure className="w-full flex justify-center items-center">
        <img
          src={imageUrl}
          alt={title}
          className="object-contain w-32 h-32 md:w-40 md:h-40"
        />
      </figure>
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
