import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { DocumentService } from '../../services/document.service';

@Component({
  selector: 'app-document-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './document-form.component.html',
  styleUrls: ['./document-form.component.scss']
})
export class DocumentFormComponent {
  form: FormGroup;
  successMessage = '';
  errorMessage = '';
  base64Pdf: string | null = null;

  constructor(
    private fb: FormBuilder,
    private docService: DocumentService
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required]],
      signerName: ['', [Validators.required]],
      signerEmail: ['', [Validators.required, Validators.email]],
      pdfUrl: ['']
    });
    this.form.setValidators(this.requireUrlOrFile.bind(this));
  }

  private requireUrlOrFile(control: AbstractControl): ValidationErrors | null {
    const group = control as FormGroup;
    const url = group.get('pdfUrl')?.value;
    const hasFile = !!this.base64Pdf;

    if (!url && !hasFile) {
      return { urlOrFileRequired: true};
    }

    return null;
  }

  onFileSelected(event: Event): void {
    const input = (event.target as HTMLInputElement);
    if (!input.files || input.files.length === 0) {
      this.base64Pdf = null;
      this.form.updateValueAndValidity();
      return;
    }

    const file = input.files[0]
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64Index = result.indexOf('base64,') + 'base64,'.length;
      this.base64Pdf = result.substring(base64Index);
      console.log('base64Pdf setado:', this.base64Pdf?.substr(0, 30), '…');
      this.form.updateValueAndValidity();
    }
    reader.readAsDataURL(file);
  }

  submit(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: any = {
      name: this.form.value.name,
      signerName: this.form.value.signerName,
      signerEmail: this.form.value.signerEmail
    };

    // Se o usuário fez upload de arquivo, base64Pdf estará preenchido:
    if (this.base64Pdf) {
      payload.base64_pdf = this.base64Pdf;
    } else {
      // Senão, usa a URL (pode estar vazia, mas a validação já garante que uma das duas exista)
      payload.pdfUrl = this.form.value.pdfUrl;
    }

    this.docService.create(payload).subscribe({
      next: (createdDoc) => {
        this.successMessage = 'Documento criado com sucesso!';
        this.form.reset();
        this.base64Pdf = null;
      },
      error: (err) => {
        console.error('Erro ao criar documento', err);
        this.errorMessage = 'Falha ao criar documento.';
      }
    });
  }
}
