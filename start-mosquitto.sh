#!/bin/bash

# Script para subir Mosquitto com configuração que aceita conexões externas

echo "🚀 Subindo Mosquitto MQTT Broker..."

docker run -d \
  --name mosquitto \
  -p 1883:1883 \
  -p 9001:9001 \
  -v $(pwd)/mosquitto/config:/mosquitto/config \
  -v $(pwd)/mosquitto/data:/mosquitto/data \
  -v $(pwd)/mosquitto/log:/mosquitto/log \
  eclipse-mosquitto

echo "✅ Mosquitto rodando!"
echo "📡 Porta 1883 disponível"
echo ""
echo "Para ver logs: docker logs -f mosquitto"
echo "Para parar: docker stop mosquitto"



