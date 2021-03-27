import {
    CharacteristicEventTypes,
    CharacteristicGetCallback,
    Service,
} from 'homebridge';

import { SensorHubAccessory, SensorHubPlatform } from './SensorHubAccessory';

export class SensorHubOffBoardAccessory extends SensorHubAccessory {

    public readonly temperatureSensorService: Service;
    private offBoardTemperatureCorrection: number;

    constructor(platform: SensorHubPlatform, name: string) {
        super(platform, name);

        this.offBoardTemperatureCorrection = this.platform.config.offBoardTemperatureCorrection || 0;

        this.temperatureSensorService = this.addService(this.createOffBoardTemperatureSensorService());

        this.platform.logger.info(`${name} finished initializing!`);
    }

    private createOffBoardTemperatureSensorService(): Service {
        const service: Service = new this.platform.hap.Service.TemperatureSensor(this.name);


        service.getCharacteristic (this.platform.hap.Characteristic.CurrentTemperature)
            // set minValue to -100 (Apple's HomeKit Accessorry Protocol limits minValue to 0, maybe it's true for California  ...)
            .setProps({
                minValue: -100,
                maxValue: 100,
            })
            .on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
                callback(undefined, this.calculateTemperature(this.sensorHub.externalTemperature));
            });

        return service;
    }

    private calculateTemperature(sensorTemperature: number) {
        return sensorTemperature + this.offBoardTemperatureCorrection;
    }


    public temperatureChanged(sensorTemperature: number) {
        const calcTemperature = this.calculateTemperature(sensorTemperature );
        this.temperatureSensorService.updateCharacteristic(this.platform.Characteristic.CurrentTemperature, calcTemperature);
        this.logger.debug(`Notify HomeKit: External temperature changed:${calcTemperature}C`);
    }

}