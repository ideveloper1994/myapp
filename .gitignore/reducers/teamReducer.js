import {
    TEAM_DETAIL, TEAM_MEMBER_ARRAY, TEAM_CHAT_MESSAGE_ARRAY, INDIVIDUAL_LEADER_BOARD, TEAM_LEADER_BOARD,
    TEAM_ACHIEVEMENT_DETAILS, TEAM_CHAT_PAGINATION, TEAM_ACHIEVEMENTES_PAGINATION, TEAM_ACHIEVEMENTES,
    TEAM_CHAT_DISPLAY_LIST,
    TEAM_MEMBER_EVENT_DETAILS, MEMBER_DETAIL,
    USER_EVENT_DETAILS,
    USER_EVENT_PAGINATION_DETAILS,
    TEAM__MEMBER_EVENT_PAGINATION_DETAILS, SEEN_ACTIVITY_LIST,
    GLOBAL_STATISCTIC, SEEN_USER_EVENTS, EVENT_BADGE_COUNT, START_EVENT_VIEWS
} from '../actions/types'

import {appDefaultReducer} from './defaultReducer';

const INITIAL_STATE = appDefaultReducer.team;

export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case TEAM_DETAIL: {
            return {
                ...state,
                teamDetail: action.payload,
            };
        }
        case TEAM_MEMBER_ARRAY: {
            return {
                ...state,
                memberArray: action.payload,
            };
        }
        case TEAM_CHAT_MESSAGE_ARRAY: {
            return {
                ...state,
                teamChatMessageArray: action.payload,
            };
        }
        case TEAM_CHAT_PAGINATION: {
            return {
                ...state,
                teamChatPagination: action.payload,
            };
        }
        case INDIVIDUAL_LEADER_BOARD: {
            return {
                ...state,
                individualLeaderBoard: {
                    ...state.individualLeaderBoard,
                    [action.payload.key]:action.payload.values
                }
            };
        }
        case TEAM_LEADER_BOARD: {
            return {
                ...state,
                teamLeaderBoard: {
                    ...state.teamLeaderBoard,
                    [action.payload.key]:action.payload.values
                }
            };
        }
        case TEAM_ACHIEVEMENT_DETAILS: {
            return {
                ...state,
                teamAchievementDetail: action.payload
            };
        }
        case TEAM_ACHIEVEMENTES: {
            return {
                ...state,
                teamAchievements: action.payload
            };
        }
        case TEAM_ACHIEVEMENTES_PAGINATION: {
            return {
                ...state,
                teamAchievementsPagination:action.payload
            };
        }
        case TEAM_CHAT_DISPLAY_LIST: {
            return {
                ...state,
                teamChatDisplayList:action.payload
            };
        }
        case TEAM_MEMBER_EVENT_DETAILS: {
            return {
                ...state,
                teamMemberEventList:action.payload
            };
        }
        case TEAM__MEMBER_EVENT_PAGINATION_DETAILS: {
            return {
                ...state,
                teamMemberEventPagination:action.payload
            };
        }
        case MEMBER_DETAIL: {
            return {
                ...state,
                memberDetail:action.payload
            };
        }
        case SEEN_ACTIVITY_LIST: {
            return {
                ...state,
                seenActivity:action.payload
            };
        }
        case USER_EVENT_DETAILS: {
            return {
                ...state,
                userEventList:action.payload
            };
        }
        case USER_EVENT_PAGINATION_DETAILS: {
            return {
                ...state,
                userEventPagination:action.payload
            };
        }
        case GLOBAL_STATISCTIC: {
            return {
                ...state,
                teamGlobalStatistic:action.payload
            };
        }
        case SEEN_USER_EVENTS: {
            return {
                ...state,
                seenUserEvents:action.payload
            };
        }
        case EVENT_BADGE_COUNT: {
            return {
                ...state,
                eventBadgeCount: action.payload
            };
        }
        case START_EVENT_VIEWS: {
            return {
                ...state,
                startEventViews:action.payload
            };
        }
        default:
            return state;
    }
}