import { AccessoryPlugin, API, HAP, Logging, PlatformConfig, StaticPlatformPlugin } from 'homebridge';
import { SensorHubOnBoardAccessory } from './SensorHubOnBoardAccessory';
import { SensorHubOffBoardAccessory } from './SensorHubOffBoardAccessory';
import { SensorHub } from './SensorHub';


export const PLATFORM_NAME = 'SensorHub';

export const EXTERNAL_ACCESSORY_POSTFIX = 'OffBoard';
const DEFAULT_INTERVAL = 10; //seconds


export class SensorHubPlatform implements StaticPlatformPlugin {

    public readonly sensorHub: SensorHub;
    public readonly hap: HAP;
    public readonly name: string;


    constructor(public readonly logger: Logging, public readonly config: PlatformConfig, public readonly api: API) {

        this.sensorHub = new SensorHub(this);
        this.hap = api.hap;
        this.name = config.name || PLATFORM_NAME;


        logger.info('SensorHubPlatform finished initializing!');
        this.startReading();
    }


    startReading() {
        const interval = this.config.interval || DEFAULT_INTERVAL;
        this.logger.info(`Start SensorHub sensor reading every ${interval} seconds.`);
        this.sensorHub.startReading(this.config.interval || DEFAULT_INTERVAL);
    }






    /*
     * This method is called to retrieve all accessories exposed by the platform.
     * The Platform can delay the response my invoking the callback at a later time,
     * it will delay the bridge startup though, so keep it to a minimum.
     * The set of exposed accessories CANNOT change over the lifetime of the plugin!
     */
    accessories(callback: (foundAccessories: AccessoryPlugin[]) => void): void {
        const accessories: Array<AccessoryPlugin> = new Array<AccessoryPlugin>();

        accessories.push(new SensorHubOnBoardAccessory(this, this.name));

        if (!this.config.disableExternalTemperatureSensor) {
            accessories.push(new SensorHubOffBoardAccessory(this, this.name + EXTERNAL_ACCESSORY_POSTFIX));
        } else {
            this.logger.info('External Temperature Sensor disabled.');
        }

        callback(accessories);
    }

}