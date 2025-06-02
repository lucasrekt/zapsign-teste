from django.contrib import admin
from django.urls import path, include
from core.views import DocumentViewSet, SignerViewSet, create_document_zapsign
from rest_framework import routers

router = routers.DefaultRouter()
router.register(r'documents', DocumentViewSet)
router.register(r'signers', SignerViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/create-document/', create_document_zapsign, name='create-document')
]
