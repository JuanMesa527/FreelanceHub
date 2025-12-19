const db = require('../database/db');
const axios = require('axios');

// URL del Webhook 
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;

// Obtener proyectos que vencen en 3 días o menos
const obtenerProyectosProximosAVencer = (dias = 3) => {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  
  const fechaLimite = new Date(hoy.getTime() + dias * 24 * 60 * 60 * 1000);
  
  const proyectos = db.prepare(`
    SELECT p.*, c.nombre as cliente_nombre, c.correo as cliente_correo
    FROM proyectos p
    INNER JOIN clientes c ON p.cliente_id = c.id
    WHERE p.estado NOT IN ('Completado')
    AND date(p.fecha_vencimiento) <= date(?)
    AND date(p.fecha_vencimiento) >= date(?)
    ORDER BY p.fecha_vencimiento ASC
  `).all(fechaLimite.toISOString().split('T')[0], hoy.toISOString().split('T')[0]);
  
  return proyectos.map(p => {
    const fechaVencimiento = new Date(p.fecha_vencimiento);
    const diffTime = fechaVencimiento.getTime() - hoy.getTime();
    const diasRestantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return {
      ...p,
      dias_restantes: diasRestantes
    };
  });
};

// Enviar alerta por n8n
const enviarAlerta = async (proyecto) => {
  const payload = {
    tipo: 'alerta_vencimiento',
    proyecto: {
      nombre: proyecto.nombre,
      fecha_vencimiento: proyecto.fecha_vencimiento,
      dias_restantes: proyecto.dias_restantes,
      estado: proyecto.estado,
    },
    cliente: {
      nombre: proyecto.cliente_nombre,
    },
    timestamp: new Date().toISOString()
  };

  // Mostrar en consola 
  console.log('\n' + '═'.repeat(60));
  console.log('ENVIANDO ALERTA A N8N');
  console.log('═'.repeat(60));
  console.log(`   Para: ${proyecto.cliente_nombre}`);
  console.log(`   Correo: ${proyecto.cliente_correo}`);
  console.log(`   Proyecto: ${proyecto.nombre}`);
  console.log(`   Vence en: ${proyecto.fecha_vencimiento}`);
  console.log(`   Vence en: ${proyecto.dias_restantes} día(s)`);
  console.log('═'.repeat(60));

  // Enviar a n8n 
  try {
    await axios.post(N8N_WEBHOOK_URL, payload);
    
    console.log('Datos enviados al webhook de n8n');
  } catch (error) {
    console.log(`Error al conectar con n8n: ${error.message}`);
  }
  
  return true;
};

// Actualizar estado de proyectos vencidos
const actualizarProyectosVencidos = () => {
  const hoy = new Date();
  const fechaHoy = hoy.toISOString().split('T')[0]; // YYYY-MM-DD
  const result = db.prepare(`
    UPDATE proyectos 
    SET estado = 'Retrasado'
    WHERE estado NOT IN ('Completado', 'Retrasado')
    AND date(fecha_vencimiento) < date(?)
  `).run(fechaHoy);
  
  return result.changes;
};

// Verificar y enviar alertas de proyectos próximos a vencer
const verificarProyectosProximosAVencer = async () => {
  actualizarProyectosVencidos();

  const proyectos = obtenerProyectosProximosAVencer();
  
  if (proyectos.length === 0) {
    console.log('No hay proyectos con vencimiento en los próximos 3 días');
    return [];
  }
  
  console.log(`\nSe encontraron ${proyectos.length} proyecto(s) próximo(s) a vencer:`);
  
  for (const proyecto of proyectos) {
    await enviarAlerta(proyecto);
  }
  
  return proyectos;
};

module.exports = {
  obtenerProyectosProximosAVencer,
  enviarAlerta,
  verificarProyectosProximosAVencer,
  actualizarProyectosVencidos
};
