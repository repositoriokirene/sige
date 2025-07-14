from django.shortcuts import redirect, render
from django.contrib import messages
from app.models import Categoria, Estabelecimento

# Create your views here.

def HomePage(request):
    estabelecimentos = Estabelecimento.objects.order_by('-id')[:4]
    qty_estabelecimentos = Estabelecimento.objects.all().count()
    qty_reguladas = Estabelecimento.objects.filter(situacao='regulada').count()
    qty_pendentes = Estabelecimento.objects.filter(situacao='pendente').count()
    qty_fora = Estabelecimento.objects.filter(situacao='fora').count()
    categorias = Categoria.objects.all()
    
    context = {
        'estabelecimentos': estabelecimentos,
        'qty_estabelecimentos': qty_estabelecimentos,
        'qty_reguladas': qty_reguladas,
        'qty_pendentes': qty_pendentes,
        'qty_fora': qty_fora,
        'categorias': categorias
    }

    return render(request, 'home_page.html', context)

def EstabelecimentosPage(request):
    categorias = Categoria.objects.all()

    context = {
        'categorias': categorias
    }
    return render(request, 'estabelecimentos_page.html', context)

def CategoriasPage(request):
    categorias = Categoria.objects.all()

    context = {
        'categorias': categorias
    }
    return render(request, 'categorias_page.html', context)

def ReparticoesPage(request):
    return render(request, 'reparticoes_page.html')