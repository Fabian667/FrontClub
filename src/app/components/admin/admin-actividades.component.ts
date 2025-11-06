import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActividadService } from '../../core/services/actividad.service';
import { Actividad } from '../../models/actividad.model';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-admin-actividades',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="admin-section">
      <div class="section-header">
        <h2>Gestión de Actividades</h2>
        <button (click)="showForm = !showForm" class="btn btn-primary">
          {{ showForm ? 'Cancelar' : 'Nueva Actividad' }}
        </button>
      </div>

      <!-- Form -->
      <div class="form-container" *ngIf="showForm">
        <form [formGroup]="actividadForm" (ngSubmit)="onSubmit()">
          <div class="form-row">
            <div class="form-group">
              <label>Nombre</label>
              <input type="text" formControlName="nombre" class="form-control">
            </div>
            <div class="form-group">
              <label>Día de la Semana</label>
              <select formControlName="diaSemana" class="form-control">
                <option value="">Seleccionar día</option>
                <option value="LUNES">Lunes</option>
                <option value="MARTES">Martes</option>
                <option value="MIERCOLES">Miércoles</option>
                <option value="JUEVES">Jueves</option>
                <option value="VIERNES">Viernes</option>
                <option value="SABADO">Sábado</option>
                <option value="DOMINGO">Domingo</option>
              </select>
            </div>
          </div>
          
          <div class="form-group">
            <label>Descripción</label>
            <textarea formControlName="descripcion" class="form-control" rows="3"></textarea>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Hora Inicio</label>
              <input type="time" formControlName="horaInicio" class="form-control">
            </div>
            <div class="form-group">
              <label>Hora Fin</label>
              <input type="time" formControlName="horaFin" class="form-control">
            </div>
            <div class="form-group">
              <label>Precio por Hora</label>
              <input type="number" formControlName="precioHora" class="form-control" min="0" step="0.01">
            </div>
          </div>
          
          <div class="form-actions">
            <button type="submit" class="btn btn-success" [disabled]="!actividadForm.valid || loading">
              {{ editingId ? 'Actualizar' : 'Crear' }}
            </button>
            <button type="button" (click)="resetForm()" class="btn btn-secondary">
              Limpiar
            </button>
          </div>
        </form>
      </div>

      <!-- List -->
      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Día</th>
              <th>Horario</th>
              <th>Precio</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let actividad of actividades()">
              <td>{{ actividad.nombre }}</td>
              <td>{{ actividad.descripcion }}</td>
              <td>{{ actividad.diaSemana }}</td>
              <td>{{ actividad.horaInicio }} - {{ actividad.horaFin }}</td>
              <td>{{ '$' + actividad.precioHora }}</td>
              <td>
                <button (click)="editActividad(actividad)" class="btn btn-sm btn-warning">
                  Editar
                </button>
                <button (click)="deleteActividad(actividad.id!)" class="btn btn-sm btn-danger">
                  Eliminar
                </button>
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
  `]
})
export class AdminActividadesComponent implements OnInit {
  actividades = signal<Actividad[]>([]);
  actividadForm: FormGroup;
  showForm = false;
  loading = false;
  editingId: number | null = null;

  constructor(
    private actividadService: ActividadService,
    private fb: FormBuilder
  ) {
    this.actividadForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: [''],
      diaSemana: [''],
      horaInicio: [''],
      horaFin: [''],
      precioHora: [0, [Validators.min(0)]]
    });
  }

  private notify = inject(NotificationService);

  ngOnInit() {
    this.loadActividades();
  }

  loadActividades() {
    this.actividadService.getAll().subscribe({
      next: (actividades) => this.actividades.set(actividades),
      error: (error) => console.error('Error loading actividades:', error)
    });
  }

  onSubmit() {
    if (this.actividadForm.valid) {
      this.loading = true;
      const actividadData = this.actividadForm.value;

      const operation = this.editingId 
        ? this.actividadService.update(this.editingId, actividadData)
        : this.actividadService.create(actividadData);

      operation.subscribe({
        next: () => {
          this.loading = false;
          this.loadActividades();
          this.resetForm();
          this.showForm = false;
          this.notify.success('Actividad guardada correctamente');
        },
        error: (error) => {
          this.loading = false;
          console.error('Error saving actividad:', error);
          
          // Mostrar mensaje de error más específico
          let errorMessage = 'Error al guardar la actividad';
          if (error.status === 403) {
            errorMessage = 'No tienes permisos para crear/editar actividades. Necesitas ser ADMIN.';
          } else if (error.status === 400) {
            errorMessage = 'Datos inválidos. Verifica que todos los campos estén correctos.';
          } else if (error.error?.message) {
            errorMessage = error.error.message;
          }
          
          alert(errorMessage);
        }
      });
    }
  }

  editActividad(actividad: Actividad) {
    this.editingId = actividad.id!;
    this.actividadForm.patchValue(actividad);
    this.showForm = true;
  }

  deleteActividad(id: number) {
    if (confirm('¿Estás seguro de eliminar esta actividad?')) {
      this.actividadService.delete(id).subscribe({
        next: () => { this.loadActividades(); this.notify.success('Actividad eliminada'); },
        error: (error) => console.error('Error deleting actividad:', error)
      });
    }
  }

  resetForm() {
    this.actividadForm.reset();
    this.editingId = null;
  }
}