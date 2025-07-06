import django_filters
from app.models import Estabelecimento
from datetime import datetime, time

class EstabelecimentoFilter(django_filters.FilterSet):
    data_inicial = django_filters.DateFilter(field_name="criado_em", lookup_expr='gte')
    data_final = django_filters.DateFilter(field_name="criado_em", lookup_expr='lte')

    def filter_data_final(self, queryset, name, value):
        # Pega até o fim do dia (23:59:59.999999)
        value = datetime.combine(value, time.max)
        return queryset.filter(criado_em__lte=value)

    class Meta:
        model = Estabelecimento
        fields = ['categoria', 'situacao', 'data_inicial', 'data_final']