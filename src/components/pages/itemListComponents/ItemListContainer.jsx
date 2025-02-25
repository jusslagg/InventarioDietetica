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
import Swal from "sweetalert2"; // Importar SweetAlert

const ItemListContainer = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newStock, setNewStock] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newImageUrl, setNewImageUrl] = useState(""); // Estado para la nueva imagen
  const [stockOriginal, setStockOriginal] = useState(0);
  const [showAddProductForm, setShowAddProductForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

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
      setFilteredItems(fetchedItems);
    });
  }, [categoryName]);

  const handleSearchChange = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    setSearchTerm(searchTerm);

    const filtered = items.filter((item) => {
      const title = item.title ? item.title.toLowerCase() : "";
      const category = item.category ? item.category.toLowerCase() : "";
      return title.includes(searchTerm) || category.includes(searchTerm);
    });

    setFilteredItems(filtered);
  };

  const agregarProducto = async (e) => {
    e.preventDefault();

    // Verificación de si ya existe el producto
    if (items.some((item) => item.title === newTitle)) {
      alert("Este producto ya existe en la base de datos.");
      return;
    }

    // Solicitar contraseña antes de agregar
    const { value: password } = await Swal.fire({
      title: "Ingrese la contraseña",
      input: "password",
      inputPlaceholder: "Contraseña",
      showCancelButton: true,
      cancelButtonText: "Cancelar",
      confirmButtonText: "Aceptar",
      inputValidator: (value) => {
        if (value !== "camicam1") {
          return "Contraseña incorrecta";
        }
      },
    });

    if (password !== "camicam1") {
      return; // Si la contraseña es incorrecta, no continuar
    }

    try {
      await addDoc(collection(db, "products"), {
        title: newTitle,
        stock: Number(newStock),
        category: newCategory,
        price: Number(newPrice),
        imageUrl: newImageUrl, // Agregar el imageUrl
      });
      alert("Producto agregado exitosamente.");

      setNewTitle("");
      setNewStock("");
      setNewCategory("");
      setNewPrice("");
      setNewImageUrl(""); // Limpiar el campo de imagen

      const updatedItems = [
        ...items,
        {
          title: newTitle,
          stock: Number(newStock),
          category: newCategory,
          price: Number(newPrice),
          imageUrl: newImageUrl,
        },
      ];
      setItems(updatedItems);
      setFilteredItems(updatedItems);
    } catch (error) {
      console.error("Error al agregar el producto:", error);
    }
  };

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

    // Solicitar contraseña antes de editar
    const { value: password } = await Swal.fire({
      title: "Ingrese la contraseña",
      input: "password",
      inputPlaceholder: "Contraseña",
      showCancelButton: true,
      cancelButtonText: "Cancelar",
      confirmButtonText: "Aceptar",
      inputValidator: (value) => {
        if (value !== "camicam1") {
          return "Contraseña incorrecta";
        }
      },
    });

    if (password !== "camicam1") {
      return; // Si la contraseña es incorrecta, no continuar
    }

    // Actualizar stock (permite reducir el stock)
    if (newStock && newStock !== currentStock) {
      updatedData.stock = Number(newStock);
    }

    // Actualizar precio (permite reducir el precio)
    if (newPrice && newPrice !== currentPrice) {
      updatedData.price = Number(newPrice);
    }

    // Verificar y actualizar otros datos
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

      // Actualizar el estado con los nuevos datos
      const updatedItems = items.map((item) =>
        item.id === selectedItemId ? { ...item, ...updatedData } : item
      );
      setItems(updatedItems);
      setFilteredItems(updatedItems);

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
      <div className="mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Buscar producto..."
          className="input input-bordered w-full"
        />
      </div>
      <ItemList items={filteredItems} />
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

              <div className="mb-4">
                <label htmlFor="imageUrl" className="block font-medium">
                  Imagen URL:
                </label>
                <input
                  type="text"
                  id="imageUrl"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
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
