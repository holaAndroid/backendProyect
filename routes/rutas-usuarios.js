const { response } = require("express");
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const Usuario = require("../models/modelo-usuario");

const checkAuth = require("../middleware/check-auth");

router.post("/login", async (req, res, next) => {
  const { email, password } = req.body;
  let usuarioExiste;
  try {
    usuarioExiste = await Usuario.findOne({
      // ? (1) Comprobación de email
      email: email,
    });
  } catch (error) {
    const err = new Error(
      "No se ha podido realizar la operación. Pruebe más tarde"
    );
    err.code = 500;
    return next(err);
  }
  // ? ¿Qué pasa si el usuario no existe?
  if (!usuarioExiste) {
    const error = new Error(
      "No se ha podido identificar al usuario. Credenciales erróneos 2"
    );
    error.code = 422; // ! 422: Datos de usuario inválidos
    return next(error);
  }
  // ? Si existe el usuario, ahora toca comprobar las contraseñas.
  let esValidoElPassword = false;
  esValidoElPassword = bcrypt.compareSync(password, usuarioExiste.password);
  if (!esValidoElPassword) {
    const error = new Error(
      "No se ha podido identificar al usuario. Credenciales erróneos"
    );
    error.code = 401; // !401: Fallo de autenticación
    return next(error);
  }
  // ? Usuario con los credeciales correctos.
  // ? Creamos ahora el token
  // ! CREACIÓN DEL TOKEN
  let token;
  try {
    token = jwt.sign(
      {
        userId: usuarioExiste.id,
        email: usuarioExiste.email,
      },
      "clave_supermegasecreta",
      {
        expiresIn: "1h",
      }
    );
  } catch (error) {
    const err = new Error("El proceso de login ha fallado");
    err.code = 500;
    return next(err);
  }
  res.status(201).json({
    mensaje: "Usuario ha entrado con éxito en el sistema",
    userId: usuarioExiste.id,
    email: usuarioExiste.email,
    token: token,
  });
});
router.post("/", async (req, res, next) => {
  const { nombre, email, password, peliculas } = req.body;
  let existeUsuario;
  try {
    existeUsuario = await Usuario.findOne({
      email: email,
    });
  } catch (err) {
    const error = new Error(err);
    error.code = 500;
    return next(error);
  }

  if (existeUsuario) {
    const error = new Error("Ya existe un usuario con ese e-mail.");
    error.code = 401;
    return next(error);
  } else {
    let hashedPassword;

    try {
      hashedPassword = await bcrypt.hash(password, 12);
    } catch (error) {
      console.log(error);
      const err = new Error("No se han podido guardar los datos");
      err.code = 500;
      return next(err);
    }
    console.log(hashedPassword);
    const nuevoUsuario = new Usuario({
      nombre,
      email,
      password: hashedPassword,
      peliculas: [],
    });
    try {
      await nuevoUsuario.save();
    } catch (error) {
      const err = new Error("No se han podido guardar los datos");
      err.code = 500;
      return next(err);
    }
    try {
      token = jwt.sign(
        {
          userId: nuevoUsuario.id,
          email: nuevoUsuario.email,
        },
        "clave_supermegasecreta",
        {
          expiresIn: "1h",
        }
      );
    } catch (error) {
      const err = new Error("El proceso de alta ha fallado");
      err.code = 500;
      return next(err);
    }
    res.status(201).json({
      userId: nuevoUsuario.id,
      email: nuevoUsuario.email,
      token: token,
    });
  }
});

// res.status(201).json({
//   usuario: nuevoUsuario,

router.use(checkAuth)

router.get("/", async (req, res, next) => {
  let usuarios;
  try {
    usuarios = await Usuario.find({}, "-password");
  } catch (err) {
    const error = new Error("Ha ocurrido un error en la recuperación de datos");
    error.code = 500;
    return next(error);
  }
  res.status(200).json({
    mensaje: "Todos los usuarios",
    usuarios: usuarios,
  });
});

router.get("/:id", async (req, res, next) => {
  const idUsuario = req.params.id;
  let usuario;
  try {
    usuario = await Usuario.findById(idUsuario);
  } catch (err) {
    const error = new Error(
      "Ha habido algún error. No se han podido recuperar los datos"
    );
    error.code = 500;
    return next(error);
  }
  if (!usuario) {
    const error = new Error(
      "No se ha podido encontrar un usuario con el id proporcionado"
    );
    error.code = 404;
    return next(error);
  }
  res.json({
    mensaje: "Usuario encontrado",
    usuario: usuario,
  });
});
router.use(checkAuth)

router.patch("/:id", async (req, res, next) => {
  const idUsuario = req.params.id;
  const camposPorCambiar = req.body;
  let usuarioBuscar;
  try {
    usuarioBuscar = await Usuario.findByIdAndUpdate(
      idUsuario,
      camposPorCambiar,
      {
        new: true,
        runValidators: true,
      }
    ); // (1) Localizamos y actualizamos a la vez el usuario en la BDD
  } catch (error) {
    res.status(404).json({
      mensaje: "No se han podido actualizar los datos del usuario",
      error: error.message,
    });
  }
  res.status(200).json({
    mensaje: "Datos de usuario modificados",
    usuario: usuarioBuscar,
  });
});

// * Eliminar un usuario
router.delete("/:id", async (req, res, next) => {
  let usuario;
  try {
    usuario = await Usuario.findByIdAndDelete(req.params.id);
  } catch (err) {
    const error = new Error(
      "Ha habido algún error. No se han podido eliminar los datos"
    );
    error.code = 500;
    return next(error);
  }
  res.json({
    mensaje: "Usuario eliminado",
    usuario: usuario,
  });
});

// * Buscar un usuario en función del parámetro de búsqueda
router.get("/buscar/:busca", async (req, res, next) => {
  const search = req.params.busca;
  let usuarios;
  try {
    usuarios = await Usuario.find({
      nombre: { $regex: search, $options: "i" },
    });
  } catch (err) {
    const error = new Error("Ha ocurrido un error en la recuperación de datos");
    error.code = 500;
    return next(error);
  }
  res.status(200).json({ mensaje: "Usuarios encontrados", usuarios: usuarios });
});

module.exports = router;
