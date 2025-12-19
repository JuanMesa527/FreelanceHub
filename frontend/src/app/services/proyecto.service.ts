import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Proyecto } from '../models/proyecto.model';

@Injectable({
  providedIn: 'root'
})
export class ProyectoService {
  private apiUrl = 'http://localhost:3000/api/proyectos';

  constructor(private http: HttpClient) {}

  getProyectos(filtros?: { estado?: string; cliente_id?: number }): Observable<Proyecto[]> {
    let params = new HttpParams();
    
    if (filtros?.estado) {
      params = params.set('estado', filtros.estado);
    }
    if (filtros?.cliente_id) {
      params = params.set('cliente_id', filtros.cliente_id.toString());
    }
    
    return this.http.get<Proyecto[]>(this.apiUrl, { params });
  }

  getProyecto(id: number): Observable<Proyecto> {
    return this.http.get<Proyecto>(`${this.apiUrl}/${id}`);
  }

  getAlertasProyectos(): Observable<Proyecto[]> {
    return this.http.get<Proyecto[]>(`${this.apiUrl}/alertas`);
  }

  createProyecto(proyecto: Proyecto): Observable<Proyecto> {
    return this.http.post<Proyecto>(this.apiUrl, proyecto);
  }

  updateProyecto(id: number, proyecto: Proyecto): Observable<Proyecto> {
    return this.http.put<Proyecto>(`${this.apiUrl}/${id}`, proyecto);
  }

  completarProyecto(id: number): Observable<Proyecto> {
    return this.http.patch<Proyecto>(`${this.apiUrl}/${id}/completar`, {});
  }

  deleteProyecto(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  enviarPromptN8n(proyectoId: number, prompt: string): Observable<any> {
    return this.http.post('http://localhost:3000/api/n8n/send-prompt', {
      proyecto_id: proyectoId,
      prompt: prompt
    });
  }
}
