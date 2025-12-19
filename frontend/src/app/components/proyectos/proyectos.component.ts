import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ProyectoService } from '../../services/proyecto.service';
import { ClienteService } from '../../services/cliente.service';
import { Proyecto } from '../../models/proyecto.model';
import { Cliente } from '../../models/cliente.model';

@Component({
  selector: 'app-proyectos',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="proyectos-page">
      <header class="page-header">
        <div>
          <h1>📁 Gestión de Proyectos</h1>
          <p>Administra y da seguimiento a todos tus proyectos</p>
        </div>
        <button class="btn btn-primary" (click)="abrirModal()">
          ➕ Nuevo Proyecto
        </button>
      </header>

      <!-- Filtros -->
      <div class="card">
        <div class="filters">
          <div class="filter-group">
            <label class="filter-label">Filtrar por Estado</label>
            <select class="filter-select" [(ngModel)]="filtroEstado" (change)="aplicarFiltros()">
              <option value="">Todos los estados</option>
              <option value="Pendiente">Pendiente</option>
              <option value="En Progreso">En Progreso</option>
              <option value="Completado">Completado</option>
              <option value="Retrasado">Retrasado</option>
            </select>
          </div>
          <div class="filter-group">
            <label class="filter-label">Filtrar por Cliente</label>
            <select class="filter-select" [(ngModel)]="filtroCliente" (change)="aplicarFiltros()">
              <option value="">Todos los clientes</option>
              @for (cliente of clientes; track cliente.id) {
                <option [value]="cliente.id">{{ cliente.nombre }}</option>
              }
            </select>
          </div>
          <div class="filter-group filter-actions">
            <label class="filter-label">Limpiar filtros</label>
              <button class="btn btn-outline btn-sm" (click)="limpiarFiltros()">
                🔄
              </button>
          </div>
        </div>
      </div>

      <!-- Tabla de Proyectos -->
      <div class="card">
        @if (proyectos.length > 0) {
          <div class="table-container">
            <table class="table">
              <thead>
                <tr>
                  <th>Proyecto</th>
                  <th>Cliente</th>
                  <th>Fecha Inicio</th>
                  <th>Vencimiento</th>
                  <th>Presupuesto</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                @for (proyecto of proyectos; track proyecto.id) {
                  <tr [class.row-urgente]="proyecto.urgente" [class.row-proximo]="proyecto.proximo_vencer && !proyecto.urgente">
                    <td>
                      <strong>{{ proyecto.nombre }}</strong>
                      @if (proyecto.urgente) {
                        <span class="badge badge-urgente" style="margin-left: 8px;">⚠️ Urgente</span>
                      } @else if (proyecto.proximo_vencer) {
                        <span class="badge badge-proximo" style="margin-left: 8px;">⏰ Próximo</span>
                      }
                    </td>
                    <td>{{ proyecto.cliente_nombre }}</td>
                    <td>{{ proyecto.fecha_inicio | date:'dd/MM/yyyy' }}</td>
                    <td>
                      <div class="fecha-vencimiento">
                        {{ proyecto.fecha_vencimiento | date:'dd/MM/yyyy' }}
                        @if (proyecto.dias_restantes !== undefined && proyecto.estado !== 'Completado') {
                          <small [class]="getDiasClass(proyecto)">
                            @if (proyecto.dias_restantes >= 0) {
                              ({{ proyecto.dias_restantes }} días)
                            } @else {
                              (Vencido hace {{ proyecto.dias_restantes * -1 }} días)
                            }
                          </small>
                        }
                      </div>
                    </td>
                    <td>
                      @if (proyecto.presupuesto) {
                        {{ proyecto.presupuesto | currency:'USD':'symbol':'1.0-0' }}
                      } @else {
                        <span class="text-muted">-</span>
                      }
                    </td>
                    <td>
                      <span [class]="'badge badge-' + proyecto.estado.toLowerCase().replace(' ', '-')">
                        {{ proyecto.estado }}
                      </span>
                    </td>
                    <td>
                      <div class="table-actions">
                        <button class="btn btn-outline btn-sm" (click)="irACorreo(proyecto)" title="Redactar correo con IA">
                          ✉️
                        </button>
                        @if (proyecto.estado !== 'Completado') {
                          <button class="btn btn-success btn-sm" (click)="completarProyecto(proyecto)" 
                                  title="Marcar como completado">
                            ✅
                          </button>
                        }
                        <button class="btn btn-outline btn-sm" (click)="editarProyecto(proyecto)" title="Editar">
                          ✏️
                        </button>
                        <button class="btn btn-danger btn-sm" (click)="eliminarProyecto(proyecto)" title="Eliminar">
                          🗑️
                        </button>
                      </div>
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
            <p>{{ filtroEstado || filtroCliente ? 'No se encontraron proyectos con los filtros aplicados' : 'Comienza creando tu primer proyecto' }}</p>
            @if (!filtroEstado && !filtroCliente) {
              <button class="btn btn-primary" (click)="abrirModal()">
                ➕ Crear Proyecto
              </button>
            }
          </div>
        }
      </div>

      <!-- Modal de Proyecto -->
      @if (mostrarModal) {
        <div class="modal-backdrop" (click)="cerrarModal()">
          <div class="modal" style="max-width: 600px;" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3 class="modal-title">{{ editando ? '✏️ Editar Proyecto' : '➕ Nuevo Proyecto' }}</h3>
              <button class="modal-close" (click)="cerrarModal()">&times;</button>
            </div>
            <form [formGroup]="proyectoForm" (ngSubmit)="guardarProyecto()">
              <div class="modal-body">
                <div class="form-group">
                  <label class="form-label">Nombre del Proyecto *</label>
                  <input type="text" class="form-control" formControlName="nombre" 
                         placeholder="Ej: Sitio Web Corporativo">
                  @if (proyectoForm.get('nombre')?.invalid && proyectoForm.get('nombre')?.touched) {
                    <span class="form-error">El nombre es requerido</span>
                  }
                </div>

                <div class="form-group">
                  <label class="form-label">Cliente Asignado *</label>
                  <select class="form-control" formControlName="cliente_id">
                    <option value="">Selecciona un cliente</option>
                    @for (cliente of clientes; track cliente.id) {
                      <option [value]="cliente.id">{{ cliente.nombre }}</option>
                    }
                  </select>
                  @if (proyectoForm.get('cliente_id')?.invalid && proyectoForm.get('cliente_id')?.touched) {
                    <span class="form-error">Debes seleccionar un cliente</span>
                  }
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label">Fecha de Inicio *</label>
                    <input type="date" class="form-control" formControlName="fecha_inicio">
                    @if (proyectoForm.get('fecha_inicio')?.invalid && proyectoForm.get('fecha_inicio')?.touched) {
                      <span class="form-error">La fecha de inicio es requerida</span>
                    }
                  </div>

                  <div class="form-group">
                    <label class="form-label">Fecha de Vencimiento *</label>
                    <input type="date" class="form-control" formControlName="fecha_vencimiento">
                    @if (proyectoForm.get('fecha_vencimiento')?.invalid && proyectoForm.get('fecha_vencimiento')?.touched) {
                      <span class="form-error">La fecha de vencimiento es requerida</span>
                    }
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label">Estado</label>
                    <select class="form-control" formControlName="estado">
                      <option value="Pendiente">Pendiente</option>
                      <option value="En Progreso">En Progreso</option>
                      <option value="Completado">Completado</option>
                      <option value="Retrasado">Retrasado</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label class="form-label">Presupuesto Estimado (USD)</label>
                    <input type="number" class="form-control" formControlName="presupuesto" 
                           placeholder="Ej: 5000" min="0">
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-outline" (click)="cerrarModal()">Cancelar</button>
                <button type="submit" class="btn btn-primary" [disabled]="proyectoForm.invalid">
                  {{ editando ? 'Actualizar' : 'Guardar' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Modal de Confirmación -->
      @if (mostrarConfirmacion) {
        <div class="modal-backdrop" (click)="cancelarEliminacion()">
          <div class="modal" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3 class="modal-title">⚠️ Confirmar Eliminación</h3>
              <button class="modal-close" (click)="cancelarEliminacion()">&times;</button>
            </div>
            <div class="modal-body">
              <p>¿Estás seguro de que deseas eliminar el proyecto <strong>{{ proyectoAEliminar?.nombre }}</strong>?</p>
            </div>
            <div class="modal-footer">
              <button class="btn btn-outline" (click)="cancelarEliminacion()">Cancelar</button>
              <button class="btn btn-danger" (click)="confirmarEliminacion()">Eliminar</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
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

    .filter-actions {
      display: flex;
      align-items: flex-end;
    }

    .fecha-vencimiento {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .fecha-vencimiento small {
      font-size: 11px;
    }

    .dias-normal { color: #22c55e; }
    .dias-proximo { color: #f59e0b; font-weight: 600; }
    .dias-urgente { color: #ef4444; font-weight: 700; }

    .text-muted {
      color: #94a3b8;
    }

    .row-urgente {
      background-color: #fef2f2 !important;
    }

    .row-proximo {
      background-color: #fffbeb !important;
    }
  `]
})
export class ProyectosComponent implements OnInit {
  proyectos: Proyecto[] = [];
  clientes: Cliente[] = [];
  proyectoForm: FormGroup;
  
  filtroEstado = '';
  filtroCliente = '';
  
  mostrarModal = false;
  mostrarConfirmacion = false;
  editando = false;
  proyectoEditando: Proyecto | null = null;
  proyectoAEliminar: Proyecto | null = null;

  constructor(
    private proyectoService: ProyectoService,
    private clienteService: ClienteService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.proyectoForm = this.fb.group({
      nombre: ['', Validators.required],
      cliente_id: ['', Validators.required],
      fecha_inicio: ['', Validators.required],
      fecha_vencimiento: ['', Validators.required],
      estado: ['Pendiente'],
      presupuesto: [null]
    });
  }

  ngOnInit(): void {
    this.cargarClientes();
    this.cargarProyectos();
  }

  cargarClientes(): void {
    this.clienteService.getClientes().subscribe({
      next: (clientes) => this.clientes = clientes.filter(c => c.estado === 'Activo'),
      error: (error) => console.error('Error al cargar clientes:', error)
    });
  }

  cargarProyectos(): void {
    const filtros: any = {};
    if (this.filtroEstado) filtros.estado = this.filtroEstado;
    if (this.filtroCliente) filtros.cliente_id = parseInt(this.filtroCliente);

    this.proyectoService.getProyectos(filtros).subscribe({
      next: (proyectos) => this.proyectos = proyectos,
      error: (error) => console.error('Error al cargar proyectos:', error)
    });
  }

  aplicarFiltros(): void {
    this.cargarProyectos();
  }

  limpiarFiltros(): void {
    this.filtroEstado = '';
    this.filtroCliente = '';
    this.cargarProyectos();
  }

  getDiasClass(proyecto: Proyecto): string {
    if (proyecto.urgente || (proyecto.dias_restantes !== undefined && proyecto.dias_restantes < 0)) {
      return 'dias-urgente';
    }
    if (proyecto.proximo_vencer) return 'dias-proximo';
    return 'dias-normal';
  }
irACorreo(proyecto: Proyecto): void {
    this.router.navigate(['/correo', proyecto.id]);
  }

  
  abrirModal(): void {
    this.editando = false;
    this.proyectoEditando = null;
    this.proyectoForm.reset({ estado: 'Pendiente' });
    this.mostrarModal = true;
  }

  editarProyecto(proyecto: Proyecto): void {
    this.editando = true;
    this.proyectoEditando = proyecto;
    this.proyectoForm.patchValue({
      nombre: proyecto.nombre,
      cliente_id: proyecto.cliente_id,
      fecha_inicio: proyecto.fecha_inicio,
      fecha_vencimiento: proyecto.fecha_vencimiento,
      estado: proyecto.estado,
      presupuesto: proyecto.presupuesto
    });
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.proyectoForm.reset();
  }

  guardarProyecto(): void {
    if (this.proyectoForm.invalid) return;

    const proyectoData = this.proyectoForm.value as Proyecto;

    if (this.editando && this.proyectoEditando) {
      this.proyectoService.updateProyecto(this.proyectoEditando.id!, proyectoData).subscribe({
        next: () => {
          this.cargarProyectos();
          this.cerrarModal();
        },
        error: (error) => console.error('Error al actualizar proyecto:', error)
      });
    } else {
      this.proyectoService.createProyecto(proyectoData).subscribe({
        next: () => {
          this.cargarProyectos();
          this.cerrarModal();
        },
        error: (error) => console.error('Error al crear proyecto:', error)
      });
    }
  }

  completarProyecto(proyecto: Proyecto): void {
    this.proyectoService.completarProyecto(proyecto.id!).subscribe({
      next: () => this.cargarProyectos(),
      error: (error) => console.error('Error al completar proyecto:', error)
    });
  }

  eliminarProyecto(proyecto: Proyecto): void {
    this.proyectoAEliminar = proyecto;
    this.mostrarConfirmacion = true;
  }

  cancelarEliminacion(): void {
    this.mostrarConfirmacion = false;
    this.proyectoAEliminar = null;
  }

  confirmarEliminacion(): void {
    if (this.proyectoAEliminar) {
      this.proyectoService.deleteProyecto(this.proyectoAEliminar.id!).subscribe({
        next: () => {
          this.cargarProyectos();
          this.cancelarEliminacion();
        },
        error: (error) => console.error('Error al eliminar proyecto:', error)
      });
    }
  }
}
