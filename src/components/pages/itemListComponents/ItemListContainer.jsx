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
  const [newImage, setNewImage] = useState(null); // Estado para la imagen
  const [stockOriginal, setStockOriginal] = useState(0); // Para almacenar el stock original del producto

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

    // Verificamos si el producto ya existe
    if (items.some((item) => item.title === newTitle)) {
      alert("Este producto ya existe en la base de datos.");
      return;
    }

    try {
      // Subir la imagen a Firebase Storage si está disponible
      let imageUrl = "";
      if (newImage) {
        const storage = getStorage();
        const imageRef = ref(storage, `products/${newImage.name}`);
        await uploadBytes(imageRef, newImage);
        imageUrl = await getDownloadURL(imageRef);
      }

      // Agregar el producto a la base de datos
      await addDoc(collection(db, "products"), {
        title: newTitle,
        price: newPrice,
        stock: newStock,
        category: newCategory,
        image: imageUrl, // Guardar la URL de la imagen
      });
      alert("Producto agregado exitosamente.");

      // Limpiar los campos
      setNewTitle("");
      setNewPrice("");
      setNewStock("");
      setNewCategory("");
      setNewImage(null); // Limpiar el campo de imagen

      // Actualizar la lista de productos
      const updatedItems = [
        ...items,
        {
          title: newTitle,
          price: newPrice,
          stock: newStock,
          category: newCategory,
          image: imageUrl, // Agregar la URL de la imagen
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

    // Subir la nueva imagen si está disponible
    if (newImage) {
      const storage = getStorage();
      const imageRef = ref(storage, `products/${newImage.name}`);
      await uploadBytes(imageRef, newImage);
      const imageUrl = await getDownloadURL(imageRef);
      updatedData.image = imageUrl; // Agregar la nueva URL de la imagen
    }

    if (Object.keys(updatedData).length === 0) {
      alert("Debes seleccionar al menos un campo para actualizar.");
      return;
    }

    try {
      await updateDoc(productRef, updatedData);
      alert("Producto actualizado exitosamente.");

      // Actualizar la lista de productos
      const updatedItems = items.map((item) =>
        item.id === selectedItemId ? { ...item, ...updatedData } : item
      );
      setItems(updatedItems);

      // Limpiar los campos
      setSelectedItemId("");
      setNewTitle("");
      setNewPrice("");
      setNewStock("");
      setNewCategory("");
      setNewImage(null); // Limpiar el campo de imagen
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
      setStockOriginal(selectedProduct.stock); // Guardamos el stock original
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

          {/* Campo para seleccionar la imagen */}
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

            {/* Campo para seleccionar la imagen */}
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
