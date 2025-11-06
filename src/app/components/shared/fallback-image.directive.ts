import { Directive, HostListener, Input } from '@angular/core';

@Directive({
  selector: 'img[fallbackImage]',
  standalone: true,
})
export class FallbackImageDirective {
  @Input('fallbackImage') fallbackSrc: string = '';

  @HostListener('error', ['$event'])
  onError(ev: Event) {
    const img = ev.target as HTMLImageElement | null;
    if (!img) return;
    if (this.fallbackSrc && img.src !== this.fallbackSrc) {
      img.src = this.fallbackSrc;
    }
  }
}