import { ADVICE_POST_LIST,
    ADD_ADVICE_DETAIL,
    ADVICE_SORT_TYPE,
    ADVICE_POST_LIST_LIKED,
    ADVICE_PAGINATION_POST_LIST,
    ADVICE_POST_COMMENT_LIST,
    ADVICE_COMMENT_PAGINATION_LIST } from '../actions/types'
import {appDefaultReducer} from './defaultReducer';
const INITIAL_STATE = appDefaultReducer.advice;

export default (state = INITIAL_STATE, action) => {

    switch (action.type) {
        case ADVICE_POST_LIST: {
            return {
                ...state,
                adviceList: action.payload,
            };
        }
        case ADVICE_PAGINATION_POST_LIST: {
            return {
                ...state,
                advicePagination: action.payload,
            };
        }
        case ADD_ADVICE_DETAIL: {
            return {
                ...state,
                adviceDetail: action.payload,
            };
        }
        case ADVICE_SORT_TYPE: {
            return {
                ...state,
                sortType: action.payload,
            }
        }
        // case ADVICE_SORT_TYPE: {
        //     return {
        //         ...state,
        //         isHeartSort: action.payload,
        //     }
        // }
        case ADVICE_POST_LIST_LIKED:{
            return {
                ...state,
                adviceDetail:action.payload,
            }
        }
        case ADVICE_POST_COMMENT_LIST:{
            return {
                ...state,
                adviceComment:action.payload,
            }
        }
        case ADVICE_COMMENT_PAGINATION_LIST:{
            return {
                ...state,
                adviceCommentPagination:action.payload,
            }
        }
        default:
            return state;
    }

}