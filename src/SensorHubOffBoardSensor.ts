import {
    AccessoryConfig,
    AccessoryPlugin,
    API,
    CharacteristicEventTypes,
    CharacteristicGetCallback,
    Logging,
    Service,
} from 'homebridge';






/*
 * Initializer function called when the plugin is loaded.
 */

export class SensorHubOffBoardSensor implements AccessoryPlugin {

    private readonly log: Logging;
    private readonly config: AccessoryConfig;
    private readonly api: API;

    private offBoardTemperatureSensorService: Service;
    private informationService: Service;


    private offBoardTemperature = -66.0;


    constructor(log: Logging, config: AccessoryConfig, api: API) {
        this.log = log;
        this.config = config;
        this.api = api;

        this.offBoardTemperatureSensorService = this.createOffBoardTemperatureSensorService();

        this.informationService = this.createInformationService();

        log.info('SensorHubOffBoardAccessory finished initializing!');
    }




    private createOffBoardTemperatureSensorService(): Service {
        const service: Service = new this.api.hap.Service.TemperatureSensor(this.config.name);

        service.getCharacteristic (this.api.hap.Characteristic.CurrentTemperature)
            // set minValue to -100 (Apple's HomeKit Accessorry Protocol limits minValue to 0, maybe it's true for California  ...)
            .setProps({
                minValue: -100,
                maxValue: 100,
            })
            .on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
                this.log.info(`Queried offboard temperature: ${this.offBoardTemperature} C`);
                callback(undefined, this.offBoardTemperature);
            });

        return service;
    }


    private createInformationService(): Service {
        const service = new this.api.hap.Service.AccessoryInformation(this.config.name)
            .setCharacteristic (this.api.hap.Characteristic.Manufacturer, 'DockerPi')
            .setCharacteristic (this.api.hap.Characteristic.Model, 'Sensor Hub');
        return service;
    }



    private getSensorData() {
        // see https://wiki.52pi.com/index.php/DockerPi_Sensor_Hub_Development_Board_SKU:_EP-0106#DockerPi_Sensor_Hub_Development_Board_V2.0
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
            this.offBoardTemperatureSensorService,
            this.informationService,
        ];
    }

}