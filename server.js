// index.js
const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
/* const corsOptions = {
  origin: "http://localhost:5000",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
}; */
require("dotenv").config();

const app = express();
app.use(cors());

app.use(express.json());

const rutasUsuarios = require("./routes/rutas-usuarios");
app.use("/usuarios", rutasUsuarios);

const rutasPeliculas = require("./routes/rutas-peliculas");
app.use("/peliculas", rutasPeliculas);

app.use((req, res) => {
  // Middleware que se ejecuta cuando el servidor no tiene la ruta que se ha enviado desde el cliente
  res.status(404);
  res.json({
    mensaje: "Información no encontrada",
  });
});

mongoose
  .connect(process.env.MONGO_DB_URI)
  .then(() => {
    console.log("💯 Conectado con éxito a Atlas");
    app.listen(process.env.PORT || 5001, () =>
      console.log(`🧏‍♀️ Escuchando en puerto ${process.env.PORT}`)
    );
  })
  .catch((error) => console.log(error));
