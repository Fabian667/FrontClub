import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InformacionService } from '../../core/services/informacion.service';
import { Informacion } from '../../models/informacion.model';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-admin-informacion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="admin-section">
      <div class="section-header">
        <h2>Información del Club</h2>
        <button class="btn btn-primary" (click)="newRecord()">Nuevo</button>
      </div>

      <div class="form-container" *ngIf="showForm">
        <form [formGroup]="infoForm" (ngSubmit)="save()">
          <div class="form-row">
            <div class="form-group">
              <label>Nombre del Club</label>
              <input class="form-control" formControlName="nombreClub" />
            </div>
            <div class="form-group">
              <label>Email</label>
              <input class="form-control" formControlName="email" />
            </div>
            <div class="form-group">
              <label>Teléfono</label>
              <input class="form-control" formControlName="telefono" />
            </div>
            <div class="form-group">
              <label>WhatsApp</label>
              <input class="form-control" formControlName="whatsapp" />
            </div>
            <div class="form-group">
              <label>Dirección</label>
              <input class="form-control" formControlName="direccion" />
            </div>
            <div class="form-group">
              <label>Ciudad</label>
              <input class="form-control" formControlName="ciudad" />
            </div>
            <div class="form-group">
              <label>Provincia</label>
              <input class="form-control" formControlName="provincia" />
            </div>
            <div class="form-group">
              <label>Código Postal</label>
              <input class="form-control" formControlName="codigoPostal" />
            </div>
            <div class="form-group">
              <label>Horario de Atención</label>
              <input class="form-control" formControlName="horarioAtencion" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Facebook</label>
              <input class="form-control" formControlName="facebook" />
            </div>
            <div class="form-group">
              <label>Instagram</label>
              <input class="form-control" formControlName="instagram" />
            </div>
            <div class="form-group">
              <label>Website</label>
              <input class="form-control" formControlName="website" />
            </div>
            <div class="form-group">
              <label>Mapa Latitud</label>
              <input class="form-control" formControlName="mapaLatitud" />
            </div>
            <div class="form-group">
              <label>Mapa Longitud</label>
              <input class="form-control" formControlName="mapaLongitud" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group" style="grid-column: 1 / -1;">
              <label>Descripción</label>
              <textarea class="form-control" formControlName="descripcion"></textarea>
            </div>
            <div class="form-group">
              <label>Fundación (YYYY-MM-DD)</label>
              <input class="form-control" formControlName="fundacion" />
            </div>
            <div class="form-group" style="grid-column: 1 / -1;">
              <label>Misión</label>
              <textarea class="form-control" formControlName="mision"></textarea>
            </div>
            <div class="form-group" style="grid-column: 1 / -1;">
              <label>Visión</label>
              <textarea class="form-control" formControlName="vision"></textarea>
            </div>
          </div>

          <div class="form-actions">
            <button class="btn btn-success" type="submit" [disabled]="infoForm.invalid || loading">Guardar</button>
            <button class="btn btn-secondary" type="button" (click)="cancel()">Cancelar</button>
          </div>
        </form>
      </div>

      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Redes</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let info of informacion()">
              <td>{{ info.id }}</td>
              <td>{{ info.nombreClub }}</td>
              <td>{{ info.email }}</td>
              <td>{{ info.telefono }}</td>
              <td>
                <!-- Facebook -->
                <a *ngIf="info.facebook" [href]="info.facebook" target="_blank" rel="noopener" title="Facebook"
                   style="display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:8px;margin-right:6px;">
                  <img src="/icons/facebook.svg" alt="Facebook" width="24" height="24" />
                </a>
                <!-- Instagram -->
                <a *ngIf="info.instagram" [href]="info.instagram" target="_blank" rel="noopener" title="Instagram"
                   style="display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:8px;margin-right:6px;">
                  <img src="/icons/instagram.svg" alt="Instagram" width="24" height="24" />
                </a>
                <!-- WhatsApp -->
                <a *ngIf="info.whatsapp" [href]="'https://wa.me/' + ((info.whatsapp || '').replace(/[^0-9]/g, ''))" target="_blank" rel="noopener" title="WhatsApp"
                   style="display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:8px;margin-right:6px;">
                  <img src="/icons/whatsapp.svg" alt="WhatsApp" width="24" height="24" />
                </a>
              </td>
              <td>
                <button class="btn btn-sm btn-warning" (click)="edit(info)">Editar</button>
                <button class="btn btn-sm btn-danger" (click)="remove(info.id!)">Eliminar</button>
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
    .form-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; }
    .form-group { margin-bottom: 1rem; }
    .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 500; }
    .form-control { width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px; }
    textarea.form-control { min-height: 100px; }
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
export class AdminInformacionComponent implements OnInit {
  informacion = signal<Informacion[]>([]);
  infoForm: FormGroup;
  showForm = false;
  loading = false;
  editingId: number | null = null;
  private notify = inject(NotificationService);

  constructor(private infoService: InformacionService, private fb: FormBuilder) {
    this.infoForm = this.fb.group({
      nombreClub: ['', Validators.required],
      descripcion: [''],
      email: ['', [Validators.email]],
      telefono: [''],
      whatsapp: [''],
      direccion: [''],
      ciudad: [''],
      provincia: [''],
      codigoPostal: [''],
      horarioAtencion: [''],
      facebook: [''],
      instagram: [''],
      website: [''],
      mapaLatitud: [''],
      mapaLongitud: [''],
      fundacion: [''],
      mision: [''],
      vision: ['']
    });
  }

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.infoService.getAll().subscribe((list) => this.informacion.set(list));
  }

  newRecord() {
    this.editingId = null;
    this.infoForm.reset({ nombreClub: '' });
    this.showForm = true;
  }

  edit(row: Informacion) {
    this.editingId = row.id ?? null;
    this.infoForm.patchValue({
      nombreClub: row.nombreClub || '',
      descripcion: row.descripcion || '',
      email: row.email || '',
      telefono: row.telefono || '',
      whatsapp: row.whatsapp || '',
      direccion: row.direccion || '',
      ciudad: row.ciudad || '',
      provincia: row.provincia || '',
      codigoPostal: row.codigoPostal || '',
      horarioAtencion: row.horarioAtencion || '',
      facebook: row.facebook || '',
      instagram: row.instagram || '',
      website: row.website || '',
      mapaLatitud: row.mapaLatitud || '',
      mapaLongitud: row.mapaLongitud || '',
      fundacion: row.fundacion || '',
      mision: row.mision || '',
      vision: row.vision || ''
    });
    this.showForm = true;
  }

  save() {
    if (this.infoForm.invalid) return;
    this.loading = true;
    const payload: Partial<Informacion> = this.infoForm.value;
    const obs = this.editingId
      ? this.infoService.update(this.editingId, payload)
      : this.infoService.create(payload);
    obs.subscribe({
      next: () => {
        this.loading = false;
        // Evitar NG0100 programando cambios de estado tras el ciclo actual
        setTimeout(() => {
          this.showForm = false;
          this.load();
          this.notify.success('Información guardada correctamente');
        }, 0);
      },
      error: (err) => { this.loading = false; this.notify.error('No se pudo guardar la información'); console.error('Error guardando información:', err); }
    });
  }

  remove(id: number) {
    if (!confirm('¿Eliminar este registro?')) return;
    this.infoService.delete(id).subscribe({
      next: () => {
        // Evitar NG0100 programando la recarga tras el ciclo actual
        setTimeout(() => {
          this.load();
          this.notify.success('Información eliminada');
        }, 0);
      },
      error: (err) => { this.notify.error('No se pudo eliminar la información'); console.error('Error eliminando información:', err); }
    });
  }

  cancel() {
    this.showForm = false;
  }
}