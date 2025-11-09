import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InstalacionService } from '../../core/services/instalacion.service';
import { Instalacion } from '../../models/instalacion.model';
import { NotificationService } from '../../core/services/notification.service';
import { UploadService } from '../../core/services/upload.service';

@Component({
  selector: 'app-admin-instalaciones',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="admin-section">
      <div class="section-header">
        <h2>Gestión de Instalaciones</h2>
        <button (click)="showForm = !showForm" class="btn btn-primary">
          {{ showForm ? 'Cancelar' : 'Nueva Instalación' }}
        </button>
      </div>

      <!-- Form -->
      <div class="form-container" *ngIf="showForm">
        <form [formGroup]="instalacionForm" (ngSubmit)="onSubmit()">
          <div class="form-row">
            <div class="form-group">
              <label>Nombre</label>
              <input type="text" formControlName="nombre" class="form-control">
            </div>
            <div class="form-group">
              <label>Tipo</label>
              <input type="text" formControlName="tipo" class="form-control" placeholder="CANCHA, SALON, etc.">
            </div>
          </div>

          <div class="form-group">
            <label>Descripción</label>
            <textarea formControlName="descripcion" class="form-control" rows="3"></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Capacidad Máxima</label>
              <input type="number" formControlName="capacidadMaxima" class="form-control" min="0">
            </div>
            <div class="form-group">
              <label>Precio por hora</label>
              <input type="number" formControlName="precioHora" class="form-control" min="0" step="0.01">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Requiere aprobación</label>
              <input type="checkbox" formControlName="requiereAprobacion" />
            </div>
            <div class="form-group">
              <label>Foto (URL o subir archivo)</label>
              <input type="text" formControlName="foto" class="form-control" placeholder="https://...">
              <input type="file" (change)="onImageSelected($event)" accept="image/*" style="margin-top:0.5rem" />
              <div *ngIf="instalacionForm.get('foto')?.value" style="margin-top:0.5rem">
                <img [src]="instalacionForm.get('foto')?.value" alt="Preview foto" style="max-height:80px;border:1px solid #ddd;border-radius:4px" />
              </div>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Estado</label>
              <select formControlName="estado" class="form-control">
                <option value="">Seleccionar estado</option>
                <option value="ACTIVA">ACTIVA</option>
                <option value="INACTIVA">INACTIVA</option>
              </select>
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-success" [disabled]="!instalacionForm.valid || loading">
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
              <th>Descripción</th>
              <th>Tipo</th>
              <th>Capacidad Máxima</th>
              <th>Precio/hora</th>
              <th>Requiere aprobación</th>
              <th>Foto</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let ins of instalaciones()">
              <td>{{ ins.nombre }}</td>
              <td>{{ ins.descripcion }}</td>
              <td>{{ ins.tipo }}</td>
              <td>{{ ins.capacidadMaxima }}</td>
              <td>{{ ins.precioHora }}</td>
              <td>{{ ins.requiereAprobacion ? 'Sí' : 'No' }}</td>
              <td>
                <img *ngIf="ins.foto || ins.imagen" [src]="ins.foto || ins.imagen" alt="Foto" style="height:40px;border-radius:4px" />
              </td>
              <td>{{ ins.estado }}</td>
              <td>
                <button (click)="editInstalacion(ins)" class="btn btn-sm btn-warning">Editar</button>
                <button (click)="deleteInstalacion(ins.id!)" class="btn btn-sm btn-danger">Eliminar</button>
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
export class AdminInstalacionesComponent implements OnInit {
  instalaciones = signal<Instalacion[]>([]);
  instalacionForm: FormGroup;
  showForm = false;
  loading = false;
  editingId: number | null = null;

  constructor(
    private instalacionesService: InstalacionService,
    private fb: FormBuilder
  ) {
    this.instalacionForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: [''],
      tipo: [''],
      capacidadMaxima: [0, [Validators.required, Validators.min(0)]],
      precioHora: [0, [Validators.min(0)]],
      requiereAprobacion: [false],
      foto: [''],
      estado: ['']
    });
  }

  private notify = inject(NotificationService);
  private uploadSrv = inject(UploadService);

  ngOnInit() {
    this.loadInstalaciones();
  }

  loadInstalaciones() {
    this.instalacionesService.getAll().subscribe({
      next: (data) => this.instalaciones.set(data),
      error: (error) => console.error('Error loading instalaciones:', error)
    });
  }

  onSubmit() {
    if (this.instalacionForm.valid) {
      this.loading = true;
      const data = this.instalacionForm.value;

      const op = this.editingId
        ? this.instalacionesService.update(this.editingId, data)
        : this.instalacionesService.create(data);

      op.subscribe({
        next: () => {
          this.loading = false;
          this.loadInstalaciones();
          this.resetForm();
          this.showForm = false;
          this.notify.success('Instalación guardada correctamente');
        },
        error: (error) => {
          this.loading = false;
          console.error('Error saving instalacion:', error);
        }
      });
    }
  }

  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    if (!file.type.startsWith('image/')) {
      this.notify.error('Selecciona un archivo de imagen válido');
      return;
    }
    this.loading = true;
    this.uploadSrv.uploadImage(file).subscribe({
      next: (res) => {
        this.instalacionForm.patchValue({ foto: res.path });
        this.loading = false;
        this.notify.info('Imagen subida, se guardará con la instalación');
      },
      error: (e) => {
        console.error('Error subiendo imagen', e);
        this.loading = false;
        this.notify.error('Error al subir la imagen');
      }
    });
  }

  editInstalacion(ins: Instalacion) {
    this.editingId = ins.id!;
    this.instalacionForm.patchValue({
      nombre: ins.nombre,
      descripcion: ins.descripcion,
      tipo: ins.tipo ?? '',
      capacidadMaxima: ins.capacidadMaxima ?? ins.capacidad ?? 0,
      precioHora: ins.precioHora ?? 0,
      requiereAprobacion: ins.requiereAprobacion ?? false,
      foto: ins.foto ?? ins.imagen ?? '',
      estado: ins.estado ?? ''
    });
    this.showForm = true;
  }

  deleteInstalacion(id: number) {
    if (confirm('¿Eliminar esta instalación?')) {
      this.instalacionesService.delete(id).subscribe({
        next: () => { this.loadInstalaciones(); this.notify.success('Instalación eliminada'); },
        error: (error) => console.error('Error deleting instalacion:', error)
      });
    }
  }

  resetForm() {
    this.instalacionForm.reset();
    this.editingId = null;
  }
}