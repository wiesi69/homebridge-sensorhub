import {
    CharacteristicEventTypes,
    CharacteristicGetCallback,
    Service,
} from 'homebridge';
import { SensorHubAccessory } from './SensorHubAccessory';
import { SensorHubPlatform } from './SensorHubPlatform';



export class SensorHubOnBoardAccessory extends SensorHubAccessory {



    public lightSensorService: Service | null = null;
    public temperatureSensorService: Service;
    public humiditySensorService: Service;
    public motionDetectorService: Service | null = null;



    constructor(platform: SensorHubPlatform, name: string | undefined) {

        super(platform, name);

        this.temperatureSensorService = this.addService(this.createOnBoardTemperatureSensorService());


        this.humiditySensorService = this.addService(this.createOnBoardHumiditySensorService());


        if (platform.config.lightSensor) {
            this.lightSensorService = this.addService(this.createLightSensorService());
        }

        if (platform.config.motionSensor) {
            this.motionDetectorService = this.addService(this.createMotionDetectorService());
        }



        this.logger.info('SensorHubOnBoardAccessory finished initializing!');
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