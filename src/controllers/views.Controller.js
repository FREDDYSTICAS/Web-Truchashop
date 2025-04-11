const Producto = require("../models/Producto");

exports.renderHome = async (req, res) => {
  const productos = await Producto.find();
  res.render("index", { productos });
};

exports.renderPanel = async (req, res) => {
  const productos = await Producto.find();
  res.render("panel", { productos });
};