import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface ContactMessagePayload {
  name: string;
  message: string;
  emailTo: string;
}

export interface EmailSendResult {
  ok: boolean;
  via: 'api' | 'fallback';
  error?: any;
}

@Injectable({ providedIn: 'root' })
export class EmailService {
  private http = inject(HttpClient);
  private endpoint = environment.apiUrl + '/contact/send';

  send(payload: ContactMessagePayload): Observable<EmailSendResult> {
    return this.http.post<EmailSendResult>(this.endpoint, payload).pipe(
      catchError((err) => of<EmailSendResult>({ ok: false, via: 'api' as const, error: err }))
    );
  }
}