const Usuario = require('../models/usuario');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.obtenerUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.obtenerPorId(req.params.id);
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener usuario' });
  }
};

exports.crearUsuario = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const id = await Usuario.crear({ nombre, email, password: hashedPassword });
    res.status(201).json({ mensaje: 'Usuario creado', id });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear usuario' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validar que email y password estén presentes
    if (!email || !password) {
      return res.status(400).json({ mensaje: 'Email y password son requeridos' });
    }

    // Usar el método login del modelo Usuario
    const user = await Usuario.login(email, password);

    // Si el usuario no existe o la contraseña no es válida
    if (!user) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }

    // Generar token JWT
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('Token generado:', token); // Debug para ver el token

    // Respuesta con el token
    return res.json({ token });
  } catch (error) {
    console.error('Error en el proceso de login:', error); // Log de error
    return res.status(500).json({ mensaje: 'Error en el servidor' });
  }
};