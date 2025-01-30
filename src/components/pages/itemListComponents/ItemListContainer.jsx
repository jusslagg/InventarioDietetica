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
  const [filteredItems, setFilteredItems] = useState([]); // Estado para los productos filtrados
  const [selectedItemId, setSelectedItemId] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newStock, setNewStock] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newPrice, setNewPrice] = useState(""); // Estado para el nuevo precio
  const [stockOriginal, setStockOriginal] = useState(0);
  const [showAddProductForm, setShowAddProductForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // Estado para el término de búsqueda

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
        stock: Number(doc.data().stock),
      }));
      setItems(fetchedItems);
      setFilteredItems(fetchedItems); // Inicialmente, los productos filtrados son todos los productos
    });
  }, [categoryName]);

  // Función para manejar el cambio en el campo de búsqueda
  const handleSearchChange = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    setSearchTerm(searchTerm);

    // Filtrar los productos en base al término de búsqueda
    const filtered = items.filter((item) => {
      const title = item.title ? item.title.toLowerCase() : "";
      const category = item.category ? item.category.toLowerCase() : "";
      return title.includes(searchTerm) || category.includes(searchTerm);
    });

    setFilteredItems(filtered);
  };

  // Función para agregar productos
  const agregarProducto = async (e) => {
    e.preventDefault();

    if (items.some((item) => item.title === newTitle)) {
      alert("Este producto ya existe en la base de datos.");
      return;
    }

    try {
      await addDoc(collection(db, "products"), {
        title: newTitle,
        stock: Number(newStock),
        category: newCategory,
        price: Number(newPrice),
      });
      alert("Producto agregado exitosamente.");

      setNewTitle("");
      setNewStock("");
      setNewCategory("");
      setNewPrice("");

      const updatedItems = [
        ...items,
        {
          title: newTitle,
          stock: Number(newStock),
          category: newCategory,
          price: Number(newPrice),
        },
      ];
      setItems(updatedItems);
      setFilteredItems(updatedItems); // Actualizar los productos filtrados
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
    const currentStock = product.stock;
    const currentPrice = product.price;

    const updatedData = {};

    if (newStock) {
      if (newStock > currentStock) {
        updatedData.stock = Number(newStock);
      } else {
        alert("El stock no puede ser menor o igual que el valor actual.");
        return;
      }
    }

    if (newPrice) {
      if (newPrice > currentPrice) {
        updatedData.price = Number(newPrice);
      } else {
        alert("El nuevo precio debe ser mayor que el precio actual.");
        return;
      }
    }

    if (newTitle) updatedData.title = newTitle;
    if (newCategory) updatedData.category = newCategory;

    if (Object.keys(updatedData).length === 0) {
      alert("Debes seleccionar al menos un campo para actualizar.");
      return;
    }

    const productRef = doc(db, "products", selectedItemId);

    try {
      await updateDoc(productRef, updatedData);
      alert("Producto actualizado exitosamente.");

      const updatedItems = items.map((item) =>
        item.id === selectedItemId ? { ...item, ...updatedData } : item
      );
      setItems(updatedItems);
      setFilteredItems(updatedItems); // Actualizar los productos filtrados

      setSelectedItemId("");
      setNewTitle("");
      setNewStock("");
      setNewCategory("");
      setNewPrice("");
    } catch (error) {
      console.error("Error al actualizar el producto:", error);
      alert("Error al actualizar el producto.");
    }
  };

  const handleSelectProduct = (e) => {
    const productId = e.target.value;
    setSelectedItemId(productId);

    if (productId) {
      const selectedProduct = items.find((item) => item.id === productId);
      setNewTitle(selectedProduct.title);
      setNewStock(selectedProduct.stock);
      setNewCategory(selectedProduct.category);
      setNewPrice(selectedProduct.price);
      setStockOriginal(selectedProduct.stock);
    }
  };

  return (
    <div className="container mx-auto px-4">
      {/* Campo de búsqueda */}
      <div className="mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Buscar producto..."
          className="input input-bordered w-full"
        />
      </div>
      <ItemList items={filteredItems} /> {/* Mostrar los productos filtrados */}
      <div className="mb-4">
        <button
          onClick={() => setShowAddProductForm(!showAddProductForm)}
          className="btn btn-secondary"
        >
          {showAddProductForm ? "Ocultar Formulario" : "Agregar Producto"}
        </button>
      </div>
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

              <button type="submit" className="btn btn-primary w-full">
                Agregar Producto
              </button>
            </form>
          </div>
        </div>
      )}
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
              <button
                type="button"
                onClick={async () => {
                  if (newStock > stockOriginal) {
                    const productRef = doc(db, "products", selectedItemId);
                    await updateDoc(productRef, { stock: Number(newStock) });
                    alert("Stock actualizado exitosamente.");
                    const updatedItems = items.map((item) =>
                      item.id === selectedItemId
                        ? { ...item, stock: Number(newStock) }
                        : item
                    );
                    setItems(updatedItems);
                    setFilteredItems(updatedItems);
                    setNewStock("");
                  } else {
                    alert(
                      "El stock no puede ser menor o igual que el valor actual."
                    );
                  }
                }}
                className="btn btn-primary mt-2"
              >
                Actualizar Stock
              </button>
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
              <button
                type="button"
                onClick={async () => {
                  if (newPrice > product.price) {
                    const productRef = doc(db, "products", selectedItemId);
                    await updateDoc(productRef, { price: Number(newPrice) });
                    alert("Precio actualizado exitosamente.");
                    const updatedItems = items.map((item) =>
                      item.id === selectedItemId
                        ? { ...item, price: Number(newPrice) }
                        : item
                    );
                    setItems(updatedItems);
                    setFilteredItems(updatedItems);
                    setNewPrice("");
                  } else {
                    alert(
                      "El nuevo precio debe ser mayor que el precio actual."
                    );
                  }
                }}
                className="btn btn-primary mt-2"
              >
                Actualizar Precio
              </button>
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
