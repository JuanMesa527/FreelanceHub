import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProyectoService } from '../../services/proyecto.service';
import { Proyecto } from '../../models/proyecto.model';

@Component({
  selector: 'app-correo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="correo-page">
      <header class="page-header">
        <button class="btn btn-outline btn-sm" (click)="volver()">← Volver</button>
        <h1>✉️ Redactar Correo con IA</h1>
        <p>Describe qué quieres decirle al cliente y n8n generará y enviará el correo.</p>
      </header>

      @if (proyecto) {
        <div class="card project-info">
          <div class="info-item">
            <span class="label">Proyecto:</span>
            <span class="value">{{ proyecto.nombre }}</span>
          </div>
          <div class="info-item">
            <span class="label">Cliente:</span>
            <span class="value">{{ proyecto.cliente_nombre }} ({{ proyecto.cliente_correo }})</span>
          </div>
        </div>

        <div class="card form-card">
          <div class="form-group">
            <label class="form-label">Instrucciones para el correo (Prompt)</label>
            <textarea 
              class="form-control prompt-area" 
              [(ngModel)]="prompt" 
              placeholder="Ej: Escribe un correo amable recordándole que la fecha de entrega es mañana y necesitamos los archivos pendientes..."
              rows="6"
            ></textarea>
          </div>

          <div class="actions">
            <button class="btn btn-primary" [disabled]="!prompt || enviando" (click)="enviarPrompt()">
              {{ enviando ? 'Enviando...' : '🚀 Enviar a n8n' }}
            </button>
          </div>

          @if (mensajeExito) {
            <div class="alert alert-success mt-3">
              {{ mensajeExito }}
            </div>
          }
          
          @if (mensajeError) {
            <div class="alert alert-danger mt-3">
              {{ mensajeError }}
            </div>
          }
        </div>
      } @else {
        <div class="loading">Cargando información del proyecto...</div>
      }
    </div>
  `,
  styles: [`
    .correo-page {
      max-width: 800px;
      margin: 0 auto;
    }
    
    .page-header {
      margin-bottom: 24px;
    }
    
    .page-header h1 {
      margin-top: 12px;
      font-size: 1.75rem;
      color: #1e293b;
    }

    .project-info {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      display: flex;
      gap: 24px;
      margin-bottom: 24px;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .label {
      font-size: 12px;
      color: #64748b;
      font-weight: 600;
      text-transform: uppercase;
    }

    .value {
      font-weight: 500;
      color: #1e293b;
    }

    .prompt-area {
      resize: vertical;
      font-family: inherit;
    }

    .actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 16px;
    }

    .mt-3 { margin-top: 16px; }
  `]
})
export class CorreoComponent implements OnInit {
  proyecto: Proyecto | null = null;
  prompt: string = '';
  enviando: boolean = false;
  mensajeExito: string = '';
  mensajeError: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private proyectoService: ProyectoService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarProyecto(Number(id));
    }
  }

  cargarProyecto(id: number): void {
    this.proyectoService.getProyecto(id).subscribe({
      next: (p) => this.proyecto = p,
      error: (e) => this.mensajeError = 'Error al cargar el proyecto'
    });
  }

  enviarPrompt(): void {
    if (!this.proyecto || !this.prompt) return;

    this.enviando = true;
    this.mensajeExito = '';
    this.mensajeError = '';

    this.proyectoService.enviarPromptN8n(this.proyecto.id!, this.prompt).subscribe({
      next: () => {
        this.enviando = false;
        this.mensajeExito = '✅ Prompt enviado correctamente a n8n. El flujo ha iniciado.';
        setTimeout(() => this.volver(), 2000);
      },
      error: (err) => {
        this.enviando = false;
        this.mensajeError = '❌ Error al conectar con el servidor.';
        console.error(err);
      }
    });
  }

  volver(): void {
    this.router.navigate(['/proyectos']);
  }
}
