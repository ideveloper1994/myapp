import {
    SET_LETTERS,
    SET_LAST_LETTER_DAY,
    SET_LAST_LETTER_DATE
} from '../actions/types';

import {appDefaultReducer} from './defaultReducer';

const INITIAL_STATE = appDefaultReducer.letters;

export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case SET_LETTERS: {
            return {
                ...state,
                letters: action.payload,
            };
        }
        case SET_LAST_LETTER_DAY: {
            return {
                ...state,
                letterInsertedDay: action.payload,
            };
        }
        case SET_LAST_LETTER_DATE: {
            return {
                ...state,
                letterInsertedDate: action.payload,
            };
        }
        default:
            return state;
    }
}