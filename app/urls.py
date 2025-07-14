from django.contrib import admin
from django.urls import path, include
from .views import HomePage, EstabelecimentosPage, CategoriasPage, ReparticoesPage

urlpatterns = [
    path('', HomePage, name='home_page'),
    path('estabelecimentos/', EstabelecimentosPage, name='estabelecimentos_page'),
    path('categorias/', CategoriasPage, name='categorias_page'),
    path('reparticoes/', ReparticoesPage, name='reparticoes_page'),
]
