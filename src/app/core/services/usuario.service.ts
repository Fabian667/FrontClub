import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Usuario } from '../../models/usuario.model';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl + '/usuarios';

  private toApi(usuario: Partial<Usuario>): any {
    const out: any = {
      nombre: usuario.nombre,
      email: usuario.email
    };
    if (usuario.apellido && usuario.apellido.trim()) out.apellido = usuario.apellido.trim();
    if ((usuario as any).dni && String((usuario as any).dni).trim()) out.dni = String((usuario as any).dni).trim();
    if ((usuario as any).telefono && String((usuario as any).telefono).trim()) out.telefono = String((usuario as any).telefono).trim();
    if ((usuario as any).direccion && String((usuario as any).direccion).trim()) out.direccion = String((usuario as any).direccion).trim();
    if ((usuario as any).fechaNacimiento && String((usuario as any).fechaNacimiento).trim()) out.fecha_nacimiento = String((usuario as any).fechaNacimiento).trim();
    if ((usuario as any).estado && String((usuario as any).estado).trim()) out.estado = String((usuario as any).estado).trim();
    if ((usuario as any).tipoSocio && String((usuario as any).tipoSocio).trim()) out.tipo_socio = String((usuario as any).tipoSocio).trim();
    if ((usuario as any).fotoPerfil && String((usuario as any).fotoPerfil).trim()) out.foto_perfil = String((usuario as any).fotoPerfil).trim();
    // En /usuarios sólo enviamos la columna soportada 'tipo_cuenta'
    const tipo = usuario.tipoCuenta ?? (usuario as any).tipo_cuenta ?? (usuario as any).tipo;
    if (tipo) { out.tipo_cuenta = tipo; }
    // No enviar 'password' en /usuarios (sólo se usa en /auth/register)
    return out;
  }

  getAll(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.baseUrl);
  }

  create(usuario: Partial<Usuario>): Observable<Usuario> {
    return this.http.post<Usuario>(this.baseUrl, this.toApi(usuario));
  }

  update(id: number, usuario: Partial<Usuario>): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.baseUrl}/${id}`, this.toApi(usuario));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}