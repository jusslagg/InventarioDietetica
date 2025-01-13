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
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const ItemListContainer = () => {
  const [items, setItems] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newStock, setNewStock] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newImage, setNewImage] = useState(null);
  const [stockOriginal, setStockOriginal] = useState(0);
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
      }));
      setItems(fetchedItems);
    });
  }, [categoryName]);

  // Función para agregar productos
  const agregarProducto = async (e) => {
    e.preventDefault();

    if (items.some((item) => item.title === newTitle)) {
      alert("Este producto ya existe en la base de datos.");
      return;
    }

    try {
      let imageUrl = "";
      if (newImage) {
        const storage = getStorage();
        const imageRef = ref(storage, `products/${newImage.name}`);
        await uploadBytes(imageRef, newImage);
        imageUrl = await getDownloadURL(imageRef);
      }

      await addDoc(collection(db, "products"), {
        title: newTitle,
        price: newPrice,
        stock: newStock,
        category: newCategory,
        image: imageUrl,
      });
      alert("Producto agregado exitosamente.");

      setNewTitle("");
      setNewPrice("");
      setNewStock("");
      setNewCategory("");
      setNewImage(null);

      const updatedItems = [
        ...items,
        {
          title: newTitle,
          price: newPrice,
          stock: newStock,
          category: newCategory,
          image: imageUrl,
        },
      ];
      setItems(updatedItems);
    } catch (error) {
      console.error("Error al agregar el producto:", error);
    }
  };

  // Función para editar productos
  const editarProducto = async (e) => {
    e.preventDefault();

    if (!selectedItemId) {
      alert("Por favor, selecciona un producto para editar.");
      return;
    }

    const product = items.find((item) => item.id === selectedItemId);
    const currentStock = product.stock;

    if (newStock < currentStock) {
      alert("El stock no puede ser menor que el valor actual.");
      return;
    }

    const productRef = doc(db, "products", selectedItemId);
    const updatedData = {};

    if (newTitle) updatedData.title = newTitle;
    if (newPrice) updatedData.price = newPrice;
    if (newStock) updatedData.stock = newStock;
    if (newCategory) updatedData.category = newCategory;

    if (newImage) {
      const storage = getStorage();
      const imageRef = ref(storage, `products/${newImage.name}`);
      await uploadBytes(imageRef, newImage);
      const imageUrl = await getDownloadURL(imageRef);
      updatedData.image = imageUrl;
    }

    if (Object.keys(updatedData).length === 0) {
      alert("Debes seleccionar al menos un campo para actualizar.");
      return;
    }

    try {
      await updateDoc(productRef, updatedData);
      alert("Producto actualizado exitosamente.");

      const updatedItems = items.map((item) =>
        item.id === selectedItemId ? { ...item, ...updatedData } : item
      );
      setItems(updatedItems);

      setSelectedItemId("");
      setNewTitle("");
      setNewPrice("");
      setNewStock("");
      setNewCategory("");
      setNewImage(null);
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
      setNewPrice(selectedProduct.price);
      setNewStock(selectedProduct.stock);
      setNewCategory(selectedProduct.category);
      setStockOriginal(selectedProduct.stock);
    }
  };

  // Filtrar los productos por nombre
  const filteredItems = items.filter((item) =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4">
      {/* Campo de búsqueda */}
      <div className="mb-4">
        <label htmlFor="search" className="block font-medium">
          Buscar Producto:
        </label>
        <input
          type="text"
          id="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input input-bordered w-full"
          placeholder="Buscar por nombre..."
        />
      </div>

      {/* Mostrar los productos filtrados */}
      <ItemList items={filteredItems} />

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

          <div className="mb-4">
            <label htmlFor="image" className="block font-medium">
              Imagen:
            </label>
            <input
              type="file"
              id="image"
              onChange={(e) => setNewImage(e.target.files[0])}
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

            <div className="mb-4">
              <label htmlFor="image" className="block font-medium">
                Nueva Imagen:
              </label>
              <input
                type="file"
                id="image"
                onChange={(e) => setNewImage(e.target.files[0])}
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
