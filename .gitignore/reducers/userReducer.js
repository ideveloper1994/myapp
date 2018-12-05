import {
    APP_SET_USER_DATA,
    USER_EMAIL_CHANGED,USER_PASS_CHANGED,START_LOADING,
    USER_USERNAME_EDIT,
    VISIBLE_TAB, REWIRING_PLAY, SET_USER_DETAIL,
    SET_COMPLETED_EXERCISES,
    SETTING_NOTIFICATIONS, SHOW_CHECKUP_POPUP,
    SHOW_REWIRING_POPUP,
    SET_READ_TODAY_LATTER, SET_API_CALL_DATE,
    FIRST_TIME_APP_OPEN_IN_DAY,
    IS_ASK_FOR_CHECKUP,
    IS_NETWORK_AVAILABLE,
    SET_SAFE_AREA_INTENT,
    SET_SAFE_AREA_INTENT_X,
    SUBSCRIPTION_CHECK_DATE,
    SHOW_REWIRING_PROGRESS_POPUP,
    SHOW_STREAK_POPUP,
    STREAK_GOAL_ACHIEVED_POPUP,
    MANAGED_SHOW_STREAK_POPUP,
    POPUP_QUEUE,
    TODAY_LIFE_TREEE,
    APP_BADGE_COUNT,
    SETTING_TEAMCHAT_NOTIFICATIONS,
    TODAY_INSTANCES,
    INTERNET_FILTER,
    APPTHEME_TYPE,
    SHOW_MONTHLY_POPUP,
    SHOW_MONTHLY_CHALLENGE_POPUP,
    MONTHLY_CHALLENGE_ACHIEVED,
    ENCOURAGE_POPUP,
    CONGRATULATE_POPUP,
    SET_DO_NOT_DISTURB,
    SHOW_TEAM_ACHIEVEMENT_POPUP,
    SET_CURRENT_USER_DATA
} from '../actions/types';
import _ from 'lodash';
import {appDefaultReducer} from './defaultReducer';
const INITIAL_STATE = appDefaultReducer.user;

export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case START_LOADING: {
            return {
                ...state,
                isLoading: action.payload,
            };
        }
        case SET_USER_DETAIL: {
            return {
                ...state,

                userDetails: action.payload,
            };
        }
        case APP_SET_USER_DATA: {
            return {
                ...state,
                email: state.email,
                password: state.password,
                token: action.payload.token
            };
        }
        case USER_EMAIL_CHANGED: {
            return {
                ...state,
                email: action.payload,
            };
        }
        case USER_PASS_CHANGED: {
            return {
                ...state,
                password: action.payload,
            };
        }
        case USER_USERNAME_EDIT: {
            return {
                ...state,
                userName: action.payload,
            };
        }
        case VISIBLE_TAB: {
            return {
                ...state,
                visibleTab: action.payload,
            };
        }
        case REWIRING_PLAY: {
            return {
                ...state,
                rewiringPlay: action.payload,
            };
        }
        case SET_COMPLETED_EXERCISES: {
            return {
                ...state,
                completedExercises: action.payload,
            };
        }
        case SETTING_NOTIFICATIONS: {
            return {
                ...state,
                settingNotifications: action.payload,
            };
        }
        case SETTING_TEAMCHAT_NOTIFICATIONS: {
            return {
                ...state,
                settingTeamChatNotifications: action.payload,
            };
        }
        case SHOW_CHECKUP_POPUP: {
            return {
                ...state,
                showCheckupPopUp: action.payload,
            };
        }
        case SHOW_REWIRING_POPUP: {
            return {
                ...state,
                showRewiringPopUp: action.payload,
            };
        }
        case SET_READ_TODAY_LATTER: {
            return {
                ...state,
                readLatterDate: action.payload,
            };
        }
        case SET_API_CALL_DATE: {
            return {
                ...state,
                dateForAPICall: action.payload,
            };
        }
        case TODAY_INSTANCES: {
            return {
                ...state,
                todayViewInstance: action.payload,
            };
        }
        case FIRST_TIME_APP_OPEN_IN_DAY: {
            return {
                ...state,
                isOpenFirstTime: action.payload,
            };
        }
        case IS_ASK_FOR_CHECKUP: {
            return {
                ...state,
                isAskForCheckup: action.payload,
            };
        }
        case IS_NETWORK_AVAILABLE: {
            return {
                ...state,
                isConnected: action.payload,
            };
        }
        case SET_SAFE_AREA_INTENT: {
            return {
                ...state,
                safeAreaInsetsDefault:action.payload,
                safeAreaInsetsData: action.payload
            }
        }
        case SET_SAFE_AREA_INTENT_X : {
            return {
                ...state,
                safeAreaInsetsData: action.payload,
            }
        }
        case SUBSCRIPTION_CHECK_DATE : {
            return {
                ...state,
                subscriptionInProcess: action.payload,
            }
        }
        case SHOW_REWIRING_PROGRESS_POPUP : {
            return {
                ...state,
                showRewindProgressPopUp: action.payload,
            }
        }
        case STREAK_GOAL_ACHIEVED_POPUP : {
            return {
                ...state,
                streakGoalAchievedPopUp: action.payload,
            }
        }
        case MANAGED_SHOW_STREAK_POPUP : {
            return {
                ...state,
                showGoalAchieved: action.payload,
            }
        }
        case POPUP_QUEUE : {
            return {
                ...state,
                popupQueue: _.cloneDeep(action.payload),
            }
        }
        case TODAY_LIFE_TREEE : {
            return {
                ...state,
                todayLifeTree: action.payload,
            }
        }
        case SHOW_STREAK_POPUP : {
            return {
                ...state,
                showStreakGoalPopUp: action.payload,
            }
        }
        case APP_BADGE_COUNT : {
            return {
                ...state,
                appBadgeCount: action.payload,
            }
        }
        case INTERNET_FILTER : {
            return {
                ...state,
                internetFilterList: action.payload,
            }
        }
        case APPTHEME_TYPE : {
            return {
                ...state,
                appTheme: action.payload,
            }
        }
        case SHOW_MONTHLY_POPUP : {
            return {
                ...state,
                monthlyPopup: action.payload,
            }
        }
        case SHOW_MONTHLY_CHALLENGE_POPUP : {
            return {
                ...state,
                monthlyChallengePopup: action.payload,
            }
        }
        case MONTHLY_CHALLENGE_ACHIEVED : {
            return {
                ...state,
                monthlyChallengeAchived: action.payload,
            }
        }
        case ENCOURAGE_POPUP : {
            return {
                ...state,
                encouragePopup: action.payload,
            }
        }
        case CONGRATULATE_POPUP : {
            return {
                ...state,
                congratulatePopup: action.payload,
            }
        }
        case SET_DO_NOT_DISTURB : {
            return {
                ...state,
                doNotDisturb: action.payload,
            }
        }
        case SHOW_TEAM_ACHIEVEMENT_POPUP : {
            return {
                ...state,
                teamAchievementPopUp: action.payload,
            }
        }
        case SET_CURRENT_USER_DATA : {
            return {
                ...state,
                userCommunity: action.payload,
            }
        }
        default:
            return state;
    }
}