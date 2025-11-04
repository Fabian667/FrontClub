import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { LandingComponent } from './components/landing/landing.component';
import { AdminLayoutComponent } from './components/admin/admin-layout.component';
import { AdminActividadesComponent } from './components/admin/admin-actividades.component';
import { AdminInstalacionesComponent } from './components/admin/admin-instalaciones.component';
import { AdminEventosComponent } from './components/admin/admin-eventos.component';
import { AdminNoticiasComponent } from './components/admin/admin-noticias.component';
import { authGuard } from './core/guards/auth.guard';
import { AdminSliderComponent } from './components/admin/admin-slider.component';
import { AdminUsuariosComponent } from './components/admin/admin-usuarios.component';
import { AdminReservasComponent } from './components/admin/admin-reservas.component';
import { AdminContactoComponent } from './components/admin/admin-contacto.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'admin/login', component: LoginComponent },
  { 
    path: 'admin', 
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'actividades', pathMatch: 'full' },
      { path: 'actividades', component: AdminActividadesComponent },
      { path: 'instalaciones', component: AdminInstalacionesComponent },
      { path: 'eventos', component: AdminEventosComponent },
      { path: 'noticias', component: AdminNoticiasComponent },
      { path: 'slider', component: AdminSliderComponent },
      { path: 'usuarios', component: AdminUsuariosComponent },
      { path: 'reservas', component: AdminReservasComponent },
      { path: 'contacto', component: AdminContactoComponent }
    ]
  }
];
