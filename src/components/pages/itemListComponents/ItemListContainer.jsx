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

const ItemListContainer = () => {
  const [items, setItems] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newStock, setNewStock] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [stockOriginal, setStockOriginal] = useState(0); // Para almacenar el stock original
  const [showAddProductForm, setShowAddProductForm] = useState(false); // Estado para controlar la visibilidad del formulario de agregar producto

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
        stock: Number(doc.data().stock), // Asegúrate de que stock sea un número
      }));
      setItems(fetchedItems);
    });
  }, [categoryName]);

  // Función para agregar productos
  const agregarProducto = async (e) => {
    e.preventDefault();

    // Verificamos si el producto ya existe
    if (items.some((item) => item.title === newTitle)) {
      alert("Este producto ya existe en la base de datos.");
      return;
    }

    try {
      // Agregamos el producto si no existe
      await addDoc(collection(db, "products"), {
        title: newTitle,
        stock: Number(newStock), // Asegúrate de que el stock sea un número
        category: newCategory,
      });
      alert("Producto agregado exitosamente.");

      // Limpiamos los campos
      setNewTitle("");
      setNewStock("");
      setNewCategory("");

      // Actualizamos la lista de productos
      const updatedItems = [
        ...items,
        {
          title: newTitle,
          stock: Number(newStock), // Asegúrate de que el stock sea un número
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

    const product = items.find((item) => item.id === selectedItemId);
    const currentStock = product.stock; // Obtener el stock actual del producto

    // Verificar si el nuevo stock es menor que el stock original
    if (newStock < currentStock) {
      alert("El stock no puede ser menor que el valor actual.");
      return;
    }

    const productRef = doc(db, "products", selectedItemId);
    const updatedData = {};

    if (newTitle) updatedData.title = newTitle;
    if (newStock) updatedData.stock = Number(newStock); // Asegúrate de que el stock sea un número
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
      setNewStock("");
      setNewCategory("");
    } catch (error) {
      console.error("Error al actualizar el producto:", error);
      alert("Error al actualizar el producto.");
    }
  };

  // Manejo de selección del producto
  const handleSelectProduct = (e) => {
    const productId = e.target.value;
    setSelectedItemId(productId);

    if (productId) {
      const selectedProduct = items.find((item) => item.id === productId);
      setNewTitle(selectedProduct.title);
      setNewStock(selectedProduct.stock);
      setNewCategory(selectedProduct.category);
      setStockOriginal(selectedProduct.stock); // Guardamos el stock original
    }
  };

  return (
    <div className="container mx-auto px-4">
      <ItemList items={items} />

      {/* Botón para mostrar/ocultar formulario de agregar producto */}
      <div className="mb-4">
        <button
          onClick={() => setShowAddProductForm(!showAddProductForm)}
          className="btn btn-secondary"
        >
          {showAddProductForm ? "Ocultar Formulario" : "Agregar Producto"}
        </button>
      </div>

      {/* Formulario para agregar productos - solo visible si showAddProductForm es true */}
      {showAddProductForm && (
        <div className="flex justify-center items-center min-h-screen">
          <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-center">
              Agregar Producto
            </h2>
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

              <button type="submit" className="btn btn-primary w-full">
                Agregar Producto
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Formulario para editar productos */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Editar Producto</h2>
        <select
          value={selectedItemId}
          onChange={handleSelectProduct}
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
