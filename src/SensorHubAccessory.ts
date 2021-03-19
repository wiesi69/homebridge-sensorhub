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

    constructor(public readonly platform: SensorHubPlatform, public readonly name: string | undefined) {
        this.sensorHub = platform.sensorHub;
        this.logger = platform.logger;
    }


    abstract getServices(): Service[];
}