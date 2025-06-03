# Clonar o repo
git clone https://github.com/lucasrekt/zapsign-teste.git
cd zapsign-teste

# Dentro de zapsign-teste, utilize o comando abaixo para criar um .env vazio
touch .env

# Subir backend em containers
docker compose up -d --build

# Aplicar migrações (inclui criação automática da Company “Zapsign”)
# A principio, o comando acima já vai rodar as migrations, mas não tem problema rodar o comando abaixo.
docker compose exec web python manage.py migrate

# (Opcional) Criar superusuário Django
docker compose exec web python manage.py createsuperuser

# Navegue até a pasta frontend e depois instale o angular.
cd frontend/
npm install

# Inicie o servidor
ng serve

# Abrir em http://localhost:4200/
# Realizar os testes.
