from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EstabelecimentoViewSet, CategoriaViewSet, ReparticaoTributariaViewSet

router = DefaultRouter()
router.register(r'estabelecimentos', EstabelecimentoViewSet)
router.register(r'categorias', CategoriaViewSet)
router.register(r'reparticoes', ReparticaoTributariaViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
