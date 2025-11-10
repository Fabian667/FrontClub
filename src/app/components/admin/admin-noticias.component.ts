import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { NoticiaService } from '../../core/services/noticia.service';
import { UploadService } from '../../core/services/upload.service';
import { Noticia } from '../../models/noticia.model';
import { finalize } from 'rxjs/operators';
import { NotificationService } from '../../core/services/notification.service';
import { FallbackImageDirective } from '../shared/fallback-image.directive';

@Component({
  selector: 'app-admin-noticias',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FallbackImageDirective],
  template: `
    <div class="admin-section">
      <div class="section-header">
        <h2>Gestión de Noticias</h2>
        <button (click)="toggleForm()" class="btn btn-primary">
          {{ showForm ? 'Cancelar' : 'Nueva Noticia' }}
        </button>
      </div>

      <!-- Formulario -->
      <div class="form-container" *ngIf="showForm">
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="form-row">
            <div class="form-group">
              <label>Título</label>
              <input type="text" class="form-control" [class.error]="isFieldInvalid('titulo')" formControlName="titulo">
              <div class="error-text" *ngIf="form.get('titulo')?.touched && form.get('titulo')?.errors as errors">
                <small *ngIf="errors['required']">El título es obligatorio</small>
                <small *ngIf="errors['minlength']">El título debe tener al menos 3 caracteres</small>
                <small *ngIf="errors['maxlength']">El título no puede tener más de 200 caracteres</small>
              </div>
            </div>
            <div class="form-group">
              <label>Fecha</label>
              <input type="date" class="form-control" [class.error]="isFieldInvalid('fecha')" formControlName="fecha">
              <div class="error-text" *ngIf="form.get('fecha')?.touched && form.get('fecha')?.errors as errors">
                <small *ngIf="errors['required']">La fecha es obligatoria</small>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label>Descripción</label>
            <textarea rows="4" class="form-control" [class.error]="form.get('descripcion')?.touched && form.get('descripcion')?.invalid" formControlName="descripcion"></textarea>
            <div class="error-text" *ngIf="form.get('descripcion')?.touched && form.get('descripcion')?.errors as errors">
              <small *ngIf="errors['required']">La descripción es obligatoria</small>
              <small *ngIf="errors['minlength']">La descripción debe tener al menos 10 caracteres</small>
              <small *ngIf="errors['maxlength']">La descripción no puede tener más de 2000 caracteres</small>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Subtítulo</label>
              <input type="text" class="form-control" formControlName="subtitulo">
            </div>
            <div class="form-group">
              <label>Autor</label>
              <input type="text" class="form-control" formControlName="autor">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Estado</label>
              <select class="form-control" formControlName="estado">
                <option value="borrador">Borrador</option>
                <option value="publicada">Publicada</option>
                <option value="archivada">Archivada</option>
              </select>
            </div>
            <div class="form-group" style="display:flex;align-items:center;gap:8px;">
              <input type="checkbox" id="destacada" formControlName="destacada">
              <label for="destacada" style="margin:0;">Destacada</label>
            </div>
          </div>

          <div class="form-group">
            <label>Editor</label>
            <input type="text" class="form-control" formControlName="editor">
          </div>

          <div class="form-group">
            <label>Imagen</label>
            <div class="image-upload">
              <div class="preview" *ngIf="imagenPreview()">
        <img [src]="imagenPreview()" alt="Preview" appFallbackImage>
                <button type="button" class="remove-image" (click)="removeImage()">&times;</button>
              </div>
              <div class="upload-area" *ngIf="!imagenPreview()"
                   (dragover)="$event.preventDefault()"
                   (drop)="onImageDrop($event)">
                <input type="file"
                       #fileInput
                       (change)="onImageSelected($event)"
                       accept="image/*"
                       [style.display]="'none'">
                <button type="button"
                        class="btn btn-outline"
                        (click)="fileInput.click()"
                        [disabled]="uploadingImage()">
                  <span class="spinner" *ngIf="uploadingImage()"></span>
                  {{ uploadingImage() ? 'Subiendo...' : 'Seleccionar imagen' }}
                </button>
                <p>o arrastra y suelta una imagen aquí</p>
              </div>
              <input type="hidden" formControlName="imagenUrl">
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-success" [disabled]="!form.valid || loading">
              <span class="spinner" *ngIf="loading"></span>
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
              <th>Fecha</th>
              <th>Descripción</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let n of noticias()">
              <td>
                <div class="d-flex align-items-center">
        <img *ngIf="n.imagenUrl" [src]="n.imagenUrl" class="table-image" [alt]="n.titulo" appFallbackImage>
                  {{ n.titulo }}
                </div>
              </td>
              <td>{{ n.fecha || '-' }}</td>
              <td>{{ n.descripcion || '-' }}</td>
              <td>
                <button class="btn btn-sm btn-warning" (click)="edit(n)">Editar</button>
                <button class="btn btn-sm btn-danger" (click)="remove(n.id)">Eliminar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .admin-section {
      padding: 2rem;
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #f0f0f0;
    }

    .section-header h2 {
      font-size: 1.5rem;
      color: #2c3e50;
      margin: 0;
    }

    .form-container {
      background: #f8f9fa;
      padding: 1.5rem;
      border-radius: 6px;
      margin-bottom: 2rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      margin-bottom: 1rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
      position: relative;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      color: #34495e;
      font-weight: 500;
    }

    .form-control {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 1px solid #dce4ec;
      border-radius: 6px;
      font-size: 1rem;
      transition: all 0.2s ease;
      background: #fff;
    }

    .form-control:focus {
      outline: none;
      border-color: #3498db;
      box-shadow: 0 0 0 2px rgba(52,152,219,0.2);
    }

    .form-control.error {
      border-color: #e74c3c;
      background-color: #fff8f8;
    }

    textarea.form-control {
      min-height: 120px;
      resize: vertical;
    }

    .error-text {
      color: #e74c3c;
      font-size: 0.8rem;
      margin-top: 0.25rem;
      display: block;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid #eee;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      min-width: 120px;
    }

    .btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }

    .btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }

    .btn-primary {
      background: #3498db;
      color: #fff;
    }

    .btn-primary:hover {
      background: #2980b9;
    }

    .btn-success {
      background: #2ecc71;
      color: #fff;
    }

    .btn-success:hover {
      background: #27ae60;
    }

    .btn-secondary {
      background: #95a5a6;
      color: #fff;
    }

    .btn-secondary:hover {
      background: #7f8c8d;
    }

    .btn-warning {
      background: #f1c40f;
      color: #2c3e50;
    }

    .btn-warning:hover {
      background: #f39c12;
    }

    .btn-danger {
      background: #e74c3c;
      color: #fff;
    }

    .btn-danger:hover {
      background: #c0392b;
    }

    .table-container {
      background: #fff;
      border-radius: 6px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .table {
      width: 100%;
      border-collapse: collapse;
    }

    .table th {
      background: #f8f9fa;
      color: #2c3e50;
      font-weight: 600;
      padding: 1rem;
      text-align: left;
      border-bottom: 2px solid #dce4ec;
    }

    .table td {
      padding: 1rem;
      border-bottom: 1px solid #eee;
      color: #34495e;
    }

    .table tr:hover {
      background: #f8f9fa;
    }

    .spinner {
      display: inline-block;
      width: 1.2rem;
      height: 1.2rem;
      margin-right: 0.5rem;
      border: 2px solid currentColor;
      border-radius: 50%;
      border-top-color: transparent;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .btn .spinner {
      border-width: 2px;
    }

    /* Image upload styles */
    .image-upload {
      margin-top: 0.5rem;
    }

    .preview {
      position: relative;
      width: 200px;
      height: 200px;
      border-radius: 8px;
      overflow: hidden;
      margin-bottom: 1rem;
    }

    .preview img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .remove-image {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      width: 2rem;
      height: 2rem;
      border-radius: 50%;
      background: rgba(0,0,0,0.5);
      color: white;
      border: none;
      font-size: 1.2rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.2s;
    }

    .remove-image:hover {
      background: rgba(0,0,0,0.7);
    }

    .upload-area {
      border: 2px dashed #dce4ec;
      border-radius: 8px;
      padding: 2rem;
      text-align: center;
      transition: all 0.2s;
      background: #f8f9fa;
    }

    .upload-area:hover {
      border-color: #3498db;
      background: #f0f4f7;
    }

    .btn-outline {
      background: transparent;
      border: 1px solid #3498db;
      color: #3498db;
      margin-bottom: 1rem;
    }

    .btn-outline:hover {
      background: #3498db;
      color: white;
    }

    .upload-area p {
      margin: 0;
      color: #7f8c8d;
      font-size: 0.9rem;
    }

    /* Table image preview */
    .table-image {
      width: 50px;
      height: 50px;
      border-radius: 4px;
      object-fit: cover;
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
      }

      .btn {
        width: 100%;
      }

      .form-actions {
        flex-direction: column;
      }

      .admin-section {
        padding: 1rem;
      }
    }
  `]
})
export class AdminNoticiasComponent implements OnInit {
  noticias = signal<Noticia[]>([]);
  showForm = false;
  loading = false;
  editingId: number | null = null;

  private uploadSrv = inject(UploadService);
  private notify = inject(NotificationService);

  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.uploadImage(input.files[0]);
    }
  }

  onImageDrop(event: DragEvent) {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (files?.length) {
      this.uploadImage(files[0]);
    }
  }

  uploadImage(file: File) {
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona una imagen válida');
      return;
    }

    // Preview inmediato usando FileReader
    const reader = new FileReader();
    reader.onload = (e) => this.imagenPreview.set(e.target?.result as string);
    reader.readAsDataURL(file);

    this.uploadingImage.set(true);
    this.uploadSrv.uploadImageTo(file, 'imagenes')
      .pipe(finalize(() => this.uploadingImage.set(false)))
      .subscribe({
        next: (response) => {
          this.form.patchValue({ imagenUrl: response.path });
        },
        error: (error) => {
          console.error('Error subiendo imagen:', error);
          this.imagenPreview.set(null);
          alert('Error al subir la imagen. Por favor intenta de nuevo.');
        }
      });
  }

  removeImage() {
    this.imagenPreview.set(null);
    this.form.patchValue({ imagenUrl: '' });
  }

  // Helper para validación de campos
  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!field && field.touched && field.invalid;
  }

  private fb = inject(FormBuilder)
  imagenPreview = signal<string | null>(null);
  uploadingImage = signal<boolean>(false);

  form = this.fb.group({
    titulo: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
    descripcion: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(2000)]],
    fecha: ['', Validators.required],
    imagenUrl: [''],
    subtitulo: ['', [Validators.maxLength(255)]],
    autor: ['', [Validators.maxLength(255)]],
    destacada: [false],
    estado: ['borrador'],
    editor: ['', [Validators.maxLength(255)]]
  });

  constructor(private noticiaService: NoticiaService) {}

  ngOnInit(): void {
    this.load();
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) this.resetForm();
  }

  load() {
    this.noticiaService.getAll().subscribe({
      next: (res) => this.noticias.set(res ?? []),
      error: (e) => console.error('Error cargando noticias:', e)
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    const raw = this.form.value as Partial<Noticia>;
    const data: Partial<Noticia> = {
      titulo: (raw.titulo ?? '').toString().trim(),
      descripcion: (raw.descripcion ?? '').toString().trim(),
      fecha: raw.fecha ?? '',
      imagenUrl: raw.imagenUrl ?? '',
      subtitulo: (raw.subtitulo ?? '').toString().trim(),
      autor: (raw.autor ?? '').toString().trim(),
      destacada: !!raw.destacada,
      estado: raw.estado ?? undefined,
      editor: (raw.editor ?? '').toString().trim()
    };
    // Si tras trim queda vacío, eliminar para evitar validaciones del backend
    if (!data.titulo) delete data.titulo;
    if (!data.descripcion) delete data.descripcion;
    if (!data.fecha) delete data.fecha;
    if (!data.imagenUrl) delete data.imagenUrl;
    if (!data.subtitulo) delete data.subtitulo;
    if (!data.autor) delete data.autor;
    if (!data.editor) delete data.editor;
    const op = this.editingId ? this.noticiaService.update(this.editingId, data) : this.noticiaService.create(data);
    op.subscribe({
      next: () => {
        this.loading = false;
        this.load();
        this.resetForm();
        this.showForm = false;
        this.notify.success('Noticia guardada correctamente');
      },
      error: (error) => {
        this.loading = false;
        console.error('Error guardando noticia:', error);
        let msg = 'Error al guardar la noticia';
        if (error?.status === 403) msg = 'No tienes permisos para crear/editar noticias. Necesitas ser ADMIN.';
        else if (error?.status === 400) msg = 'Datos inválidos. Verifica los campos.';
        else if (error?.error?.message) msg = error.error.message;
        alert(msg);
      }
    });
  }

  edit(n: Noticia) {
    this.editingId = n.id;
    this.form.patchValue(n);
    if (n.imagenUrl) {
      this.imagenPreview.set(n.imagenUrl);
    }
    this.showForm = true;
  }

  remove(id: number) {
    if (!confirm('¿Eliminar esta noticia?')) return;
    this.noticiaService.delete(id).subscribe({
      next: () => { this.load(); this.notify.success('Noticia eliminada'); },
      error: (e) => console.error('Error eliminando noticia:', e)
    });
  }

  resetForm() {
    this.editingId = null;
    this.imagenPreview.set(null);
    this.form.reset();
  }
}