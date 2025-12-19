import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProyectoService } from '../../services/proyecto.service';
import { ClienteService } from '../../services/cliente.service';
import { Proyecto } from '../../models/proyecto.model';
import { Cliente } from '../../models/cliente.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard">
      <header class="page-header">
        <h1>📊 Dashboard</h1>
        <p>Resumen general de tus proyectos y clientes</p>
      </header>

      <!-- Alertas de proyectos próximos a vencer -->
      @if (proyectosUrgentes.length > 0) {
        <div class="alert alert-danger">
          <span>⚠️</span>
          <div>
            <strong>¡Atención!</strong> Tienes {{ proyectosUrgentes.length }} proyecto(s) que vencen en 3 días o menos.
            <a routerLink="/timeline" class="alert-link">Ver línea de tiempo →</a>
          </div>
        </div>
      }

      <!-- Estadísticas -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon primary">📁</div>
          <div class="stat-info">
            <h3>{{ totalProyectos }}</h3>
            <p>Total Proyectos</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon success">✅</div>
          <div class="stat-info">
            <h3>{{ proyectosCompletados }}</h3>
            <p>Completados</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon warning">🔄</div>
          <div class="stat-info">
            <h3>{{ proyectosEnProgreso }}</h3>
            <p>En Progreso</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon danger">⏰</div>
          <div class="stat-info">
            <h3>{{ proyectosRetrasados }}</h3>
            <p>Retrasados</p>
          </div>
        </div>
      </div>

      <div class="dashboard-grid">
        <!-- Proyectos Recientes -->
        <div class="card">
          <div class="card-header">
            <h2 class="card-title">📋 Proyectos Recientes</h2>
            <a routerLink="/proyectos" class="btn btn-outline btn-sm">Ver todos</a>
          </div>
          
          @if (proyectos.length > 0) {
            <div class="table-container">
              <table class="table">
                <thead>
                  <tr>
                    <th>Proyecto</th>
                    <th>Cliente</th>
                    <th>Vencimiento</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  @for (proyecto of proyectos.slice(0, 5); track proyecto.id) {
                    <tr>
                      <td>
                        <strong>{{ proyecto.nombre }}</strong>
                      </td>
                      <td>{{ proyecto.cliente_nombre }}</td>
                      <td>
                        <span [class]="getDiasClass(proyecto)">
                          {{ proyecto.fecha_vencimiento | date:'dd/MM/yyyy' }}
                          @if (proyecto.dias_restantes !== undefined && proyecto.dias_restantes >= 0) {
                            <small>({{ proyecto.dias_restantes }} días)</small>
                          }
                        </span>
                      </td>
                      <td>
                        <span [class]="'badge badge-' + proyecto.estado.toLowerCase().replace(' ', '-')">
                          {{ proyecto.estado }}
                        </span>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          } @else {
            <div class="empty-state">
              <div class="empty-state-icon">📁</div>
              <h3>No hay proyectos</h3>
              <p>Comienza creando tu primer proyecto</p>
              <a routerLink="/proyectos" class="btn btn-primary">Crear Proyecto</a>
            </div>
          }
        </div>

        <!-- Clientes Activos -->
        <div class="card">
          <div class="card-header">
            <h2 class="card-title">👥 Clientes Activos</h2>
            <a routerLink="/clientes" class="btn btn-outline btn-sm">Ver todos</a>
          </div>
          
          @if (clientes.length > 0) {
            <div class="clientes-list">
              @for (cliente of clientes.slice(0, 5); track cliente.id) {
                <div class="cliente-item">
                  <div class="cliente-avatar">{{ getInitials(cliente.nombre) }}</div>
                  <div class="cliente-info">
                    <h4>{{ cliente.nombre }}</h4>
                    <p>{{ cliente.correo }}</p>
                  </div>
                  <span [class]="'badge badge-' + cliente.estado.toLowerCase()">
                    {{ cliente.estado }}
                  </span>
                </div>
              }
            </div>
          } @else {
            <div class="empty-state">
              <div class="empty-state-icon">👥</div>
              <h3>No hay clientes</h3>
              <p>Comienza registrando tu primer cliente</p>
              <a routerLink="/clientes" class="btn btn-primary">Agregar Cliente</a>
            </div>
          }
        </div>
      </div>
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

    .alert-link {
      color: inherit;
      margin-left: 8px;
      font-weight: 600;
    }

    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 24px;
    }

    .clientes-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .cliente-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: #f8fafc;
      border-radius: 8px;
    }

    .cliente-avatar {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #4f46e5, #7c3aed);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 14px;
    }

    .cliente-info {
      flex: 1;
    }

    .cliente-info h4 {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 2px;
    }

    .cliente-info p {
      font-size: 12px;
      color: #64748b;
    }

    .dias-normal { color: #22c55e; }
    .dias-proximo { color: #f59e0b; font-weight: 600; }
    .dias-urgente { color: #ef4444; font-weight: 700; }

    @media (max-width: 768px) {
      .dashboard-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  proyectos: Proyecto[] = [];
  clientes: Cliente[] = [];
  proyectosUrgentes: Proyecto[] = [];

  totalProyectos = 0;
  proyectosCompletados = 0;
  proyectosEnProgreso = 0;
  proyectosRetrasados = 0;

  constructor(
    private proyectoService: ProyectoService,
    private clienteService: ClienteService
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.proyectoService.getProyectos().subscribe({
      next: (proyectos) => {
        this.proyectos = proyectos;
        this.calcularEstadisticas();
        this.proyectosUrgentes = proyectos.filter(p => p.urgente && p.estado !== 'Completado');
      },
      error: (error) => console.error('Error al cargar proyectos:', error)
    });

    this.clienteService.getClientes().subscribe({
      next: (clientes) => {
        this.clientes = clientes.filter(c => c.estado === 'Activo');
      },
      error: (error) => console.error('Error al cargar clientes:', error)
    });
  }

  calcularEstadisticas(): void {
    this.totalProyectos = this.proyectos.length;
    this.proyectosCompletados = this.proyectos.filter(p => p.estado === 'Completado').length;
    this.proyectosEnProgreso = this.proyectos.filter(p => p.estado === 'En Progreso').length;
    this.proyectosRetrasados = this.proyectos.filter(p => p.estado === 'Retrasado').length;
  }

  getInitials(nombre: string): string {
    return nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  getDiasClass(proyecto: Proyecto): string {
    if (proyecto.urgente) return 'dias-urgente';
    if (proyecto.proximo_vencer) return 'dias-proximo';
    return 'dias-normal';
  }
}
