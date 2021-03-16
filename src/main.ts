import { API } from 'homebridge';
//import { SensorHubSensorReader } from './SensorHubSensorReader';

import { SensorHubOnBoardAccessory} from './SensorHubOnBoardAccessory';
// import { SensorHubOffBoardSensor} from './SensorHubOffBoardSensor';




export = (api: API) => {

    api.registerAccessory('SensorHub', SensorHubOnBoardAccessory);
    // api.registerAccessory('SensorHubOffBoardSensor', SensorHubOffBoardSensor);
};