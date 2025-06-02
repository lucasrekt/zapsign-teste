# Clonar o repo
git clone https://github.com/lucasrekt/zapsign-teste.git
cd zapsign-teste

# Subir backend em containers
docker compose up -d --build

# Aplicar migrações (inclui criação automática da Company “Zapsign”)
docker compose exec web python manage.py migrate

# (Opcional) Criar superusuário Django
docker compose exec web python manage.py createsuperuser

# Abrir em http://localhost:8000/ (API) e http://localhost:4200/ (frontend)

# Rodar frontend Angular em outra aba
cd frontend
npm install
ng serve
