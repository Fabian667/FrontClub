import { Component, inject, signal, OnInit, effect, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { ActividadService } from '../../core/services/actividad.service';
import { InstalacionService } from '../../core/services/instalacion.service';
import { EventoService } from '../../core/services/evento.service';
import { NoticiaService } from '../../core/services/noticia.service';
import { ReservaService } from '../../core/services/reserva.service';
import { EmailService, ContactMessagePayload } from '../../core/services/email.service';

interface ContactInfo {
  address?: string;
  phone?: string;
  email?: string;
  facebook?: string;
  instagram?: string;
  mapsUrl?: string;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent implements OnInit {
  private router = inject(Router);
  private actividadesSrv = inject(ActividadService);
  private instalacionesSrv = inject(InstalacionService);
  private eventosSrv = inject(EventoService);
  private noticiasSrv = inject(NoticiaService);
  private reservasSrv = inject(ReservaService);
  private platformId = inject(PLATFORM_ID);
  private emailSrv = inject(EmailService);

  isLoggedIn = signal<boolean>(false);

  noticias = signal<any[]>([]);
  actividades = signal<any[]>([]);
  instalaciones = signal<any[]>([]);
  eventos = signal<any[]>([]);
  reservasCount = signal<number>(0);

  backgroundStyle = signal<string>('linear-gradient(135deg, #667eea 0%, #764ba2 100%)');
  contactInfo = signal<ContactInfo>({});
  // Estado del menú hamburguesa
  menuOpen = signal<boolean>(false);

  constructor() {
    this.loadPublic();
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Initialize browser-only features
      this.isLoggedIn.set(!!localStorage.getItem('token'));
      this.loadContactInfo();
      this.updateBackgroundStyle();
      
      // Listen for storage changes
      window.addEventListener('storage', (ev) => {
        if (ev.key === 'landingSliderImages') {
          this.updateBackgroundStyle();
        }
        if (ev.key === 'siteContactInfo') {
          this.loadContactInfo();
        }
      });
    }
  }

  private updateBackgroundStyle() {
    if (isPlatformBrowser(this.platformId)) {
      const imgs = JSON.parse(localStorage.getItem('landingSliderImages') || '[]');
      const current = imgs?.[0] || '';
      const style = current ? `url(${current})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      this.backgroundStyle.set(style);
    }
  }

  private loadPublic() {
    this.noticiasSrv.getAll().subscribe({ next: (data) => this.noticias.set(data || []), error: () => this.noticias.set([]) });
    this.actividadesSrv.getAll().subscribe({ next: (data) => this.actividades.set(data || []), error: () => this.actividades.set([]) });
    this.instalacionesSrv.getAll().subscribe({ next: (data) => this.instalaciones.set(data || []), error: () => this.instalaciones.set([]) });
    this.eventosSrv.getAll().subscribe({ next: (data) => this.eventos.set(data || []), error: () => this.eventos.set([]) });
    this.reservasSrv.getCount().subscribe({ next: (count) => this.reservasCount.set(count ?? 0), error: () => this.reservasCount.set(0) });
  }

  private loadContactInfo() {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const raw = localStorage.getItem('siteContactInfo');
        const parsed: ContactInfo = raw ? JSON.parse(raw) : {};
        this.contactInfo.set(parsed || {});
      } catch {
        this.contactInfo.set({});
      }
    }
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
    }
    this.isLoggedIn.set(false);
  }

  // Toggle del menú hamburguesa
  toggleMenu() {
    this.menuOpen.set(!this.menuOpen());
  }

  // Cerrar menú al seleccionar opción
  closeMenu() {
    this.menuOpen.set(false);
  }

  onContactSubmit(form: NgForm) {
    if (form.valid) {
      const { name, message } = form.value;
      const email = this.contactInfo().email;
      if (email) {
        const payload: ContactMessagePayload = { name, message, emailTo: email };
        this.emailSrv.send(payload).subscribe({
          next: (res) => {
            if (res.ok) {
              alert('Mensaje enviado. ¡Gracias por contactarte!');
              form.resetForm();
            } else {
              const mailtoUrl = this.mailtoHref(name, email, message);
              if (isPlatformBrowser(this.platformId)) {
                window.open(mailtoUrl, '_blank');
              }
              form.resetForm();
            }
          },
          error: () => {
            const mailtoUrl = this.mailtoHref(name, email, message);
            if (isPlatformBrowser(this.platformId)) {
              window.open(mailtoUrl, '_blank');
            }
            form.resetForm();
          }
        });
      } else {
        alert('No hay email de contacto configurado. Por favor, configúralo en el panel de administración.');
      }
    }
  }

  mailtoHref(name: string, email: string | undefined, message: string) {
    const target = email || '';
    const subj = encodeURIComponent('Consulta');
    const body = encodeURIComponent(`Nombre: ${name}\n\n${message}`);
    return target ? `mailto:${target}?subject=${subj}&body=${body}` : '#';
  }
}