@echo off
echo Iniciando Servidor API (Backend)...
start cmd /k "npm run start:api"

echo Iniciando Servidor Vite (Frontend)...
start cmd /k "npm run dev"

echo ¡Ambos servidores han sido iniciados en ventanas separadas!
