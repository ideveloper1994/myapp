import { HELP_POST_LIST, ADD_HELP_DETAIL, HELP_SORT_TYPE,
    HELP_PAGINATION_POST_LIST, HELP_POST_COMMENT_LIST, HELP_POST_COMMENT_PAGINATION_LIST } from '../actions/types';

import {appDefaultReducer} from './defaultReducer';
const INITIAL_STATE = appDefaultReducer.helpPost;

export default (state = INITIAL_STATE, action) => {

    switch (action.type) {

        case HELP_POST_LIST: {
            return {
                ...state,
                helpPostList: action.payload,
            };
        }
        case HELP_PAGINATION_POST_LIST: {
            return {
                ...state,
                helpPostPagination: action.payload,
            };
        }
        case HELP_POST_COMMENT_LIST: {
            return {
                ...state,
                helpPostComment: action.payload,
            };
        }
        case HELP_POST_COMMENT_PAGINATION_LIST: {
            return {
                ...state,
                helpPostCommentPagination: action.payload,
            };
        }
        case ADD_HELP_DETAIL: {
            return {
                ...state,
                helpPostList: action.payload,
            };
        }
        case HELP_SORT_TYPE: {
            return {
                ...state,
                sortType: action.payload,
            }
        }
        default:
            return state;
    }

}