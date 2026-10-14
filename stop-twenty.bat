@echo off
echo Stopping Twenty CRM containers...
docker compose --env-file packages/twenty-docker/.env -f packages/twenty-docker/docker-compose.yml down
echo Twenty CRM stopped.
pause

