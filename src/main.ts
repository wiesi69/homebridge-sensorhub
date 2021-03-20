import { API } from 'homebridge';

import { SensorHubPlatform } from './SensorHubPlatform';

const PLATFORM_NAME = 'SensorHub';

export = (api: API) => {
    api.registerPlatform(PLATFORM_NAME, SensorHubPlatform);
};