import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ClientesComponent } from './components/clientes/clientes.component';
import { ProyectosComponent } from './components/proyectos/proyectos.component';
import { TimelineComponent } from './components/timeline/timeline.component';
import { CorreoComponent } from './components/correo/correo.component';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'clientes', component: ClientesComponent },
  { path: 'proyectos', component: ProyectosComponent },
  { path: 'timeline', component: TimelineComponent },
  { path: 'correo/:id', component: CorreoComponent }
];
