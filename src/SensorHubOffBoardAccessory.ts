import {
    CharacteristicEventTypes,
    CharacteristicGetCallback,
    Service,
} from 'homebridge';

import { SensorHubAccessory, SensorHubPlatform } from './SensorHubAccessory';

export class SensorHubOffBoardAccessory extends SensorHubAccessory {

    public readonly temperatureSensorService: Service;

    constructor(platform: SensorHubPlatform, name: string) {
        super(platform, name);

        this.temperatureSensorService = this.addService(this.createOffBoardTemperatureSensorService());

        this.platform.logger.info(`${name} finished initializing!`);
    }

    private createOffBoardTemperatureSensorService(): Service {
        const service: Service = new this.platform.hap.Service.TemperatureSensor(this.name);
        const correction = this.platform.config.offBoardTemperatureCorrection || 0;

        service.getCharacteristic (this.platform.hap.Characteristic.CurrentTemperature)
            // set minValue to -100 (Apple's HomeKit Accessorry Protocol limits minValue to 0, maybe it's true for California  ...)
            .setProps({
                minValue: -100,
                maxValue: 100,
            })
            .on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
                callback(undefined, this.sensorHub.offBoardTemperature + correction);
            });

        return service;
    }



}