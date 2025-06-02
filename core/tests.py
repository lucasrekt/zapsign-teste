# zapsign/core/tests.py

from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from unittest.mock import patch
from .models import Company, Document, Signer


class CreateDocumentViewTest(TestCase):
    """
    Testes para o endpoint create_document_zapsign (rota: /api/create-document/).
    """

    def setUp(self):
        # Cria uma Company de teste
        self.company = Company.objects.create(
            name="Test Company",
            api_token="token_de_teste_123",
        )
        self.client = APIClient()
        self.url = reverse('create-document')  # deve bater com name='create-document' em urls.py

    @patch('core.views.requests.post')
    def test_create_with_only_url(self, mock_post):
        """
        Ao enviar payload apenas com URL, deve fingir a resposta da ZapSign e retornar 201.
        """
        # Mock de requests.post para retornar um fakeresponse com status_code 201
        class FakeResponse:
            status_code = 201

            def json(self):
                # JSON que a view espera
                return {
                    "open_id": 42,
                    "token": "doc-token-abc",
                    "status": "pending",
                    "external_id": "text-123",
                    "signers": [
                        {
                            "token": "signer-token-xyz",
                            "status": "pending",
                            "name": "Peixonauta",
                            "email": "peixonauta@exemplo.com",
                            "external_id": "sig-id"
                        }
                    ]
                }

        # Dizer ao mock para devolver essa instância sempre que requests.post(...) for chamado
        mock_post.return_value = FakeResponse()

        # Monta o payload de teste (somente URL, sem base64)
        payload = {
            "name": "Documento de Teste",
            "signerName": "Peixonauta",
            "signerEmail": "peixonauta@exemplo.com",
            "pdfUrl": "https://www.exemplo.com/teste.pdf"
        }

        # Chamar a view via client.post
        response = self.client.post(self.url, payload, format='json')

        # Agora esperamos 201 CREATED
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Verifica que um Document foi criado no banco
        docs = Document.objects.all()
        self.assertEqual(docs.count(), 1)

        doc = docs.first()
        self.assertEqual(doc.name, payload['name'])
        self.assertEqual(doc.token, "doc-token-abc")
        self.assertEqual(doc.status, "pending")
        self.assertEqual(doc.externalID, "ext-123")

        # Verifica que o Signer foi salvo
        signers = Signer.objects.filter(document=doc)
        self.assertEqual(signers.count(), 1)
        self.assertEqual(signers.first().name, "Peixonauta")
        self.assertEqual(signers.first().email, "peixonauta@exemplo.com")

    def test_create_with_missing_fields(self):
        """
        Se faltar signerName, a view deve retornar 400.
        """
        payload = {
            "name": "Sem signatário",
            "signerEmail": "fulano@exemplo.com",
            "pdfUrl": "https://www.exemplo.com/teste.pdf"
        }
        response = self.client.post(self.url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
