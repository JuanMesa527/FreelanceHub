export interface Proyecto {
  id?: number;
  nombre: string;
  cliente_id: number;
  cliente_nombre?: string;
  cliente_correo?: string;
  fecha_inicio: string;
  fecha_vencimiento: string;
  estado: 'Pendiente' | 'En Progreso' | 'Completado' | 'Retrasado';
  presupuesto?: number | null;
  fecha_creacion?: string;
  dias_restantes?: number;
  proximo_vencer?: boolean;
  urgente?: boolean;
}
