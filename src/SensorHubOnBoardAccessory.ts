import {
    CharacteristicEventTypes,
    CharacteristicGetCallback,
    Service,
} from 'homebridge';
import { SensorHubAccessory } from './SensorHubAccessory';
import { SensorHubPlatform } from './SensorHubPlatform';


export class SensorHubOnBoardAccessory extends SensorHubAccessory {

    public temperatureSensorService: Service;
    public humiditySensorService: Service;
    public lightSensorService: Service;
    public motionDetectionService: Service;

    private temperatureCorrection: number;
    private humidityCorrection: number;
    private brightnessCorrection: number;
    private airPressureCorrection: number;



    constructor(platform: SensorHubPlatform, name: string) {

        super(platform, name);

        this.temperatureCorrection = this.platform.config.temperatureCorrection || 0;
        this.humidityCorrection = this.platform.config.humidityCorrection || 0;
        this.brightnessCorrection = this.platform.config.brightnessCorrection || 0;
        this.airPressureCorrection = this.platform.config.airPressureCorrection || 0;

        // OnBoard Temperature Sensor Service
        this.temperatureSensorService = this.createTemperatureSensorService();
        if (!this.platform.config.disableTemperatureService) {
            this.addService(this.temperatureSensorService);
        } else {
            this.logger.info('Temperature service disabled.');
        }


        // OnBoard Humidity Sensor Service
        this.humiditySensorService = this.createHumiditySensorService();
        if (!this.platform.config.disableHumidityService) {
            this.addService(this.humiditySensorService);
        } else {
            this.logger.info('Humidity service disabled.');
        }

        // OnBoard Light Sensor Service
        this.lightSensorService = this.createLightSensorService();
        if (!this.platform.config.disableLigthBrightnessService) {
            this.addService(this.lightSensorService);
        } else {
            this.logger.info('Light brightness service disabled.');
        }

        // OnBoard Motion Sensor Service
        this.motionDetectionService = this.createMotionDetectionService();
        if (!this.platform.config.disableMotionDetectionService) {
            this.addService(this.motionDetectionService);
        } else {
            this.logger.info('Motion detection service disabled.');
        }

        this.logger.info(`${this.name} finished initializing!`);
    }




    private createLightSensorService(): Service {

        const service: Service = new this.platform.hap.Service.LightSensor(this.platform.name);
        service.getCharacteristic(this.platform.hap.Characteristic.CurrentAmbientLightLevel)
            .on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
                callback(undefined, this.calculateBrightness(this.sensorHub.brightness));
            });

        return service;
    }




    private createTemperatureSensorService(): Service {
        const service: Service = new this.platform.hap.Service.TemperatureSensor(this.platform.name);

        service.getCharacteristic(this.platform.hap.Characteristic.CurrentTemperature)
            .on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
                callback(undefined, this.calculateTemperature(this.sensorHub.onBoardTemperatur, this.sensorHub.bmp280Temperature));
            });


        /* There is no CurrentAirPressure in HAP
        service.getCharacteristic (this.platform.hap.Characteristic.CurrentAirPressure)
            .on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
                callback(undefined, this.sensorHub.bmp280Pressure);
            });

        */

        return service;
    }





    private createHumiditySensorService(): Service {

        const service: Service = new this.platform.hap.Service.HumiditySensor(this.platform.name);

        service.getCharacteristic(this.platform.hap.Characteristic.CurrentRelativeHumidity)
            .on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
                callback(undefined, this.calculateHumidity(this.sensorHub.humidity));
            });

        return service;
    }



    private calculateBrightness(brigthness: number): number {
        return Math.max(brigthness + this.brightnessCorrection, 0.0001); // HAP spec: minimum allowed value
    }

    private calculateTemperature(onBoardTemperatur: number, bmp280Temperature: number): number {
        return ((onBoardTemperatur + bmp280Temperature) / 2) + this.temperatureCorrection;
    }

    private calculateAirPressure(sensorPressure: number): number {
        return (sensorPressure + this.airPressureCorrection);
    }

    private calculateHumidity(sensorHumidity: number): number {
        return sensorHumidity + this.humidityCorrection;
    }

    private createMotionDetectionService(): Service {
        const service: Service = new this.platform.hap.Service.MotionSensor(this.platform.name);

        service.getCharacteristic(this.platform.hap.Characteristic.MotionDetected)
            .on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
                callback(undefined, this.sensorHub.motionDetected);
            });

        return service;
    }

    brightnessChanged(sensorBrightness: number) {
        const brigthness = this.calculateBrightness(sensorBrightness);
        this.lightSensorService.updateCharacteristic(this.platform.Characteristic.CurrentAmbientLightLevel, brigthness);
        this.logger.debug(`Notify HomeKit: Brightness changed to ${brigthness} lux`);
    }

    motionDetectionChanged(motionDetected: boolean) {
        this.motionDetectionService.updateCharacteristic(this.platform.Characteristic.MotionDetected, motionDetected);
        this.logger.debug(`Notify HomeKit: Motion detected: ${motionDetected}`);
    }

    bmp280TemperatureChanged(bmpSensorTemperature: number) {
        const calcTemperature = this.calculateTemperature(this.sensorHub.onBoardTemperatur, bmpSensorTemperature);
        this.temperatureSensorService.updateCharacteristic(this.platform.Characteristic.CurrentTemperature, calcTemperature);
        this.logger.debug(`Notify HomeKit: Temperature changed to ${calcTemperature} C`);
    }

    bmp280PressureChanged(sensorPressure: number) {
        const pressure = this.calculateAirPressure(sensorPressure);
        // this.temperatureSensorService.updateCharacteristic(this.platform.Characteristic.CurrentPressure, pressure);
        this.logger.debug(`Notify HomeKit: Air pressure changed to ${pressure} pascal`);
    }


    onBoardTemperatureChanged(sensorTemperature: number) {
        const calcTemperature = this.calculateTemperature(sensorTemperature, this.sensorHub.bmp280Temperature);
        this.temperatureSensorService.updateCharacteristic(this.platform.Characteristic.CurrentTemperature, calcTemperature);
        this.logger.debug(`Notify HomeKit: Temperature changed to ${calcTemperature} C`);
    }

    humidityChanged(sensorHumidity: number) {
        const humidity = this.calculateHumidity(sensorHumidity);
        this.humiditySensorService.updateCharacteristic(this.platform.Characteristic.CurrentRelativeHumidity, humidity);
        this.logger.debug(`Notify HomeKit:Humidity changed to ${humidity} %`);
    }

}