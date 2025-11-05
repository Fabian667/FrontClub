import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { SliderService } from '../../core/services/slider.service';
import { SliderImagen } from '../../models/slider-imagen.model';

@Component({
  selector: 'app-admin-slider',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="admin-section">
      <div class="section-header">
        <h2>Gestión de Sliders</h2>
        <button (click)="toggleForm()" class="btn btn-primary">
          {{ showForm ? 'Cancelar' : 'Nuevo Slider' }}
        </button>
      </div>

      <!-- Formulario -->
      <div class="form-container" *ngIf="showForm">
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="form-row">
            <div class="form-group">
              <label>Título</label>
              <input type="text" class="form-control" formControlName="titulo">
            </div>
            <div class="form-group">
              <label>Sección</label>
              <select class="form-control" formControlName="seccion">
                <option value="landing">Pantalla principal</option>
                <option value="actividades">Actividades</option>
                <option value="instalaciones">Instalaciones</option>
                <option value="eventos">Eventos</option>
                <option value="noticias">Noticias</option>
              </select>
            </div>
            <div class="form-group">
              <label>Orden</label>
              <input type="number" class="form-control" formControlName="orden" min="0">
            </div>
          </div>

          <div class="form-group">
            <label>Descripción</label>
            <textarea rows="3" class="form-control" formControlName="descripcion"></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Imagen (URL)</label>
              <input type="url" class="form-control" formControlName="imagen" placeholder="https://...">
            </div>
            <div class="form-group">
              <label>Enlace (URL opcional)</label>
              <input type="url" class="form-control" formControlName="enlace" placeholder="https://...">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Fecha Inicio</label>
              <input type="date" class="form-control" formControlName="fechaInicio">
            </div>
            <div class="form-group">
              <label>Fecha Fin</label>
              <input type="date" class="form-control" formControlName="fechaFin">
            </div>
            <div class="form-group">
              <label>Activo</label>
              <select class="form-control" formControlName="activo">
                <option [value]="true">Sí</option>
                <option [value]="false">No</option>
              </select>
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-success" [disabled]="!form.valid || loading">
              {{ editingId ? 'Actualizar' : 'Crear' }}
            </button>
            <button type="button" (click)="resetForm()" class="btn btn-secondary">Limpiar</button>
          </div>
        </form>
      </div>

      <!-- Listado -->
      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>Título</th>
              <th>Sección</th>
              <th>Orden</th>
              <th>Activo</th>
              <th>Vigencia</th>
              <th>Imagen</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let s of sliders()">
              <td>{{ s.titulo || '-' }}</td>
              <td>{{ s.seccion || '-' }}</td>
              <td>{{ s.orden ?? '-' }}</td>
              <td>{{ s.activo ? 'Sí' : 'No' }}</td>
              <td>
                <span *ngIf="s.fechaInicio">{{ s.fechaInicio }}</span>
                <span *ngIf="s.fechaFin"> - {{ s.fechaFin }}</span>
              </td>
              <td>
                <img *ngIf="s.imagen" [src]="s.imagen" alt="Imagen" width="60" height="40" style="object-fit: cover; border-radius: 4px;" />
              </td>
              <td>
                <button class="btn btn-sm btn-warning" (click)="edit(s)">Editar</button>
                <button class="btn btn-sm btn-danger" (click)="remove(s.id!)">Eliminar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .admin-section { padding: 2rem; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    .form-container { background: #f8f9fa; padding: 2rem; border-radius: 8px; margin-bottom: 2rem; }
    .form-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
    .form-group { margin-bottom: 1rem; }
    .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 500; }
    .form-control { width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px; }
    .form-actions { display: flex; gap: 1rem; margin-top: 1rem; }
    .btn { padding: 0.5rem 1rem; border: none; border-radius: 4px; cursor: pointer; font-weight: 500; }
    .btn-primary { background: #007bff; color: white; }
    .btn-success { background: #28a745; color: white; }
    .btn-warning { background: #ffc107; color: #212529; }
    .btn-danger { background: #dc3545; color: white; }
    .btn-secondary { background: #6c757d; color: white; }
    .btn-sm { padding: 0.25rem 0.5rem; font-size: 0.875rem; }
    .table-container { overflow-x: auto; }
    .table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; }
    .table th, .table td { padding: 1rem; text-align: left; border-bottom: 1px solid #dee2e6; }
    .table th { background: #f8f9fa; font-weight: 600; }
    @media (max-width: 768px) {
      .admin-section { padding: 1rem; }
      .form-actions { flex-direction: column; }
      .btn { width: 100%; }
    }
  `]
})
export class AdminSliderComponent implements OnInit {
  private fb = inject(FormBuilder);
  private sliderSrv = inject(SliderService);

  sliders = signal<SliderImagen[]>([]);
  showForm = false;
  loading = false;
  editingId: number | null = null;

  form = this.fb.group({
    titulo: [''],
    descripcion: [''],
    imagen: ['', Validators.required],
    enlace: [''],
    seccion: ['landing', Validators.required],
    orden: [0, [Validators.min(0)]],
    activo: [true],
    fechaInicio: [''],
    fechaFin: ['']
  });

  ngOnInit(): void {
    this.load();
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) this.resetForm();
  }

  load() {
    this.sliderSrv.getAll().subscribe({
      next: (list) => this.sliders.set(list ?? []),
      error: (e) => console.error('Error cargando sliders:', e)
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    const data = this.form.value as Partial<SliderImagen>;
    const op = this.editingId ? this.sliderSrv.update(this.editingId, data) : this.sliderSrv.create(data);
    op.subscribe({
      next: () => {
        this.loading = false;
        this.load();
        this.resetForm();
        this.showForm = false;
      },
      error: (error) => {
        this.loading = false;
        console.error('Error guardando slider:', error);
        let msg = 'Error al guardar el slider';
        if (error?.status === 403) msg = 'No tienes permisos para crear/editar sliders. Necesitas ser ADMIN.';
        else if (error?.status === 400) msg = 'Datos inválidos. Verifica los campos.';
        else if (error?.error?.message) msg = error.error.message;
        alert(msg);
      }
    });
  }

  edit(s: SliderImagen) {
    this.editingId = s.id ?? null;
    this.form.patchValue({
      titulo: s.titulo || '',
      descripcion: s.descripcion || '',
      imagen: s.imagen || '',
      enlace: s.enlace || '',
      seccion: s.seccion || 'landing',
      orden: s.orden ?? 0,
      activo: !!s.activo,
      fechaInicio: s.fechaInicio || '',
      fechaFin: s.fechaFin || ''
    });
    this.showForm = true;
  }

  remove(id: number) {
    if (!confirm('¿Eliminar este slider?')) return;
    this.sliderSrv.delete(id).subscribe({
      next: () => this.load(),
      error: (e) => console.error('Error eliminando slider:', e)
    });
  }

  resetForm() {
    this.editingId = null;
    this.form.reset({ activo: true, orden: 0, seccion: 'landing' });
  }
}