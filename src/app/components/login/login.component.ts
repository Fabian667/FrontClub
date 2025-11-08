import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  loading = signal(false);
  error = signal<string | null>(null);
  showRegister = signal(false);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  registerForm = this.fb.group({
    nombre: ['', [Validators.required]],
    apellido: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  private extractToken(resp: any): string | null {
    try {
      // Si es HttpResponse, intentar desde headers
      const headerAuth: string | null = resp?.headers?.get?.('Authorization') ?? null;
      if (headerAuth && headerAuth.toLowerCase().startsWith('bearer ')) {
        return headerAuth.slice(7).trim();
      }
      const body = resp?.body ?? resp;
      const candidates = [
        body?.token,
        body?.accessToken,
        body?.jwt,
        body?.access_token,
        body?.data?.token,
        body?.data?.accessToken,
        body?.result?.token
      ];
      for (const c of candidates) {
        if (typeof c === 'string' && c && c !== 'undefined') return c;
      }
      // Exploración básica de propiedades por si viene anidado:
      if (typeof body === 'object' && body) {
        for (const key of Object.keys(body)) {
          const val = (body as any)[key];
          if (typeof val === 'string' && val.split('.').length >= 2) {
            return val; // Probable JWT
          }
        }
      }
    } catch {}
    return null;
  }

  submit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(null);
    this.auth.login(this.form.value as any).subscribe({
      next: (resp: any) => {
        const token = this.extractToken(resp);
        if (typeof token !== 'string' || !token || token === 'undefined') {
          this.error.set('Inicio de sesión sin token válido. Contacta al administrador.');
          this.loading.set(false);
          return;
        }
        localStorage.setItem('token', token);
        // Navegar de inmediato y validar sesión en background
        this.router.navigateByUrl('/admin');
        this.auth.me().subscribe({
          next: () => {
            this.loading.set(false);
          },
          error: (e) => {
            localStorage.removeItem('token');
            this.error.set('Token inválido o expirado. Intenta iniciar sesión nuevamente.');
            this.router.navigateByUrl('/admin/login');
            this.loading.set(false);
          }
        });
      },
      error: (err) => {
        const status = err?.status;
        const backendMsg = err?.error?.message || err?.error?.error || err?.statusText;
        if (status === 401 || status === 403) {
          this.error.set(backendMsg || 'Credenciales inválidas o acceso no autorizado');
        } else if (status === 0) {
          this.error.set('Servidor no disponible. Verifica conexión al backend.');
        } else {
          this.error.set(backendMsg || 'Error al iniciar sesión. Intenta nuevamente.');
        }
        console.error('Login error:', err);
        this.loading.set(false);
      },
      complete: () => {}
    });
  }

  cancel() {
    this.router.navigateByUrl('/');
  }

  submitRegister() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    const payload = { ...this.registerForm.value } as any;
    this.auth.register(payload).subscribe({
      next: () => {
        // Intentar iniciar sesión con las mismas credenciales
        this.form.patchValue({ email: payload.email, password: payload.password });
        this.showRegister.set(false);
        // Reutilizar flujo de login
        this.submit();
      },
      error: (err) => {
        const status = err?.status;
        const backendMsg = err?.error?.message || err?.error?.error || err?.statusText;
        if (status === 409) {
          this.error.set(backendMsg || 'El email ya está registrado. Intenta iniciar sesión.');
        } else if (status === 0) {
          this.error.set('Servidor no disponible. Verifica conexión al backend.');
        } else {
          this.error.set(backendMsg || 'Error al registrar. Intenta nuevamente.');
        }
        console.error('Register error:', err);
        this.loading.set(false);
      }
    });
  }
}