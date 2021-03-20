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
    public motionDetectorService: Service;

    constructor(platform: SensorHubPlatform, name: string | undefined) {

        super(platform, name);

        // OnBoard Temperature Sensor Service
        this.temperatureSensorService = this.createOnBoardTemperatureSensorService();
        if (!this.platform.config.disableTemperatureSensorAcessory) {
            this.addService(this.temperatureSensorService);
        } else {
            this.logger.info('Onboard temperature service disabled.');
        }


        // OnBoard Humidity Sensor Service
        this.humiditySensorService = this.createOnBoardHumiditySensorService();
        if (!this.platform.config.disableHumiditySensorAcessory) {
            this.addService(this.humiditySensorService);
        } else {
            this.logger.info('Humidity service disabled.');
        }

        // OnBoard Light Sensor Service
        this.lightSensorService = this.createLightSensorService();
        if (!this.platform.config.disableLightSensor) {
            this.addService(this.lightSensorService);
        } else {
            this.logger.info('Light brightness service disabled.');
        }

        // OnBoard Motion Sensor Service
        this.motionDetectorService = this.createMotionDetectorService();
        if (!this.platform.config.motionSensor) {
            this.addService(this.motionDetectorService);
        } else {
            this.logger.info('Motion detection service disabled.');
        }

        this.logger.info(`${this.name} finished initializing!`);
    }




    private createLightSensorService(): Service {
        const service: Service = new this.platform.hap.Service.LightSensor(this.platform.name);
        service.getCharacteristic(this.platform.hap.Characteristic.CurrentAmbientLightLevel)
            .on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
                const brightness = Math.max(this.sensorHub.onBoardBrigthness, 0.0001); // HAP spec: minimum allowed value
                callback(undefined, brightness);
            });

        return service;
    }


    private createOnBoardTemperatureSensorService(): Service {
        const service: Service = new this.platform.hap.Service.TemperatureSensor(this.platform.name);

        service.getCharacteristic(this.platform.hap.Characteristic.CurrentTemperature)
            .on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
                const temp1 = this.sensorHub.onBoardTemperature;
                const temp2 = this.sensorHub.bmp280Temperature;
                const temp = (temp1 + temp2) / 2;
                callback(undefined, temp);
            });

        /*
        service.getCharacteristic (this.platform.hap.Characteristic.C   .CurrentAtm  )
            .on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
                callback(undefined, this.sensorHub.bmp280Pressure);
            });

*/

        return service;
    }


    private createOnBoardHumiditySensorService(): Service {
        const service: Service = new this.platform.hap.Service.HumiditySensor(this.platform.name);

        service.getCharacteristic(this.platform.hap.Characteristic.CurrentRelativeHumidity)
            .on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
                callback(undefined, this.sensorHub.onBoardHumidity);
            });

        return service;
    }


    private createMotionDetectorService(): Service {
        const service: Service = new this.platform.hap.Service.MotionSensor(this.platform.name);

        service.getCharacteristic(this.platform.hap.Characteristic.MotionDetected)
            .on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
                callback(undefined, this.sensorHub.onBoardMotionDetected);
            });

        return service;
    }

}