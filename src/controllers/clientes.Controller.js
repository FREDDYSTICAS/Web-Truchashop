const Cliente = require("../models/Cliente");

exports.registrarCliente = async (req, res) => {
  try {
    const nuevoCliente = new Cliente({
      tipoDocumento: req.body.tipoDocumento,
      numeroDocumento: req.body.numeroDocumento,
      nombreCompleto: req.body.nombreCompleto,
      numeroContacto: req.body.numeroContacto,
      correoElectronico: req.body.correoElectronico,
      newsletter: req.body.newsletter === 'on',
      fechaRegistro: new Date()
    });

    await nuevoCliente.save();
    res.status(201).json({ success: true, message: "Cliente registrado exitosamente" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al registrar cliente", error: error.message });
  }
};

exports.listarClientes = async (req, res) => {
  const clientes = await Cliente.find().sort({ fechaRegistro: -1 });
  res.json(clientes);
};

exports.obtenerCliente = async (req, res) => {
  const cliente = await Cliente.findById(req.params.id);
  if (!cliente) return res.status(404).json({ message: 'Cliente no encontrado' });
  res.json(cliente);
};

exports.crearCliente = async (req, res) => {
  try {
    const cliente = new Cliente(req.body);
    await cliente.save();
    res.status(201).json(cliente);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.actualizarCliente = async (req, res) => {
  const cliente = await Cliente.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!cliente) return res.status(404).json({ message: 'Cliente no encontrado' });
  res.json(cliente);
};

exports.eliminarCliente = async (req, res) => {
  const cliente = await Cliente.findByIdAndDelete(req.params.id);
  if (!cliente) return res.status(404).json({ message: 'Cliente no encontrado' });
  res.json({ message: 'Cliente eliminado correctamente' });
};

exports.renderPanelClientes = async (req, res) => {
  const clientes = await Cliente.find().sort({ fechaRegistro: -1 });
  res.render("panel-clientes", { clientes });
};