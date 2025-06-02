from django.db import migrations

def create_default_company(apps, schema_editor):
    Company = apps.get_model('core', 'Company')
    default_name = "Zapsign"
    default_token = "dd9b9e20-5cc3-47f5-aa26-882666ece80ecce6903c-d393-48b7-905b-2c12338d480e"

    # Cria somente se não existir
    if not Company.objects.filter(name=default_name).exists():
        Company.objects.create(
            name=default_name,
            api_token=default_token
        )


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(create_default_company),
    ]
