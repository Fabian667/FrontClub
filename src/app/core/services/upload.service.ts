import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UploadService {
  private http = inject(HttpClient);
  // SSR Express corre en 4000 (script serve:ssr:clubSocialRest)
  private base = environment.apiUrl + '/upload';

  uploadImage(file: File): Observable<{ path: string }> {
    return this.uploadImageTo(file, 'uploads');
  }

  uploadImageTo(file: File, folder: 'imagenes' | 'uploads' = 'uploads'): Observable<{ path: string }> {
    const form = new FormData();
    form.append('file', file);
    const url = `${this.base}?folder=${folder}`;
    return this.http.post<{ path: string }>(url, form);
  }
}