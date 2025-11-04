import { Component, inject, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PLATFORM_ID } from '@angular/core';

interface ContactInfo {
  address?: string;
  phone?: string;
  email?: string;
  facebook?: string;
  instagram?: string;
  mapsUrl?: string;
}

@Component({
  selector: 'app-admin-contacto',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-contact">
      <h2>Contacto</h2>
      <p class="help">Configura la información de contacto y el mapa. Se guarda en el navegador como los sliders.</p>

      <div class="grid">
        <div class="card">
          <div class="card-content">
            <label>Dirección</label>
            <input [(ngModel)]="model.address" type="text" placeholder="Calle y número" />

            <label>Teléfono</label>
            <input [(ngModel)]="model.phone" type="text" placeholder="Ej: +54 9 11 ..." />

            <label>Email de contacto</label>
            <input [(ngModel)]="model.email" type="email" placeholder="correo@dominio.com" />

            <label>Facebook (URL)</label>
            <input [(ngModel)]="model.facebook" type="url" placeholder="https://facebook.com/tu_pagina" />

            <label>Instagram (URL)</label>
            <input [(ngModel)]="model.instagram" type="url" placeholder="https://instagram.com/tu_perfil" />

            <label>Mapa (URL de Google Maps)</label>
            <input [(ngModel)]="model.mapsUrl" type="url" placeholder="URL de embed o compartido" />
            <div class="inline-actions">
              <button type="button" class="neutral" (click)="convertMapsUrlToEmbed()">Convertir a embed</button>
              <span class="hint">Acepta URL compartida o embed. “Convertir” normaliza a iframe.</span>
            </div>

            <div class="actions">
              <button class="primary" (click)="save()">Guardar</button>
              <button class="neutral" (click)="load()">Cargar</button>
              <button class="danger" (click)="reset()">Borrar</button>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="card-content">
            <h3>Vista previa</h3>
            <p *ngIf="model.address"><strong>Dirección:</strong> {{ model.address }}</p>
            <p *ngIf="model.phone"><strong>Teléfono:</strong> {{ model.phone }}</p>
            <p *ngIf="model.email"><strong>Email:</strong> {{ model.email }}</p>
            <div class="social">
              <a *ngIf="model.facebook" [href]="model.facebook" target="_blank">Facebook</a>
              <a *ngIf="model.instagram" [href]="model.instagram" target="_blank">Instagram</a>
            </div>
            <div class="map" *ngIf="model.mapsUrl"> 
              <iframe [src]="model.mapsUrl" width="100%" height="220" style="border:0" allowfullscreen="" loading="lazy"></iframe>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-contact { max-width: 1000px; margin: 20px auto; padding: 0 16px; }
    h2 { color: var(--color-primary, #2c3e50); font-weight: 600; }
    .help { color: var(--color-text-muted, #555); margin-bottom: 12px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .card { background: var(--color-surface, #fff); border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .card-content { padding: 16px; }
    label { display:block; margin-top: 8px; color: var(--color-text-muted, #555); }
    input { width:100%; padding: 10px 12px; margin-top:4px; border:1px solid var(--color-border, #d0d7de); border-radius:8px; background: var(--color-bg-soft, #fafbfc); }
    .inline-actions { display:flex; align-items:center; gap:8px; margin-top:8px; }
    .hint { color: var(--color-text-muted, #555); font-size: 0.9rem; }
    .actions { display:flex; gap:8px; margin-top:12px; }
    .primary { background: var(--color-primary, #2c3e50); color:#fff; border:0; border-radius:8px; padding:10px 14px; }
    .neutral { background: var(--color-secondary, #6ea57e); color:#fff; border:0; border-radius:8px; padding:10px 14px; }
    .danger { background: var(--color-accent, #e67e22); color:#fff; border:0; border-radius:8px; padding:10px 14px; }
    .social a { display:inline-block; margin-right: 8px; color: var(--color-secondary, #6ea57e); text-decoration:none; }
  `]
})
export class AdminContactoComponent {
  model: ContactInfo = {};
  private platformId = inject(PLATFORM_ID);

  constructor() {
    this.load();
  }

  load() {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const raw = localStorage.getItem('siteContactInfo');
        this.model = raw ? JSON.parse(raw) : {};
      } catch { this.model = {}; }
    }
  }

  save() {
    if (isPlatformBrowser(this.platformId)) {
      // Normaliza la URL de mapas antes de guardar
      this.model.mapsUrl = this.normalizeMapsUrl(this.model.mapsUrl || '');
      localStorage.setItem('siteContactInfo', JSON.stringify(this.model || {}));
    }
  }

  convertMapsUrlToEmbed() {
    this.model.mapsUrl = this.normalizeMapsUrl(this.model.mapsUrl || '');
  }

  private normalizeMapsUrl(url: string): string {
    if (!url) return '';
    // Si ya es URL de embed, dejarla como está
    if (url.includes('/maps/embed')) return url;
    // Construir un embed genérico con q=<url compartida>
    const base = 'https://www.google.com/maps';
    return `${base}?q=${encodeURIComponent(url)}&output=embed`;
  }

  reset() {
    this.model = {};
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('siteContactInfo');
    }
  }
}