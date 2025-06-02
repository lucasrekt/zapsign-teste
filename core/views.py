import requests
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticatedOrReadOnly, AllowAny
from rest_framework.response import Response

from .models import Company, Document, Signer
from .serializers import DocumentSerializer, SignerSerializer

@api_view(['POST'])
@permission_classes([AllowAny])
def create_document_zapsign(request):
    payload = padronizaRequestParaAPIZapSign(request)
    
    if isinstance(payload, Response):
        return payload
    
    company = get_object_or_404(Company, id=1)

    document = Document.objects.create(
        openID = 0,
        token = '',
        name = payload.get('name'),
        status = 'pending',
        company = company,
        externalID = ''
    )

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {company.api_token}"
    }

    try:
        zap_response = requests.post(
            "https://sandbox.api.zapsign.com.br/api/v1/docs/",
            json = payload,
            headers = headers,
            timeout = 10
        )
    except requests.RequestException as e:
        document.status = 'error'
        document.save()

        return Response(
            {
                "error": "Falha na requisição ao ZapSign.",
                "details": str(e)
            },
            status = status.HTTP_502_BAD_GATEWAY
        )
    
    if zap_response.status_code not in (200, 201):
        document.status = "error"
        document.save()

        return Response(
            {
                "error": "Erro da API ZapSign.",
                "status_code": zap_response.status_code,
                "details": zap_response.text
            },
            status = status.HTTP_400_BAD_REQUEST
        )
    data = zap_response.json()

    document.openID = data.get("open_id")
    document.token = data.get("token")
    document.status = data.get("status")
    document.externalID = data.get("external_id")
    document.save()
    
    signers_data = data.get("signers", [])
    if signers_data and isinstance(signers_data, list):
        for signer_info in signers_data:
            Signer.objects.create(
                token = signer_info.get("token", ""),
                status = signer_info.get("status", ""),
                name = signer_info.get("name", ""),
                email = signer_info.get("email", ""),
                externalID = signer_info.get("external_id"),
                document = document
            )
    
    serializer = DocumentSerializer(document)
    return Response(serializer.data, status = status.HTTP_201_CREATED)

def padronizaRequestParaAPIZapSign(request):
    dados = request.data

    name = dados.get('name')
    signer_name = dados.get('signerName')
    signer_email = dados.get('signerEmail')
    base64_pdf = dados.get('base64_pdf')
    url_pdf = dados.get('pdfUrl')

    if not all([name, signer_email, signer_name]):
        return Response(
            {"error": "Campos obrigatórios faltando."},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if base64_pdf:
        payload = {
            "name": name,
            "base64_pdf": base64_pdf,
            "signers": [
                {"name": signer_name, "email": signer_email}
            ]
        }
    else:
        if not url_pdf:
            return Response(
                {"error": "Quando não enviar arquivo, é obrigatório fornecer pdfUrl."},
                status=status.HTTP_400_BAD_REQUEST
            )
        payload = {
            "name": name,
            "url_pdf": url_pdf,
            "signers": [
                {"name": signer_name, "email": signer_email}
            ]
        }

    return payload


class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    permission_classes = [AllowAny]

    def destroy(self, request, *args, **kwargs):
        # document = self.get_object()

        # zap_url = f"https://sandbox.api.zapsign.com.br/api/v1/docs/{document.token}/"
        # company = document.company
        # headers = {
        #     "Authorization": f"Bearer {company.api_token}"
        # }

        # try:
        #     zap_response = requests.delete(
        #         zap_url,
        #         headers = headers,
        #         timeout=10
        #     )
        # except requests.RequestException as e:
        #     return Response(
        #         {"error": "Falha ao conectar ao ZapSign para excluir.", "details": str(e)},
        #         status = status.HTTP_502_BAD_GATEWAY
        #     )
        
        # if zap_response.status_code not in (200, 204):
        #     return Response(
        #         {
        #           "error": "ZapSign recusou a exclusão.",
        #           "status_code": zap_response.status_code,
        #           "details": zap_response.text
        #         },
        #         status = status.HTTP_400_BAD_REQUEST
        #     )
        
        return super().destroy(request, *args, **kwargs)


class SignerViewSet(viewsets.ModelViewSet):
    queryset = Signer.objects.all()
    serializer_class = SignerSerializer
    permission_classes = [AllowAny]
