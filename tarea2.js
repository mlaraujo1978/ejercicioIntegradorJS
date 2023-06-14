/*
En el archivo tarea2.js podemos encontrar un código de un supermercado que vende productos.
El código contiene 
    - una clase Producto que representa un producto que vende el super
    - una clase Carrito que representa el carrito de compras de un cliente
    - una clase ProductoEnCarrito que representa un producto que se agrego al carrito
    - una función findProductBySku que simula una base de datos y busca un producto por su sku
El código tiene errores y varias cosas para mejorar / agregar
​
Ejercicios
1) Arreglar errores existentes en el código
    a) Al ejecutar agregarProducto 2 veces con los mismos valores debería agregar 1 solo producto con la suma de las cantidades.    
    b) Al ejecutar agregarProducto debería actualizar la lista de categorías solamente si la categoría no estaba en la lista.
    c) Si intento agregar un producto que no existe debería mostrar un mensaje de error.
​
2) Agregar la función eliminarProducto a la clase Carrito
    a) La función eliminarProducto recibe un sku y una cantidad (debe devolver una promesa)
    b) Si la cantidad es menor a la cantidad de ese producto en el carrito, se debe restar esa cantidad al producto
    c) Si la cantidad es mayor o igual a la cantidad de ese producto en el carrito, se debe eliminar el producto del carrito
    d) Si el producto no existe en el carrito, se debe mostrar un mensaje de error
    e) La función debe retornar una promesa
​
3) Utilizar la función eliminarProducto utilizando .then() y .catch()

*/

// Cada producto que vende el super es creado con esta clase
class Producto {
  constructor(sku, nombre, precio, categoria, stock) {
    this.sku = sku;
    this.nombre = nombre;
    this.categoria = categoria;
    this.precio = precio;
    this.stock = stock === undefined ? 10 : stock;
  }
}

// Creo todos los productos que vende mi super
const queso = new Producto("KS944RUR", "Queso", 10, "lacteos", 4);
const gaseosa = new Producto("FN312PPE", "Gaseosa", 5, "bebidas");
const cerveza = new Producto("PV332MJ", "Cerveza", 20, "bebidas");
const arroz = new Producto("XX92LKI", "Arroz", 7, "alimentos", 20);
const fideos = new Producto("UI999TY", "Fideos", 5, "alimentos");
const lavandina = new Producto("RT324GD", "Lavandina", 9, "limpieza");
const shampoo = new Producto("OL883YE", "Shampoo", 3, "higiene", 50);
const jabon = new Producto("WE328NJ", "Jabon", 4, "higiene", 3);

// Genero un listado de productos. Simulando base de datos
const productosDelSuper = [
  queso,
  gaseosa,
  cerveza,
  arroz,
  fideos,
  lavandina,
  shampoo,
  jabon,
];

// Cada cliente que venga a mi super va a crear un carrito
class Carrito {
  // Al crear un carrito, empieza vació
  constructor() {
    this.precioTotal = 0;
    this.productos = [];
    this.categorias = [];
  }

//función que agrega @{cantidad} de productos con @{sku} al carrito
  async agregarProducto(sku, cantidad) {
    try {
      const producto = await findProductBySku(sku); // Busco el producto en la "base de datos"
      console.log(`\nAgregando ${cantidad} unidades... del SKU:|${sku}|`);
      const printControlStock = stockControl(sku, cantidad);
      const foundProduct = this.productos.find(
        (product) => product.sku === sku
      );
      const foundCategory = this.categorias.find(
        (category) => category === producto.categoria
      );

      if (this.productos.length == 0 || !foundProduct) {
        if (producto.stock < cantidad) {
          cantidad = producto.stock;
        }
        const nuevoProducto = new ProductoEnCarrito(
          sku,
          producto.nombre,
          cantidad
        );
        this.productos.push(nuevoProducto);
        this.precioTotal += producto.precio * cantidad;

        if (!foundCategory) {
          this.categorias.push(producto.categoria);
        }
      } else {
        if (foundProduct) {
          if (producto.stock < cantidad) {
            cantidad = producto.stock;
          }
          foundProduct.cantidad += cantidad;
          this.precioTotal += producto.precio * cantidad;
        }
      }
      stockUpdate(sku, -cantidad);
      printProductInCart(this.productos, this.categorias, this.precioTotal);
    } catch (error) {
      console.log(error);
    }
  }
// función que elimina @{cantidad} de productos con @{sku} al carrito
  async eliminarProducto(sku, cantidad) {
    const foundProduct = await findProductBySkuInCart(sku);
    const foundProductMarket = await findProductBySku(sku);
    
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (foundProduct) {
          console.log(
            `\nEliminando del carrito... ${cantidad} unidades, del SKU: ${sku}`
          );

          if (foundProduct.cantidad < cantidad) {
            cantidad = foundProduct.cantidad;
            console.log(`<<<<  | Hay solo "${cantidad}" unidad/es de ${foundProduct.nombre}|SKU:${sku}.| Se eliminan "${cantidad}" unidad/es... >>>>`);
            const index = this.productos.findIndex(function (foundProduct) {
              return foundProduct.sku === sku;
            });
            this.productos.splice(index, 1);
            this.categorias = categoriesUpdate(this.productos);
          } else {
            foundProduct.cantidad -= cantidad;
          }
          this.precioTotal -= cantidad * foundProductMarket.precio;
          stockUpdate(sku, cantidad);
          printProductInCart(this.productos, this.categorias, this.precioTotal);

          resolve(
            `\n <<<<  | Carrito actualizado. Se eliminaron ${cantidad} unidad/es de ${foundProduct.nombre} |SKU:${sku}| >>>>`
          );
        } else {
          reject(
            error            
          );
        }
      }, 1000);
    });
  }
}

// Cada producto que se agrega al carrito es creado con esta clase
class ProductoEnCarrito {
  constructor(sku, nombre, cantidad) {
    this.sku = sku;
    this.nombre = nombre;
    this.cantidad = cantidad;
  }
}

// Función que busca un producto por su sku en "la base de datos"
function findProductBySku(sku) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const foundProduct = productosDelSuper.find(
        (product) => product.sku === sku
      );
      if (foundProduct) {
        resolve(foundProduct);
      } else {
        reject(`\n[[[ ERROR: || Product ${sku} not found. || ]]]`);
      }
    }, 1000);
  });
}
// Función que busca un producto por su sku en "en el carrito"
function findProductBySkuInCart(sku) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const foundProduct = carrito.productos.find(
        (product) => product.sku === sku
      );
      if (foundProduct) {
        resolve(foundProduct);
      } else {
        reject(
          `\n[[[ ERROR: || Producto SKU: ${sku} no encontrado en el carrito. || ]]]`
        );
      }
    }, 1000);
  });
}
// Función que controla el stock disponible vs. la cantidad solicitada del producto
function stockControl(sku, cantidad) {
  const foundProduct = productosDelSuper.find((product) => product.sku === sku);
  if (foundProduct.stock >= cantidad) {
    console.log(
      "\n<< El stock disponible del producto " +
        foundProduct.nombre +
        "|sku: " +
        foundProduct.sku +
        ", es de " +
        foundProduct.stock +
        " unidades. >>"
    );
  } else {
    console.log(
      "\n<< No hay suficiente stock disponible de " +
        foundProduct.nombre +
        "|sku: " +
        foundProduct.sku +
        ", como máximo se agregaran " +
        foundProduct.stock +
        " unidad/es. >>"
    );
  }
}
// Función que actualiza el stock del super
function stockUpdate(sku, cantidad) {
  const foundProduct = productosDelSuper.find((product) => product.sku === sku);
  foundProduct.stock += cantidad;
  console.log(
    "\n*** Se actualiza el stock del producto " +
      foundProduct.nombre +
      " ahora hay disponible: " +
      foundProduct.stock +
      " unidad/es. ***"
  );
}
// Función que actualiza las categorias del carrito cuando se elimina un producto
function categoriesUpdate(productsInCart) {
  const categoriesSet = new Set(); // Con el set evito duplicados 

  productsInCart.forEach(({ sku }) => {
    const foundProduct = productosDelSuper.find(
      (product) => product.sku === sku
    );
    categoriesSet.add(foundProduct.categoria);
  });
  return Array.from(categoriesSet);
}
// Función que imprime el carrito de compras
function printProductInCart(products, categories, totalPrice) {
  console.log("\n|| CARRITO DE COMPRAS: ");
  console.log(products);
  console.log("|| Precio Total a Pagar: $ " + totalPrice)+" ||";
  console.log("|| Categoria/s de los productos: " + categories)+" ||\n";
}

const carrito = new Carrito();
carrito.agregarProducto("WE328NJ", 1);
carrito.agregarProducto("WE328NJ", 3);
carrito.agregarProducto("OL883YE", 7);
carrito
  .eliminarProducto("WE328NJ", 4)
  .then((resultado) => console.log(resultado))
  .catch((error) => console.log(error));
carrito
  .eliminarProducto("WE3w28NJ", 2)
  .then((resultado) => console.log(resultado))
  .catch((error) => console.log(error));
carrito.agregarProducto("PV332MJ", 5);