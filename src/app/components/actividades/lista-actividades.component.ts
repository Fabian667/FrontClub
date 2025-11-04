import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActividadService } from '../../core/services/actividad.service';
import { Actividad } from '../../models/actividad.model';
import { UploadService } from '../../core/services/upload.service';

@Component({
  selector: 'app-lista-actividades',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lista-actividades.component.html',
  styleUrl: './lista-actividades.component.css'
})
export class ListaActividadesComponent {
  private actividadesSrv = inject(ActividadService);
  private uploadSrv = inject(UploadService);

  actividades = signal<Actividad[]>([]);
  imagenSubida = signal<string | null>(null);

  ngOnInit() {
    this.actividadesSrv.getAll().subscribe({
      next: (data) => this.actividades.set(data),
      error: (e) => console.error(e)
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    this.uploadSrv.uploadImage(file).subscribe({
      next: (res) => this.imagenSubida.set(res.path),
      error: (e) => console.error('Error subiendo imagen', e)
    });
  }
}