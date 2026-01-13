const mqtt = require('mqtt');

const MQTT_BROKER = process.env.MQTT_BROKER || 'mqtt://localhost:1883';
const TOPIC = 'factory/machines/M-01';
const INTERVAL_MS = 1000;

const client = mqtt.connect(MQTT_BROKER);

client.on('connect', () => {
  console.log(`✅ Conectado ao broker MQTT: ${MQTT_BROKER}`);
  console.log(`📡 Publicando em: ${TOPIC}`);
  console.log(`⏱️  Intervalo: ${INTERVAL_MS}ms\n`);

  startPublishing();
});

client.on('error', (error) => {
  console.error('❌ Erro na conexão MQTT:', error);
  process.exit(1);
});

function generatePLCData() {
  const machineId = 'M-01';
  
  const baseTemp = 70;
  const tempVariation = (Math.random() - 0.5) * 10;
  const temperature = parseFloat((baseTemp + tempVariation).toFixed(1));
  
  const basePressure = 4.2;
  const pressureVariation = (Math.random() - 0.5) * 1.5;
  const pressure = parseFloat((basePressure + pressureVariation).toFixed(1));
  
  const statusRand = Math.random();
  let status;
  if (statusRand < 0.90) {
    status = 'RUNNING';
  } else if (statusRand < 0.98) {
    status = 'STOPPED';
  } else {
    status = 'ERROR';
  }
  
  return {
    machineId,
    temperature,
    pressure,
    status,
    timestamp: new Date().toISOString()
  };
}

function startPublishing() {
  setInterval(() => {
    const data = generatePLCData();
    const message = JSON.stringify(data);
    
    client.publish(TOPIC, message, (error) => {
      if (error) {
        console.error('❌ Erro ao publicar:', error);
      } else {
        console.log(`📤 ${data.timestamp} | ${data.machineId} | Temp: ${data.temperature}°C | Pressão: ${data.pressure}bar | Status: ${data.status}`);
      }
    });
  }, INTERVAL_MS);
}

process.on('SIGINT', () => {
  console.log('\n\n🛑 Encerrando simulador PLC...');
  client.end();
  process.exit(0);
});

