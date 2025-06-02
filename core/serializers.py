from rest_framework import serializers
from .models import Document, Signer

class SignerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Signer
        fields = ['id', 'token', 'status', 'name', 'email', 'externalID', 'document']
        extra_kwargs = {
            'token': {'required': False},
            'status': {'required': False},
            'document': {'required': False}
        }

class DocumentSerializer(serializers.ModelSerializer):
    signers = SignerSerializer(many=True, read_only=True)

    class Meta:
        model = Document
        fields = [
            'id',
            'openID',
            'token',
            'name',
            'status',
            'created_at',
            'last_updated_at',
            'company',
            'externalID',
            'signers',
        ]
        extra_kwargs = {
            'openID': {'required': False},
            'token': {'required': False},
            'status': {'required': False},
            'company': {'required': False},
        }
