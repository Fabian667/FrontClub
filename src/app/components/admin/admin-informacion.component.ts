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
                   style="display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:8px;margin-right:6px;background:#1877f2;color:#fff;">
                  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                    <path fill="currentColor" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987H7.898V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.891h-2.33v6.987C18.343 21.128 22 16.991 22 12z"></path>
                  </svg>
                </a>
                <!-- Instagram -->
                <a *ngIf="info.instagram" [href]="info.instagram" target="_blank" rel="noopener" title="Instagram"
                   style="display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:8px;margin-right:6px;background:linear-gradient(45deg,#f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%);color:#fff;">
                  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                    <path fill="currentColor" d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.343 3.608 1.318.975.975 1.256 2.242 1.318 3.608.058 1.266.07 1.646.07 4.84s-.012 3.575-.07 4.84c-.062 1.366-.343 2.633-1.318 3.608-.975.975-2.242 1.256-3.608 1.318-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.343-3.608-1.318-.975-.975-1.256-2.242-1.318-3.608C2.175 15.615 2.163 15.235 2.163 12s.012-3.575.07-4.84c.062-1.366.343-2.633 1.318-3.608.975-.975 2.242-1.256 3.608-1.318C8.415 2.175 8.795 2.163 12 2.163zm0 1.622c-3.16 0-3.532.012-4.785.069-1.028.047-1.588.216-1.957.363-.492.191-.843.418-1.212.787-.369.369-.596.72-.787 1.212-.147.369-.316.929-.363 1.957-.057 1.253-.069 1.625-.069 4.785s.012 3.532.069 4.785c.047 1.028.216 1.588.363 1.957.191.492.418.843.787 1.212.369.369.72.596 1.212.787.369.147.929.316 1.957.363 1.253.057 1.625.069 4.785.069s3.532-.012 4.785-.069c1.028-.047 1.588-.216 1.957-.363.492-.191.843-.418 1.212-.787.369-.369.596-.72.787-1.212.147-.369.316-.929.363-1.957.057-1.253.069-1.625.069-4.785s-.012-3.532-.069-4.785c-.047-1.028-.216-1.588-.363-1.957-.191-.492-.418-.843-.787-1.212-.369-.369-.72-.596-1.212-.787-.369-.147-.929-.316-1.957-.363-1.253-.057-1.625-.069-4.785-.069zm0 3.09a4.125 4.125 0 1 1 0 8.25 4.125 4.125 0 0 1 0-8.25zm6.406-.844a1.031 1.031 0 1 1 0 2.062 1.031 1.031 0 0 1 0-2.062z"></path>
                  </svg>
                </a>
                <!-- WhatsApp -->
                <a *ngIf="info.whatsapp" [href]="'https://wa.me/' + ((info.whatsapp || '').replace(/[^0-9]/g, ''))" target="_blank" rel="noopener" title="WhatsApp"
                   style="display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:8px;margin-right:6px;background:#25D366;color:#fff;">
                  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                    <path fill="currentColor" d="M12 2C6.485 2 2 6.266 2 11.5c0 1.722.497 3.351 1.347 4.775L2 22l5.053-1.326C8.4 21.318 10.159 22 12 22c5.515 0 10-4.266 10-9.5S17.515 2 12 2zm0 18c-1.65 0-3.2-.5-4.5-1.356l-.322-.209-2.98.782.796-2.903-.217-.336C4.242 14.89 3.8 13.224 3.8 11.5 3.8 7.79 7.398 5 12 5s8.2 2.79 8.2 6.5S16.602 20 12 20zm5.258-5.83c-.286-.143-1.684-.83-1.945-.923-.26-.095-.45-.143-.64.143-.19.286-.733.923-.9 1.114-.167.19-.333.215-.62.072-.286-.143-1.21-.446-2.305-1.402-.852-.73-1.427-1.63-1.595-1.916-.167-.286-.018-.441.125-.584.129-.128.286-.333.429-.5.143-.167.19-.286.286-.476.095-.19.048-.357-.024-.5-.072-.143-.64-1.54-.877-2.106-.23-.554-.465-.477-.64-.485-.167-.008-.357-.01-.547-.01-.19 0-.5.072-.762.357-.26.286-1 1-1 2.429 0 1.429 1.048 2.811 1.193 3.005.143.19 2.063 3.15 5 4.277.7.24 1.248.383 1.674.491.702.168 1.341.144 1.846.087.562-.062 1.684-.686 1.92-1.35.238-.667.238-1.238.167-1.357-.072-.119-.262-.19-.548-.333z"></path>
                  </svg>
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