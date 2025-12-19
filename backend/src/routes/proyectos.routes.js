const express = require('express');
const router = express.Router();
const db = require('../database/db');
const alertasService = require('../services/alertas.service');

// Obtener todos los proyectos con información del cliente
router.get('/', (req, res) => {
  try {
    const { estado, cliente_id } = req.query;
    
    let query = `
      SELECT p.*, c.nombre as cliente_nombre, c.correo as cliente_correo
      FROM proyectos p
      INNER JOIN clientes c ON p.cliente_id = c.id
      WHERE 1=1
    `;
    const params = [];
    
    if (estado) {
      query += ' AND p.estado = ?';
      params.push(estado);
    }
    
    if (cliente_id) {
      query += ' AND p.cliente_id = ?';
      params.push(cliente_id);
    }
    
    query += ' ORDER BY p.fecha_vencimiento ASC';
    
    const proyectos = db.prepare(query).all(...params);
    
    // Agregar información de días restantes
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const proyectosConDias = proyectos.map(p => {
      const fechaVencimiento = new Date(p.fecha_vencimiento);
      const diffTime = fechaVencimiento.getTime() - hoy.getTime();
      const diasRestantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return {
        ...p,
        dias_restantes: diasRestantes,
        proximo_vencer: diasRestantes <= 7 && diasRestantes >= 0,
        urgente: diasRestantes <= 3 && diasRestantes >= 0
      };
    });
    
    res.json(proyectosConDias);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener proyectos próximos a vencer
router.get('/alertas', (req, res) => {
  try {
    const proyectos = alertasService.obtenerProyectosProximosAVencer();
    res.json(proyectos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener un proyecto por ID
router.get('/:id', (req, res) => {
  try {
    const proyecto = db.prepare(`
      SELECT p.*, c.nombre as cliente_nombre, c.correo as cliente_correo
      FROM proyectos p
      INNER JOIN clientes c ON p.cliente_id = c.id
      WHERE p.id = ?
    `).get(req.params.id);
    
    if (!proyecto) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }
    res.json(proyecto);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear un nuevo proyecto
router.post('/', (req, res) => {
  try {
    const { nombre, cliente_id, fecha_inicio, fecha_vencimiento, estado = 'Pendiente', presupuesto } = req.body;
    
    if (!nombre || !cliente_id || !fecha_inicio || !fecha_vencimiento) {
      return res.status(400).json({ 
        error: 'Nombre, cliente, fecha de inicio y fecha de vencimiento son requeridos' 
      });
    }
    
    // Verificar que el cliente existe
    const cliente = db.prepare('SELECT * FROM clientes WHERE id = ?').get(cliente_id);
    if (!cliente) {
      return res.status(400).json({ error: 'El cliente especificado no existe' });
    }
    
    const result = db.prepare(`
      INSERT INTO proyectos (nombre, cliente_id, fecha_inicio, fecha_vencimiento, estado, presupuesto) 
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(nombre, cliente_id, fecha_inicio, fecha_vencimiento, estado, presupuesto || null);
    
    const nuevoProyecto = db.prepare(`
      SELECT p.*, c.nombre as cliente_nombre
      FROM proyectos p
      INNER JOIN clientes c ON p.cliente_id = c.id
      WHERE p.id = ?
    `).get(result.lastInsertRowid);
    
    res.status(201).json(nuevoProyecto);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar un proyecto
router.put('/:id', (req, res) => {
  try {
    const { nombre, cliente_id, fecha_inicio, fecha_vencimiento, estado, presupuesto } = req.body;
    const { id } = req.params;
    
    const proyectoExistente = db.prepare('SELECT * FROM proyectos WHERE id = ?').get(id);
    if (!proyectoExistente) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }
    
    // Si se cambia el cliente, verificar que existe
    if (cliente_id) {
      const cliente = db.prepare('SELECT * FROM clientes WHERE id = ?').get(cliente_id);
      if (!cliente) {
        return res.status(400).json({ error: 'El cliente especificado no existe' });
      }
    }
    
    db.prepare(`
      UPDATE proyectos 
      SET nombre = ?, cliente_id = ?, fecha_inicio = ?, fecha_vencimiento = ?, estado = ?, presupuesto = ?
      WHERE id = ?
    `).run(
      nombre || proyectoExistente.nombre,
      cliente_id || proyectoExistente.cliente_id,
      fecha_inicio || proyectoExistente.fecha_inicio,
      fecha_vencimiento || proyectoExistente.fecha_vencimiento,
      estado || proyectoExistente.estado,
      presupuesto !== undefined ? presupuesto : proyectoExistente.presupuesto,
      id
    );
    
    const proyectoActualizado = db.prepare(`
      SELECT p.*, c.nombre as cliente_nombre
      FROM proyectos p
      INNER JOIN clientes c ON p.cliente_id = c.id
      WHERE p.id = ?
    `).get(id);
    
    res.json(proyectoActualizado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Marcar proyecto como completado (acción rápida)
router.patch('/:id/completar', (req, res) => {
  try {
    const { id } = req.params;
    
    const proyecto = db.prepare('SELECT * FROM proyectos WHERE id = ?').get(id);
    if (!proyecto) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }
    
    db.prepare('UPDATE proyectos SET estado = ? WHERE id = ?').run('Completado', id);
    
    const proyectoActualizado = db.prepare(`
      SELECT p.*, c.nombre as cliente_nombre
      FROM proyectos p
      INNER JOIN clientes c ON p.cliente_id = c.id
      WHERE p.id = ?
    `).get(id);
    
    res.json(proyectoActualizado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar un proyecto
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const proyecto = db.prepare('SELECT * FROM proyectos WHERE id = ?').get(id);
    if (!proyecto) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }
    
    db.prepare('DELETE FROM proyectos WHERE id = ?').run(id);
    res.json({ message: 'Proyecto eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
