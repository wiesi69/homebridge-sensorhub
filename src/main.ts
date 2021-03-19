import { API } from 'homebridge';
//import { SensorHubsensorHub } from './SensorHubsensorHub';

import { SensorHubPlatform } from './SensorHubPlatform';
// import { SensorHubOffBoardSensor} from './SensorHubOffBoardSensor';


const PLATFORM_NAME = 'SensorHub';

export = (api: API) => {
    api.registerPlatform(PLATFORM_NAME, SensorHubPlatform);
};