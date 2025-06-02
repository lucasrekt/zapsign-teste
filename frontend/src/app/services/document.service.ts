import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, tap } from 'rxjs';
import { Document } from '../models/document.model';

@Injectable({ providedIn: 'root' })
export class DocumentService {
  private apiBase = 'http://localhost:8000/api/';
  private _refreshNeeded$ = new Subject<void>();
  get refreshNeeded$() {
    return this._refreshNeeded$;
  }

  constructor(private http: HttpClient) {}

  getAll(): Observable<Document[]> {
    return this.http.get<Document[]>(`${this.apiBase}documents/`);
  }  

  getById(id: number): Observable<Document> {
    return this.http.get<Document>(`${this.apiBase}${id}/`);
  }

  update(id: number, payload: Partial<Document>): Observable<Document> {
    return this.http.put<Document>(`${this.apiBase}documents/${id}/`, payload).pipe(
      tap(() => this._refreshNeeded$.next())
    );
  }  

  delete(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.apiBase}documents/${id}/`)
      .pipe(
        tap(() => this._refreshNeeded$.next())
      )
  }

  create(payload: {
    name: string;
    signerName: string;
    signerEmail: string;
    pdfUrl: string;
  }): Observable<Document> {
    return this.http
      .post<Document>(`${this.apiBase}create-document/`, payload)
      .pipe(
        tap(() => {
          this._refreshNeeded$.next();
        })
      );
  }
}
