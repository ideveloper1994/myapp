import { createStackNavigator } from 'react-navigation';
import {Easing, Animated, I18nManager} from 'react-native';
import {  NewTransitionConfiguration, CardTransitionConfiguration, AndroidTransitionConfiguration } from './customTransition';
import {screens} from './screens';
import Constant from '../helper/constant';

const StackModalNavigator = (routeConfigs, navigatorConfig) => {
    const CardStackNavigator = createStackNavigator(routeConfigs, navigatorConfig);
    const cardRouteConfig = {};

    const routeNames = Object.keys(routeConfigs);
    for (let i = 0; i < routeNames.length; i++) {
        cardRouteConfig[`${routeNames[i]}Card`] = routeConfigs[routeNames[i]];
    }
    const ModalStackNavigator = createStackNavigator({
        CardStackNavigator: { screen: CardStackNavigator },
        ...cardRouteConfig
    }, {
        mode: 'card',
        headerMode: 'none',
        transitionConfig: CardTransitionConfiguration,
    });
    return ModalStackNavigator;
};

export default AppNavigator =  StackModalNavigator(screens, {
    headerMode: 'none',
    mode: 'modal',
    transitionConfig: (Constant.isIOS) && NewTransitionConfiguration || AndroidTransitionConfiguration
});