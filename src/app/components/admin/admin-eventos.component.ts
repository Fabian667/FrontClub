import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EventoService } from '../../core/services/evento.service';
import { Evento } from '../../models/evento.model';

@Component({
  selector: 'app-admin-eventos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="admin-section">
      <div class="section-header">
        <h2>Gestión de Eventos</h2>
        <button (click)="showForm = !showForm" class="btn btn-primary">
          {{ showForm ? 'Cancelar' : 'Nuevo Evento' }}
        </button>
      </div>

      <!-- Form -->
      <div class="form-container" *ngIf="showForm">
        <form [formGroup]="eventoForm" (ngSubmit)="onSubmit()">
          <div class="form-row">
            <div class="form-group">
              <label>Nombre</label>
              <input type="text" formControlName="nombre" class="form-control">
            </div>
            <div class="form-group">
              <label>Fecha</label>
              <input type="date" formControlName="fecha" class="form-control">
            </div>
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
              <label>Lugar</label>
              <input type="text" formControlName="lugar" class="form-control">
            </div>
          </div>

          <div class="form-group">
            <label>Descripción</label>
            <textarea formControlName="descripcion" class="form-control" rows="3"></textarea>
          </div>

          <div class="form-group">
            <label>Imagen (URL)</label>
            <input type="text" formControlName="imagen" class="form-control" placeholder="https://...">
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-success" [disabled]="!eventoForm.valid || loading">
              {{ editingId ? 'Actualizar' : 'Crear' }}
            </button>
            <button type="button" (click)="resetForm()" class="btn btn-secondary">Limpiar</button>
          </div>
        </form>
      </div>

      <!-- List -->
      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Fecha</th>
              <th>Horario</th>
              <th>Lugar</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let ev of eventos()">
              <td>{{ ev.nombre }}</td>
              <td>{{ ev.fecha }}</td>
              <td>{{ ev.horaInicio }} - {{ ev.horaFin }}</td>
              <td>{{ ev.lugar }}</td>
              <td>
                <button (click)="editEvento(ev)" class="btn btn-sm btn-warning">Editar</button>
                <button (click)="deleteEvento(ev.id!)" class="btn btn-sm btn-danger">Eliminar</button>
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
export class AdminEventosComponent implements OnInit {
  eventos = signal<Evento[]>([]);
  eventoForm: FormGroup;
  showForm = false;
  loading = false;
  editingId: number | null = null;

  constructor(
    private eventosService: EventoService,
    private fb: FormBuilder
  ) {
    this.eventoForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: [''],
      fecha: ['', Validators.required],
      horaInicio: [''],
      horaFin: [''],
      lugar: [''],
      imagen: ['']
    });
  }

  ngOnInit() {
    this.loadEventos();
  }

  loadEventos() {
    this.eventosService.getAll().subscribe({
      next: (data) => this.eventos.set(data),
      error: (error) => console.error('Error loading eventos:', error)
    });
  }

  onSubmit() {
    if (this.eventoForm.valid) {
      this.loading = true;
      const data = this.eventoForm.value;

      const op = this.editingId
        ? this.eventosService.update(this.editingId, data)
        : this.eventosService.create(data);

      op.subscribe({
        next: () => {
          this.loading = false;
          this.loadEventos();
          this.resetForm();
          this.showForm = false;
        },
        error: (error) => {
          this.loading = false;
          console.error('Error saving evento:', error);
        }
      });
    }
  }

  editEvento(ev: Evento) {
    this.editingId = ev.id!;
    this.eventoForm.patchValue(ev);
    this.showForm = true;
  }

  deleteEvento(id: number) {
    if (confirm('¿Eliminar este evento?')) {
      this.eventosService.delete(id).subscribe({
        next: () => this.loadEventos(),
        error: (error) => console.error('Error deleting evento:', error)
      });
    }
  }

  resetForm() {
    this.eventoForm.reset();
    this.editingId = null;
  }
}