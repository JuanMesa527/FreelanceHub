require('dotenv').config();
const express = require('express');
const cors = require('cors');
const clientesRoutes = require('./routes/clientes.routes');
const proyectosRoutes = require('./routes/proyectos.routes');
const n8nRoutes = require('./routes/n8n.routes');
const alertasService = require('./services/alertas.service');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

app.use('/api/clientes', clientesRoutes);
app.use('/api/proyectos', proyectosRoutes);
app.use('/api/n8n', n8nRoutes);

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
  //Verificación de alertas al iniciar el servidor
  console.log('\nVerificando proyectos con vencimiento próximo...');
  alertasService.verificarProyectosProximosAVencer();
});
