export interface Noticia {
  id: number;
  titulo: string;
  descripcion?: string; // mapea a 'contenido'
  fecha?: string;       // mapea a 'fecha_publicacion'
  imagenUrl?: string;   // mapea a 'imagen'
  subtitulo?: string;
  autor?: string;
  destacada?: boolean;
  estado?: 'borrador' | 'publicada' | 'archivada';
  editor?: string;
}