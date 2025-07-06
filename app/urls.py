from django.contrib import admin
from django.urls import path, include
from .views import HomePage, EstabelecimentosPage, CategoriasPage

urlpatterns = [
    path('', HomePage, name='home_page'),
    path('estabelecimentos/', EstabelecimentosPage, name='estabelecimentos_page'),
    path('categorias/', CategoriasPage, name='categorias_page'),
]
