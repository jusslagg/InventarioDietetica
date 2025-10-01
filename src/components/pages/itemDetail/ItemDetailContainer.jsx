import { useEffect, useState } from "react";
import ItemDetail from "./ItemDetail";
import { collection, doc, getDoc } from "firebase/firestore";
import { useParams } from "react-router-dom";
import useCartContext from "../../../hooks/useCartContext";
import { db } from "../../../configFirebase.js";

const ItemDetailContainer = () => {
  const [item, setItem] = useState({});
    const { addToCart, getTotalQuantityById } = useCartContext();

  const { id } = useParams();

  const totalAdded = getTotalQuantityById(id);

  useEffect(() => {
    const productCollection = collection(db, "products");
    const refDoc = doc(productCollection, id);

    getDoc(refDoc).then((res) => setItem({ ...res.data(), id: res.id }));
  }, [id]);

  const addOn = (quantity) => {
    const productToAdd = { ...item, quantity };
    addToCart(productToAdd);
  };

  return <ItemDetail item={item} addOn={addOn} totalAdded={totalAdded} />;
};

export default ItemDetailContainer;
