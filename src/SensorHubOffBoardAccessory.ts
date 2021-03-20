import {
    CharacteristicEventTypes,
    CharacteristicGetCallback,

    Service,
} from 'homebridge';
import { SensorHubAccessory, SensorHubPlatform } from './SensorHubAccessory';





/*
 * Initializer function called when the plugin is loaded.
 */

export class SensorHubOffBoardAccessory extends SensorHubAccessory {

    private offBoardTemperatureSensorService: Service;

    constructor(platform: SensorHubPlatform, name: string | undefined) {
        super(platform, name);

        this.offBoardTemperatureSensorService = this.addService(this.createOffBoardTemperatureSensorService());


        this.platform.logger.info('SensorHubOffBoardAccessory finished initializing!');
    }

    private createOffBoardTemperatureSensorService(): Service {
        const service: Service = new this.platform.hap.Service.TemperatureSensor(`${this.platform.name}OffBoard`);
        // service.UUID = this.platform.hap.uuid.generate('OffBoardTemperatureSensor');

        service.getCharacteristic (this.platform.hap.Characteristic.CurrentTemperature)
            // set minValue to -100 (Apple's HomeKit Accessorry Protocol limits minValue to 0, maybe it's true for California  ...)
            .setProps({
                minValue: -100,
                maxValue: 100,
            })
            .on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
                callback(undefined, this.sensorHub.offBoardTemperature);
            });

        return service;
    }



}