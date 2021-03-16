import {
    AccessoryConfig,
    AccessoryPlugin,
    API,
    Logging,
    Service,
} from 'homebridge';

import { SensorHubSensorReader } from './SensorHubSensorReader';


export abstract class SensorHubAccessory implements AccessoryPlugin {

    constructor(protected readonly logger: Logging,
        protected readonly config: AccessoryConfig,
        protected readonly api: API,
        protected readonly sensorReader: SensorHubSensorReader) { }


    abstract getServices(): Service[];
}