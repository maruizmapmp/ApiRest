const db = require('../config/database');
const redis = require('../config/redis');
const bcrypt = require('bcrypt');

class Usuario {
  static async obtenerPorId(id) {
    const cacheKey = `usuario:${id}`;
    // Log para verificar intento de lectura de Redis
    console.log('Buscando en Redis:', cacheKey);
    const cachedUser = await redis.get(cacheKey);

    if (cachedUser) {
      console.log('Usuario obtenido de Redis:', cachedUser)
      return JSON.parse(cachedUser);
    }

    const [rows] = await db.query('SELECT * FROM usuarios WHERE id = ?', [id]);
    if (rows.length > 0) {
      await redis.set(cacheKey, JSON.stringify(rows[0]), 'EX', 3600);
      return rows[0];
    }
    return null;
  }

  static async crear(datos) {
    const [result] = await db.query('INSERT INTO usuarios SET ?', datos);
    return result.insertId;
  }
  static async login(email, password) {
    // Buscar usuario por email
    const [users] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    
    if (users.length === 0) {
      // Si no se encuentra el usuario, devolver null
      return null;
    }

    const user = users[0];
    
    // Verificar la contraseña
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      // Si la contraseña no es válida, devolver null
      return null;
    }

    // Si todo es válido, devolver el usuario
    return user;
  }
}

  // Implementar otros métodos CRUD según sea necesario


module.exports = Usuario;