from django.db import models

class Categoria(models.Model):
    descricao = models.TextField(max_length=50)

    def __str__(self):
        return self.descricao
    

class ReparticaoTributaria(models.Model):
    regiao_tributaria = models.CharField(max_length=50)
    provincia = models.CharField(max_length=50)
    municipio = models.CharField(max_length=50)
    reparticao = models.CharField(max_length=50)
    referencia = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return f"{self.reparticao} - {self.municipio} "


def upload_alvara(instance, filename):
    return f'alvara/{instance.nif}/{filename}'

class Estabelecimento(models.Model):
    nome = models.CharField(max_length=255)
    nif = models.CharField(max_length=100)
    categoria = models.ForeignKey(Categoria, on_delete=models.DO_NOTHING, null=True)
    regiao_tributaria = models.CharField(max_length=50, null=True)
    provincia = models.CharField(max_length=50, null=True)
    municipio = models.CharField(max_length=50, null=True)
    reparticao = models.CharField(max_length=50, null=True)
    referencia = models.CharField(max_length=50, null=True)
    numero_estabelecimento = models.CharField(max_length=30, null=True, unique=True)
    foto_alvara = models.ImageField(upload_to=upload_alvara)
    situacao = models.CharField(choices=[
        ('regulada','Regulada'), ('pendente','Pendente'),('fora','Fora de Actividade')
        ], max_length=100, default='regulada')
    latitude = models.FloatField()
    longitude = models.FloatField()
    criado_em = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nome