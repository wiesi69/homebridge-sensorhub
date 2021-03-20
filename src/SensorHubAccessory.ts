import {
    AccessoryPlugin,
    Service,
    Logging,
} from 'homebridge';
import { SensorHub } from './SensorHub';
import { SensorHubPlatform } from './SensorHubPlatform';

export { SensorHubPlatform };

export abstract class SensorHubAccessory implements AccessoryPlugin {

    public readonly logger: Logging;
    public readonly sensorHub: SensorHub;

    protected services: Array<Service> = new Array<Service>();


    constructor(public readonly platform: SensorHubPlatform, public readonly name: string | undefined) {
        this.sensorHub = platform.sensorHub;
        this.logger = platform.logger;

        this.addService(this.createInformationService());
    }

    public createInformationService(): Service {
        const service = new this.platform.hap.Service.AccessoryInformation()
            .setCharacteristic(this.platform.hap.Characteristic.Manufacturer, 'DockerPi')
            .setCharacteristic(this.platform.hap.Characteristic.Model, 'Sensor Hub');
        return service;
    }


    addService(service: Service): Service {
        this.services.push(service);
        return service;

    }

    getServices(): Service[] {
        return this.services;
    }
}