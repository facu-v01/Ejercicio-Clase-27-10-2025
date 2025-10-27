require("dotenv").config()
const express = require("express")
import mongoose from "mongoose"
const { connectToDatabase } = require("./db")
const { Categoria } = require("./models/Categoria")
const { Producto } = require("./models/Producto")

const app = express()
const PORT = process.env.PORT || 4000

app.use(express.json())

// Conección a base de datos
const connectionString = "mongodb+srv://facundoandreassi_db_user:admin@clase-27-10-2025.ftc62pb.mongodb.net/"

async function connectToDatabase() {
    if (!connectionString) {
        throw new Error("No hay un string de conexión a la base de datos")
    }

    await mongoose.connect(connectionString)

    console.log("Conexión con la base de datos exitosa.")
}

// ENDPOINTS GET
app.get("/", (req, res) => {
    res.send("Bienvenido a la API de Hermanos Jota")
})

app.get("/api/categorias", async (req, res, next) => {

    try {

        const categorias = await Categoria.find()
        res.status(200).json(categorias)

    } catch (error) {

        console.error("Error al obtener las categorias:", error.message)
        next(error)

    }
})

app.get("/api/productos", async (req, res, next) => {

    try {

        const productos = await Producto.find().populate("categoria")
        res.status(200).json(productos)

    } catch (error) {

        console.error("Error al obtener los productos:", error.message)
        next(error)

    }
})

app.get("/api/productos/:id", async (req, res, next) => {

    try {
        
        const productoId = req.params.id
        console.log("Buscando producto con ID:", productoId)

        const producto = await Producto.findById(productoId).populate("categoria")

        if (!producto) {
            const error = new Error("Producto no encontrado")
            error.status = 404
            return next(error)
        }

        res.status(200).json(producto)

    } catch (error) {

        console.error("Error al buscar el producto por ID:", error.message)
        error.status = 400
        next(error)

    }
})


// ENDPOINTS POST
app.post("/api/categorias", async (req, res, next) => {
    try {
        const datosCategoriaNueva = req.body
        console.log("Datos recibidos para agregar categoria:", datosCategoriaNueva)

        const nuevaCategoria = new Categoria(datosCategoriaNueva)

        const categoriaGuardada = await nuevaCategoria.save()

        res.status(200).json({
            message: "Producto agregado exitosamente",
            producto: categoriaGuardada
        })

    } catch (error) {
        console.error("Error al agregar categoria:", error.message)
        error.status(400)
        next(error)
    }
})

app.post("/api/productos", async (req, res, next) => {
    try {
        const datosProductoNuevo = req.body
        console.log("Datos recibidos para agregar producto:", datosProductoNuevo)

        const nuevoProducto = new Producto(datosProductoNuevo)

        const productoGuardado = await nuevoProducto.save()

        res.status(200).json({
            message: "Producto agregado exitosamente",
            producto: productoGuardado
        })

    } catch (error) {
        console.error("Error al agregar producto:", error.message)
        error.status(400)
        next(error)
    }
})

// ENDPOINTS PUT
app.put("/api/productos/:id", async (req, res, next) => {
    try {
        const productoId = req.params.id
        const datosActualizados = req.body
        console.log(`Actualizando los datos del producto con ID ${productoId} con datos:`, datosActualizados)

        const productoActualizado = await Producto.findByIdAndUpdate(
            productoId,
            datosActualizados,
            { new: true, runValidators: true }
        )

        if (!productoActualizado) {
            const error = new Error("Producto no encontrado para actualizar")
            error.status(404)
            return next(error)
        }

        res.status(200).json({
            message: "Producto actualizado con éxitos",
            producto: productoActualizado
        })

    } catch (error) {
        console.error("Error al actualizar el producto:", error.message)
        error.status(400)
        next(error)
    }
})

// ENDPOINTS DELETE
app.delete("/api/productos/:id", async (req, res, next) => {
    try {
        const productoId = req.params.id
        console.log("Eliminando producto con ID:", productoId)

        const productoEliminado = await Producto.findByIdAndDelete(productoId)

        if (!productoEliminado) {
            const error = new Error("No se encontró el producto a eliminar")
            error.status(404)
            return next(error)
        }

        res.status(200).json({
            message: "Producto eliminado exitosamente",
            producto: productoEliminado
        })

    } catch (error) {
        console.error("Error al eliminar el producto:", error.message)
        error.status(400)
        next(error)
    }
})


// Middleware páginas no encontradas (404)
app.use((req, res, next) => {
    const error = new Error(`No se encontró la ruta ${req.originalUrl}`)
    error.status(404)
    next(error)
})

// Middleware de manejo de errores centralizado
app.use((err, req, res, next) => {
    const statusCode = err.status || 500
    res.status(statusCode).json({
        error: {
            message: err.message || "Error interno del servidor",
            stack: process.env.NODE_ENV === "development" ? err.stack : undefined
        }
    })
})

connectToDatabase()
    .then(() => {
        console.log("Base de datos conectada correctamente.")

        app.listen(PORT, () => {
            console.log(`Servidor corriendo en http://localhost:${PORT}`)
        })
    })
    .catch(error => {
        console.error("Error al conectar a la base de datos:", error.message)
        process.exit(1)
    })