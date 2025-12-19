# FreelanceHub - Arquitectura de la Solución

Juan Camilo Mesa Calderon para el Reto FullStack del banco de Bogota

## 1. Visión General
La solución sigue una arquitectura desacoplada, separando la interfaz de usuario de la lógica de negocio y los datos.

- Frontend: Angular 17 
- Backend: Node.js con Express - API RESTful.
- Base de Datos: SQLite 
- Integración: n8n - Automatización de procesos.

## 2. Capas de la Aplicación (Backend)

El backend implementa el principio de **separación de responsabilidades**:

### A. Capa de Presentación (Routes)
- **Ubicación:** `src/routes/`
- **Responsabilidad:** Manejar la comunicación HTTP (Request/Response), validar entradas y delegar tareas.
- **Ejemplo:** `proyectos.routes.js` recibe las peticiones del frontend.

### B. Capa de Lógica de Negocio (Services)
- **Ubicación:** `src/services/`
- **Responsabilidad:** Contener la lógica compleja y cálculos que pueden ser automatizados y no dependen de peticiones HTTP. 
- **Ejemplo:** `alertas.service.js` calcula vencimientos y gestiona la comunicación con n8n.

### C. Capa de Datos (Database)
- **Ubicación:** `src/database/`
- **Responsabilidad:** Gestionar la persistencia de datos y ejecutar consultas SQL seguras.
- **Tecnología:** `better-sqlite3`.

### Integración mail.
- **Webhook n8n:** Sistema de envío de correos a servicio externo n8n.

## 3. Flujo de Datos (Ejemplo: Crear Proyecto)

1.  **Usuario:** Completa el formulario en la interfaz.
2.  **Frontend:** Envía petición `POST` con JSON a la API.
3.  **Backend (Route):** Valida datos y verifica existencia del cliente.
4.  **Backend (DB):** Inserta registro en SQLite.
5.  **Backend:** Retorna respuesta `201 Created`.
6.  **Frontend:** Actualiza la vista automáticamente sin recargar la página.
