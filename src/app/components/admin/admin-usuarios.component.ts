import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { UsuarioService } from '../../core/services/usuario.service';
import { Usuario } from '../../models/usuario.model';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-usuarios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <h2>ABM Usuarios</h2>
    <div class="alert" *ngIf="isUsuario">Tu perfil es Usuario: no podés crear, editar ni eliminar usuarios.</div>

    <form [formGroup]="form" (ngSubmit)="save()" class="form">
      <div class="row">
        <label>Nombre</label>
        <input formControlName="nombre" [disabled]="isUsuario" />
      </div>
      <div class="row">
        <label>Apellido</label>
        <input formControlName="apellido" [disabled]="isUsuario" />
      </div>
      <div class="row">
        <label>DNI</label>
        <input formControlName="dni" [disabled]="isUsuario" />
        <small *ngIf="form.get('dni')?.touched && form.get('dni')?.invalid">
          DNI requerido para crear usuario
        </small>
      </div>
      <div class="row">
        <label>Teléfono</label>
        <input formControlName="telefono" [disabled]="isUsuario" />
        <small *ngIf="form.get('telefono')?.touched && form.get('telefono')?.invalid">
          Teléfono requerido
        </small>
      </div>
      <div class="row">
        <label>Dirección</label>
        <input formControlName="direccion" [disabled]="isUsuario" />
        <small *ngIf="form.get('direccion')?.touched && form.get('direccion')?.invalid">
          Dirección requerida
        </small>
      </div>
      <div class="row">
        <label>Fecha de nacimiento</label>
        <input formControlName="fechaNacimiento" type="date" [disabled]="isUsuario" />
        <small *ngIf="form.get('fechaNacimiento')?.touched && form.get('fechaNacimiento')?.invalid">
          Fecha de nacimiento requerida
        </small>
      </div>
      <div class="row">
        <label>Estado</label>
        <select formControlName="estado" [disabled]="isUsuario">
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
          <option value="eliminado">Eliminado</option>
        </select>
        <small *ngIf="form.get('estado')?.touched && form.get('estado')?.invalid">
          Estado requerido
        </small>
      </div>
      <div class="row">
        <label>Email</label>
        <input formControlName="email" type="email" [disabled]="isUsuario" />
      </div>
      <div class="row">
        <label>Tipo</label>
        <select formControlName="tipoCuenta" [disabled]="isUsuario">
          <option value="admin">Admin</option>
          <option value="socio">Socio</option>
        </select>
      </div>
      <div class="row">
        <label>Tipo de socio</label>
        <select formControlName="tipoSocio" [disabled]="isUsuario">
          <option value="">-- Seleccionar --</option>
          <option value="titular">Titular</option>
          <option value="familiar">Familiar</option>
          <option value="invitado">Invitado</option>
        </select>
        <small *ngIf="form.get('tipoSocio')?.touched && form.get('tipoSocio')?.invalid">
          Tipo de socio requerido para cuentas de tipo Socio
        </small>
      </div>
      <div class="row">
        <label>Foto de perfil (URL)</label>
        <input formControlName="fotoPerfil" type="url" [disabled]="isUsuario" />
      </div>
      <div class="row">
        <label>Password</label>
        <input formControlName="password" type="password" [disabled]="isUsuario" />
        <small *ngIf="form.get('password')?.touched && form.get('password')?.invalid">
          Password requerido para crear y mínimo 6 caracteres
        </small>
      </div>
      <div class="actions">
        <button type="submit" [disabled]="isUsuario || form.invalid">{{ editId ? 'Actualizar' : 'Crear' }}</button>
        <button type="button" (click)="reset()" class="secondary" [disabled]="isUsuario">Limpiar</button>
      </div>
    </form>

    <table class="table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Apellido</th>
          <th>Email</th>
          <th>Tipo</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let u of usuarios()">
          <td>{{u.id}}</td>
          <td>{{u.nombre}}</td>
          <td>{{u.apellido || '-'}} </td>
          <td>{{u.email}}</td>
          <td>{{u.tipoCuenta || '-'}}</td>
          <td>
            <button (click)="edit(u)" [disabled]="isUsuario">Editar</button>
            <button (click)="remove(u)" class="danger" [disabled]="isUsuario">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>
  `,
  styles: [`
    .alert { background: #fff6e5; border: 1px solid #f0c36d; padding: 0.6rem; border-radius: 6px; margin-bottom: 1rem; }
    .form { display: grid; grid-template-columns: 1fr; gap: 1rem; max-width: 520px; }
    .row label { font-weight: 600; display: block; }
    .row input, .row select { width: 100%; padding: 0.5rem; border: 1px solid #ccc; border-radius: 6px; }
    .actions { display: flex; gap: 0.5rem; }
    .actions button { padding: 0.5rem 0.8rem; border-radius: 6px; border: none; background: #2c3e50; color: white; }
    .actions .secondary { background: #888; }
    .table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
    .table th, .table td { border: 1px solid #eee; padding: 0.5rem; }
    .danger { background: #e74c3c; color: white; border: none; padding: 0.4rem 0.6rem; border-radius: 4px; }
  `]
})
export class AdminUsuariosComponent {
  private fb = inject(FormBuilder);
  private usuariosSrv = inject(UsuarioService);
  private notify = inject(NotificationService);
  private auth = inject(AuthService);

  usuarios = signal<Usuario[]>([]);
  editId: number | null = null;
  // Flag de rol para deshabilitar acciones en UI y lógica
  isUsuario: boolean = false;

  form = this.fb.group({
    nombre: ['', Validators.required],
    apellido: [''],
    dni: [''],
    telefono: [''],
    direccion: [''],
    fechaNacimiento: [''],
    estado: ['activo'],
    email: ['', [Validators.required, Validators.email]],
    tipoCuenta: ['socio', Validators.required],
    tipoSocio: [''],
    fotoPerfil: [''],
    password: ['']
  });

  ngOnInit() {
    this.load();
    this.setPasswordRequired(true);
    this.setDniRequired(true);
    this.setTelefonoRequired(true);
    this.setDireccionRequired(true);
    this.setFechaNacimientoRequired(true);
    this.setEstadoRequired(true);
    this.setTipoSocioRequired(true);
    // Requerir tipoSocio solo cuando tipoCuenta es 'socio'
    const tipoCtrl = this.form.get('tipoCuenta');
    tipoCtrl?.valueChanges.subscribe((val) => {
      const isSocio = String(val || '').toLowerCase() === 'socio';
      this.setTipoSocioRequired(isSocio);
    });

    // Determinar si el rol actual es 'usuario' para bloquear edición
    const roleLocal = (localStorage.getItem('role') || '').toLowerCase();
    this.isUsuario = roleLocal === 'usuario';
    // Intento silencioso por si aún no está cargado el usuario
    this.auth.meSilenced().subscribe({
      next: (me) => {
        const r = (me?.tipoCuenta || (me as any)?.tipo || '').toLowerCase();
        if (r) this.isUsuario = r === 'usuario';
      }
    });
  }

  load() {
    this.usuariosSrv.getAll().subscribe({ next: (d) => this.usuarios.set(d) });
  }

  save() {
    if (this.isUsuario) { this.notify.error('Tu perfil Usuario no puede crear ni editar usuarios'); return; }
    const creating = !this.editId;
    const payload: any = { ...this.form.value };
    // sanitize
    payload.nombre = (payload.nombre || '').trim();
    if (payload.apellido !== undefined) {
      const ap = (payload.apellido || '').trim();
      if (!ap) delete payload.apellido; else payload.apellido = ap;
    }
    if (payload.dni !== undefined) {
      const d = (payload.dni || '').trim();
      if (!d) delete payload.dni; else payload.dni = d;
    }
    if (payload.telefono !== undefined) {
      const t = (payload.telefono || '').trim();
      if (!t) delete payload.telefono; else payload.telefono = t;
    }
    if (payload.direccion !== undefined) {
      const dir = (payload.direccion || '').trim();
      if (!dir) delete payload.direccion; else payload.direccion = dir;
    }
    if (payload.fechaNacimiento !== undefined) {
      const fn = (payload.fechaNacimiento || '').trim();
      if (!fn) delete payload.fechaNacimiento; else payload.fechaNacimiento = fn;
    }
    if (payload.estado !== undefined) {
      const es = (payload.estado || '').trim();
      if (!es) delete payload.estado; else payload.estado = es;
    }
    if (payload.tipoSocio !== undefined) {
      const ts = (payload.tipoSocio || '').trim();
      if (!ts) delete payload.tipoSocio; else payload.tipoSocio = ts;
    }
    if (payload.fotoPerfil !== undefined) {
      const fp = (payload.fotoPerfil || '').trim();
      if (!fp) delete payload.fotoPerfil; else payload.fotoPerfil = fp;
    }
    payload.email = (payload.email || '').trim();
    const pass = (payload.password || '').trim();
    if (!creating && !pass) { delete payload.password; } else { payload.password = pass; }
    if (this.editId) {
      this.usuariosSrv.update(this.editId, payload).subscribe({
        next: () => { this.reset(); this.load(); this.notify.success('Usuario actualizado correctamente'); },
        error: (err) => { const msg = err?.error?.message || err?.error?.error || err?.message || 'Error al actualizar usuario'; this.notify.error(msg); }
      });
    } else {
      // Intento principal: crear vía /usuarios
      this.usuariosSrv.create(payload).subscribe({
        next: () => { this.reset(); this.load(); this.notify.success('Usuario creado correctamente'); },
        error: (err) => {
          const status = err?.status;
          const text = (err?.statusText || '').toLowerCase();
          const msgBody = (err?.error?.message || err?.message || '').toLowerCase();
          const isMethodNotAllowed = status === 405 || text.includes('method') || msgBody.includes('method');
          const shouldFallback = isMethodNotAllowed || (status === 400 && (
            msgBody.includes('password') || msgBody.includes('password_hash') || msgBody.includes('register') ||
            msgBody.includes('unknown') || msgBody.includes('dni') || msgBody.includes('invalid')
          ));
          if (shouldFallback) {
            // Fallback: registrar vía /auth/register
            const reg: any = { nombre: payload.nombre, email: payload.email, password: pass };
            if (payload.apellido) reg.apellido = payload.apellido;
            if (payload.dni) reg.dni = payload.dni;
            if (payload.telefono) reg.telefono = payload.telefono;
            if (payload.direccion) reg.direccion = payload.direccion;
            if (payload.fechaNacimiento) reg.fecha_nacimiento = payload.fechaNacimiento;
            if (payload.estado) reg.estado = payload.estado;
            if (payload.tipoSocio) reg.tipo_socio = payload.tipoSocio;
            if (payload.fotoPerfil) reg.foto_perfil = payload.fotoPerfil;
            // Tipo de cuenta
            const tipo = payload.tipo ?? payload.tipoCuenta;
            if (tipo) { reg.tipo = tipo; reg.tipo_cuenta = tipo; }
            this.auth.register(reg).subscribe({
              next: () => { this.reset(); this.load(); this.notify.success('Usuario creado correctamente'); },
              error: (e) => {
                const m = e?.error?.message || e?.error?.error || e?.message || 'Error al registrar usuario';
                this.notify.error(m);
              }
            });
          } else {
            const msg = err?.error?.message || err?.error?.error || err?.message || 'Error al crear usuario';
            this.notify.error(msg);
          }
        }
      });
    }
  }

  edit(u: Usuario) {
    if (this.isUsuario) { this.notify.error('Tu perfil Usuario no puede editar usuarios'); return; }
    this.editId = u.id;
    this.form.patchValue({ nombre: u.nombre, apellido: u.apellido || '', dni: (u as any).dni || '', telefono: (u as any).telefono || '', direccion: (u as any).direccion || '', fechaNacimiento: (u as any).fechaNacimiento || '', estado: u.estado || 'activo', email: u.email, tipoCuenta: u.tipoCuenta || 'socio', tipoSocio: (u as any).tipoSocio || '', fotoPerfil: (u as any).fotoPerfil || '', password: '' });
    this.setPasswordRequired(false);
    this.setDniRequired(false);
    this.setTelefonoRequired(false);
    this.setDireccionRequired(false);
    this.setFechaNacimientoRequired(false);
    this.setEstadoRequired(false);
    // Ajustar requerimiento de tipoSocio según tipoCuenta en edición
    const isSocio = String((u.tipoCuenta || '')).toLowerCase() === 'socio';
    this.setTipoSocioRequired(isSocio);
  }

  remove(u: Usuario) {
    if (this.isUsuario) { this.notify.error('Tu perfil Usuario no puede eliminar usuarios'); return; }
    if (!confirm('¿Eliminar usuario?')) return;
    this.usuariosSrv.delete(u.id).subscribe({ next: () => { this.load(); this.notify.success('Usuario eliminado'); } });
  }

  reset() { this.editId = null; this.form.reset({ nombre: '', apellido: '', dni: '', telefono: '', direccion: '', fechaNacimiento: '', estado: 'activo', email: '', tipoCuenta: 'socio', tipoSocio: '', fotoPerfil: '', password: '' }); this.setPasswordRequired(true); this.setDniRequired(true); this.setTelefonoRequired(true); this.setDireccionRequired(true); this.setFechaNacimientoRequired(true); this.setEstadoRequired(true); this.setTipoSocioRequired(true); }

  private setPasswordRequired(required: boolean) {
    const ctrl = this.form.get('password');
    if (!ctrl) return;
    if (required) {
      ctrl.setValidators([Validators.required, Validators.minLength(6)]);
    } else {
      ctrl.clearValidators();
    }
    ctrl.updateValueAndValidity();
  }

  private setDniRequired(required: boolean) {
    const ctrl = this.form.get('dni');
    if (!ctrl) return;
    if (required) {
      ctrl.setValidators([Validators.required]);
    } else {
      ctrl.clearValidators();
    }
    ctrl.updateValueAndValidity();
  }

  private setTelefonoRequired(required: boolean) {
    const ctrl = this.form.get('telefono');
    if (!ctrl) return;
    if (required) ctrl.setValidators([Validators.required]); else ctrl.clearValidators();
    ctrl.updateValueAndValidity();
  }

  private setDireccionRequired(required: boolean) {
    const ctrl = this.form.get('direccion');
    if (!ctrl) return;
    if (required) ctrl.setValidators([Validators.required]); else ctrl.clearValidators();
    ctrl.updateValueAndValidity();
  }

  private setFechaNacimientoRequired(required: boolean) {
    const ctrl = this.form.get('fechaNacimiento');
    if (!ctrl) return;
    if (required) ctrl.setValidators([Validators.required]); else ctrl.clearValidators();
    ctrl.updateValueAndValidity();
  }

  private setEstadoRequired(required: boolean) {
    const ctrl = this.form.get('estado');
    if (!ctrl) return;
    if (required) ctrl.setValidators([Validators.required]); else ctrl.clearValidators();
    ctrl.updateValueAndValidity();
  }

  private setTipoSocioRequired(required: boolean) {
    const ctrl = this.form.get('tipoSocio');
    if (!ctrl) return;
    if (required) ctrl.setValidators([Validators.required]); else ctrl.clearValidators();
    ctrl.updateValueAndValidity();
  }
}