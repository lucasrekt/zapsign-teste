import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Signer } from '../models/signer.model';

@Injectable({ providedIn: 'root' })
export class SignerService {
  private apiBase = 'http://localhost:8000/api/';
  private _refreshNeeded$ = new Subject<void>();

  constructor(private http: HttpClient) {}

  get refreshNeeded$(): Subject<void> {
    return this._refreshNeeded$;
  }

  update(id: number, payload: Partial<Signer>): Observable<Signer> {
    return this.http.put<Signer>(`${this.apiBase}signers/${id}/`, payload).pipe(
      tap(() => {
        // Caso queira notificar algo, por enquanto só emitimos
        this._refreshNeeded$.next();
      })
    );
  }

  // Outros métodos (se precisar no futuro) podem ser adicionados aqui
}
