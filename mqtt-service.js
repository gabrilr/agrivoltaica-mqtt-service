
import mqtt from 'mqtt';
import dotenv from 'dotenv';

import { db } from '..database/db.js';

dotenv.config();
// Configuración del cliente MQTT
const mqttClient = mqtt.connect(`mqtt://${MQTT_HOST}`);  // URL del broker MQTT

// Suscribirse al canal de MQTT donde recibes los datos
mqttClient.on('connect', () => {
    console.log('Conectado al broker MQTT');
    mqttClient.subscribe('ec2.sensores', (err) => {
        if (err) {
            console.error('Error al suscribirse al canal:', err);
        } else {
            console.log('Suscripción exitosa al canal');
        }
    });
});

// Manejar los mensajes recibidos de MQTT
mqttClient.on('message', (topic, message) => {
    try {
        // Parsear el mensaje recibido (JSON)
        const data = JSON.parse(message.toString());
        
        // Desestructurar los datos recibidos
        const { mac, iluminacion, humedad_suelo, iluminacion_2, humedad_suelo_2, temp, humedad_aire, fecha_hora } = data;

        // Inserción de los datos en la base de datos
        const query = `INSERT INTO sensor_data (
            mac, iluminacion, humedad_suelo, iluminacion_2, humedad_suelo_2, temp, humedad_aire, timestamp
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

        const values = [mac, iluminacion, humedad_suelo, iluminacion_2, humedad_suelo_2, temp, humedad_aire, fecha_hora];

        db.query(query, values, (err, result) => {
            if (err) {
                console.error('Error al insertar los datos en la base de datos:', err);
            } else {
                console.log('MQTT Service: Datos insertados correctamente:', result);
            }
        });
    } catch (error) {
        console.error('Error al procesar el mensaje de MQTT:', error);
    }
});

// Manejo de errores de conexión MQTT
mqttClient.on('error', (err) => {
    console.error('Error en la conexión MQTT:', err);
});