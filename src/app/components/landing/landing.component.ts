import { Component, inject, signal, OnInit, effect, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FallbackImageDirective } from '../shared/fallback-image.directive';
import { ActividadService } from '../../core/services/actividad.service';
import { InstalacionService } from '../../core/services/instalacion.service';
import { EventoService } from '../../core/services/evento.service';
import { NoticiaService } from '../../core/services/noticia.service';
import { SliderService } from '../../core/services/slider.service';
import { InformacionService } from '../../core/services/informacion.service';
import { Informacion } from '../../models/informacion.model';
import { ReservaService } from '../../core/services/reserva.service';
import { EmailService, ContactMessagePayload } from '../../core/services/email.service';

interface ContactInfo {
  address?: string;
  phone?: string;
  email?: string;
  facebook?: string;
  instagram?: string;
  whatsapp?: string;
  mapsUrl?: string | SafeResourceUrl;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, FallbackImageDirective],
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
  private sliderSrv = inject(SliderService);
  private informacionSrv = inject(InformacionService);
  private sanitizer = inject(DomSanitizer);

  isLoggedIn = signal<boolean>(false);

  noticias = signal<any[]>([]);
  actividades = signal<any[]>([]);
  instalaciones = signal<any[]>([]);
  eventos = signal<any[]>([]);
  reservasCount = signal<number>(0);
  reservas = signal<any[]>([]);
  clubName = signal<string>('');
  // Estado del modal de reservas
  reservasModalOpen = signal<boolean>(false);
  // Flujo: solicitud por WhatsApp para no socios
  mostrarSolicitud = signal<boolean>(false);
  solicitud: {
    nombre: string;
    telefono: string;
    email: string;
    instalacionId: number | null;
    fecha: string;
    horaInicio: string;
    horaFin: string;
    motivo: string;
  } = {
    nombre: '',
    telefono: '',
    email: '',
    instalacionId: null,
    fecha: '',
    horaInicio: '',
    horaFin: '',
    motivo: ''
  };

  backgroundStyle = signal<string>('linear-gradient(135deg, #667eea 0%, #764ba2 100%)');
  private landingSliders = signal<string[]>([]);
  private sliderIndex = 0;
  contactInfo = signal<ContactInfo>({});
  // Estado del menú hamburguesa
  menuOpen = signal<boolean>(false);

  

  // Imágenes por defecto para el slider de Landing cuando no hay datos del backend
  private readonly DEFAULT_LANDING_SLIDER_IMAGES: string[] = [
    'https://freeimage.host/i/KtE0UCb',
    'https://freeimage.host/i/KtE0vje'
  ];

  constructor() {
    this.loadPublic();
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Initialize browser-only features
      this.isLoggedIn.set(!!localStorage.getItem('token'));
      this.loadContactInfo();
      this.updateBackgroundStyle();
      this.loadLandingSliders();
      // rotación de slider cada 6s
      setInterval(() => {
        const imgs = this.landingSliders();
        if (imgs.length > 0) {
          this.sliderIndex = (this.sliderIndex + 1) % imgs.length;
          const current = imgs[this.sliderIndex];
          this.backgroundStyle.set(`url(${current})`);
        }
      }, 6000);
      
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
      const lsImgs = JSON.parse(localStorage.getItem('landingSliderImages') || '[]');
      const current = lsImgs?.[0] || '';
      const style = current ? `url(${current})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      this.backgroundStyle.set(style);
    }
  }

  private loadLandingSliders() {
    this.sliderSrv.getActivos().subscribe({
      next: async (list) => {
        const now = new Date();
        const urls = (list || [])
          .filter((s) => (s.seccion ?? 'landing') === 'landing')
          .filter((s) => s.activo !== false)
          .filter((s) => {
            const startOk = !s.fechaInicio || new Date(s.fechaInicio) <= now;
            const endOk = !s.fechaFin || new Date(s.fechaFin) >= now;
            return startOk && endOk;
          })
          .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
          .map((s) => s.imagen)
          .filter((url) => !!url);

        // Preload verificando que carguen correctamente; descartamos las que fallen
        let valid = await this.preloadAndFilter(urls);

        // Si no hay imágenes válidas desde backend, intentamos con localStorage
        if (valid.length === 0 && isPlatformBrowser(this.platformId)) {
          try {
            const lsImgsRaw = localStorage.getItem('landingSliderImages') || '[]';
            const lsImgs: string[] = JSON.parse(lsImgsRaw);
            if (Array.isArray(lsImgs) && lsImgs.length > 0) {
              valid = await this.preloadAndFilter(lsImgs);
            }
          } catch {}
        }

        // Si sigue vacío, usamos las imágenes por defecto declaradas arriba
        if (valid.length === 0) {
          valid = await this.preloadAndFilter(this.DEFAULT_LANDING_SLIDER_IMAGES);
        }

        this.landingSliders.set(valid);

        if (valid.length > 0) {
          this.sliderIndex = 0;
          this.backgroundStyle.set(`url(${valid[0]})`);
        } else {
          // Fallback seguro: fondo por defecto (gradiente)
          this.backgroundStyle.set('linear-gradient(135deg, #667eea 0%, #764ba2 100%)');
        }
      },
      error: () => {
        // en error, dejamos el fondo por defecto
        this.backgroundStyle.set('linear-gradient(135deg, #667eea 0%, #764ba2 100%)');
      }
    });
  }

  private preloadAndFilter(urls: string[]): Promise<string[]> {
    const loaders = urls.map((url) => new Promise<string>((resolve) => {
      const img = new Image();
      img.onload = () => resolve(url);
      img.onerror = () => resolve(''); // marcar inválida
      img.src = url;
    }));
    return Promise.all(loaders).then((res) => res.filter((u) => !!u));
  }

  private loadPublic() {
    this.noticiasSrv.getAll().subscribe({ next: (data) => this.noticias.set(data || []), error: () => this.noticias.set([]) });
    this.actividadesSrv.getAll().subscribe({ next: (data) => this.actividades.set(data || []), error: () => this.actividades.set([]) });
    this.instalacionesSrv.getAll().subscribe({ next: (data) => this.instalaciones.set(data || []), error: () => this.instalaciones.set([]) });
    this.eventosSrv.getAll().subscribe({ next: (data) => this.eventos.set(data || []), error: () => this.eventos.set([]) });
    this.reservasSrv.getCount().subscribe({ next: (count) => this.reservasCount.set(count ?? 0), error: () => this.reservasCount.set(0) });
    this.reservasSrv.getAll().subscribe({ next: (items) => {
      const list = Array.isArray(items) ? items : [];
      // Mostrar máximo 10 para no saturar la landing
      this.reservas.set(list.slice(0, 10));
    }, error: () => this.reservas.set([]) });
  }

  private loadContactInfo() {
    // Intento principal: API backend
    this.informacionSrv.getAll().subscribe({
      next: (items: Informacion[]) => {
        const info = (items && items.length > 0) ? items[0] : undefined;
        if (info) {
          const mapped = this.mapInformacionToContact(info);
          this.contactInfo.set(mapped);
          this.clubName.set(info.nombreClub || '');
          if (isPlatformBrowser(this.platformId)) {
            try { localStorage.setItem('siteContactInfo', JSON.stringify(mapped)); } catch {}
          }
        } else {
          // Fallback: datos públicos en GitHub Pages
          this.loadContactInfoFromGithub();
        }
      },
      error: () => {
        // Fallback: datos públicos en GitHub Pages
        this.loadContactInfoFromGithub();
      }
    });
  }

  private loadContactInfoFromGithub() {
    this.informacionSrv.getAllFromGithub().subscribe({
      next: (items: Informacion[]) => {
        const info = (items && items.length > 0) ? items[0] : undefined;
        if (info) {
          const mapped = this.mapInformacionToContact(info);
          this.contactInfo.set(mapped);
          this.clubName.set(info.nombreClub || '');
          if (isPlatformBrowser(this.platformId)) {
            try { localStorage.setItem('siteContactInfo', JSON.stringify(mapped)); } catch {}
          }
        } else {
          this.loadContactInfoFromLocalStorage();
        }
      },
      error: () => this.loadContactInfoFromLocalStorage()
    });
  }

  private loadContactInfoFromLocalStorage() {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const raw = localStorage.getItem('siteContactInfo');
        const parsed: ContactInfo = raw ? JSON.parse(raw) : {};
        this.contactInfo.set(parsed || {});
        // Si no tenemos nombre, dejar vacío
        this.clubName.set('');
      } catch {
        this.contactInfo.set({});
        this.clubName.set('');
      }
    } else {
      this.contactInfo.set({});
      this.clubName.set('');
    }
  }

  getInstalacionNombre(id?: number | null): string {
    if (!id) return '-';
    const found = (this.instalaciones() || []).find((i: any) => i.id === id);
    return found?.nombre || `Instalación #${id}`;
  }


  private mapInformacionToContact(info: Informacion): ContactInfo {
    const latRaw: any = (info as any).mapaLatitud;
    const lngRaw: any = (info as any).mapaLongitud;
    const lat = typeof latRaw === 'string' ? parseFloat(latRaw) : latRaw;
    const lng = typeof lngRaw === 'string' ? parseFloat(lngRaw) : lngRaw;
    let mapsUrl: string | SafeResourceUrl | undefined;
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      const embed = `https://maps.google.com/maps?q=${encodeURIComponent(lat)},${encodeURIComponent(lng)}&z=15&hl=es&output=embed`;
      mapsUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embed);
    } else if (info.direccion) {
      const q = encodeURIComponent(info.direccion);
      const embed = `https://maps.google.com/maps?q=${q}&z=15&hl=es&output=embed`;
      mapsUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embed);
    }

    return {
      address: info.direccion,
      phone: info.telefono || info.telefonoAlternativo || info.whatsapp,
      email: info.email,
      facebook: info.facebook || undefined,
      instagram: info.instagram || undefined,
      whatsapp: info.whatsapp || undefined,
      mapsUrl
    };
  }

  getWhatsappUrl(value?: string): string | undefined {
    if (!value) return undefined;
    const digits = String(value).replace(/[^0-9]/g, '');
    if (!digits) return undefined;
    return `https://wa.me/${digits}`;
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
    }
    this.isLoggedIn.set(false);
  }

  openSolicitudForm() {
    this.mostrarSolicitud.set(true);
  }

  cancelSolicitudForm() {
    this.mostrarSolicitud.set(false);
  }

  sendSolicitudWhatsApp(form?: NgForm) {
    const info = this.contactInfo();
    const phoneRaw = info.whatsapp || info.phone || '';
    const digits = String(phoneRaw).replace(/[^0-9]/g, '');
    if (!digits) {
      // Si no hay número válido, simplemente no hacemos nada para evitar errores
      return;
    }
    const nombre = (this.solicitud.nombre || '').trim();
    const telefono = (this.solicitud.telefono || '').trim();
    const email = (this.solicitud.email || '').trim();
    const instalacion = this.getInstalacionNombre(this.solicitud.instalacionId ?? undefined);
    const fecha = (this.solicitud.fecha || '').trim();
    const horaInicio = (this.solicitud.horaInicio || '').trim();
    const horaFin = (this.solicitud.horaFin || '').trim();
    const motivo = (this.solicitud.motivo || '').trim();

    const lines = [
      '*Solicitud de reserva*',
      nombre ? `Nombre: ${nombre}` : undefined,
      telefono ? `Teléfono: ${telefono}` : undefined,
      email ? `Email: ${email}` : undefined,
      instalacion ? `Instalación: ${instalacion}` : undefined,
      fecha ? `Fecha: ${fecha}` : undefined,
      horaInicio ? `Inicio: ${horaInicio}` : undefined,
      horaFin ? `Fin: ${horaFin}` : undefined,
      motivo ? `Motivo: ${motivo}` : undefined
    ].filter(Boolean) as string[];
    const text = encodeURIComponent(lines.join('\n'));
    const url = `https://wa.me/${digits}?text=${text}`;
    if (isPlatformBrowser(this.platformId)) {
      window.open(url, '_blank');
    }
  }

  // Modal reservas
  openReservasModal() {
    this.reservasModalOpen.set(true);
  }

  closeReservasModal() {
    this.reservasModalOpen.set(false);
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