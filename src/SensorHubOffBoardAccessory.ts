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



/*
 * Initializer function called when the plugin is loaded.
 */

export class SensorHubOffBoardAccessory extends SensorHubAccessory {

    private offBoardTemperatureSensorService: Service;
    private informationService: Service;

    constructor(logger: Logging, config: AccessoryConfig, api: API) {
        const sensorReader = SensorHubSensorReader.getInstance();
        super(logger, config, api, sensorReader);
        this.offBoardTemperatureSensorService = this.createOffBoardTemperatureSensorService();
        this.informationService = this.createInformationService();
        logger.info('SensorHubOffBoardAccessory finished initializing!');
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
                callback(undefined, this.sensorReader.offBoardTemperature);
            });

        return service;
    }


    private createInformationService(): Service {
        const service = new this.api.hap.Service.AccessoryInformation(this.config.name)
            .setCharacteristic (this.api.hap.Characteristic.Manufacturer, 'DockerPi')
            .setCharacteristic (this.api.hap.Characteristic.Model, 'Sensor Hub');
        return service;
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