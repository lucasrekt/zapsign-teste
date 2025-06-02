import { Component, OnDestroy, OnInit } from '@angular/core';
import { DocumentService } from '../../services/document.service';
import { Document } from '../../models/document.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { SignerService } from '../../services/signer.service';
import { Signer } from '../../models/signer.model';

@Component({
  selector: 'app-document-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './document-list.component.html',
  styleUrls: ['./document-list.component.scss']
})
export class DocumentListComponent implements OnInit, OnDestroy {
  documents: Document[] = [];
  loading = false;
  error = '';
  editingId: number | null = null;
  editForm: {
    name: string;
    signerName: string;
    signerEmail: string;
  } = { name: '', signerName: '', signerEmail: '' };

  private refreshSub!: Subscription;
  private docRefreshSub!: Subscription;
  private signerRefreshSub!: Subscription;

  constructor(
    private docService: DocumentService,
    private signerService: SignerService
  ) {}

  ngOnInit(): void {
    this.fetchDocuments();

    this.refreshSub = this.docService.refreshNeeded$.subscribe(() => {
      this.fetchDocuments();
    });
    this.signerRefreshSub = this.signerService.refreshNeeded$.subscribe(() => {
      this.fetchDocuments();
    });
  }

  ngOnDestroy(): void {
    this.refreshSub.unsubscribe();
    this.docRefreshSub.unsubscribe();
    this.signerRefreshSub.unsubscribe();
  }

  fetchDocuments(): void {
    this.loading = true;
    this.docService.getAll().subscribe({
      next: docs => {
        this.documents = docs;
        this.loading = false;
      },
      error: err => {
        this.error = 'Erro ao carregar documentos';
        this.loading = false;
        console.error(err);
      }
    });
  }

  deleteDocument(id: number): void {
    this.docService.delete(id).subscribe({
      next: () => {
        this.fetchDocuments();
      },
      error: err => {
        console.error('Erro ao excluir documento', err);
        this.error = 'Não foi possível excluir';
      }
    });
  }

  startEdit(doc: Document): void {
    this.editingId = doc.id;
    this.editForm = {
      name: doc.name,
      signerName: doc.signers.length > 0 ? doc.signers[0].name : '',
      signerEmail: doc.signers.length > 0 ? doc.signers[0].email : ''
    };
  }

  saveEdit(doc: Document): void {
    // Atualiza apenas o nome do documento
    this.docService.update(doc.id, { name: this.editForm.name }).subscribe({
      next: (updatedDoc) => {
        // Se houver ao menos 1 signatário, atualiza o primeiro
        if (doc.signers.length > 0) {
          const signerToUpdate: Signer = doc.signers[0];
          this.signerService
            .update(signerToUpdate.id, {
              name: this.editForm.signerName,
              email: this.editForm.signerEmail
            })
            .subscribe({
              next: () => {
                this.editingId = null;
              },
              error: (err2) => {
                this.error = 'Erro ao atualizar signatário';
                console.error(err2);
              }
            });
        } else {
          // não havia signatário, apenas fecha edição do nome
          this.editingId = null;
        }
        // o update do doc já emitiu refreshNeeded$, entao a lista se atualiza
      },
      error: (err) => {
        this.error = 'Erro ao atualizar documento';
        console.error(err);
      }
    });
  }

  cancelEdit(): void {
    this.editingId = null;
  }
}
