const mqtt = require('mqtt');

const MQTT_BROKER = process.env.MQTT_BROKER || 'mqtt://localhost:1883';
const MACHINES = (process.env.MACHINES || 'M-01,M-02').split(',');
const INTERVAL_MS = 1000;

const client = mqtt.connect(MQTT_BROKER);

client.on('connect', () => {
  console.log(`✅ Conectado ao broker MQTT: ${MQTT_BROKER}`);
  console.log(`📡 Publicando para ${MACHINES.length} máquina(s): ${MACHINES.join(', ')}`);
  console.log(`⏱️  Intervalo: ${INTERVAL_MS}ms\n`);

  startPublishing();
});

client.on('error', (error) => {
  console.error('❌ Erro na conexão MQTT:', error);
  process.exit(1);
});

function generatePLCData(machineId) {
  const baseTemp = 70 + (MACHINES.indexOf(machineId) * 5);
  const tempVariation = (Math.random() - 0.5) * 10;
  const temperature = parseFloat((baseTemp + tempVariation).toFixed(1));
  
  const basePressure = 4.2 + (MACHINES.indexOf(machineId) * 0.3);
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
  let machineIndex = 0;
  
  setInterval(() => {
    const machineId = MACHINES[machineIndex];
    const topic = `factory/machines/${machineId}`;
    const data = generatePLCData(machineId);
    const message = JSON.stringify(data);
    
    client.publish(topic, message, (error) => {
      if (error) {
        console.error('❌ Erro ao publicar:', error);
      } else {
        console.log(`📤 ${data.timestamp} | ${data.machineId} | Temp: ${data.temperature}°C | Pressão: ${data.pressure}bar | Status: ${data.status}`);
      }
    });
    
    machineIndex = (machineIndex + 1) % MACHINES.length;
  }, INTERVAL_MS);
}

process.on('SIGINT', () => {
  console.log('\n\n🛑 Encerrando simulador PLC...');
  client.end();
  process.exit(0);
});

