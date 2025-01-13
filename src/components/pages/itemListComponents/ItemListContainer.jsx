import { useState, useEffect } from "react";
import { ItemList } from "./ItemList";
import { useParams } from "react-router-dom";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../configFirebase";
import { products } from "../../../products"; // Suponiendo que los productos están en un archivo 'products.js'

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

    // Cargar productos de Firebase
    getDocs(consulta).then((snapshot) => {
      const fetchedItems = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setItems(fetchedItems);
    });
  }, [categoryName]);

  // Función para agregar productos desde el archivo products.js
  const agregarProductosDesdeFile = async () => {
    try {
      // Recorremos todos los productos del archivo products.js
      for (const product of products) {
        // Verificamos si el producto ya existe en Firebase por el título
        const existingProduct = items.find(
          (item) => item.title === product.title
        );

        // Si el producto no existe en Firebase, lo agregamos
        if (!existingProduct) {
          await addDoc(collection(db, "products"), {
            title: product.title,
            price: product.price,
            stock: product.stock,
            category: product.category,
          });
          console.log(`Producto agregado: ${product.title}`);
        } else {
          console.log(`Producto ya existe: ${product.title}`);
        }
      }
      // Actualizamos la lista de productos después de agregar los nuevos
      const itemsCollection = collection(db, "products");
      const snapshot = await getDocs(itemsCollection);
      const fetchedItems = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setItems(fetchedItems);

      alert("Productos agregados correctamente.");
    } catch (error) {
      console.error("Error al agregar productos:", error);
      alert("Hubo un error al agregar los productos.");
    }
  };

  // Función para agregar un producto manualmente
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

  return (
    <div className="container mx-auto px-4">
      <ItemList items={items} />

      {/* Formulario para agregar productos manualmente */}
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

      {/* Botón para agregar productos desde el archivo products.js */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">
          Agregar Productos desde Archivo
        </h2>
        <button onClick={agregarProductosDesdeFile} className="btn btn-primary">
          Agregar Productos Desde Archivo
        </button>
      </div>
    </div>
  );
};

export default ItemListContainer;
