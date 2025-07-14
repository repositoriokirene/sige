from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from app.models import Estabelecimento, Categoria, ReparticaoTributaria
from .serializers import EstabelecimentoSerializer, CategoriaSerializer, ReparticaoTributariaSerializer
from .filters import EstabelecimentoFilter

class EstabelecimentoViewSet(viewsets.ModelViewSet):
    queryset = Estabelecimento.objects.all().order_by('-criado_em')
    serializer_class = EstabelecimentoSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_class = EstabelecimentoFilter
    search_fields = ['nome', 'nif', 'provincia', 'municipio', 
        'reparticao', 'referencia', 'numero_estabelecimento']

class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all().order_by('descricao')
    serializer_class = CategoriaSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['descricao']

class ReparticaoTributariaViewSet(viewsets.ModelViewSet):
    queryset = ReparticaoTributaria.objects.all()
    serializer_class = ReparticaoTributariaSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['regiao_tributaria', 'provincia', 'municipio', 'reparticao', 'referencia']
