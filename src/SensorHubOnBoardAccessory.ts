import { SensorHubAccessory } from './SensorHubAccessory';
import { SensorHubSensorReader } from './SensorHubSensorReader';

import {
    AccessoryConfig,
    API,
    CharacteristicEventTypes,
    CharacteristicGetCallback,
    Logging,
    Service,
} from 'homebridge';


export class SensorHubOnBoardAccessory extends SensorHubAccessory {
    private lightSensorService: Service;
    private temperatureSensorService: Service;
    private humiditySensorService: Service;
    private motionDetectorService: Service;
    private informationService: Service;


    constructor(logger: Logging, config: AccessoryConfig, api: API) {
        const interval = config.interval || 10;
        const sensorReader = SensorHubSensorReader.createAndStart(interval, logger);
        super(logger, config, api, sensorReader);


        this.lightSensorService = this.createLightSensorService();
        this.temperatureSensorService = this.createOnBoardTemperatureSensorService();
        this.humiditySensorService = this.createOnBoardHumiditySensorService();
        this.motionDetectorService = this.createMotionDetectorService();
        this.informationService = this.createInformationService();

        logger.info('SensorHubOnBoardAccessory finished initializing!');
    }




    private createLightSensorService(): Service {
        const service: Service = new this.api.hap.Service.LightSensor(this.config.name);

        service.getCharacteristic(this.api.hap.Characteristic.CurrentAmbientLightLevel)
            .on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
                callback(undefined, this.sensorReader.ligthBrigthness);
            });

        return service;
    }


    private createOnBoardTemperatureSensorService(): Service {
        const temp1 = this.sensorReader.onBoardTemperature;
        const temp2 = this.sensorReader.bmp280Temperature;
        const temp = (temp1 + temp2) / 2;

        const service: Service = new this.api.hap.Service.TemperatureSensor(this.config.name);

        service.getCharacteristic(this.api.hap.Characteristic.CurrentTemperature)
            .on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
                callback(undefined, temp );
            });

        /*
        service.getCharacteristic (this.api.hap.Characteristic.C   .CurrentAtm  )
            .on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
                callback(undefined, this.sensorReader.bmp280Pressure);
            });

*/

        return service;
    }


    private createOnBoardHumiditySensorService(): Service {
        const service: Service = new this.api.hap.Service.HumiditySensor(this.config.name);

        service.getCharacteristic(this.api.hap.Characteristic.CurrentRelativeHumidity)
            .on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
                callback(undefined, this.sensorReader.onBoardHumidity);
            });

        return service;
    }


    private createMotionDetectorService(): Service {
        const service: Service = new this.api.hap.Service.MotionSensor(this.config.name);

        service.getCharacteristic(this.api.hap.Characteristic.MotionDetected)
            .on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
                callback(undefined, this.sensorReader.motionDetected);
            });

        return service;
    }



    private createInformationService(): Service {
        const service = new this.api.hap.Service.AccessoryInformation()
            .setCharacteristic(this.api.hap.Characteristic.Manufacturer, 'DockerPi')
            .setCharacteristic(this.api.hap.Characteristic.Model, 'Sensor Hub');
        return service;
    }


    /*
     * This method is called directly after creation of this instance.
     * It should return all services which should be added to the accessory.
     */
    getServices(): Service[] {
        return [
            this.lightSensorService,
            this.temperatureSensorService,
            this.humiditySensorService,
            this.motionDetectorService,
            this.informationService,

        ];
    }

}