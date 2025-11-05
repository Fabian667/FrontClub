export interface Informacion {
  id?: number;
  nombreClub?: string;
  descripcion?: string;
  email?: string;
  telefono?: string;
  telefonoAlternativo?: string | null;
  whatsapp?: string;
  direccion?: string;
  ciudad?: string;
  provincia?: string;
  codigoPostal?: string;
  horarioAtencion?: string;
  facebook?: string;
  instagram?: string;
  twitter?: string | null;
  youtube?: string | null;
  tiktok?: string | null;
  linkedin?: string | null;
  website?: string;
  logo?: string;
  imagenPrincipal?: string;
  imagenGaleria1?: string | null;
  imagenGaleria2?: string | null;
  imagenGaleria3?: string | null;
  imagenGaleria4?: string | null;
  imagenGaleria5?: string | null;
  mapaLatitud?: string | null;
  mapaLongitud?: string | null;
  fundacion?: string | null; // YYYY-MM-DD
  mision?: string | null;
  vision?: string | null;
  fechaActualizacion?: string | null; // ISO timestamp
}