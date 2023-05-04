const mongoose = require("mongoose");

const peliculaSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true,
  },
  anyo: {
    type: String,
    trim: true,
  },
  duration: {
    type: String,
    trim: true,
  },
  genero: {
    type: String,
    trim: true,
  },
});

module.exports = mongoose.model("Pelicula", peliculaSchema);
