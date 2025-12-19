const express = require('express');
const router = express.Router();
const axios = require('axios');
const db = require('../database/db');

router.post('/send-prompt', async (req, res) => {
  try {
    const { proyecto_id, prompt } = req.body;
    
    const proyecto = db.prepare(`
      SELECT p.*, c.nombre as cliente_nombre, c.correo as cliente_correo
      FROM proyectos p
      INNER JOIN clientes c ON p.cliente_id = c.id
      WHERE p.id = ?
    `).get(proyecto_id);

    if (!proyecto) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }

    const payload = {
      tipo: 'prompt',
      prompt: prompt,
      proyecto: {
        nombre: proyecto.nombre,
        fecha_vencimiento: proyecto.fecha_vencimiento,
        estado: proyecto.estado
      },
      cliente: {
        nombre: proyecto.cliente_nombre,
        email: proyecto.cliente_correo
      },
      timestamp: new Date().toISOString()
    };

    const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL; 
    
    await axios.post(N8N_WEBHOOK_URL, payload);

    res.json({ 
      message: 'Prompt enviado a n8n correctamente', 
      data_sent: payload 
    });

  } catch (error) {
    console.error('Error al enviar a n8n:', error);
    res.status(500).json({ error: 'Error al procesar la solicitud con n8n' });
  }
});

module.exports = router;
