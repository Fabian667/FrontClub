import { Component, signal } from '@angular/core';
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
        <!-- Botón menú hamburguesa para móvil -->
        <button class="menu-toggle" type="button"
                aria-label="Abrir menú"
                aria-controls="admin-nav-links"
                [attr.aria-expanded]="menuOpen()"
                (click)="toggleMenu()">
          <span class="bar"></span>
          <span class="bar"></span>
          <span class="bar"></span>
        </button>
        <div id="admin-nav-links" class="nav-links" [class.open]="menuOpen()">
          <a routerLink="/admin/actividades" routerLinkActive="active" *ngIf="!isSocio">Actividades</a>
          <a routerLink="/admin/instalaciones" routerLinkActive="active" *ngIf="!isSocio">Instalaciones</a>
          <a routerLink="/admin/eventos" routerLinkActive="active" *ngIf="!isSocio">Eventos</a>
          <a routerLink="/admin/noticias" routerLinkActive="active" *ngIf="!isSocio">Noticias</a>
          <a routerLink="/admin/usuarios" routerLinkActive="active" *ngIf="!isSocio">Usuarios</a>
          <a routerLink="/admin/reservas" routerLinkActive="active" (click)="closeMenu()">Reservas</a>
          <a routerLink="/admin/slider" routerLinkActive="active" *ngIf="!isSocio" (click)="closeMenu()">Slider</a>
          <button (click)="logout(); closeMenu()" class="logout-btn">Salir</button>
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
      padding: 0.75rem 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 1000;
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

    /* Botón hamburguesa */
    .menu-toggle {
      display: none;
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 6px;
      margin-left: auto;
    }
    .menu-toggle .bar {
      display: block;
      width: 22px;
      height: 2px;
      margin: 4px 0;
      background: white;
      border-radius: 2px;
      transition: all 0.3s ease;
    }

    /* Responsive nav en admin */
    @media (max-width: 768px) {
      .menu-toggle { display: inline-block; }
      .nav-links {
        display: none;
        position: absolute;
        top: 56px;
        left: 12px;
        right: 12px;
        background: #2c3e50;
        box-shadow: 0 8px 24px rgba(0,0,0,0.25);
        border-radius: 8px;
        padding: 12px;
        flex-direction: column;
        gap: 8px;
        z-index: 1001;
      }
      .nav-links.open { display: flex; }
      .nav-links a, .logout-btn {
        width: 100%;
        text-align: left;
      }
    }
  `]
})
export class AdminLayoutComponent {
  isSocio = false;
  menuOpen = signal<boolean>(false);

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

  toggleMenu() {
    this.menuOpen.set(!this.menuOpen());
  }

  closeMenu() {
    this.menuOpen.set(false);
  }
}