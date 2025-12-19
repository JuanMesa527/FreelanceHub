import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProyectoService } from '../../services/proyecto.service';
import { Proyecto } from '../../models/proyecto.model';

@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="timeline-page">
      <header class="page-header">
        <div>
          <h1>📅 Línea de Tiempo</h1>
          <p>Visualiza los proyectos activos y sus plazos de entrega</p>
        </div>
      </header>

      <!-- Leyenda -->
      <div class="card leyenda-card">
        <h3>📌 Leyenda</h3>
        <div class="leyenda">
          <div class="leyenda-item">
            <span class="leyenda-color urgente"></span>
            <span>Urgente (≤ 3 días)</span>
          </div>
          <div class="leyenda-item">
            <span class="leyenda-color proximo"></span>
            <span>Próximo a vencer (≤ 7 días)</span>
          </div>
          <div class="leyenda-item">
            <span class="leyenda-color normal"></span>
            <span>En tiempo (> 7 días)</span>
          </div>
          <div class="leyenda-item">
            <span class="leyenda-color completado"></span>
            <span>Completado</span>
          </div>
        </div>
      </div>

      <!-- Alertas de proyectos urgentes -->
      @if (proyectosUrgentes.length > 0) {
        <div class="alert alert-danger">
          <span>🚨</span>
          <div>
            <strong>¡Alerta de vencimiento!</strong> 
            Hay {{ proyectosUrgentes.length }} proyecto(s) que vencen en 3 días o menos.
          </div>
        </div>
      }

      <!-- Timeline de proyectos -->
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">🗓️ Proyectos Activos</h2>
          <span class="proyectos-count">{{ proyectosActivos.length }} proyectos</span>
        </div>

        @if (proyectosActivos.length > 0) {
          <div class="timeline-container">
            @for (proyecto of proyectosActivos; track proyecto.id) {
              <div class="timeline-item">
                <div [class]="'timeline-bar ' + getTimelineClass(proyecto)"></div>
                <div class="timeline-content">
                  <div class="timeline-header">
                    <h4>{{ proyecto.nombre }}</h4>
                    <span [class]="'badge badge-' + proyecto.estado.toLowerCase().replace(' ', '-')">
                      {{ proyecto.estado }}
                    </span>
                  </div>
                  <p class="timeline-cliente">👤 {{ proyecto.cliente_nombre }}</p>
                  <div class="timeline-dates">
                    <span>📅 Inicio: {{ proyecto.fecha_inicio | date:'dd/MM/yyyy' }}</span>
                    <span [class]="'fecha-vencimiento ' + getTimelineClass(proyecto)">
                      ⏰ Vencimiento: {{ proyecto.fecha_vencimiento | date:'dd/MM/yyyy' }}
                    </span>
                  </div>
                  <div class="timeline-footer">
                    @if (proyecto.presupuesto) {
                      <span class="presupuesto">💰 {{ proyecto.presupuesto | currency:'USD':'symbol':'1.0-0' }}</span>
                    }
                    <span [class]="'dias-restantes ' + getTimelineClass(proyecto)">
                      @if (proyecto.dias_restantes !== undefined) {
                        @if (proyecto.dias_restantes > 0) {
                          {{ proyecto.dias_restantes }} días restantes
                        } @else if (proyecto.dias_restantes === 0) {
                          ¡Vence hoy!
                        } @else {
                          Vencido hace {{ proyecto.dias_restantes * -1 }} días
                        }
                      }
                    </span>
                  </div>

                  <!-- Barra de progreso visual -->
                  <div class="progress-container">
                    <div class="progress-bar" [style.width.%]="getProgress(proyecto)" 
                         [class]="getTimelineClass(proyecto)"></div>
                  </div>
                </div>
              </div>
            }
          </div>
        } @else {
          <div class="empty-state">
            <div class="empty-state-icon">📅</div>
            <h3>No hay proyectos activos</h3>
            <p>Todos los proyectos están completados o no hay proyectos registrados</p>
          </div>
        }
      </div>

      <!-- Proyectos Completados -->
      @if (proyectosCompletados.length > 0) {
        <div class="card">
          <div class="card-header">
            <h2 class="card-title">✅ Proyectos Completados</h2>
            <span class="proyectos-count">{{ proyectosCompletados.length }} proyectos</span>
          </div>
          <div class="timeline-container completados">
            @for (proyecto of proyectosCompletados; track proyecto.id) {
              <div class="timeline-item">
                <div class="timeline-bar completado"></div>
                <div class="timeline-content">
                  <div class="timeline-header">
                    <h4>{{ proyecto.nombre }}</h4>
                    <span class="badge badge-completado">Completado</span>
                  </div>
                  <p class="timeline-cliente">👤 {{ proyecto.cliente_nombre }}</p>
                  <div class="timeline-dates">
                    <span>📅 {{ proyecto.fecha_inicio | date:'dd/MM/yyyy' }} - {{ proyecto.fecha_vencimiento | date:'dd/MM/yyyy' }}</span>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-header {
      margin-bottom: 24px;
    }

    .page-header h1 {
      font-size: 1.75rem;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 4px;
    }

    .page-header p {
      color: #64748b;
    }

    .leyenda-card {
      padding: 16px 24px;
    }

    .leyenda-card h3 {
      font-size: 14px;
      margin-bottom: 12px;
      color: #64748b;
    }

    .leyenda {
      display: flex;
      gap: 24px;
      flex-wrap: wrap;
    }

    .leyenda-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
    }

    .leyenda-color {
      width: 16px;
      height: 16px;
      border-radius: 4px;
    }

    .leyenda-color.urgente { background-color: #ef4444; }
    .leyenda-color.proximo { background-color: #f59e0b; }
    .leyenda-color.normal { background-color: #22c55e; }
    .leyenda-color.completado { background-color: #94a3b8; }

    .proyectos-count {
      background: #e2e8f0;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 500;
    }

    .timeline-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .timeline-item {
      display: flex;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      overflow: hidden;
      background: white;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .timeline-item:hover {
      transform: translateX(4px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .timeline-bar {
      width: 8px;
      flex-shrink: 0;
    }

    .timeline-bar.urgente { background: linear-gradient(180deg, #ef4444, #dc2626); }
    .timeline-bar.proximo { background: linear-gradient(180deg, #f59e0b, #d97706); }
    .timeline-bar.normal { background: linear-gradient(180deg, #22c55e, #16a34a); }
    .timeline-bar.completado { background: linear-gradient(180deg, #94a3b8, #64748b); }

    .timeline-content {
      flex: 1;
      padding: 16px 20px;
    }

    .timeline-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .timeline-header h4 {
      font-size: 16px;
      font-weight: 600;
      color: #1e293b;
    }

    .timeline-cliente {
      font-size: 13px;
      color: #64748b;
      margin-bottom: 8px;
    }

    .timeline-dates {
      display: flex;
      gap: 24px;
      font-size: 13px;
      color: #64748b;
      margin-bottom: 12px;
    }

    .fecha-vencimiento.urgente { color: #ef4444; font-weight: 600; }
    .fecha-vencimiento.proximo { color: #f59e0b; font-weight: 600; }

    .timeline-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .presupuesto {
      font-size: 14px;
      font-weight: 600;
      color: #1e293b;
    }

    .dias-restantes {
      font-size: 13px;
      font-weight: 600;
      padding: 4px 12px;
      border-radius: 20px;
    }

    .dias-restantes.urgente { 
      background-color: #fee2e2; 
      color: #991b1b;
      animation: pulse 2s infinite;
    }
    .dias-restantes.proximo { background-color: #fef3c7; color: #92400e; }
    .dias-restantes.normal { background-color: #d1fae5; color: #065f46; }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }

    .progress-container {
      height: 6px;
      background-color: #e2e8f0;
      border-radius: 3px;
      overflow: hidden;
    }

    .progress-bar {
      height: 100%;
      border-radius: 3px;
      transition: width 0.3s ease;
    }

    .progress-bar.urgente { background-color: #ef4444; }
    .progress-bar.proximo { background-color: #f59e0b; }
    .progress-bar.normal { background-color: #22c55e; }

    .completados .timeline-item {
      opacity: 0.8;
    }

    .completados .timeline-content {
      padding: 12px 16px;
    }
  `]
})
export class TimelineComponent implements OnInit {
  proyectos: Proyecto[] = [];
  proyectosActivos: Proyecto[] = [];
  proyectosCompletados: Proyecto[] = [];
  proyectosUrgentes: Proyecto[] = [];

  constructor(private proyectoService: ProyectoService) {}

  ngOnInit(): void {
    this.cargarProyectos();
  }

  cargarProyectos(): void {
    this.proyectoService.getProyectos().subscribe({
      next: (proyectos) => {
        this.proyectos = proyectos;
        this.proyectosActivos = proyectos.filter(p => p.estado !== 'Completado');
        this.proyectosCompletados = proyectos.filter(p => p.estado === 'Completado');
        this.proyectosUrgentes = proyectos.filter(p => p.urgente && p.estado !== 'Completado');
      },
      error: (error) => console.error('Error al cargar proyectos:', error)
    });
  }

  getTimelineClass(proyecto: Proyecto): string {
    if (proyecto.estado === 'Completado') return 'completado';
    if (proyecto.urgente || (proyecto.dias_restantes !== undefined && proyecto.dias_restantes < 0)) {
      return 'urgente';
    }
    if (proyecto.proximo_vencer) return 'proximo';
    return 'normal';
  }

  getProgress(proyecto: Proyecto): number {
    if (proyecto.estado === 'Completado') return 100;
    
    const inicio = new Date(proyecto.fecha_inicio).getTime();
    const fin = new Date(proyecto.fecha_vencimiento).getTime();
    const hoy = new Date().getTime();
    
    const total = fin - inicio;
    const transcurrido = hoy - inicio;
    
    if (total <= 0) return 100;
    
    const progreso = (transcurrido / total) * 100;
    return Math.min(Math.max(progreso, 0), 100);
  }
}
