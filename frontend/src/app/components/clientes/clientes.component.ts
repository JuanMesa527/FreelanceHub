import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClienteService } from '../../services/cliente.service';
import { Cliente } from '../../models/cliente.model';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="clientes-page">
      <header class="page-header">
        <div>
          <h1>👥 Gestión de Clientes</h1>
          <p>Administra la información de tus clientes</p>
        </div>
        <button class="btn btn-primary" (click)="abrirModal()">
          ➕ Nuevo Cliente
        </button>
      </header>

      <!-- Tabla de Clientes -->
      <div class="card">
        @if (clientes.length > 0) {
          <div class="table-container">
            <table class="table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Correo Electrónico</th>
                  <th>Proyectos</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                @for (cliente of clientes; track cliente.id) {
                  <tr>
                    <td>
                      <div class="cliente-cell">
                        <div class="cliente-avatar">{{ getInitials(cliente.nombre) }}</div>
                        <strong>{{ cliente.nombre }}</strong>
                      </div>
                    </td>
                    <td>{{ cliente.correo }}</td>
                    <td>
                      <span class="proyectos-count">{{ cliente.total_proyectos || 0 }}</span>
                    </td>
                    <td>
                      <span [class]="'badge badge-' + cliente.estado.toLowerCase()">
                        {{ cliente.estado }}
                      </span>
                    </td>
                    <td>
                      <div class="table-actions">
                        <button class="btn btn-outline btn-sm" (click)="editarCliente(cliente)" title="Editar">
                          ✏️
                        </button>
                        <button class="btn btn-danger btn-sm" (click)="eliminarCliente(cliente)" title="Eliminar">
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
            <div class="empty-state-icon">👥</div>
            <h3>No hay clientes registrados</h3>
            <p>Comienza agregando tu primer cliente</p>
            <button class="btn btn-primary" (click)="abrirModal()">
              ➕ Agregar Cliente
            </button>
          </div>
        }
      </div>

      <!-- Modal de Cliente -->
      @if (mostrarModal) {
        <div class="modal-backdrop" (click)="cerrarModal()">
          <div class="modal" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3 class="modal-title">{{ editando ? '✏️ Editar Cliente' : '➕ Nuevo Cliente' }}</h3>
              <button class="modal-close" (click)="cerrarModal()">&times;</button>
            </div>
            <form [formGroup]="clienteForm" (ngSubmit)="guardarCliente()">
              <div class="modal-body">
                <div class="form-group">
                  <label class="form-label">Nombre del Cliente *</label>
                  <input type="text" class="form-control" formControlName="nombre" 
                         placeholder="Ej: Empresa ABC">
                  @if (clienteForm.get('nombre')?.invalid && clienteForm.get('nombre')?.touched) {
                    <span class="form-error">El nombre es requerido</span>
                  }
                </div>

                <div class="form-group">
                  <label class="form-label">Correo Electrónico *</label>
                  <input type="email" class="form-control" formControlName="correo" 
                         placeholder="Ej: contacto@empresa.com">
                  @if (clienteForm.get('correo')?.invalid && clienteForm.get('correo')?.touched) {
                    <span class="form-error">Ingresa un correo válido</span>
                  }
                </div>

                <div class="form-group">
                  <label class="form-label">Estado</label>
                  <select class="form-control" formControlName="estado">
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-outline" (click)="cerrarModal()">Cancelar</button>
                <button type="submit" class="btn btn-primary" [disabled]="clienteForm.invalid">
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
              <p>¿Estás seguro de que deseas eliminar al cliente <strong>{{ clienteAEliminar?.nombre }}</strong>?</p>
              <p class="text-warning">Esta acción también eliminará todos los proyectos asociados.</p>
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

    .cliente-cell {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .cliente-avatar {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, #4f46e5, #7c3aed);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 12px;
    }

    .proyectos-count {
      background: #e2e8f0;
      padding: 4px 12px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 13px;
    }

    .text-warning {
      color: #f59e0b;
      font-size: 14px;
      margin-top: 8px;
    }
  `]
})
export class ClientesComponent implements OnInit {
  clientes: Cliente[] = [];
  clienteForm: FormGroup;
  mostrarModal = false;
  mostrarConfirmacion = false;
  editando = false;
  clienteEditando: Cliente | null = null;
  clienteAEliminar: Cliente | null = null;

  constructor(
    private clienteService: ClienteService,
    private fb: FormBuilder
  ) {
    this.clienteForm = this.fb.group({
      nombre: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      estado: ['Activo']
    });
  }

  ngOnInit(): void {
    this.cargarClientes();
  }

  cargarClientes(): void {
    this.clienteService.getClientes().subscribe({
      next: (clientes) => this.clientes = clientes,
      error: (error) => console.error('Error al cargar clientes:', error)
    });
  }

  getInitials(nombre: string): string {
    return nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  abrirModal(): void {
    this.editando = false;
    this.clienteEditando = null;
    this.clienteForm.reset({ estado: 'Activo' });
    this.mostrarModal = true;
  }

  editarCliente(cliente: Cliente): void {
    this.editando = true;
    this.clienteEditando = cliente;
    this.clienteForm.patchValue({
      nombre: cliente.nombre,
      correo: cliente.correo,
      estado: cliente.estado
    });
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.clienteForm.reset();
  }

  guardarCliente(): void {
    if (this.clienteForm.invalid) return;

    const clienteData = this.clienteForm.value as Cliente;

    if (this.editando && this.clienteEditando) {
      this.clienteService.updateCliente(this.clienteEditando.id!, clienteData).subscribe({
        next: () => {
          this.cargarClientes();
          this.cerrarModal();
        },
        error: (error) => console.error('Error al actualizar cliente:', error)
      });
    } else {
      this.clienteService.createCliente(clienteData).subscribe({
        next: () => {
          this.cargarClientes();
          this.cerrarModal();
        },
        error: (error) => console.error('Error al crear cliente:', error)
      });
    }
  }

  eliminarCliente(cliente: Cliente): void {
    this.clienteAEliminar = cliente;
    this.mostrarConfirmacion = true;
  }

  cancelarEliminacion(): void {
    this.mostrarConfirmacion = false;
    this.clienteAEliminar = null;
  }

  confirmarEliminacion(): void {
    if (this.clienteAEliminar) {
      this.clienteService.deleteCliente(this.clienteAEliminar.id!).subscribe({
        next: () => {
          this.cargarClientes();
          this.cancelarEliminacion();
        },
        error: (error) => console.error('Error al eliminar cliente:', error)
      });
    }
  }
}
