import { AccessoryPlugin, API, HAP, Logging, PlatformConfig, StaticPlatformPlugin } from 'homebridge';
import { SensorHubOnBoardAccessory } from './SensorHubOnBoardAccessory';
import { SensorHubOffBoardAccessory } from './SensorHubOffBoardAccessory';
import { SensorHub } from './SensorHub';



export class SensorHubPlatform implements StaticPlatformPlugin {

    public readonly sensorHub: SensorHub;
    public readonly hap: HAP;
    public readonly name: string | undefined;


    constructor(public readonly logger: Logging, public readonly config: PlatformConfig, public readonly api: API) {

        this.sensorHub = new SensorHub(this);
        this.hap = api.hap;
        this.name = config.name;



        logger.info('SensorHubPlatform finished initializing!');

        this.sensorHub.startReading(config.interval | 10);
    }


    startReading() {
        this.sensorHub.startReading(this.config.interval || 10);
    }






    /*
     * This method is called to retrieve all accessories exposed by the platform.
     * The Platform can delay the response my invoking the callback at a later time,
     * it will delay the bridge startup though, so keep it to a minimum.
     * The set of exposed accessories CANNOT change over the lifetime of the plugin!
     */
    accessories(callback: (foundAccessories: AccessoryPlugin[]) => void): void {
        const accessories: Array<AccessoryPlugin> = new Array<AccessoryPlugin>();

        accessories.push(new SensorHubOnBoardAccessory(this, `${this.config.name}OnBoardAccessory`));

        if (this.config.externalTemperatureSensor) {
            accessories.push(new SensorHubOffBoardAccessory(this, `${this.config.name}OffBoardAccessory`));
        }

        callback(accessories);
    }

}