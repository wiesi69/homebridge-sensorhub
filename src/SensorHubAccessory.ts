import {
    AccessoryConfig,
    AccessoryPlugin,
    API,
    CharacteristicEventTypes,
    CharacteristicGetCallback,
    Logging,
    Service,
} from 'homebridge';



export class SensorHubAccessory implements AccessoryPlugin {

    private readonly log: Logging;
    private readonly config: AccessoryConfig;
    private readonly api: API;

    private readonly sensorReadInterval: number;

    private lightSensorService: Service;
    private onBoardTemperatureSensorService: Service;
    private onBoardHumiditySensorService: Service;
    private motionDetectorService: Service;
    // private bmp280SensorService: Service;
    private informationService: Service;


    private ligthBrigthness = 0;
    private onBoardTemperature = 0;
    private onBoardHumidity = 0;
    private motionDetected = false;
    private bmp280Temperature = 0;
    private bmp280Pressure = 0;


    constructor(log: Logging, config: AccessoryConfig, api: API) {
        this.log = log;
        this.config = config;
        this.api = api;
        this.sensorReadInterval = config.sensorReadInterval || 10;

        this.lightSensorService = this.createLightSensorService();
        this.onBoardTemperatureSensorService = this.createOnBoardTemperatureSensorService();
        this.onBoardHumiditySensorService = this.createOnBoardHumiditySensorService();
        this.motionDetectorService = this.createMotionDetectorService();
        // this.bmp280SensorService = this.createBmp280SensorService();

        this.informationService = this.createInformationService();



        this.readSensors();
        setInterval(() => {
            this.readSensors();
        }, this.sensorReadInterval * 1000);

        log.info('SensorHubOnBoardAccessory finished initializing!');
    }




    private createLightSensorService(): Service {
        const service: Service = new this.api.hap.Service.LightSensor(this.config.name);

        service.getCharacteristic(this.api.hap.Characteristic.CurrentAmbientLightLevel)
            .on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
                this.log.info(`Queried current light brightness:${this.ligthBrigthness} Lux`);
                callback(undefined, this.ligthBrigthness);
            });

        return service;
    }


    private createOnBoardTemperatureSensorService(): Service {
        const service: Service = new this.api.hap.Service.TemperatureSensor(this.config.name);

        service.getCharacteristic(this.api.hap.Characteristic.CurrentTemperature)
            .on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
                this.log.info(`Queried onboard temperature: ${this.onBoardTemperature} C`);
                callback(undefined, this.onBoardTemperature);
            });

        return service;
    }


    private createOnBoardHumiditySensorService(): Service {
        const service: Service = new this.api.hap.Service.HumiditySensor(this.config.name);

        service.getCharacteristic(this.api.hap.Characteristic.CurrentRelativeHumidity)
            .on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
                this.log.info(`Queried onboard humidity: ${this.onBoardHumidity}%`);
                callback(undefined, this.onBoardHumidity);
            });

        return service;
    }


    private createMotionDetectorService(): Service {
        const service: Service = new this.api.hap.Service.MotionSensor(this.config.name);

        service.getCharacteristic(this.api.hap.Characteristic.MotionDetected)
            .on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
                this.log.info(`Queried motion detected: ${this.motionDetected}`);
                callback(undefined, this.motionDetected);
            });

        return service;
    }


    private createBmp280SensorService(): Service {
        const service: Service = new this.api.hap.Service.TemperatureSensor(this.config.name + ' BMP280');

        service.getCharacteristic(this.api.hap.Characteristic.CurrentTemperature)
            .on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
                this.log.info(`Queried BMP280 temperature: ${this.bmp280Temperature} C`);
                callback(undefined, this.bmp280Temperature);
            });

        /*
        // TODO FOR Eve App:  PRESSURE WITH Community Types
        service.getCharacteristic (CommunityTypes.AtmosphericPressureLevel)
            .on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
                this.log.info(`Queried BMP280 pressure: ${this.bmp280Pressure} pascal`);
                callback(undefined, this.bmp280Pressure);
            });
        */

        return service;
    }



    private createInformationService(): Service {
        const service = new this.api.hap.Service.AccessoryInformation()
            .setCharacteristic(this.api.hap.Characteristic.Manufacturer, 'DockerPi')
            .setCharacteristic(this.api.hap.Characteristic.Model, 'Sensor Hub');
        return service;
    }



    private readSensors() {

        // see https://wiki.52pi.com/index.php/DockerPi_Sensor_Hub_Development_Board_SKU:_EP-0106#DockerPi_Sensor_Hub_Development_Board_V2.0

        this.log.info('ReadSensors');

        this.ligthBrigthness++;
        this.onBoardTemperature++;
        this.onBoardHumidity++;
        this.motionDetected = !!this.motionDetected;
        this.bmp280Temperature++;
        this.bmp280Pressure++;






    }




    /*
     * This method is optional to implement. It is called when HomeKit ask to identify the accessory.
     * Typical this only ever this.api.happens at the pairing process.
     */
    identify(): void {
        this.log('Identify!');
    }

    /*
     * This method is called directly after creation of this instance.
     * It should return all services which should be added to the accessory.
     */
    getServices(): Service[] {
        return [
            this.lightSensorService,
            this.onBoardTemperatureSensorService,
            this.onBoardHumiditySensorService,
            this.motionDetectorService,
            //    this.bmp280SensorService,
            this.informationService,

        ];
    }

}