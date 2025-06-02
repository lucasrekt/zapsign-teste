import { Component } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { DocumentListComponent } from './documents/document-list/document-list.component';
import { CommonModule } from '@angular/common';
import { DocumentFormComponent } from './documents/document-form/document-form.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    DocumentListComponent,
    DocumentFormComponent
  ],
  template: `
    <h1>CRUD de Documentos</h1>

    <section>
      <h2>Criar Novo Documento</h2>
      <app-document-form></app-document-form>
    </section>

    <hr />

    <section>
      <h2>Lista de Documentos</h2>
      <app-document-list></app-document-list>
    </section>
  `,
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'frontend';
}
