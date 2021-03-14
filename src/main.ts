import { API } from 'homebridge';
import { SensorHubAccessory} from './SensorHubAccessory';
import { SensorHubOffBoardSensor} from './SensorHubOffBoardSensor';


export = (api: API) => {
    api.registerAccessory('SensorHub', SensorHubAccessory);
    // api.registerAccessory('SensorHubOffBoardSensor', SensorHubOffBoardSensor);
};