
# 1.1. Copia gli script nel container
docker cp migrazione_fase1.py nome-container:/app/
docker cp migrazione_fase2.py nome-container:/app/
docker cp migrazione_fase3.py nome-container:/app/

# 1.2. Entra nel container
docker exec -it nome-container bash

# 1.3. Installa Python (se non presente)
apt-get update && apt-get install -y python3

# 1.4. Esegui lo script (target è la directory corrente)
python3 migrazione_fase1.py --target /app



# 2 Ispeziona il container per trovare i volumi
docker inspect nome-container

# Cerca "Mounts" → vedrai qualcosa tipo:
# "Source": "/var/lib/docker/volumes/xxx/_data"
# oppure se bind mount:
# "Source": "C:\\Users\\dev\\progetti\\strapi-docker"

# Usa quel path come target
python migrazione_fase1.py --target "C:\Users\dev\progetti\strapi-docker"


# 3 docker-compose.yml
services:
  strapi:
    volumes:
      - ./strapi-app:/app  # ← Questo è il tuo path!

      python migrazione_fase1.py --target ".\strapi-app"
# oppure path assoluto
python migrazione_fase1.py --target "C:\progetti\strapi-docker\strapi-app"


# 4 Copia gli script nella directory target
# Poi esegui direttamente lì
cd C:\path\to\strapi-docker
python ..\migrazione_fase1.py --target .