const { response } = require("express");
const express = require("express");
// const mongoose = require("mongoose");
const router = express.Router();
const Pelicula = require("../models/modelo-pelicula");
const Usuario = require("../models/modelo-usuario");
// const checkAuth = require("../middleware/check-auth"); // (1) Importamos middleware de autorización

router.get("/", async (req, res, next) => {
  let peliculas;
  try {
    peliculas = await Pelicula.find({});
    // peliculas = await Pelicula.find({}).populate("usuarios");
  } catch (error) {
    const err = new Error("Ha ocurrido un error en la recuperación de datos");
    error.code = 500;
    return next(err);
  }
  res.status(200).json({
    mensaje: "Listado de todas las peliculas",
    peliculas: peliculas,
  });
});

//* Recuperar películas por id
router.get("/:id", async (req, res, next) => {
  const idPeliculas = req.params.id;
  let pelicula;
  try {
    pelicula = await Pelicula.findById(idPeliculas);
  } catch (error) {
    const err = new Error("Ha ocurrido un error en la recuperación de datos");
    error.code = 500;
    return next(err);
  }
  if (!pelicula) {
    const error = new Error(
      "No se ha podido encontrar una pelicula con el id proporcionado"
    );
    error.code = 404;
    return next(error);
  }
  res.status(200).json({
    mensaje: "Película encontrada",
    pelicula: pelicula,
  });
});

//* Crear nueva pelicula
router.post("/", async (req, res, next) => {
  const { nombre, anyo, duration, genero } = req.body;
  let compruebaPelicula;

  try {
    compruebaPelicula = await Pelicula.findOne({ nombre });
  } catch (err) {
    const error = new Error(err);
    error.code = 500;
    return next(error);
  }

  if (compruebaPelicula) {
    const error = new Error("Ya existe una película con ese nombre.");
    error.code = 401;
    return next(error);
  }

  const nuevaPelicula = new Pelicula({
    nombre,
    anyo,
    duration,
    genero,
  });

  try {
    await nuevaPelicula.save(); // Guardar en MongoDB Atlas
  } catch (error) {
    const err = new Error(
      "No ha podido añadirse, fallo al conectar al servidor"
    );
    err.code = 500;
    return next(err);
  }
  res.status(201).json({
    mensaje: "Pelicula añadida con exito.",
    pelicula: nuevaPelicula,
  });
});

// * Modificar una pelicula
router.patch("/:id", async (req, res, next) => {
  const idPelicula = req.params.id;
  const camposPorCambiar = req.body;
  let peliculaBuscar;
  try {
    peliculaBuscar = await Pelicula.findByIdAndUpdate(
      idPelicula,
      camposPorCambiar,
      {
        new: true,
        runValidators: true,
      }
    ); // (1) Localizamos y actualizamos a la vez la película en la BDD
  } catch (error) {
    res.status(404).json({
      mensaje: "No se han podido actualizar los datos del docente",
      error: error.message,
    });
  }

  res.status(200).json({
    mensaje: "Datos de película modificados",
    pelicula: peliculaBuscar,
  });
});
// * Eliminar una pelicula por su id
router.delete("/:id", async (req, res, next) => {
  let eliminarPelicula;
  try {
    eliminarPelicula = await Pelicula.findByIdAndDelete(req.params.id);
  } catch (err) {
    const error = new Error(
      "Ha habido algún error. No se han podido eliminar los datos"
    );
    error.code = 500;
    return next(error);
  }
  res.json({
    mensaje: "Película eliminada",
    mostrarPeliculaEliminada: eliminarPelicula,
  });
});
router.get("/buscar", async (req, res, next) => {
  const search = req.params.busca;
  let peliculas;
  try {
    peliculas = await Pelicula.find({
      nombre: { $regex: search, $options: "i" },
    });
  } catch (err) {
    const error = new Error("Ha ocurrido un error en la recuperación de datos");
    error.code = 500;
    return next(error);
  }
  res
    .status(200)
    .json({ mensaje: "Peliculas encontrados", peliculas: peliculas });
});

module.exports = router;
