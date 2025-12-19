export interface Cliente {
  id?: number;
  nombre: string;
  correo: string;
  estado: 'Activo' | 'Inactivo';
  fecha_creacion?: string;
  total_proyectos?: number;
}
