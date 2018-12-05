import { combineReducers } from 'redux';
import  AppNavigator  from '../navigation/index';
import UserReducer from './userReducer';
import StatisticReducer from './statisticReducer';
import TeamReducer from './teamReducer';
import AdviceReducer from './postAdviceReducer';
import HelpPostReducer from './helpPostReducer';
import MetaDataReducer from './metaDataReducer';
import letterReducer from './letterReducer';
import {RESET_STORE} from '../actions/types';
import {appDefaultReducer} from "./defaultReducer";

const appReducer = combineReducers({
    navigation: (state, action) => (
        AppNavigator.router.getStateForAction(action, state)
    ),
    user: UserReducer,
    statistic: StatisticReducer,
    team: TeamReducer,
    advice: AdviceReducer,
    helpPost: HelpPostReducer,
    metaData: MetaDataReducer,
    letters: letterReducer
});

export default function rootReducer(state, action) {
    let finalState = appReducer(state, action);
    if (action.type === RESET_STORE) {
        finalState = appDefaultReducer;//resetReducer(finalState, action);
    }
    return finalState;
}