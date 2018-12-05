import {
    SET_LETTERS,
    SET_LAST_LETTER_DAY,
    SET_LAST_LETTER_DATE
} from './types'
import {CallApi} from '../services/apiCall';
import Constant from '../services/apiConstant';
import {find} from 'lodash';
import moment from 'moment';
import {apiErrorHandler} from "./userActions";

export const getAllLetters = () => {
    return (dispatch, getState) => {
        return CallApi(Constant.baseUrlV2+Constant.letters,'get',{},{"Authorization":"Bearer "+getState().user.token})
            .then((response)=> {
                let allLetters = response.data;
                let oldLetters = getState().letters.letters;
                allLetters.map((obj,i)=>{
                    allLetters[i].updateDate = null;
                    if(oldLetters && oldLetters.length > 0){
                        if(oldLetters[i].updateDate){
                            allLetters[i].updateDate = oldLetters[i].updateDate;
                        }
                    }
                })
                return dispatch({
                    type: SET_LETTERS,
                    payload: allLetters,
                })
            })
            .catch((error)=>{
                // return Promise.reject(error);
                return dispatch(apiErrorHandler(error));
            })
    };
};

export const updateLetters = (lettersData) => {
    return (dispatch, getState) => {
        let apiUrl = Constant.baseUrlV2+Constant.letters+lettersData.day;
        return CallApi(apiUrl,'patch',{content: lettersData.content},
            {"Authorization":"Bearer "+getState().user.token})
            .then((response)=> {
                let allLetteres = getState().letters.letters;
                let selectedLetter = find(allLetteres, {day: lettersData.day});
                let index = allLetteres.indexOf(selectedLetter);
                allLetteres[index] = response.data.data;
                allLetteres[index].updateDate =  new Date().toDateString();

                dispatch({
                    type: SET_LAST_LETTER_DAY,
                    payload: lettersData.day,
                });
                dispatch({
                    type: SET_LAST_LETTER_DATE,
                    payload: new Date().toDateString(),
                });

                return dispatch({
                    type: SET_LETTERS,
                    payload: allLetteres,
                })
            })
            .catch((error)=>{
                // return Promise.reject(error);
                return dispatch(apiErrorHandler(error));
            })
    };
};