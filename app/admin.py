from django.contrib import admin
from .models import Categoria, Estabelecimento, ReparticaoTributaria

admin.site.register(Estabelecimento)
admin.site.register(Categoria)
admin.site.register(ReparticaoTributaria)