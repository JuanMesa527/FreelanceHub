const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'freelance.db');
const db = new Database(dbPath);

db.pragma('foreign_keys = ON');

const initDB = () => {
  // Tabla Clientes
  db.exec(`
    CREATE TABLE IF NOT EXISTS clientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      correo TEXT NOT NULL UNIQUE,
      estado TEXT DEFAULT 'Activo' CHECK(estado IN ('Activo', 'Inactivo')),
      fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabla Proyectos
  db.exec(`
    CREATE TABLE IF NOT EXISTS proyectos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      cliente_id INTEGER NOT NULL,
      fecha_inicio DATE NOT NULL,
      fecha_vencimiento DATE NOT NULL,
      estado TEXT DEFAULT 'Pendiente' CHECK(estado IN ('Pendiente', 'En Progreso', 'Completado', 'Retrasado')),
      presupuesto REAL,
      fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
    )
  `);
  insertarDatosEjemplo();
};

const insertarDatosEjemplo = () => {
  const clientesCount = db.prepare('SELECT COUNT(*) as count FROM clientes').get();
  
  if (clientesCount.count === 0) {
    const insertCliente = db.prepare(`
      INSERT INTO clientes (nombre, correo, estado) VALUES (?, ?, ?)
    `);
    insertCliente.run('Empresa ABC', 'contacto@empresaabc.com', 'Activo');
    insertCliente.run('Tech Solutions', 'info@techsolutions.com', 'Activo');
    insertCliente.run('Marketing Digital', 'hola@marketingdigital.com', 'Activo');
    insertCliente.run('Startup XYZ', 'team@startupxyz.com', 'Inactivo');
    
    const hoy = new Date();
    const formatDate = (date) => date.toISOString().split('T')[0];
    
    const hace30Dias = new Date(hoy.getTime() - 30 * 24 * 60 * 60 * 1000);
    const hace15Dias = new Date(hoy.getTime() - 15 * 24 * 60 * 60 * 1000);
    const hace7Dias = new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000);
    const en2Dias = new Date(hoy.getTime() + 2 * 24 * 60 * 60 * 1000);
    const en5Dias = new Date(hoy.getTime() + 5 * 24 * 60 * 60 * 1000);
    const en10Dias = new Date(hoy.getTime() + 10 * 24 * 60 * 60 * 1000);
    const en20Dias = new Date(hoy.getTime() + 20 * 24 * 60 * 60 * 1000);
    const en30Dias = new Date(hoy.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    const insertProyecto = db.prepare(`
      INSERT INTO proyectos (nombre, cliente_id, fecha_inicio, fecha_vencimiento, estado, presupuesto) 
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    insertProyecto.run('Sitio Web Corporativo', 1, formatDate(hace30Dias), formatDate(en2Dias), 'En Progreso', 5000);
    insertProyecto.run('App Móvil E-commerce', 2, formatDate(hace15Dias), formatDate(en5Dias), 'En Progreso', 15000);
    insertProyecto.run('Sistema de Inventario', 1, formatDate(hace7Dias), formatDate(en20Dias), 'Pendiente', 8000);
    insertProyecto.run('Landing Page Campaña', 3, formatDate(hace7Dias), formatDate(en10Dias), 'En Progreso', 2500);
    insertProyecto.run('Dashboard Analytics', 2, formatDate(hoy), formatDate(en30Dias), 'Pendiente', 12000);
    insertProyecto.run('Rediseño Blog', 3, formatDate(hace30Dias), formatDate(hace7Dias), 'Retrasado', 3000);
  }
};

initDB();

module.exports = db;
