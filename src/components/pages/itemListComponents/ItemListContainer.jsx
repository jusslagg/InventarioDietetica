import { useState, useEffect } from "react";
import { ItemList } from "./ItemList";
import { useParams } from "react-router-dom";
import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../../configFirebase";
import { products } from "../../../products";

const ItemListContainer = () => {
  const [items, setItems] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newStock, setNewStock] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const { categoryName } = useParams();

  useEffect(() => {
    let itemsCollection = collection(db, "products");
    let consulta = itemsCollection;

    if (categoryName) {
      consulta = query(itemsCollection, where("category", "==", categoryName));
    }

    getDocs(consulta).then((snapshot) => {
      const fetchedItems = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setItems(fetchedItems);
    });
  }, [categoryName]);

  // Verificar si un producto ya existe en Firebase
  const checkIfProductExists = (newProductTitle) => {
    return items.some((item) => item.title === newProductTitle);
  };

  // Función para agregar productos
  const agregarProducto = async (e) => {
    e.preventDefault();

    // Verificamos si el producto ya existe
    if (checkIfProductExists(newTitle)) {
      alert("Este producto ya existe en la base de datos.");
      return;
    }

    try {
      // Agregamos el producto si no existe
      await addDoc(collection(db, "products"), {
        title: newTitle,
        price: newPrice,
        stock: newStock,
        category: newCategory,
      });
      alert("Producto agregado exitosamente.");

      // Limpiamos los campos
      setNewTitle("");
      setNewPrice("");
      setNewStock("");
      setNewCategory("");

      // Actualizamos la lista de productos
      const updatedItems = [
        ...items,
        {
          title: newTitle,
          price: newPrice,
          stock: newStock,
          category: newCategory,
        },
      ];
      setItems(updatedItems);
    } catch (error) {
      console.error("Error al agregar el producto:", error);
    }
  };

  // Función para editar un producto
  const editarProducto = async (e) => {
    e.preventDefault();

    if (!selectedItemId) {
      alert("Por favor, selecciona un producto para editar.");
      return;
    }

    const productRef = doc(db, "products", selectedItemId);
    const updatedData = {};

    if (newTitle) updatedData.title = newTitle;
    if (newPrice) updatedData.price = newPrice;
    if (newStock) updatedData.stock = newStock;
    if (newCategory) updatedData.category = newCategory;

    if (Object.keys(updatedData).length === 0) {
      alert("Debes seleccionar al menos un campo para actualizar.");
      return;
    }

    try {
      await updateDoc(productRef, updatedData);
      alert("Producto actualizado exitosamente.");

      // Actualizar los productos en la interfaz
      const updatedItems = items.map((item) =>
        item.id === selectedItemId ? { ...item, ...updatedData } : item
      );
      setItems(updatedItems);

      // Limpiar campos
      setSelectedItemId("");
      setNewTitle("");
      setNewPrice("");
      setNewStock("");
      setNewCategory("");
    } catch (error) {
      console.error("Error al actualizar el producto:", error);
      alert("Error al actualizar el producto.");
    }
  };

  return (
    <div className="container mx-auto px-4">
      <ItemList items={items} />

      {/* Formulario para agregar productos */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Agregar Producto</h2>
        <form onSubmit={agregarProducto}>
          <div className="mb-4">
            <label htmlFor="title" className="block font-medium">
              Título:
            </label>
            <input
              type="text"
              id="title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="input input-bordered w-full"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="price" className="block font-medium">
              Precio:
            </label>
            <input
              type="number"
              id="price"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              className="input input-bordered w-full"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="stock" className="block font-medium">
              Stock:
            </label>
            <input
              type="number"
              id="stock"
              value={newStock}
              onChange={(e) => setNewStock(e.target.value)}
              className="input input-bordered w-full"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="category" className="block font-medium">
              Categoría:
            </label>
            <input
              type="text"
              id="category"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="input input-bordered w-full"
            />
          </div>

          <button type="submit" className="btn btn-primary">
            Agregar Producto
          </button>
        </form>
      </div>

      {/* Formulario para editar productos */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Editar Producto</h2>
        <select
          value={selectedItemId}
          onChange={(e) => setSelectedItemId(e.target.value)}
          className="select select-bordered w-full mb-4"
        >
          <option value="">Seleccionar producto para editar</option>
          {items.map((item) => (
            <option key={item.id} value={item.id}>
              {item.title}
            </option>
          ))}
        </select>

        {selectedItemId && (
          <form onSubmit={editarProducto}>
            <div className="mb-4">
              <label htmlFor="title" className="block font-medium">
                Nuevo Título:
              </label>
              <input
                type="text"
                id="title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="input input-bordered w-full"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="price" className="block font-medium">
                Nuevo Precio:
              </label>
              <input
                type="number"
                id="price"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                className="input input-bordered w-full"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="stock" className="block font-medium">
                Nuevo Stock:
              </label>
              <input
                type="number"
                id="stock"
                value={newStock}
                onChange={(e) => setNewStock(e.target.value)}
                className="input input-bordered w-full"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="category" className="block font-medium">
                Nueva Categoría:
              </label>
              <input
                type="text"
                id="category"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="input input-bordered w-full"
              />
            </div>

            <button type="submit" className="btn btn-primary">
              Actualizar Producto
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ItemListContainer;
