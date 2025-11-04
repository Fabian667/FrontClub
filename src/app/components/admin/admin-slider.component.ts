import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-admin-slider',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="admin-slider">
      <h2>Configurar Slider de Portada</h2>
      <p>Definí hasta 4 URLs de imágenes para el fondo de la portada. Se guardan en el navegador (localStorage), no en la base de datos.</p>

      <form [formGroup]="form" (ngSubmit)="save()" class="slider-form">
        <div class="field">
          <label>Imagen 1</label>
          <input type="url" formControlName="img1" placeholder="https://..." />
        </div>
        <div class="preview" *ngIf="form.value.img1">
          <img [src]="form.value.img1" alt="Imagen 1" />
        </div>

        <div class="field">
          <label>Imagen 2</label>
          <input type="url" formControlName="img2" placeholder="https://..." />
        </div>
        <div class="preview" *ngIf="form.value.img2">
          <img [src]="form.value.img2" alt="Imagen 2" />
        </div>

        <div class="field">
          <label>Imagen 3</label>
          <input type="url" formControlName="img3" placeholder="https://..." />
        </div>
        <div class="preview" *ngIf="form.value.img3">
          <img [src]="form.value.img3" alt="Imagen 3" />
        </div>

        <div class="field">
          <label>Imagen 4</label>
          <input type="url" formControlName="img4" placeholder="https://..." />
        </div>
        <div class="preview" *ngIf="form.value.img4">
          <img [src]="form.value.img4" alt="Imagen 4" />
        </div>

        <div class="actions">
          <button type="submit">Guardar</button>
          <button type="button" (click)="clear()" class="secondary">Vaciar</button>
        </div>
      </form>

      <div class="help">
        <p>Tip: Podés usar imágenes públicas de tus ABMs (por ejemplo, la URL de una instalación o evento) o cualquier URL válida.</p>
      </div>
    </div>
  `,
  styles: [`
    .admin-slider { max-width: 800px; margin: 0 auto; }
    .slider-form { display: grid; grid-template-columns: 1fr; gap: 1rem; }
    .field label { display: block; font-weight: 600; margin-bottom: 0.25rem; }
    .field input { width: 100%; padding: 0.6rem 0.8rem; border: 1px solid var(--color-border); border-radius: 6px; }
    .preview { width: 100%; height: 160px; overflow: hidden; border-radius: 8px; border: 1px solid var(--color-border); }
    .preview img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .actions { display: flex; gap: 1rem; margin-top: 0.5rem; }
    .actions button { padding: 0.6rem 1rem; border-radius: 6px; border: none; cursor: pointer; background: var(--color-primary); color: white; }
    .actions button.secondary { background: var(--color-secondary); }
    .help { margin-top: 1rem; color: #3f4b3f; font-size: 0.95rem; }
  `]
})
export class AdminSliderComponent {
  private fb = inject(FormBuilder);

  form = this.fb.group({
    img1: [''],
    img2: [''],
    img3: [''],
    img4: ['']
  });

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const raw = localStorage.getItem('landingSliderImages');
      const arr = raw ? JSON.parse(raw) : [];
      if (Array.isArray(arr)) {
        const [img1, img2, img3, img4] = arr;
        this.form.patchValue({ img1: img1 || '', img2: img2 || '', img3: img3 || '', img4: img4 || '' });
      }
    } catch {}
  }

  save() {
    const { img1, img2, img3, img4 } = this.form.value as any;
    const arr = [img1, img2, img3, img4].filter((u) => !!u).slice(0, 4);
    localStorage.setItem('landingSliderImages', JSON.stringify(arr));
    // Notificar a otras pestañas / componentes
    window.dispatchEvent(new StorageEvent('storage', { key: 'landingSliderImages', newValue: JSON.stringify(arr) } as any));
    alert('Slider guardado en el navegador.');
  }

  clear() {
    localStorage.removeItem('landingSliderImages');
    this.form.reset({ img1: '', img2: '', img3: '', img4: '' });
    window.dispatchEvent(new StorageEvent('storage', { key: 'landingSliderImages', newValue: null } as any));
  }
}