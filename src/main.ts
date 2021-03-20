import { API } from 'homebridge';

import { PLATFORM_NAME, SensorHubPlatform } from './SensorHubPlatform';




export = (api: API) => {
    api.registerPlatform(PLATFORM_NAME, SensorHubPlatform);
};