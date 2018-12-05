import { StackNavigator } from 'react-navigation';
import { Easing,Animated } from 'react-native';

import team from '../screens/tabs/team/showTeam';
import leaderboard from '../screens/tabs/team/component/leaderboard';

TeamStackNavigator = StackNavigator({
    team: {
        screen: team,
        navigationOptions:{
            tabBarVisible:true
        }
    },
    leaderboard: {
        screen: leaderboard,
        navigationOptions:{
            tabBarVisible:false
        }
    }
},{
    headerMode: 'none',
    mode: 'modal'
});

TeamStackNavigator.navigationOptions = ({ navigation }) => {
    return {
        tabBarVisible: navigation.state.index === 0,
    };
};
export default  TeamStackNavigator;