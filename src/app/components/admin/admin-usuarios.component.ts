import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { UsuarioService } from '../../core/services/usuario.service';
import { Usuario } from '../../models/usuario.model';

@Component({
  selector: 'app-admin-usuarios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <h2>ABM Usuarios</h2>
    <form [formGroup]="form" (ngSubmit)="save()" class="form">
      <div class="row">
        <label>Nombre</label>
        <input formControlName="nombre" />
      </div>
      <div class="row">
        <label>Email</label>
        <input formControlName="email" type="email" />
      </div>
      <div class="row">
        <label>Tipo</label>
        <select formControlName="tipoCuenta">
          <option value="admin">Admin</option>
          <option value="socio">Socio</option>
        </select>
      </div>
      <div class="actions">
        <button type="submit" [disabled]="form.invalid">{{ editId ? 'Actualizar' : 'Crear' }}</button>
        <button type="button" (click)="reset()" class="secondary">Limpiar</button>
      </div>
    </form>

    <table class="table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Email</th>
          <th>Tipo</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let u of usuarios()">
          <td>{{u.id}}</td>
          <td>{{u.nombre}}</td>
          <td>{{u.email}}</td>
          <td>{{u.tipoCuenta || '-'}}</td>
          <td>
            <button (click)="edit(u)">Editar</button>
            <button (click)="remove(u)" class="danger">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>
  `,
  styles: [`
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

  usuarios = signal<Usuario[]>([]);
  editId: number | null = null;

  form = this.fb.group({
    nombre: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    tipoCuenta: ['socio', Validators.required],
    password: ['']
  });

  ngOnInit() { this.load(); }

  load() {
    this.usuariosSrv.getAll().subscribe({ next: (d) => this.usuarios.set(d) });
  }

  save() {
    const payload: any = this.form.value;
    if (!payload.password) { delete payload.password; }
    if (this.editId) {
      this.usuariosSrv.update(this.editId, payload).subscribe({ next: () => { this.reset(); this.load(); } });
    } else {
      this.usuariosSrv.create(payload).subscribe({ next: () => { this.reset(); this.load(); } });
    }
  }

  edit(u: Usuario) {
    this.editId = u.id;
    this.form.patchValue({ nombre: u.nombre, email: u.email, tipoCuenta: u.tipoCuenta || 'socio', password: '' });
  }

  remove(u: Usuario) {
    if (!confirm('¿Eliminar usuario?')) return;
    this.usuariosSrv.delete(u.id).subscribe({ next: () => this.load() });
  }

  reset() { this.editId = null; this.form.reset({ nombre: '', email: '', tipoCuenta: 'socio', password: '' }); }
}