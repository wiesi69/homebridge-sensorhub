#!/usr/bin/env node

import { init } from 'raspi';
import { I2C } from 'raspi-i2c';
import { Logging } from 'homebridge';
import { SensorHubPlatform } from './SensorHubPlatform';



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

// SensorHub BMP280 sensors
const BMP280_TEMP_REG = 0x08;
const BMP280_PRESSURE_REG_L = 0x09;
const BMP280_PRESSURE_REG_M = 0x0A;
const BMP280_PRESSURE_REG_H = 0x0B;
const BMP280_STATUS = 0x0C;
const MOTION_DETECT = 0x0D;

const REGISTER_LENGTH = 0x0D;

// SensorHub STATUS_REG register
const T_OVR = 0x01; // external temperature sensor overrange
const T_FAIL = 0x02; // external temperture sensor not found
const L_OVR = 0x03; // Brightness sensor overrange
const L_FAIL = 0x04; // Brightness sensor failure


const DATA_BUFFER_SIZE = 6;


type SensorHubData = {
    externalTemperature: number;
    brightness: number;
    onBoardTemperatur: number;
    humidity: number;
    motionDetected: boolean;
    bmp280Temperature: number;
    bmp280Pressure: number;
};

export class SensorHub {
    private logger: Logging;
    private timeout: NodeJS.Timeout | null = null;

    private dataBuffer: Array<SensorHubData> = new Array<SensorHubData>();

    private values: SensorHubData = {
        externalTemperature: 0,
        brightness: 0,
        onBoardTemperatur: 0,
        humidity: 0,
        motionDetected: false,
        bmp280Temperature: 0,
        bmp280Pressure: 0,
    };


    public constructor(public readonly platform: SensorHubPlatform) {
        this.logger = this.platform.logger;
    }



    public get externalTemperature() {
        return this.values.externalTemperature;
    }

    public get brightness() {
        return this.values.brightness;
    }

    public get onBoardTemperatur() {
        return this.values.onBoardTemperatur;
    }

    public get humidity() {
        return this.values.humidity;
    }

    public get motionDetected() {
        return this.values.motionDetected;
    }

    public get bmp280Temperature() {
        return this.values.bmp280Temperature;
    }

    public get bmp280Pressure() {
        return this.values.bmp280Pressure;
    }



    public startReading(sec: number) {
        if (this.timeout === null) {
            this.readSensors(); // read imidiatly
            this.timeout = setInterval(() => this.readSensors(), sec * 1000); //millisecond needed
        } else {
            this.platform.logger.error('Sensor reading already started.');
        }
    }

    private readSensors() {
        // see https://wiki.52pi.com/index.php/DockerPi_Sensor_Hub_Development_Board_SKU:_EP-0106#DockerPi_Sensor_Hub_Development_Board_V2.0

        init(() => this.readSensorData());
    }


    private readSensorData() {
        const register = this.readRegister();

        this.readOnBoardSensors(register);
        this.readLigthBrightnessSensor(register);
        this.readMotionSensor(register);
        this.readBmp280Sensor(register);
        this.readExternalTemperatureSensor(register);
    }





    private readRegister(): Array<number> {
        const register: Array<number> = new Array<number>(REGISTER_LENGTH);
        const i2c = new I2C();

        for (let i = TEMP_REG; i <= REGISTER_LENGTH; i++) {
            const data: number = i2c.readByteSync(DEVICE_ADDR, i);
            register[i] = data;
        }

        return register;
    }


    private readOnBoardSensors(register: Array<number>) {

        if (register[ON_BOARD_SENSOR_ERROR] === 0) {
            const oldTemperature = this.onBoardTemperatur;
            const currentTemperature = register[ON_BOARD_TEMP_REG];

            if (oldTemperature !== currentTemperature) {
                this.values.onBoardTemperatur = currentTemperature;
                this.logger.debug(`Onboard Temperature Sensor: ${currentTemperature} C`);
                this.platform.onBoardAccessory.onBoardTemperatureChanged(currentTemperature);
            }


            const oldHumidity = this.humidity;
            const currentHumidity = register[ON_BOARD_HUMIDITY_REG];

            if (oldHumidity !== currentHumidity) {
                this.values.humidity = currentHumidity;
                this.logger.debug(`Onboard Humidity Sensor: ${currentHumidity} %`);
                this.platform.onBoardAccessory.humidityChanged(currentHumidity);
            }

        } else {
            this.logger.error(`Onboard Sensor Error: ${register[ON_BOARD_SENSOR_ERROR]}`);
            this.logger.info('Onboard temperature and humidity sensor data may not be up to date!');
        }

    }

    private readExternalTemperatureSensor(register: Array<number>) {

        if (register[STATUS_REG] & T_OVR) {
            this.logger.error('OffBoard Temperature Sensor: Overrange!');
            this.values.externalTemperature = 0;
        } else if (register[STATUS_REG] & T_FAIL) {
            this.logger.error('OffBoard Temperature Sensor: not available');
            this.values.externalTemperature = 0;
        } else {
            const oldValue = this.externalTemperature;
            const newValue = register[TEMP_REG];
            if (oldValue !== newValue) {
                this.values.externalTemperature = newValue;
                this.logger.debug(`OffBoard Temperature Sensor: ${newValue} C`);
                this.platform.offBoardAccessory?.temperatureChanged(newValue);
            }
        }

    }


    private readLigthBrightnessSensor(register: Array<number>) {
        if (register[STATUS_REG] & L_OVR) {
            this.logger.error('OnBoard Brightness Sensor: Overrange!');
            this.values.brightness = 0;
        } else if (register[STATUS_REG] & L_FAIL) {
            // This is not an error, it's just too dark for the sensor
            this.logger.debug('OnBoard Brightness Sensor: Failure!');
            this.values.brightness = 0;
        } else {
            const oldValue = this.brightness;
            const newValue = (register[LIGHT_REG_H] << 8) | (register[LIGHT_REG_L]);
            if (oldValue !== newValue) {
                this.values.brightness = newValue;
                this.logger.debug(`OnBoard Brightness Sensor: ${newValue} lux`);
                this.platform.onBoardAccessory.brightnessChanged(newValue);
            }
        }
    }



    private readBmp280Sensor(register: Array<number>) {

        if (register[BMP280_STATUS] === 0) {

            // Read Temperature
            const oldTemperature = this.bmp280Temperature;
            const currentTemperature = register[BMP280_TEMP_REG];

            if (oldTemperature !== currentTemperature) {
                this.values.bmp280Temperature = currentTemperature;
                this.logger.debug(`BMP280 Temperature Sensor: ${currentTemperature} C`);
                this.platform.onBoardAccessory.bmp280TemperatureChanged(currentTemperature);
            }

            // Read Pressure
            const oldPressure = this.bmp280Pressure;
            const currentPressure =
                register[BMP280_PRESSURE_REG_L] | (register[BMP280_PRESSURE_REG_M] << 8) | (register[BMP280_PRESSURE_REG_H] << 16);

            if (oldPressure !== currentPressure) {
                this.values.bmp280Pressure = currentPressure;
                this.logger.debug(`BMP280 AirPressure Sensor: ${currentPressure} pascal`);
                this.platform.onBoardAccessory.bmp280PressureChanged(currentPressure);
            }

        } else {
            this.logger.error('BMP280 sensor works abnormally!');
            this.values.bmp280Temperature = 0;
            this.values.bmp280Pressure = 0;
        }

    }


    private readMotionSensor(register: Array<number>) {
        const oldValue = this.motionDetected;
        const newValue = register[MOTION_DETECT] > 0;


        if (oldValue !== newValue) {
            this.values.motionDetected = newValue;
            this.platform.onBoardAccessory.motionDetectionChanged(newValue);
            if (newValue) {
                this.logger.debug(`Motion Detection Sensor: (${register[MOTION_DETECT]}) Motion detected within 5 seconds!`);
            } else {
                this.logger.debug(`Motion Detection Sensor: (${register[MOTION_DETECT]}) No motion detected!`);
            }
        }
    }

}

