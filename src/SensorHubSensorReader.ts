#!/usr/bin/env node

import { init } from 'raspi';
import { I2C } from 'raspi-i2c';
import { Logging, LogLevel } from 'homebridge';




export class SensorHubSensorReader {

    //SensorHub is a Singleton
    private static instance: SensorHubSensorReader;

    readonly logger: Logging;
    readonly interval: number;

    offBoardTemperature = 0;
    ligthBrigthness = 0;
    onBoardTemperature = 0;
    onBoardHumidity = 0;
    motionDetected = false;
    bmp280Temperature = 0;
    bmp280Pressure = 0;


    private constructor(sec: number, logger: Logging) {
        if (SensorHubSensorReader.instance) {
            throw new Error('SensorHubSensorReader instance already exists');
        }
        SensorHubSensorReader.instance = this;
        this.logger = logger;
        this.interval = sec;
    }

    static getInstance(): SensorHubSensorReader {
        if (!SensorHubSensorReader.instance) {
            throw new Error('SensorHubSensorReader does not exist');
        }

        return SensorHubSensorReader.instance;
    }

    public static createAndStart(sec: number, logger: Logging): SensorHubSensorReader {
        const reader = new SensorHubSensorReader(sec, logger);

        setInterval(() => SensorHubSensorReader.instance.readSensors(), sec * 1000);

        return reader;
    }


    private readSensors() {
        // see https://wiki.52pi.com/index.php/DockerPi_Sensor_Hub_Development_Board_SKU:_EP-0106#DockerPi_Sensor_Hub_Development_Board_V2.0

        // SensorHub address
        // const DEVICE_BUS = 1;
        const DEVICE_ADDR = 0x17;

        // SensorHub offboard sensor
        const TEMP_REG = 0x01;

        // SensorHub onboard sensors
        const LIGHT_REG_L = 0x02;
        const LIGHT_REG_H = 0x03;


        const STATUS_REG = 0x04;

        const ON_BOARD_TEMP_REG = 0x05;
        const ON_BOARD_HUMIDITY_REG = 0x06;
        const ON_BOARD_SENSOR_ERROR = 0x07;

        const MOTION_DETECT = 0x0D;

        // SensorHub BMP280 sensors
        const BMP280_TEMP_REG = 0x08;
        const BMP280_PRESSURE_REG_L = 0x09;
        const BMP280_PRESSURE_REG_M = 0x0A;
        const BMP280_PRESSURE_REG_H = 0x0B;
        const BMP280_STATUS = 0x0C;

        // SensorHub STATUS_REG register
        const T_OVR = 0x01; // external temperature sensor overrange
        const T_FAIL = 0x02; // external temperture sensor not found
        const L_OVR = 0x03; // Brightness sensor overrange
        const L_FAIL = 0x04; // Brightness sensor failure


        // Sensor Data Corrections
        const TEMP_COR = -3;
        const ON_BOARD_TEMP_COR = -6;
        const BMP280_TEMP_COR = -8;



        init(() => {
            const register: Array<number> = [];
            const i2c = new I2C();

            // read register
            for (let i = TEMP_REG; i <= MOTION_DETECT; i++) {
                const data: number = i2c.readByteSync(DEVICE_ADDR, i);
                register[i] = data;
            }

            if (register[STATUS_REG] & T_OVR) {
                this.logger.error('Off-chip temperature sensor overrange!');
            } else if (register[STATUS_REG] & T_FAIL) {
                this.logger.log(LogLevel.INFO, 'No external temperature sensor!');
            } else {
                const offBoardTemperature: number = register[TEMP_REG] + TEMP_COR;
                this.logger.debug(`Current external Sensor Temperature = ${offBoardTemperature} Celsius`);
            }

            if (register[STATUS_REG] & L_OVR) {
                this.logger.error('Onboard brightness sensor overrange!');
            } else if (register[STATUS_REG] & L_FAIL) {
                this.logger.error('Onboard brightness sensor failure!');
            } else {
                const brightness: number = (register[LIGHT_REG_H] << 8) | (register[LIGHT_REG_L]);
                this.logger.debug(`Current onboard sensor brightness = ${brightness} Lux`);
            }

            const onBoardTemperature: number = register[ON_BOARD_TEMP_REG] + ON_BOARD_TEMP_COR;
            const onBoardHumiditiy: number = register[ON_BOARD_HUMIDITY_REG];
            this.logger.debug(`Current onboard sensor temperature = ${onBoardTemperature} Celsius`);
            this.logger.debug(`Current onboard sensor humidity = ${onBoardHumiditiy} %`);

            if (register[ON_BOARD_SENSOR_ERROR] !== 0) {
                this.logger.log(LogLevel.INFO, 'Onboard temperature and humidity sensor data may not be up to date!');
            }



            if (register[BMP280_STATUS] === 0) {
                const bmp280Temperature: number = register[BMP280_TEMP_REG] + BMP280_TEMP_COR;
                const bmp289Pressure: number =
                    register[BMP280_PRESSURE_REG_L] | (register[BMP280_PRESSURE_REG_M] << 8) | (register[BMP280_PRESSURE_REG_H] << 16);
                this.logger.debug(`Current barometer temperature = ${bmp280Temperature} Celsius`);
                this.logger.debug(`Current barometer pressure = ${bmp289Pressure} Pascal`);
            } else {
                this.logger.debug('Onboard BMP280 barometer works abnormally!');
            }

            if (register[MOTION_DETECT] === 1) {
                this.logger.debug('Motion detected within 5 seconds!');
            } else {
                this.logger.debug('No motion detected!');
            }


        });
    }
}

