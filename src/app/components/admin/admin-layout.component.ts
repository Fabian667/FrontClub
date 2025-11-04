import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-layout">
      <nav class="admin-nav">
        <div class="nav-brand">
          <h2>Admin Panel</h2>
        </div>
        <div class="nav-links">
          <a routerLink="/admin/actividades" routerLinkActive="active" *ngIf="!isSocio">Actividades</a>
          <a routerLink="/admin/instalaciones" routerLinkActive="active" *ngIf="!isSocio">Instalaciones</a>
          <a routerLink="/admin/eventos" routerLinkActive="active" *ngIf="!isSocio">Eventos</a>
          <a routerLink="/admin/noticias" routerLinkActive="active" *ngIf="!isSocio">Noticias</a>
          <a routerLink="/admin/usuarios" routerLinkActive="active" *ngIf="!isSocio">Usuarios</a>
          <a routerLink="/admin/reservas" routerLinkActive="active">Reservas</a>
          <a routerLink="/admin/slider" routerLinkActive="active" *ngIf="!isSocio">Slider</a>
          <button (click)="logout()" class="logout-btn">Salir</button>
        </div>
      </nav>
      <main class="admin-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .admin-layout { min-height: 100vh; }
    .admin-nav {
      background: #2c3e50;
      color: white;
      padding: 1rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .nav-brand h2 { margin: 0; }
    .nav-links { display: flex; gap: 1rem; align-items: center; }
    .nav-links a {
      color: white;
      text-decoration: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      transition: background 0.3s;
    }
    .nav-links a:hover, .nav-links a.active {
      background: rgba(255,255,255,0.1);
    }
    .logout-btn {
      background: #e74c3c;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
    }
    .admin-content { padding: 2rem; }
  `]
})
export class AdminLayoutComponent {
  isSocio = false;

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit() {
    this.auth.me().subscribe({
      next: (me: any) => {
        const tipo = me?.tipoCuenta || me?.tipo || localStorage.getItem('role');
        this.isSocio = (tipo === 'socio');
      },
      error: () => {
        const tipo = localStorage.getItem('role');
        this.isSocio = (tipo === 'socio');
      }
    });
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}