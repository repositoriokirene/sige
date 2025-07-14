from rest_framework import serializers
from app.models import Estabelecimento, Categoria, ReparticaoTributaria


class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = ['id', 'descricao']

class ReparticaoTributariaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReparticaoTributaria
        fields = '__all__'

class EstabelecimentoSerializer(serializers.ModelSerializer):
    situacao_display = serializers.CharField(source='get_situacao_display', read_only=True)
    categoria_descricao = serializers.CharField(source='categoria.descricao', read_only=True)
    class Meta:
        model = Estabelecimento
        fields = [
            'id', 'nome', 'nif', 'categoria', 'categoria_descricao', 
            'regiao_tributaria', 'provincia', 'municipio', 'reparticao', 'referencia',
            'numero_estabelecimento' , 'latitude', 'longitude', 'situacao', 'situacao_display', 'criado_em'
        ]


    