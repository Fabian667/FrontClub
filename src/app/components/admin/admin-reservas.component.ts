import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { ReservaService } from '../../core/services/reserva.service';
import { Reserva, ReservaEstado } from '../../models/reserva.model';
import { AuthService } from '../../core/services/auth.service';
import { InstalacionService } from '../../core/services/instalacion.service';
import { Instalacion } from '../../models/instalacion.model';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-admin-reservas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <h2>ABM Reservas</h2>

    <div class="alert" *ngIf="isSocio">Tu perfil es Socio: solo podés crear y ver tus reservas.</div>

    <form [formGroup]="form" (ngSubmit)="save()" class="form">
      <div class="row">
        <label>Fecha de reserva</label>
        <input type="date" formControlName="fecha_reserva" />
        <div class="error" *ngIf="form.get('fecha_reserva')?.touched && form.get('fecha_reserva')?.invalid">
          <small *ngIf="form.get('fecha_reserva')?.errors?.['required']">La fecha es obligatoria.</small>
          <small *ngIf="form.get('fecha_reserva')?.errors?.['pastDate']">La fecha no puede ser anterior a hoy.</small>
        </div>
      </div>
      <div class="row">
        <label>Hora inicio</label>
        <input type="time" formControlName="hora_inicio" />
      </div>
      <div class="row">
        <label>Hora fin</label>
        <input type="time" formControlName="hora_fin" />
        <div class="error" *ngIf="(form.get('hora_fin')?.touched || form.touched) && form.errors">
          <small *ngIf="form.errors?.['badRange']">La hora de fin debe ser mayor que la hora de inicio.</small>
          <small *ngIf="form.errors?.['timeFormat']">Formato de hora inválido.</small>
        </div>
      </div>
      <div class="row">
        <label>Instalación</label>
        <select formControlName="instalacion_id">
          <option [ngValue]="null">Seleccionar...</option>
          <option *ngFor="let i of instalaciones()" [ngValue]="i.id">{{ i.nombre }}</option>
        </select>
        <div class="error" *ngIf="form.get('instalacion_id')?.touched && form.get('instalacion_id')?.invalid">
          <small>Debes seleccionar una instalación.</small>
        </div>
      </div>
      <div class="row">
        <label>Cantidad de personas</label>
        <input type="number" formControlName="cantidad_personas" min="1" />
        <div class="error" *ngIf="form.get('cantidad_personas')?.touched && form.get('cantidad_personas')?.invalid">
          <small *ngIf="form.get('cantidad_personas')?.errors?.['min']">La cantidad debe ser al menos 1.</small>
        </div>
      </div>
      <div class="row">
        <label>Estado</label>
        <select formControlName="estado">
          <option [ngValue]="null">Seleccionar...</option>
          <option *ngFor="let e of estados" [value]="e">{{ e }}</option>
        </select>
      </div>
      <div class="row">
        <label>Motivo</label>
        <textarea formControlName="motivo" rows="2"></textarea>
      </div>
      <div class="row">
        <label>Observaciones</label>
        <textarea formControlName="observaciones" rows="2"></textarea>
      </div>
      <div class="row">
        <label>Precio total</label>
        <input type="number" step="0.01" formControlName="precio_total" />
      </div>
      <div class="row">
        <label>Costo total</label>
        <input type="number" step="0.01" formControlName="costo_total" />
      </div>
      <div class="row">
        <label>Fecha cancelación</label>
        <input type="datetime-local" formControlName="fecha_cancelacion" />
      </div>
      <div class="actions">
        <button type="submit" [disabled]="form.invalid">{{ editId ? 'Actualizar' : 'Crear reserva' }}</button>
        <button type="button" (click)="reset()" class="secondary">Limpiar</button>
      </div>
    </form>

    <table class="table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Usuario</th>
          <th>Instalación</th>
          <th>Fecha</th>
          <th>Inicio</th>
          <th>Fin</th>
          <th>Personas</th>
          <th>Estado</th>
          <th>Precio</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let r of reservas()">
          <td>{{r.id}}</td>
          <td>{{r.usuario_id}}</td>
          <td>{{r.instalacion_id || '-'}}</td>
          <td>{{r.fecha_reserva}}</td>
          <td>{{r.hora_inicio || '-'}}</td>
          <td>{{r.hora_fin || '-'}}</td>
          <td>{{r.cantidad_personas || '-'}}</td>
          <td>{{r.estado || '-'}}</td>
          <td>{{r.precio_total || '-'}}</td>
          <td>
            <button (click)="edit(r)" [disabled]="isSocio && r.usuario_id !== currentUserId">Editar</button>
            <button (click)="remove(r)" class="danger" [disabled]="isSocio && r.usuario_id !== currentUserId">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>
  `,
  styles: [`
    .alert { background: #eaf4ea; border: 1px solid var(--color-border); padding: 0.6rem; border-radius: 6px; margin-bottom: 1rem; }
    .form { display: grid; grid-template-columns: 1fr; gap: 1rem; max-width: 720px; }
    .row label { font-weight: 600; display: block; }
    .row input, .row select, .row textarea { width: 100%; padding: 0.5rem; border: 1px solid var(--color-border); border-radius: 6px; }
    .actions { display: flex; gap: 0.5rem; }
    .actions button { padding: 0.5rem 0.8rem; border-radius: 6px; border: none; background: var(--color-primary); color: white; }
    .actions .secondary { background: var(--color-secondary); }
    .table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
    .table th, .table td { border: 1px solid var(--color-border); padding: 0.5rem; }
    .danger { background: #c62828; color: white; border: none; padding: 0.4rem 0.6rem; border-radius: 4px; }
  `]
})
export class AdminReservasComponent {
  private fb = inject(FormBuilder);
  private reservasSrv = inject(ReservaService);
  private auth = inject(AuthService);
  private instalacionesSrv = inject(InstalacionService);
  private notify = inject(NotificationService);

  reservas = signal<Reserva[]>([]);
  instalaciones = signal<Instalacion[]>([]);
  estados: ReservaEstado[] = ['pendiente', 'confirmada', 'cancelada', 'completada'];

  editId: number | null = null;
  currentUserId: number | null = null;
  isSocio = false;

  // Validadores personalizados
  private dateNotPast: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;
    // value expected as YYYY-MM-DD
    const today = new Date();
    const date = new Date(value + 'T00:00:00');
    // Normalizar horas para comparar solo fechas
    today.setHours(0,0,0,0);
    if (date < today) return { pastDate: true };
    return null;
  };

  private timeRange: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
    const inicio = group.get('hora_inicio')?.value;
    const fin = group.get('hora_fin')?.value;
    if (!inicio || !fin) return null;
    // comparar HH:mm
    const toMinutes = (hm: string) => {
      const [h, m] = hm.split(':').map((s: string) => parseInt(s, 10));
      return h * 60 + (m || 0);
    };
    if (isNaN(toMinutes(inicio)) || isNaN(toMinutes(fin))) return { timeFormat: true };
    if (toMinutes(fin) <= toMinutes(inicio)) return { badRange: true };
    return null;
  };

  form = this.fb.group({
    fecha_reserva: ['', [Validators.required, this.dateNotPast]],
    hora_inicio: ['', Validators.required],
    hora_fin: ['', Validators.required],
    instalacion_id: this.fb.control<number | null>(null, Validators.required),
    cantidad_personas: this.fb.control<number | null>(1, [Validators.min(1)]),
    estado: this.fb.control<ReservaEstado | null>(null),
    motivo: [''],
    observaciones: [''],
    precio_total: this.fb.control<number | null>(null),
    costo_total: this.fb.control<number | null>(null),
    fecha_cancelacion: ['']
  }, { validators: [this.timeRange] });

  ngOnInit() {
    // Intentar obtener usuario actual y cargar instalaciones
    this.auth.meSilenced().subscribe({
      next: (me: any) => {
        this.currentUserId = me?.id ?? null;
        const tipo = me?.tipoCuenta || me?.tipo || localStorage.getItem('role');
        this.isSocio = (tipo === 'socio');
        this.load();
      },
      error: () => {
        const tipo = localStorage.getItem('role');
        this.isSocio = (tipo === 'socio');
        this.load();
      }
    });
    this.instalacionesSrv.getAll().subscribe({ next: (list) => this.instalaciones.set(list) });
  }

  load() {
    this.reservasSrv.getAll().subscribe({ next: (d) => {
      const list = this.isSocio && this.currentUserId ? d.filter(r => r.usuario_id === this.currentUserId) : d;
      this.reservas.set(list);
    }});
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.form.value as any;
    // Forzar usuario_id para socio
    if (this.isSocio && this.currentUserId) {
      payload.usuario_id = this.currentUserId;
    }
    // Si estamos editando, intentar actualizar; fallback a eliminar+crear si no está soportado
    if (this.editId) {
      this.reservasSrv.update(this.editId, payload).subscribe({
        next: () => { this.reset(); this.load(); this.notify.success('Reserva actualizada correctamente'); },
        error: (err) => {
          const status = err?.status;
          const text = (err?.statusText || '').toLowerCase();
          const msgBody = (err?.error?.message || err?.message || '').toLowerCase();
          const methodNotAllowed = status === 405 || text.includes('method') || msgBody.includes('method');
          if (methodNotAllowed || status === 404 || status === 400) {
            // Fallback: eliminar la reserva anterior y crear una nueva con los datos editados
            const id = this.editId;
            this.reservasSrv.delete(id!).subscribe({
              next: () => {
                this.reservasSrv.create(payload).subscribe({
                  next: () => { this.reset(); this.load(); this.notify.success('Reserva actualizada correctamente'); },
                  error: () => { this.notify.error('No se pudo crear la reserva actualizada'); }
                });
              },
              error: () => { this.notify.error('No se pudo eliminar la reserva anterior'); }
            });
          } else {
            const msg = err?.error?.message || err?.error?.error || err?.message || 'Error al actualizar reserva';
            this.notify.error(msg);
          }
        }
      });
    } else {
      // Crear nueva reserva
      this.reservasSrv.create(payload).subscribe({
        next: () => {
          this.reset();
          this.load();
          this.notify.success('Reserva creada correctamente');
        },
        error: (err) => {
          const msg = err?.error?.message || err?.error?.error || err?.message || 'No se pudo crear la reserva';
          this.notify.error(msg);
        }
      });
    }
  }

  edit(r: Reserva) {
    this.editId = r.id;
    this.form.patchValue({
      fecha_reserva: r.fecha_reserva,
      hora_inicio: r.hora_inicio || '',
      hora_fin: r.hora_fin || '',
      instalacion_id: (r.instalacion_id ?? null) as number | null,
      cantidad_personas: (r.cantidad_personas ?? null) as number | null,
      estado: (r.estado ?? null) as ReservaEstado | null,
      motivo: r.motivo || '',
      observaciones: r.observaciones || '',
      precio_total: (r.precio_total ?? null) as number | null,
      costo_total: (r.costo_total ?? null) as number | null,
      fecha_cancelacion: r.fecha_cancelacion || ''
    });
  }

  remove(r: Reserva) {
    if (!confirm('¿Eliminar reserva?')) return;
    this.reservasSrv.delete(r.id).subscribe({ next: () => { this.load(); this.notify.success('Reserva eliminada'); } });
  }

  reset() {
    this.editId = null;
    this.form.reset({
      fecha_reserva: '',
      hora_inicio: '',
      hora_fin: '',
      instalacion_id: null,
      cantidad_personas: null,
      estado: null,
      motivo: '',
      observaciones: '',
      precio_total: null,
      costo_total: null,
      fecha_cancelacion: ''
    });
  }
}
