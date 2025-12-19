import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-container">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <h1 class="logo">📊 FreelanceHub</h1>
        </div>
        <nav class="sidebar-nav">
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">🏠</span>
            <span>Dashboard</span>
          </a>
          <a routerLink="/clientes" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">👥</span>
            <span>Clientes</span>
          </a>
          <a routerLink="/proyectos" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">📁</span>
            <span>Proyectos</span>
          </a>
          <a routerLink="/timeline" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">📅</span>
            <span>Línea de Tiempo</span>
          </a>
        </nav>
        <div class="sidebar-footer">
          <p>Juan Mesa - Reto Fullstack BdB</p>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      display: flex;
      min-height: 100vh;
    }

    .sidebar {
      width: 260px;
      background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
      color: white;
      display: flex;
      flex-direction: column;
      position: fixed;
      height: 100vh;
      left: 0;
      top: 0;
    }

    .sidebar-header {
      padding: 24px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }

    .logo {
      font-size: 1.5rem;
      font-weight: 700;
      margin: 0;
    }

    .sidebar-nav {
      flex: 1;
      padding: 16px 12px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      color: rgba(255,255,255,0.7);
      text-decoration: none;
      border-radius: 8px;
      transition: all 0.2s ease;
      font-weight: 500;
    }

    .nav-item:hover {
      background: rgba(255,255,255,0.1);
      color: white;
    }

    .nav-item.active {
      background: #4f46e5;
      color: white;
    }

    .nav-icon {
      font-size: 1.25rem;
    }

    .sidebar-footer {
      padding: 16px 24px;
      border-top: 1px solid rgba(255,255,255,0.1);
      font-size: 12px;
      color: rgba(255,255,255,0.5);
    }

    .main-content {
      flex: 1;
      margin-left: 260px;
      padding: 24px;
      background-color: #f5f7fa;
      min-height: 100vh;
    }

    @media (max-width: 768px) {
      .sidebar {
        width: 70px;
      }

      .sidebar-header h1,
      .nav-item span:not(.nav-icon),
      .sidebar-footer {
        display: none;
      }

      .nav-item {
        justify-content: center;
        padding: 16px;
      }

      .main-content {
        margin-left: 70px;
      }
    }
  `]
})
export class AppComponent {
  title = 'Gestión de Proyectos Freelance';
}
