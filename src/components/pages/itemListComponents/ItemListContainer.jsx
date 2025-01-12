import { useState, useEffect } from "react";
import { ItemList } from "./ItemList";
import { useParams } from "react-router-dom";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../configFirebase";
import { products } from "../../../products";

const ItemListContainer = () => {
  const [items, setItems] = useState([]);
  const { categoryName } = useParams();

  useEffect(() => {
    let itemsCollection = collection(db, "products");

    let consulta = itemsCollection;

    if (categoryName) {
      consulta = query(itemsCollection, where("category", "==", categoryName));
    }

    getDocs(consulta).then((snapshot) => {
      setItems(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
  }, [categoryName]);

  // Función para agregar productos
  const agregarProductos = () => {
    const confirmAdd = window.confirm(
      "¿Estás seguro de que quieres agregar los productos? Esta acción añadirá nuevos productos a la base de datos."
    );
    if (confirmAdd) {
      products.forEach((product) => {
        addDoc(collection(db, "products"), product);
      });
      alert("Productos agregados exitosamente.");
    }
  };

  // Función para actualizar la lista de productos, solo agregando nuevos productos
  const actualizarProductos = () => {
    const confirmUpdate = window.confirm(
      "¿Estás seguro de que quieres actualizar los productos? Esta acción añadirá solo los productos nuevos que no estén en la base de datos."
    );
    if (confirmUpdate) {
      products.forEach((product) => {
        const existingProduct = items.find(
          (item) => item.name === product.name
        );
        if (!existingProduct) {
          addDoc(collection(db, "products"), product);
        }
      });
      alert("Productos actualizados exitosamente.");
    }
  };

  return (
    <>
      <ItemList items={items} />
      <button className="btn" onClick={agregarProductos}>
        Agregar productos
      </button>
      <button className="btn" onClick={actualizarProductos}>
        Actualizar productos
      </button>
    </>
  );
};

export default ItemListContainer;
