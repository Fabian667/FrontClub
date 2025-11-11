import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReservaService } from '../../core/services/reserva.service';
import { InstalacionService } from '../../core/services/instalacion.service';
import { InformacionService } from '../../core/services/informacion.service';
import { Reserva } from '../../models/reserva.model';
import { Instalacion } from '../../models/instalacion.model';
import { Informacion } from '../../models/informacion.model';

@Component({
  selector: 'app-reservas-public',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="section">
      <div class="container">
        <h2>Reservas de {{ clubName() || 'nuestro club' }}</h2>
        <p class="subtitle" *ngIf="reservas().length === 0">No hay reservas para mostrar.</p>

        <table class="table" *ngIf="reservas().length > 0">
          <thead>
            <tr>
              <th>Instalación</th>
              <th>Fecha</th>
              <th>Inicio</th>
              <th>Fin</th>
              <th>Personas</th>
              <th>Estado</th>
              <th>Motivo</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let r of reservas()">
              <td>{{ getInstalacionNombre(r.instalacion_id) }}</td>
              <td>{{ r.fecha_reserva }}</td>
              <td>{{ r.hora_inicio || '-' }}</td>
              <td>{{ r.hora_fin || '-' }}</td>
              <td>{{ r.cantidad_personas || '-' }}</td>
              <td>{{ r.estado || '-' }}</td>
              <td>{{ r.motivo || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  `,
  styles: [`
    .section { padding: 80px 20px; }
    .container { max-width: 1024px; margin: 0 auto; }
    .subtitle { color: var(--color-text-soft); }
    .table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
    .table th, .table td { border: 1px solid var(--color-border); padding: 0.5rem; text-align: left; }
  `]
})
export class ReservasPublicComponent {
  private reservasSrv = inject(ReservaService);
  private instalacionesSrv = inject(InstalacionService);
  private infoSrv = inject(InformacionService);

  reservas = signal<Reserva[]>([]);
  instalaciones = signal<Instalacion[]>([]);
  clubName = signal<string>('');

  ngOnInit() {
    this.reservasSrv.getAll().subscribe({ next: (list) => this.reservas.set(list || []) });
    this.instalacionesSrv.getAll().subscribe({ next: (list) => this.instalaciones.set(list || []) });
    this.infoSrv.getAll().subscribe({
      next: (items: Informacion[]) => {
        const info = items && items.length > 0 ? items[0] : undefined;
        if (info?.nombreClub) this.clubName.set(info.nombreClub);
        else this.loadInfoFallback();
      },
      error: () => this.loadInfoFallback()
    });
  }

  private loadInfoFallback() {
    this.infoSrv.getAllFromGithub().subscribe({
      next: (items: Informacion[]) => {
        const info = items && items.length > 0 ? items[0] : undefined;
        this.clubName.set(info?.nombreClub || '');
      }
    });
  }

  getInstalacionNombre(id?: number | null): string {
    if (!id) return '-';
    const found = (this.instalaciones() || []).find(i => i.id === id);
    return found?.nombre || `Instalación #${id}`;
  }
}