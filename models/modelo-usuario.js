const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const usuarioSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true,
    minLength: 3,
    maxLength: 50,
  },
  email: {
    type: String,
    trim: true,
    unique: true,
  },
  password: {
    type: String,
    trim: true,
  },
  peliculas: [
    {
      type: mongoose.Types.ObjectId,
      ref: "peliculas",
    },
  ],
});

usuarioSchema.plugin(uniqueValidator);
module.exports = mongoose.model("Usuario", usuarioSchema);
