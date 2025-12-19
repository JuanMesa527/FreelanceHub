const express = require('express');
const router = express.Router();
const db = require('../database/db');

// Obtener todos los clientes
router.get('/', (req, res) => {
  try {
    const clientes = db.prepare(`
      SELECT c.*, 
        (SELECT COUNT(*) FROM proyectos WHERE cliente_id = c.id) as total_proyectos
      FROM clientes c
      ORDER BY c.fecha_creacion DESC
    `).all();
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener un cliente por ID
router.get('/:id', (req, res) => {
  try {
    const cliente = db.prepare(`
      SELECT c.*, 
        (SELECT COUNT(*) FROM proyectos WHERE cliente_id = c.id) as total_proyectos
      FROM clientes c
      WHERE c.id = ?
    `).get(req.params.id);
    
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.json(cliente);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear un nuevo cliente
router.post('/', (req, res) => {
  try {
    const { nombre, correo, estado = 'Activo' } = req.body;
    
    if (!nombre || !correo) {
      return res.status(400).json({ error: 'Nombre y correo son requeridos' });
    }
    
    const result = db.prepare(`
      INSERT INTO clientes (nombre, correo, estado) VALUES (?, ?, ?)
    `).run(nombre, correo, estado);
    
    const nuevoCliente = db.prepare('SELECT * FROM clientes WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(nuevoCliente);
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'El correo ya está registrado' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Actualizar un cliente
router.put('/:id', (req, res) => {
  try {
    const { nombre, correo, estado } = req.body;
    const { id } = req.params;
    
    const clienteExistente = db.prepare('SELECT * FROM clientes WHERE id = ?').get(id);
    if (!clienteExistente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    
    db.prepare(`
      UPDATE clientes SET nombre = ?, correo = ?, estado = ? WHERE id = ?
    `).run(
      nombre || clienteExistente.nombre,
      correo || clienteExistente.correo,
      estado || clienteExistente.estado,
      id
    );
    
    const clienteActualizado = db.prepare('SELECT * FROM clientes WHERE id = ?').get(id);
    res.json(clienteActualizado);
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'El correo ya está registrado' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Eliminar un cliente
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const cliente = db.prepare('SELECT * FROM clientes WHERE id = ?').get(id);
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    
    db.prepare('DELETE FROM clientes WHERE id = ?').run(id);
    res.json({ message: 'Cliente eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
