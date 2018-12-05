import {
    AsyncStorage,
} from 'react-native';
import {
    STATISTIC_J_DATE_ARRAY,
    STATISTIC_JOURNAL_DETAIL,
    STATISTIC_JOURNAL_DETAIL_EDIT,
    STATISTIC_P_CALCULATION,
    STATISTIC_M_CALCULATION,
    STATISTIC_OTHER_DETAIL,
    STATISTIC_ALL_BACKUP_EDIT,
    STATISTIC_ALL_BACKUP,
    META_DATA_BACKUP,
    SET_GOAL_DATA
} from './types';
import {CallApi} from '../services/apiCall';
import Constant from '../services/apiConstant';
import moment from 'moment';
import {find, filter, groupBy, indexOf, cloneDeep, remove, findIndex} from 'lodash';
import { getTeamDetail,getTeamChat,getleaderboardIndividualList,getleaderboardTeamList } from './teamAction';
import { getHelpPostDetail } from './helpPostActions';
import { getAdviceDetail } from './postAdviceAction';
import {calculateRewiringProgress, updateMetaData} from './metadataActions';
import { getAllLetters } from './lettersActions';
import {setUpLocalNotificationAlerts, manageStreakAchievedPopup, apiErrorHandler} from './userActions';

const keys = ["progress_desensitation","progress_hypofrontality","progress_wisdom","progress_dopamine_rewiring","progress_stress_control",
    "relapse_porn_bored","relapse_porn_stress","relapse_porn_anxiety","relapse_porn_tired","relapse_porn_alone","relapse_porn_pain",
    "relapse_porn_horny","relapse_porn_morning","relapse_porn_afternoon","relapse_porn_evening","relapse_porn_night","relapse_masturbation_morning",
    "relapse_masturbation_afternoon","relapse_masturbation_evening","relapse_masturbation_night","tempted_porn_morning","tempted_porn_afternoon",
    "tempted_porn_evening","tempted_porn_night","tempted_masturbation_morning","tempted_masturbation_afternoon","tempted_masturbation_evening",
    "tempted_masturbation_night",
    "exercise_number_activity","exercise_number_audio","exercise_number_breathing","exercise_number_choose",
    "exercise_number_emotion","exercise_number_escape","exercise_number_faith","exercise_number_kegals","exercise_number_learn",
    "exercise_number_letters","exercise_number_meditation","exercise_number_slideshow","exercise_number_story","exercise_number_stress_relief",
    "exercise_number_thought_control","exercise_number_brain_training","exercise_number_video","exercise_number_visualization",
    "improvement_mind",
    "improvement_energy","improvement_attraction","improvement_sleep","improvement_voice",
    "improvement_health","improvement_confidence","improvement_alive",
    "stressed_morning","stressed_afternoon","stressed_evening","stressed_night","registered_at","last_checkup_at"];
const objDefaultMetaData = {};
keys.forEach((key) => objDefaultMetaData[key] = key.includes('exercise') ? 1 : 0);

function reverseObject(tmpObj) {
    let keys = Object.keys(tmpObj).reverse();
    let obj = {};
    keys.map(key => {
        obj[key] = tmpObj[key];
    });
    return obj;
}

//Handle porn details

export const getPornDays = (isCallDelete = true, isCallJournal = true) => {
    return (dispatch, getState) => {
        return CallApi(Constant.baseUrlV2+Constant.getPornDays,'get',{},{"Authorization":"Bearer "+getState().user.token})
            .then((response)=>{
                dispatch(calculatePornDay(response.data,true));
                if(isCallDelete){
                    dispatch(deleteFuturePornDates(response.data));
                }
                if(isCallJournal){
                    return dispatch(getJournalDays());
                }
            }).catch((error)=>{
                return dispatch(calculatePornDay(getState().statistic.pornDetail.p_array, true));
                // return Promise.reject(error);
                return dispatch(apiErrorHandler(error));
            })
    };
};

export const addPornDays = (objPorn) => {
    return (dispatch, getState) => {
        return CallApi(Constant.baseUrlV2+Constant.getPornDays,
            'post',
            objPorn,
            {"Authorization":"Bearer "+getState().user.token})
            .then((response)=> {
                let pornData = getState().statistic.pornDetail.p_array;
                pornData.push(response.data.data);
                dispatch(calculatePornDay(pornData));
                return Promise.resolve(response.data.data);
            }).catch((error)=>{
                // return Promise.reject(error);
                return dispatch(apiErrorHandler(error));
            });
    };
};

export const updatePornDay = (objPorn) => {
    return (dispatch, getState) => {
        // let pornData = getState().statistic.pornDetail.p_array;
        // let pornDeleteObj = find(pornData, {id: objPorn.id});
        // let index = indexOf(pornData, pornDeleteObj);
        // pornData[index].is_relapse = objPorn.is_relapse;
        // if(objPorn.is_relapse){
        //     pornData[index].is_resolved = true;
        //     objPorn.is_resolved = true;
        // }
        // dispatch(calculatePornDay(pornData));

        let updateUrl = Constant.baseUrlV2+Constant.getPornDays+'/'+objPorn.id;
        return CallApi(updateUrl,
            'patch',
            objPorn,
            {"Authorization":"Bearer "+getState().user.token})
            .then((response)=> {

                let pornData = getState().statistic.pornDetail.p_array;
                let pornDeleteObj = find(pornData, {id: objPorn.id});
                let index = indexOf(pornData, pornDeleteObj);
                pornData[index].is_relapse = objPorn.is_relapse;
                if(objPorn.is_relapse){
                    pornData[index].is_resolved = true;
                    objPorn.is_resolved = true;
                }
                dispatch(calculatePornDay(pornData));

                return Promise.resolve(response.data.data);
            })
            .catch((error)=>{
                // return Promise.reject(error);
                return dispatch(apiErrorHandler(error));
            });
    }
};

export const deletePornDay = (pornId) => {
    return (dispatch, getState) => {
        // let pornData = getState().statistic.pornDetail.p_array;
        // let pornDeleteObj = find(pornData, {id: pornId});
        // remove(pornData,pornDeleteObj);
        // dispatch(calculatePornDay(pornData));

        let deleteUrl = Constant.baseUrlV2+Constant.getPornDays+'/'+pornId;
        return CallApi(deleteUrl,
            'delete',
            {},
            {"Authorization":"Bearer "+getState().user.token})
            .then((response)=> {

                let pornData = getState().statistic.pornDetail.p_array;
                let pornDeleteObj = find(pornData, {id: pornId});
                remove(pornData,pornDeleteObj);
                dispatch(calculatePornDay(pornData));
                return Promise.resolve(pornDeleteObj);
            })
            .catch((error)=>{
                // return Promise.reject(error);
                return dispatch(apiErrorHandler(error));
            });
    }
};

//Resolve porn day entry

export const resolvePornDay = (pornObj) => {
    return (dispatch, getState) => {
        let pornData = getState().statistic.pornDetail.p_array;
        let pornOldObj = find(pornData, {id: pornObj.id});
        let index = indexOf(pornData, pornOldObj);
        pornData[index].is_resolved = true;
        pornData[index].is_relapse = true;
        dispatch(calculatePornDay(pornData));

        let resolveUrl = Constant.baseUrlV2+Constant.getPornDays+'/'+pornObj.id+'/resolve';
        return CallApi(resolveUrl,
            'post',
            {},
            {"Authorization":"Bearer "+getState().user.token})
            .then((response)=> {
                pornObj.is_relapse = true;
                dispatch(updatePornDay(pornObj));
                return Promise.resolve();
            })
            .catch((error)=>{
                // return Promise.reject(error);
                return dispatch(apiErrorHandler(error));
            }).catch((error)=>{
                return Promise.reject(error);
            });
    }
};

//Handle masturbation details
export const getMasturbationDays = (isCallDelete = true) => {
    return (dispatch, getState) => {
        return CallApi(Constant.baseUrlV2+Constant.masturbationDays,'get',{},{"Authorization":"Bearer "+getState().user.token})
            .then((response)=>{
                if(isCallDelete){
                    dispatch(deleteFutureMosturbationDates(response.data));
                }
                return dispatch(calculateMosturbationDay(response.data));
            })
            .catch((error)=>{
                // return Promise.reject(error);
                return dispatch(apiErrorHandler(error));
            })
    };
};

export const addMasturbationDays = (objMasturbation) => {
    return (dispatch, getState) => {
        return CallApi(Constant.baseUrlV2+Constant.masturbationDays,
            'post',
            objMasturbation,
            {"Authorization":"Bearer "+getState().user.token})
            .then((response)=> {
                if(response.data.data){
                    // return dispatch(getMasturbationDays());
                    let masturbationData = getState().statistic.mosturbutionDetail.m_array;
                    masturbationData.push(response.data.data);
                    dispatch(calculateMosturbationDay(masturbationData));
                    return Promise.resolve(response.data.data);
                }
            })
            .catch((error)=>{
                // return Promise.reject(error);
                return dispatch(apiErrorHandler(error));
            })
    };
};

export const updateMasturbationDay = (objMasturbation) => {
    return (dispatch, getState) => {
        let masturbationData = getState().statistic.mosturbutionDetail.m_array;
        let mObj = find(masturbationData, {id: objMasturbation.id});
        let index = indexOf(masturbationData, mObj);
        masturbationData[index].is_relapse = objMasturbation.is_relapse;
        if(objMasturbation.is_relapse){
            masturbationData[index].is_resolved = true;
            objMasturbation.is_resolved = true;
        }
        dispatch(calculateMosturbationDay(masturbationData));

        let updateUrl = Constant.baseUrlV2+Constant.masturbationDays+'/'+objMasturbation.id;
        return CallApi(updateUrl,
            'patch',
            objMasturbation,
            {"Authorization":"Bearer "+getState().user.token})
            .then((response)=> {
                return Promise.resolve(mObj);
            })
            .catch((error)=>{
                // return Promise.reject(error);
                return dispatch(apiErrorHandler(error));
            });
    }
};

export const deleteMasturbationDay = (masturbationId) => {
    return (dispatch, getState) => {
        let masturbationData = getState().statistic.mosturbutionDetail.m_array;
        let mObj = find(masturbationData, {id: masturbationId});
        remove(masturbationData,mObj);
        dispatch(calculateMosturbationDay(masturbationData));

        let deleteUrl = Constant.baseUrlV2+Constant.masturbationDays+'/'+masturbationId;
        return CallApi(deleteUrl,
            'delete',
            {},
            {"Authorization":"Bearer "+getState().user.token})
            .then((response)=> {
                ``  // return dispatch(getMasturbationDays());
                return Promise.resolve(mObj);
            })
            .catch((error)=>{
                // return Promise.reject(error);
                return dispatch(apiErrorHandler(error));
            });
    }
};

//Resolve Masturbation day entry

export const resolveMasturbationDay = (masturbationObj) => {
    return (dispatch, getState) => {
        let masturbationData = getState().statistic.mosturbutionDetail.m_array;
        let mObj = find(masturbationData, {id: masturbationObj.id});
        let index = indexOf(masturbationData, mObj);
        masturbationData[index].is_resolved = true;
        masturbationData[index].is_relapse = true;
        dispatch(calculateMosturbationDay(masturbationData));
        let resolveUrl = Constant.baseUrlV2+Constant.masturbationDays+'/'+masturbationObj.id+'/resolve';
        return CallApi(resolveUrl,
            'post',
            {},
            {"Authorization":"Bearer "+getState().user.token})
            .then((response)=> {
                masturbationObj.is_relapse = true;
                dispatch(updateMasturbationDay(masturbationObj));
                return Promise.resolve();
            })
            .catch((error)=>{
                // return Promise.reject(error);
                return dispatch(apiErrorHandler(error));
            });
    }
};


//Handle journal details

export const getJournalDays = () => {
    return (dispatch, getState) => {
        return CallApi(Constant.baseUrlV2+Constant.journalEntries,'get',{},{"Authorization":"Bearer "+getState().user.token})
            .then((response)=> {
                return dispatch(calculateJournal(response.data));
            })
            .catch((error)=>{
                // return Promise.reject(error);
                return dispatch(apiErrorHandler(error));
            })
    };
};

export const addJournalDays = (objJournal) => {
    return (dispatch, getState) => {
        return CallApi(Constant.baseUrlV2+Constant.journalEntries,'post',
            {entered_at: objJournal.key,content: objJournal.data},
            {"Authorization":"Bearer "+getState().user.token})
            .then((response)=> {
                // return dispatch(getJournalDays());
                let oldJournalEntries = cloneDeep(getState().statistic.j_array)
                oldJournalEntries.push(response.data.data)
                return dispatch(calculateJournal(oldJournalEntries));
            })
            .catch((error)=>{
                // return Promise.reject(error);
                return dispatch(apiErrorHandler(error));
            })
    };
};

export const updateJournalContent = (objJournal) => {
    let updateUrl = Constant.baseUrlV2+Constant.journalEntries+'/'+objJournal.id;
    return (dispatch, getState) => {
        return CallApi(updateUrl,'patch',{entered_at: objJournal.key,content: objJournal.data},
            {"Authorization":"Bearer "+getState().user.token})
            .then((response)=> {
                // return dispatch(getJournalDays());
                let oldJournalEntries = cloneDeep(getState().statistic.j_array)
                var index = findIndex(oldJournalEntries, {id: objJournal.id});
                oldJournalEntries.splice(index, 1, response.data.data);
                return dispatch(calculateJournal(oldJournalEntries));

            })
            .catch((error)=>{
                // return Promise.reject(error);
                return dispatch(apiErrorHandler(error));
            })
    };
};

//old method
export const editJournalList = (data) => {
    return (dispatch, getState) => {
        let jDateKey = "";
        Object.keys(data).map(obj => {
            if (obj.match(/^j(\d{1,2})\-(\d{1,2})\-(\d{4})$/)) {
                jDateKey = obj.slice(1);
            }
        });
        let month = moment(jDateKey, 'D-M-YYYY').format("MMMM");
        let year = moment(jDateKey, 'D-M-YYYY').format("YYYY");
        let key = month + "-" + year;
        let journalObj = getState().statistic.journal_date_wise_list;
        if(Object.keys(journalObj).indexOf(key) > -1 ) {
            journalObj[key][jDateKey].data = data["j" + jDateKey];
        }
        dispatch({
            type:STATISTIC_JOURNAL_DETAIL_EDIT,
            payload:journalObj,
        });
        return Promise.resolve();
    }
};

//All Calculation
/*
export  const calculatePornDay = (pornData, isAPICall = false) =>{

    console.log("========Cal Porn Days==========");
    return (dispatch, getState) => {
        let arrN_NO = [],arrN_YES=[], arrN=[];
        let full_array = cloneDeep(pornData);
        let todayDate = moment().format("YYYY-MM-DD");
        //let yesterdayDate = moment().subtract(1,'days').format("YYYY-MM-DD");
        //let last_checkup_at = getState().metaData.metaData.last_checkup_at || "";
        let remove_futureDate_array = [];

        // if(last_checkup_at == todayDate || last_checkup_at == yesterdayDate) {
        //     remove_futureDate_array  = remove(full_array,item => (!moment(item.occurred_at).isSame(moment(), 'd'))
        //         ? moment(item.occurred_at).isBefore(moment(), "day"):true);
        // }else {
        //     remove_futureDate_array  = remove(full_array,item => (!moment(item.occurred_at)
        //         .isSame(moment().subtract(1, 'days'), 'd'))
        //         ? moment(item.occurred_at).isBefore(moment().subtract(1, 'days'), "day"):true);
        // }

        remove_futureDate_array  = remove(full_array,item => (!moment(item.occurred_at).isSame(moment(), 'd'))
            ? moment(item.occurred_at).isBefore(moment(), "day"):true);

        arrN_YES = filter(remove_futureDate_array,{ is_relapse: false, is_resolved: true});
        arrN_NO = filter(remove_futureDate_array,{ is_relapse: true, is_resolved: true});

        let arrPornFreeObj = filter(remove_futureDate_array,{ is_relapse: false, is_resolved: false});

        arrPornFreeObj.forEach(obj=>{
            if(obj.occurred_at !== todayDate) {
                obj.is_resolved = true;
                arrN_YES.push(obj);
            }
        })

        arrN_YES.sort(function(a,b){
            // Turn your strings into dates, and then subtract them
            // to get a value that is either negative, positive, or zero.
            let aDAte = moment(a.occurred_at, 'YYYY-MM-DD').toDate();
            let bDAte = moment(b.occurred_at, 'YYYY-MM-DD').toDate();
            return new Date(aDAte) - new Date(bDAte);
        });

        let todayObject = find(arrN_YES, {occurred_at: todayDate});
        if(todayObject != undefined){
            let todayIndex = arrN_YES.indexOf(todayObject);
            arrN_YES.splice(todayIndex, 1);
        }

        arrN_NO.sort(function(a,b){
            // Turn your strings into dates, and then subtract them
            // to get a value that is either negative, positive, or zero.
            let aDAte = moment(a.occurred_at, 'YYYY-MM-DD').toDate();
            let bDAte = moment(b.occurred_at, 'YYYY-MM-DD').toDate();
            return new Date(aDAte) - new Date(bDAte);
        });

        arrN = pornData;
        arrN_YES = arrN_YES.map(function(a) {return a.occurred_at;});
        arrN_NO = arrN_NO.map(function(a) {return a.occurred_at;});

        // PORN Calculation
        //Total Clean Days P
        let totalPCleanDays = arrN_YES.length;
        //END Clean Days P
        //current streak calculation
        let i = 1, current_clean_streak_p =0,streakarrayp=[],counterp=0, best_streak_p = 0;

        if(find(remove_futureDate_array,{occurred_at: todayDate, is_resolved: true}) !== undefined){
            console.log("take i = 0")
            i = 0
        }

        while (true){
            let res = arrN_YES.indexOf(moment(moment().subtract(i, 'days').
            format('YYYY-MM-DD'),'YYYY-MM-DD').format('YYYY-MM-DD'));
            if(res!=-1) {
                current_clean_streak_p++;
                i++;
            }else break;
        }

        //End current streak calculation
        // Best Streak calculation
        let ii = 1;
        arrN_YES.map((obj)=>{
            let a = moment(obj, 'YYYY-MM-DD').toDate();
            let dayafter = moment(a).add(1,'days').toDate();
            let res = arrN_YES.indexOf(moment(dayafter).format('YYYY-MM-DD'));
            if(res!=-1) {
                counterp++;
                ii++;
            }else {
                streakarrayp.push(counterp+1);
                ii=1;
                counterp=0;
            }
        });

        if(streakarrayp.length>0) {
            best_streak_p  = streakarrayp.reduce(function (previous, current) {
                return previous > current ? previous : current
            });
        }
        //END Best Streak calculation

        //clean days per year mapping blue chart on statistic
        let groupbyYear = groupBy(arrN_YES, function (el) {
            return (moment(el, 'YYYY-MM-DD').toDate().getFullYear());
        });

        let finalYearMonthMapP = {};
        let currentYear = moment().toDate().getFullYear();
        Object.keys(groupbyYear).map((year)=> {
            let temp = groupBy(groupbyYear[year], function (el) {
                return (moment(el, 'YYYY-MM-DD').toDate().getMonth());
            });
            let monthArr = [0,0,0,0,0,0,0,0,0,0,0,0];

            Object.keys(temp).map((month)=>{
                let totalDays = moment((parseInt(month)+1).toString()+"-"+year.toString(), 'M-YYYY').daysInMonth();
                monthArr[month] = parseInt((temp[month].length/totalDays)*100);

            });
            finalYearMonthMapP[year] = {
                isCurrentYear:(year==currentYear),
                hasPrev:(Object.keys(groupbyYear).indexOf((parseInt(year)-1).toString()) > -1 ),
                hasNext:(Object.keys(groupbyYear).indexOf((parseInt(year)+1).toString()) > -1 ),
                monthArr:monthArr
            };
        });
        let strCurrentYear = currentYear.toString();
        if((Object.keys(finalYearMonthMapP).indexOf(strCurrentYear)) < 0){
            let prev = (currentYear - 1).toString();
            if((Object.keys(finalYearMonthMapP).indexOf(prev)) >= 0){
                finalYearMonthMapP[prev].hasNext = true;
                finalYearMonthMapP[strCurrentYear] = {isCurrentYear: true, hasPrev: true, hasNext: false, monthArr: [0,0,0,0,0,0,0,0,0,0,0,0]}
            }else{
                if(Object.keys(finalYearMonthMapP).length == 0){
                    finalYearMonthMapP[strCurrentYear] = {isCurrentYear: true, hasPrev: false, hasNext: false, monthArr: [0,0,0,0,0,0,0,0,0,0,0,0]}
                }else{
                    Object.keys(finalYearMonthMapP).forEach(key=>{
                        finalYearMonthMapP[key].hasNext = true
                    });
                    finalYearMonthMapP[strCurrentYear] = {isCurrentYear: true, hasPrev: true, hasNext: false, monthArr: [0,0,0,0,0,0,0,0,0,0,0,0]}
                }

            }
        }
        // END clean days per year mapping blue chart on statistic

        // START what day I relapsed

        let total = arrN_NO.length;
        let arrOfWeekDays=[0,0,0,0,0,0,0];
        arrN_NO.map((obj)=>{
            let day = moment(obj,'YYYY-MM-DD').toDate().getDay();
            let value = arrOfWeekDays[day];
            arrOfWeekDays[day]=(value+1);
        });

        let newArrOfWeekDaysP = [];
        arrOfWeekDays.map((obj)=> {
            let a = parseInt((obj/total)*100);
            if(isNaN(a)){
                newArrOfWeekDaysP.push(0);
            }else{
                newArrOfWeekDaysP.push(a);
            }
        });
        newArrOfWeekDaysP.push(newArrOfWeekDaysP.shift());
        // END what day I relapsed

        //End PORN Calculation

        console.log("------------Val-------"+current_clean_streak_p)

        //For Streak goal popup
        if(current_clean_streak_p === 0) {
            dispatch(manageStreakAchievedPopup({
                isShow: false,
                achivedGoal: 0,
                displayDate: getState().user.showStreakGoalPopUp.displayDate || "",
                whileGoal: getState().user.showStreakGoalPopUp.whileGoal || 0,
                inProcess: false
            }));
        }
        return Promise.all([
            dispatch({
                type: STATISTIC_P_CALCULATION,
                payload: {
                    p_array: arrN,
                    p_no_array: arrN_NO,
                    p_yes_array: arrN_YES,
                    clean_p_days_per_month: finalYearMonthMapP,
                    relapsed_p_days_per_weekdays: newArrOfWeekDaysP,
                    total_p_clean_days: totalPCleanDays,
                    current_p_clean_days: current_clean_streak_p,
                    best_p_clean_days: best_streak_p
                }
            })
        ]).then(res => {
            dispatch(goalCalculation());
            if(!isAPICall){
                dispatch(calculateJournal(getState().statistic.j_array));
            }
        });

        //});

    }
};

export  const calculateMosturbationDay = (masturbationData) =>{
    return (dispatch, getState) => {
        let arrM=[],arrM_NO=[],arrM_YES=[];
        let full_array = cloneDeep(masturbationData);
        let yesterdayDate = moment().subtract(1,'days').format("YYYY-MM-DD");
        let last_checkup_at = (getState().metaData.metaData.last_checkup_at != undefined) &&
            getState().metaData.metaData.last_checkup_at || "";
        let todayDate = moment().format("YYYY-MM-DD");

        let remove_futureDate_array = [];
        remove_futureDate_array  = remove(full_array,item => (!moment(item.occurred_at).isSame(moment(), 'd'))
            ? moment(item.occurred_at).isBefore(moment(), "day"):true);

        arrM_YES = filter(remove_futureDate_array,{ is_relapse: false, is_resolved: true});
        arrM_NO = filter(remove_futureDate_array,{ is_relapse: true, is_resolved: true});

        arrM_NO.sort(function(a,b){
            // Turn your strings into dates, and then subtract them
            // to get a value that is either negative, positive, or zero.
            let aDAte = moment(a.occurred_at, 'YYYY-MM-DD').toDate();
            let bDAte = moment(b.occurred_at, 'YYYY-MM-DD').toDate();
            return new Date(aDAte) - new Date(bDAte);
        });

        arrM_YES.sort(function(a,b){
            // Turn your strings into dates, and then subtract them
            // to get a value that is either negative, positive, or zero.
            let aDAte = moment(a.occurred_at, 'YYYY-MM-DD').toDate();
            let bDAte = moment(b.occurred_at, 'YYYY-MM-DD').toDate();
            return new Date(aDAte) - new Date(bDAte);
        });

        arrM_YES = arrM_YES.map(function(a) {return a.occurred_at;});
        arrM_NO = arrM_NO.map(function(a) {return a.occurred_at;});

        arrM = masturbationData;

        //Mosturbation calculation
        //Total Clean Days M
        let totalMCleanDays=arrM_YES.length;
        //END Clean Days M
        //M current streak calculation

        let i= 1, current_clean_streak_m = 0, streakarraym=[],counterm=0;
        if(find(remove_futureDate_array,{occurred_at: todayDate, is_resolved: true }) !== undefined){
            i = 0
        }
        while (true){
            let res = arrM_YES.indexOf(moment(moment().subtract(i, 'days').format('YYYY-MM-DD'),'YYYY-MM-DD').format('YYYY-MM-DD'));
            if(res!==-1) {
                current_clean_streak_m++;
                i++;
            }else break;
        }
        //End current streak calculation

        // Best Streak calculation
        let best_streak_m = 0;

        let ij = 1;
        arrM_YES.map((obj)=>{

            let a = moment(obj, 'YYYY-MM-DD').toDate();
            let dayafter = moment(a).add(1,'days').toDate();
            let res = arrM_YES.indexOf(moment(dayafter).format('YYYY-MM-DD'));
            if(res!=-1) {
                counterm++;
                ij++;
            }else {
                streakarraym.push(counterm+1);
                ij=1;
                counterm=0;
            }
        });

        if(streakarraym.length>0) {
            best_streak_m = streakarraym.reduce(function (previous, current) {
                return previous > current ? previous : current
            });
        }
        //END Best Streak calculation

        //M clean days per year mapping blue chart on statistic

        let groupbyYearM = groupBy(arrM_YES, function (el) {
            return (moment(el, 'YYYY-MM-DD').toDate().getFullYear());
        });
        let currentYear = moment().toDate().getFullYear();
        let finalYearMonthMapM = {};
        Object.keys(groupbyYearM).map((year)=> {
            let temp = groupBy(groupbyYearM[year], function (el) {
                return (moment(el, 'YYYY-MM-DD').toDate().getMonth());
            });
            let monthArrM = [0,0,0,0,0,0,0,0,0,0,0,0];

            Object.keys(temp).map((month)=>{
                let totalDays = moment((parseInt(month)+1).toString()+"-"+year.toString(), 'MM-YYYY').daysInMonth();
                monthArrM[month] = parseInt((temp[month].length/totalDays)*100);

            });
            finalYearMonthMapM[year] = {
                isCurrentYear:(year==currentYear),
                hasPrev:(Object.keys(groupbyYearM).indexOf((parseInt(year)-1).toString()) > -1 ),
                hasNext:(Object.keys(groupbyYearM).indexOf((parseInt(year)+1).toString()) > -1 ),
                monthArr:monthArrM
            };
        });
        let strCurrentYear = currentYear.toString();
        if((Object.keys(finalYearMonthMapM).indexOf(strCurrentYear)) < 0){
            let prev = (currentYear - 1).toString();
            if((Object.keys(finalYearMonthMapM).indexOf(prev)) >= 0) {
                finalYearMonthMapM[prev].hasNext = true;
                finalYearMonthMapM[strCurrentYear] = {isCurrentYear: true, hasPrev: true, hasNext: false,
                    monthArr: [0,0,0,0,0,0,0,0,0,0,0,0]}
            }else{
                if(Object.keys(finalYearMonthMapM).length == 0){
                    finalYearMonthMapM[strCurrentYear] = {isCurrentYear: true, hasPrev: false, hasNext: false,
                        monthArr: [0,0,0,0,0,0,0,0,0,0,0,0]};
                }else{
                    Object.keys(finalYearMonthMapM).forEach(key=>{
                        finalYearMonthMapM[key].hasNext = true
                    });
                    finalYearMonthMapM[strCurrentYear] = {isCurrentYear: true, hasPrev: true, hasNext: false, monthArr: [0,0,0,0,0,0,0,0,0,0,0,0]}
                }


            }
        }

        //M END clean days per year mapping blue chart on statistic


        //M START what day I relapsed
        let totalM = arrM_NO.length;
        let arrOfWeekDaysM=[0,0,0,0,0,0,0];
        arrM_NO.map((obj)=>{
            let day = moment(obj,'YYYY-MM-DD').toDate().getDay();
            let value = arrOfWeekDaysM[day];
            arrOfWeekDaysM[day]=(value+1);
        });
        let newArrOfWeekDaysM = [];
        arrOfWeekDaysM.map((obj)=> {
            let a = parseInt((obj/totalM)*100);
            if(isNaN(a)){
                newArrOfWeekDaysM.push(0);
            }else{
                newArrOfWeekDaysM.push(a);
            }
        });
        newArrOfWeekDaysM.push(newArrOfWeekDaysM.shift());
        //M END what day I relapsed
        //End Mosturbation calculation
        dispatch({
            type: STATISTIC_M_CALCULATION,
            payload: {
                m_array: arrM,
                m_no_array: arrM_NO,
                m_yes_array: arrM_YES,
                clean_m_days_per_month: finalYearMonthMapM,
                relapsed_m_days_per_weekdays: newArrOfWeekDaysM,
                total_m_clean_days: totalMCleanDays,
                current_m_clean_days: current_clean_streak_m,
                best_m_clean_days: best_streak_m
            }
        });
        return Promise.resolve(true);
        //});
    }
};
*/

//Current goal for life tree
export  const calculateCurrentGoalForLifeTree = () =>{
    return (dispatch, getState) => {
        let arrN_YES=[];
        let full_array = getState().statistic.pornDetail.p_array;
        let todayDate = moment().format("YYYY-MM-DD");
        let remove_futureDate_array = [];
        full_array.map(obj=>{
            if(new Date(obj.occurred_at) <= new Date()){
                remove_futureDate_array.push(obj)
            }
        })
        arrN_YES = filter(remove_futureDate_array,{ is_relapse: false, is_resolved: true});
        arrN_YES.sort(function(a,b){
            return new Date(a.occurred_at) - new Date(b.occurred_at);
        });
        arrN_YES = arrN_YES.map(a=>a.occurred_at);
        // PORN Calculation
        //Total Clean Days P
        let totalPCleanDays = arrN_YES.length;
        //END Clean Days P
        //current streak calculation
        let i = 1, current_clean_streak_p =0;
        while (true){
            let res = arrN_YES.indexOf(moment(moment().subtract(i, 'days').
            format('YYYY-MM-DD'),'YYYY-MM-DD').format('YYYY-MM-DD'));
            if(res!=-1) {
                current_clean_streak_p++;
                i++;
            }else break;
        }
        return Promise.resolve(current_clean_streak_p);
    }
};

export  const getCurrentClean = () =>{
    return (dispatch, getState) => {
        try{

            dispatch(calculatePornDay(getState().statistic.pornDetail.p_array));
            dispatch(calculateRewiringProgress());

            let arrN_YES=[];
            let full_array = cloneDeep(getState().statistic.pornDetail.p_array);
            let todayDate = moment().format("YYYY-MM-DD");
            let remove_futureDate_array = [];

            full_array.map(obj=>{
                if(new Date(obj.occurred_at) <= new Date()){
                    remove_futureDate_array.push(obj)
                }
            })
            arrN_YES = filter(remove_futureDate_array,{ is_relapse: false, is_resolved: true});

            let arrPornFreeObj = filter(remove_futureDate_array,{ is_relapse: false, is_resolved: false});

            arrPornFreeObj.forEach(obj=>{
                if(obj.occurred_at !== todayDate) {
                    obj.is_resolved = true;
                    arrN_YES.push(obj);
                }
            })
            arrN_YES.sort(function(a,b){
                return new Date(a.occurred_at) - new Date(b.occurred_at);
            });

            let todayObject = find(arrN_YES, {occurred_at: todayDate});
            if(todayObject != undefined){
                let todayIndex = arrN_YES.indexOf(todayObject);
                arrN_YES.splice(todayIndex, 1);
            }
            arrN_YES = arrN_YES.map(a=>a.occurred_at);
            // PORN Calculation
            //END Clean Days P
            //current streak calculation
            let i = 1, current_clean_streak_p =0;
            if(find(remove_futureDate_array,{occurred_at: todayDate, is_resolved: true, is_relapse: true}) !== undefined){
                i = 0
            }
            while (true){
                let res = arrN_YES.indexOf(moment(moment().subtract(i, 'days').
                format('YYYY-MM-DD'),'YYYY-MM-DD').format('YYYY-MM-DD'));
                if(res!=-1) {
                    current_clean_streak_p++;
                    i++;
                }else break;
            }
            let goal = 1;
            if(current_clean_streak_p < 1){
                goal = 1;
            }else if(current_clean_streak_p < 3){
                goal = 3;
            }else if(current_clean_streak_p < 7){
                goal = 7;
            }else if(current_clean_streak_p < 14){
                goal = 14;
            }else if(current_clean_streak_p < 30){
                goal = 30;
            }else if(current_clean_streak_p < 90){
                goal = 90;
            }else if(current_clean_streak_p < 180){
                goal = 180;
            }else{
                goal = 365;
            }
            dispatch(goalCalculation(false, current_clean_streak_p));
            return Promise.resolve({cleanDays:current_clean_streak_p, goal});

        }catch (e){
            return Promise.reject(e);
        }
    }
};

export  const calculatePornDay = (pornData, isAPICall = false) =>{
    return (dispatch, getState) => {
        let arrN_NO = [],arrN_YES=[], arrN=[];
        let full_array = cloneDeep(pornData);
        let todayDate = moment().format("YYYY-MM-DD");
        let remove_futureDate_array = [];
        full_array.map(obj=>{
            if(new Date(obj.occurred_at) <= new Date()){
                remove_futureDate_array.push(obj)
            }
        })
        arrN_YES = filter(remove_futureDate_array,{ is_relapse: false, is_resolved: true});
        arrN_NO = filter(remove_futureDate_array,{ is_relapse: true, is_resolved: true});

        let arrPornFreeObj = filter(remove_futureDate_array,{ is_relapse: false, is_resolved: false});

        arrPornFreeObj.forEach(obj=>{
            if(obj.occurred_at !== todayDate) {
                obj.is_resolved = true;
                arrN_YES.push(obj);
            }
        })

        arrN_YES.sort(function(a,b){
            return new Date(a.occurred_at) - new Date(b.occurred_at);
        });

        arrN_NO.sort(function(a,b){
            return new Date(a.occurred_at) - new Date(b.occurred_at);
        });

        let todayObject = find(arrN_YES, {occurred_at: todayDate});
        if(todayObject != undefined){
            let todayIndex = arrN_YES.indexOf(todayObject);
            arrN_YES.splice(todayIndex, 1);
        }
        arrN = pornData;
        arrN_YES = arrN_YES.map(a=>a.occurred_at);
        arrN_NO = arrN_NO.map(a=>a.occurred_at);

        // PORN Calculation
        //Total Clean Days P
        let totalPCleanDays = arrN_YES.length;
        //END Clean Days P
        //current streak calculation
        let i = 1, current_clean_streak_p =0,streakarrayp=[],counterp=0, best_streak_p = 0;

        if(find(remove_futureDate_array,{occurred_at: todayDate, is_resolved: true, is_relapse: true}) !== undefined){
            i = 0
        }

        Date.prototype.addDays = function(days) {
            var dat = new Date(this.valueOf());
            dat.setDate(dat.getDate() + days);
            return dat;
        }
        //
        // Date.prototype.subDays = function(days) {
        //     var dat = new Date(this.valueOf());
        //     dat.setDate(dat.getDate() - days);
        //     return dat;
        // }
        while (true){
            let res = arrN_YES.indexOf(moment(moment().subtract(i, 'days').
            format('YYYY-MM-DD'),'YYYY-MM-DD').format('YYYY-MM-DD'));
            if(res!=-1) {
                current_clean_streak_p++;
                i++;
            }else break;
        }
        // while (true){
        //     let prevDate = new Date().subDays(i).toISOString().substring(0,10);
        //     let res = arrN_YES.indexOf(prevDate);
        //     if(res!=-1) {
        //         current_clean_streak_p++;
        //         i++;
        //     }else break;
        // }

        //End current streak calculation
        // Best Streak calculation
        // let ii = 1;
        // arrN_YES.map((obj)=>{
        //     let a = moment(obj, 'YYYY-MM-DD').toDate();
        //     let dayafter = moment(a).add(1,'days').toDate();
        //     let res = arrN_YES.indexOf(moment(dayafter).format('YYYY-MM-DD'));
        //     if(res!=-1) {
        //         counterp++;
        //         ii++;
        //     }else {
        //         streakarrayp.push(counterp+1);
        //         ii=1;
        //         counterp=0;
        //     }
        // });
        let ii = 1;
        arrN_YES.map((obj)=>{
            let a = new Date(obj);
            let dayafter =  a.addDays(1);
            let formatedDate = dayafter.toISOString().substring(0,10);
            let res = arrN_YES.indexOf(formatedDate);
            if(res!=-1) {
                counterp++;
                ii++;
            }else {
                streakarrayp.push(counterp+1);
                ii=1;
                counterp=0;
            }
        });

        if(streakarrayp.length>0) {
            best_streak_p  = streakarrayp.reduce(function (previous, current) {
                return previous > current ? previous : current
            });
        }
        //END Best Streak calculation

        //clean days per year mapping blue chart on statistic
        let groupbyYear = groupBy(arrN_YES, function (el) {
            return (new Date(el).getFullYear());
        });

        let finalYearMonthMapP = {};
        let currentYear= new Date().getFullYear()
        let currentMonth= new Date().getMonth()
        Object.keys(groupbyYear).map((year)=> {
            let temp = groupBy(groupbyYear[year], function (el) {
                return (new Date(el).getMonth());
            });
            let monthArr = [0,0,0,0,0,0,0,0,0,0,0,0];
            let monthlyObj = {};
            Object.keys(temp).map((month)=>{
                let totalDays = moment((parseInt(month)+1).toString()+"-"+year.toString(), 'M-YYYY').daysInMonth();
                monthArr[month] = parseInt((temp[month].length/totalDays)*100);
                monthlyObj[month] = {
                    totalClean: temp[month].length,
                    totalDays: totalDays,
                    percentage: parseInt((temp[month].length/totalDays)*100),
                    isAchieved: (parseInt((temp[month].length/totalDays)*100) == 100),
                    isCurrentMonth: (year == currentYear && month == currentMonth),
                    month: month,
                }
            });
            finalYearMonthMapP[year] = {
                isCurrentYear:(year==currentYear),
                hasPrev:(Object.keys(groupbyYear).indexOf((parseInt(year)-1).toString()) > -1 ),
                hasNext:(Object.keys(groupbyYear).indexOf((parseInt(year)+1).toString()) > -1 ),
                monthArr:monthArr,
                monthlyProgress: monthlyObj
            };
        });

        let strCurrentYear = currentYear.toString();
        if((Object.keys(finalYearMonthMapP).indexOf(strCurrentYear)) < 0){
            let prev = (currentYear - 1).toString();
            if((Object.keys(finalYearMonthMapP).indexOf(prev)) >= 0){
                finalYearMonthMapP[prev].hasNext = true;
                finalYearMonthMapP[strCurrentYear] = {isCurrentYear: true, hasPrev: true, hasNext: false, monthArr: [0,0,0,0,0,0,0,0,0,0,0,0]}
            }else{
                if(Object.keys(finalYearMonthMapP).length == 0){
                    finalYearMonthMapP[strCurrentYear] = {isCurrentYear: true, hasPrev: false, hasNext: false, monthArr: [0,0,0,0,0,0,0,0,0,0,0,0]}
                }else{
                    Object.keys(finalYearMonthMapP).forEach(key=>{
                        finalYearMonthMapP[key].hasNext = true
                    });
                    finalYearMonthMapP[strCurrentYear] = {isCurrentYear: true, hasPrev: true, hasNext: false, monthArr: [0,0,0,0,0,0,0,0,0,0,0,0]}
                }
            }
        }

        // END clean days per year mapping blue chart on statistic

        // START what day I relapsed

        let total = arrN_NO.length;
        let arrOfWeekDays=[0,0,0,0,0,0,0];
        arrN_NO.map((obj)=>{
            let day = new Date(obj).getDay();
            let value = arrOfWeekDays[day];
            arrOfWeekDays[day]=(value+1);
        });

        let newArrOfWeekDaysP = [];
        arrOfWeekDays.map((obj)=> {
            let a = parseInt((obj/total)*100);
            if(isNaN(a)){
                newArrOfWeekDaysP.push(0);
            }else{
                newArrOfWeekDaysP.push(a);
            }
        });
        newArrOfWeekDaysP.push(newArrOfWeekDaysP.shift());
        // END what day I relapsed

        //End PORN Calculation

        //For Streak goal popup
        if(current_clean_streak_p === 0) {
            dispatch(manageStreakAchievedPopup({
                isShow: false,
                achivedGoal: 0,
                displayDate: getState().user.showStreakGoalPopUp.displayDate || "",
                whileGoal: getState().user.showStreakGoalPopUp.whileGoal || 0,
                inProcess: false
            }));
        }

        Promise.all([
            dispatch({
                type: STATISTIC_P_CALCULATION,
                payload: {
                    p_array: arrN,
                    p_no_array: arrN_NO,
                    p_yes_array: arrN_YES,
                    clean_p_days_per_month: finalYearMonthMapP,
                    relapsed_p_days_per_weekdays: newArrOfWeekDaysP,
                    total_p_clean_days: totalPCleanDays,
                    current_p_clean_days: current_clean_streak_p,
                    best_p_clean_days: best_streak_p
                }
            })
        ]).then(res => {
            dispatch(goalCalculation(false, current_clean_streak_p));
            if(!isAPICall){
                dispatch(calculateJournal(getState().statistic.j_array));
            }
        });
        return Promise.resolve(true);
    }
};

export  const calculateMosturbationDay = (masturbationData) =>{
    return (dispatch, getState) => {
        let arrM=[],arrM_NO=[],arrM_YES=[];
        let full_array = cloneDeep(masturbationData);
        let yesterdayDate = moment().subtract(1,'days').format("YYYY-MM-DD");
        let last_checkup_at = (getState().metaData.metaData.last_checkup_at != undefined) &&
            getState().metaData.metaData.last_checkup_at || "";
        let todayDate = moment().format("YYYY-MM-DD");

        let remove_futureDate_array = [];

        full_array.map(obj=>{
            if(new Date(obj.occurred_at) <= new Date()){
                remove_futureDate_array.push(obj)
            }
        })
        arrM_YES = filter(remove_futureDate_array,{ is_relapse: false, is_resolved: true});
        arrM_NO = filter(remove_futureDate_array,{ is_relapse: true, is_resolved: true});

        let arrMosturbationFreeObj = filter(remove_futureDate_array,{ is_relapse: false, is_resolved: false});

        arrMosturbationFreeObj.forEach(obj=>{
            if(obj.occurred_at !== todayDate) {
                obj.is_resolved = true;
                arrM_YES.push(obj);
            }
        })

        arrM_NO.sort(function(a,b){
            return new Date(a.occurred_at) - new Date(b.occurred_at);
        });

        arrM_YES.sort(function(a,b){
            return new Date(a.occurred_at) - new Date(b.occurred_at);
        });

        arrM_YES = arrM_YES.map(a=>a.occurred_at);
        arrM_NO = arrM_NO.map(a=>a.occurred_at);

        //Mosturbation calculation
        //Total Clean Days M
        let totalMCleanDays=arrM_YES.length;
        //END Clean Days M
        //M current streak calculation

        let i= 1, current_clean_streak_m = 0, streakarraym=[],counterm=0;
        if(find(remove_futureDate_array,{occurred_at: todayDate, is_resolved: true }) !== undefined){
            i = 0
        }

        Date.prototype.addDays = function(days) {
            var dat = new Date(this.valueOf());
            dat.setDate(dat.getDate() + days);
            return dat;
        }
        //
        // Date.prototype.subDays = function(days) {
        //     var dat = new Date(this.valueOf());
        //     dat.setDate(dat.getDate() - days);
        //     return dat;
        // }
        // while (true){
        //     let prevDate = new Date().subDays(i).toISOString().substring(0,10);
        //     let res = arrM_YES.indexOf(prevDate);
        //     if(res!==-1) {
        //         current_clean_streak_m++;
        //         i++;
        //     }else break;
        // }
        while (true){
            let res = arrM_YES.indexOf(moment(moment().subtract(i, 'days').format('YYYY-MM-DD'),'YYYY-MM-DD').format('YYYY-MM-DD'));
            if(res!==-1) {
                current_clean_streak_m++;
                i++;
            }else break;
        }
        //End current streak calculation

        // Best Streak calculation
        let best_streak_m = 0;

        let ij = 1;
        arrM_YES.map((obj)=>{
            let a = new Date(obj);
            let dayafter =  a.addDays(1);
            let formatedDate = dayafter.toISOString().substring(0,10);
            let res = arrM_YES.indexOf(formatedDate);
            if(res!=-1) {
                counterm++;
                ij++;
            }else {
                streakarraym.push(counterm+1);
                ij=1;
                counterm=0;
            }
        });

        if(streakarraym.length>0) {
            best_streak_m = streakarraym.reduce(function (previous, current) {
                return previous > current ? previous : current
            });
        }
        //END Best Streak calculation

        //M clean days per year mapping blue chart on statistic

        let groupbyYearM = groupBy(arrM_YES, function (el) {
            return (new Date(el).getFullYear());
        });
        let currentYear = new Date().getFullYear();
        let finalYearMonthMapM = {};
        Object.keys(groupbyYearM).map((year)=> {
            let temp = groupBy(groupbyYearM[year], function (el) {
                return (new Date(el).getMonth());
            });
            let monthArrM = [0,0,0,0,0,0,0,0,0,0,0,0];
            Object.keys(temp).map((month)=>{
                let totalDays = moment((parseInt(month)+1).toString()+"-"+year.toString(), 'MM-YYYY').daysInMonth();
                monthArrM[month] = parseInt((temp[month].length/totalDays)*100);

            });
            finalYearMonthMapM[year] = {
                isCurrentYear:(year==currentYear),
                hasPrev:(Object.keys(groupbyYearM).indexOf((parseInt(year)-1).toString()) > -1 ),
                hasNext:(Object.keys(groupbyYearM).indexOf((parseInt(year)+1).toString()) > -1 ),
                monthArr:monthArrM
            };
        });
        let strCurrentYear = currentYear.toString();
        if((Object.keys(finalYearMonthMapM).indexOf(strCurrentYear)) < 0){
            let prev = (currentYear - 1).toString();
            if((Object.keys(finalYearMonthMapM).indexOf(prev)) >= 0) {
                finalYearMonthMapM[prev].hasNext = true;
                finalYearMonthMapM[strCurrentYear] = {isCurrentYear: true, hasPrev: true, hasNext: false,
                    monthArr: [0,0,0,0,0,0,0,0,0,0,0,0]}
            }else{
                if(Object.keys(finalYearMonthMapM).length == 0){
                    finalYearMonthMapM[strCurrentYear] = {isCurrentYear: true, hasPrev: false, hasNext: false,
                        monthArr: [0,0,0,0,0,0,0,0,0,0,0,0]};
                }else{
                    Object.keys(finalYearMonthMapM).forEach(key=>{
                        finalYearMonthMapM[key].hasNext = true
                    });
                    finalYearMonthMapM[strCurrentYear] = {isCurrentYear: true, hasPrev: true, hasNext: false, monthArr: [0,0,0,0,0,0,0,0,0,0,0,0]}
                }
            }
        }

        //M END clean days per year mapping blue chart on statistic

        //M START what day I relapsed
        let totalM = arrM_NO.length;
        let arrOfWeekDaysM=[0,0,0,0,0,0,0];
        arrM_NO.map((obj)=>{
            let day = new Date(obj).getDay();
            let value = arrOfWeekDaysM[day];
            arrOfWeekDaysM[day]=(value+1);
        });
        let newArrOfWeekDaysM = [];
        arrOfWeekDaysM.map((obj)=> {
            let a = parseInt((obj/totalM)*100);
            if(isNaN(a)){
                newArrOfWeekDaysM.push(0);
            }else{
                newArrOfWeekDaysM.push(a);
            }
        });
        newArrOfWeekDaysM.push(newArrOfWeekDaysM.shift());
        //M END what day I relapsed
        //End Mosturbation calculation

        const mDetail = {
            m_array: masturbationData,
            m_no_array: arrM_NO,
            m_yes_array: arrM_YES,
            clean_m_days_per_month: finalYearMonthMapM,
            relapsed_m_days_per_weekdays: newArrOfWeekDaysM,
            total_m_clean_days: totalMCleanDays,
            current_m_clean_days: current_clean_streak_m,
            best_m_clean_days: best_streak_m
        };
        if (JSON.stringify(getState().statistic.mosturbutionDetail) != JSON.stringify(mDetail)) {
            dispatch({
                type: STATISTIC_M_CALCULATION,
                payload: mDetail
            });
        }
        return Promise.resolve(true);
        //});
    }
};


export  const calculateJournal = (journalDays) =>{
    return (dispatch, getState) => {

        let arrJTmp = [];
        let today = moment();

        let arrNTmp = getState().statistic.pornDetail.p_array;//[];
        //Journal list calculation

        journalDays.map(obj => {
            let pornObj = find(arrNTmp, {occurred_at: obj.entered_at});
            let formatedDate = moment(obj.entered_at, 'YYYY-MM-DD').format('MMMM DD, YYYY');
            if(pornObj != undefined) {
                const color = (pornObj.is_relapse) ?  "red" : "rgb(37,215,76)";
                arrJTmp[obj.entered_at] = {
                    data:  obj.content,
                    color: color,
                    formatedDate: (moment().diff(moment(formatedDate, 'MMMM DD, YYYY'), 'days') == 0) ? "Today"
                        : formatedDate,
                    day: moment(obj.entered_at, 'YYYY-MM-DD').format('DD'),
                    key: obj.entered_at,
                    id: obj.id
                }
            }else{
                arrJTmp[obj.entered_at] = {
                    data:  obj.content,
                    color: "rgb(239,239,244)",
                    formatedDate: (moment().diff(moment(formatedDate, 'MMMM DD, YYYY'), 'days') == 0) ? "Today"
                        : formatedDate,
                    day: moment(obj.entered_at, 'YYYY-MM-DD').format('DD'),
                    key: obj.entered_at,
                    id: obj.id
                }
            }
        });

        let todayformated = moment(today).format("YYYY-MM-DD");

        let todayJournalObj = find(journalDays, {entered_at: todayformated});

        if(todayJournalObj == undefined) {
            arrJTmp[todayformated] = {
                data:  "",
                color: "rgb(239,239,244)",
                formatedDate: "Today",
                day: moment(todayformated, 'YYYY-MM-DD').format('DD'),
                key: todayformated,
                id: 0
            }
        }

        let mapObject={};
        Object.keys(arrJTmp).map((obj) => {
            let a = moment(obj, 'YYYY-MM-DD').format("MMMM");
            let year = moment(obj, 'YYYY-MM-DD').format("YYYY");
            let key = a+"-"+year;
            if(Object.keys(mapObject).indexOf(key) > -1 ) {
                mapObject[key][obj] = arrJTmp[obj];
            }else {
                mapObject[key] = {};
                mapObject[key][obj] = arrJTmp[obj];
                mapObject[key][obj] = arrJTmp[obj];
            }
        });

        const journalOrderedDates = {};
        Object.keys(mapObject).sort(function(a, b) {
            return moment(b, 'MMMM-YYYY').toDate() - moment(a, 'MMMM-YYYY').toDate();
        }).forEach(function(key) {
            journalOrderedDates[key] = reverseObject(mapObject[key]);
        });
        Object.keys(journalOrderedDates).forEach(function(date) {});

        dispatch({
            type: STATISTIC_J_DATE_ARRAY,
            payload: journalDays,
        });

        dispatch({
            type: STATISTIC_JOURNAL_DETAIL,
            payload: journalOrderedDates,
        });
        return Promise.resolve(true);
        //End Journal List
    }
};

//Goal Calculation
export const goalCalculation = (isFromToday = false, currentCleanStreak = null) => {
    return (dispatch, getState) => {
        let currentClean = getState().statistic.pornDetail.current_p_clean_days;
        if(currentCleanStreak != null){
            currentClean = currentCleanStreak;
        }
        if(isFromToday){
            dispatch(calculatePornDay(getState().statistic.pornDetail.p_array));
        }
        setTimeout(()=>{
            dispatch(setUpLocalNotificationAlerts());
        },10000);

        if (currentClean === 0 || currentClean >= 365) {
            let res = getState().statistic.pornDetail.p_no_array.indexOf(moment().format('YYYY-MM-DD'));
            let todayDate = moment().format("YYYY-MM-DD");
            let registerDate = (getState().metaData.metaData.registered_at !== undefined) &&
                getState().metaData.metaData.registered_at || "";
            if(res !== -1 || registerDate === todayDate) {
                return dispatch({
                    type: SET_GOAL_DATA,
                    payload: {
                        Heading: "1 - 24 hours clean",
                        Description: "Goal begins at midnight",//"Goal starts at midnight",
                        per:4, //0 means 4%
                        goalDays: 1,
                        previousAchieved: 0,
                        previousMessage: "",
                    },
                });
            }else {
                //Math.round((4 + (new Date().getHours()/24)* 96)*100)/100
                //X hours remaining
                let previousAchieved = (currentClean >= 365) ? 365 : 0;
                let remHours = moment().toDate().getHours();
                return dispatch({
                    type: SET_GOAL_DATA,
                    payload: {
                        Heading: "1 - 24 hours clean",
                        Description: (remHours === 1) && remHours + " hour" || remHours + " hours",
                        per: Math.floor(4 + (new Date().getHours()/24)* 96),
                        goalDays: 1,
                        previousAchieved: previousAchieved,
                        previousMessage: "",
                    },
                });
            }
        }
        (currentClean < 3) ?
            caseVal = 1 :
            (currentClean < 7) ?
                caseVal = 2 :
                (currentClean < 14) ?
                    caseVal = 3 :
                    (currentClean < 30) ?
                        caseVal = 4 :
                        (currentClean < 90) ?
                            caseVal = 5 :
                            (currentClean < 180) ?
                                caseVal = 6 :
                                (currentClean < 365) ?
                                    caseVal = 7 :
                                    caseVal = 0;
        switch (caseVal) {
            case 1:
                return dispatch({
                    type: SET_GOAL_DATA,
                    payload: {
                        Heading: "2 - 3 days clean",
                        Description: getCurrentStreak(3, currentClean),//24 - moment().toDate().getHours() + " hours",
                        per: Math.round((4 + (Math.round(((currentClean * 24 + new Date().getHours()) / (3*24)) * 100) * 0.96)) * 100)/100,
                        goalDays: 3,
                        previousAchieved: 1,
                        previousMessage: "1 - 24 hours clean",
                    },
                });
                break;
            case 2:
                return dispatch({
                    type: SET_GOAL_DATA,
                    payload: {
                        Heading: "3 - 7 days clean",
                        Description: getCurrentStreak(7, currentClean),//7 - currentClean + " days",
                        per: Math.round((4 + (Math.round(((currentClean * 24 + new Date().getHours()) / (7*24)) * 100) * 0.96)) * 100)/100,
                        goalDays: 7,
                        previousAchieved: 3,
                        previousMessage: "2 - 3 days clean",
                    },
                });
                break;
            case 3:
                return dispatch({
                    type: SET_GOAL_DATA,
                    payload: {
                        Heading: "4 - 14 days clean",
                        Description: getCurrentStreak(14, currentClean),//14 - currentClean + " days",
                        per: Math.round((4 + (Math.round(((currentClean * 24 + new Date().getHours()) / (14*24)) * 100) * 0.96)) * 100)/100,
                        goalDays: 14,
                        previousAchieved: 7,
                        previousMessage: "3 - 7 days clean",
                    },
                });
                break;
            case 4:
                return dispatch({
                    type: SET_GOAL_DATA,
                    payload: {
                        Heading: "5 - 30 days clean",
                        Description: getCurrentStreak(30, currentClean),//30 - currentClean + " days",
                        per: Math.round((4 + (Math.round(((currentClean * 24 + new Date().getHours()) / (30*24)) * 100) * 0.96)) * 100)/100,
                        goalDays: 30,
                        previousAchieved: 14,
                        previousMessage: "4 - 14 days clean",
                    },
                });
                break;
            case 5:
                return dispatch({
                    type: SET_GOAL_DATA,
                    payload: {
                        Heading: "6 - 90 days clean",
                        Description: getCurrentStreak(90, currentClean),//90 - currentClean + " days",
                        per: Math.round((4 + (Math.round(((currentClean * 24 + new Date().getHours()) / (90*24)) * 100) * 0.96)) * 100)/100,
                        goalDays: 90,
                        previousAchieved: 30,
                        previousMessage: "5 - 30 days clean",
                    },
                });
                break;
            case 6:
                return dispatch({
                    type: SET_GOAL_DATA,
                    payload: {
                        Heading: "7 - 180 days clean",
                        Description: getCurrentStreak(180, currentClean),//180 - currentClean + " days",
                        per: Math.round((4 + (Math.round(((currentClean * 24 + new Date().getHours()) / (180*24)) * 100) * 0.96)) * 100)/100,
                        goalDays: 180,
                        previousAchieved: 90,
                        previousMessage: "6 - 90 days clean",
                    },
                });
                break;
            case 7:
                return dispatch({
                    type: SET_GOAL_DATA,
                    payload: {
                        Heading: "8 - 365 days clean",
                        Description: getCurrentStreak(365, currentClean),//365 - currentClean + " days",
                        per: Math.round((4 + (Math.round(((currentClean * 24 + new Date().getHours()) / (365*24)) * 100) * 0.96)) * 100)/100,
                        goalDays: 365,
                        previousAchieved: 180,
                        previousMessage: "7 - 180 days clean",
                    },
                });
                break;
        }
    }
};

getCurrentStreak = (day, currentClean) => {
    let hour = new Date().getHours();
    let hourString = "";
    if(hour != 0){
        if(hour == 1){
            hourString = ", " + hour + " hour";
        }else{
            hourString = ", " + hour + " hours";
        }
    }
    let message =  currentClean + " days" + hourString;
    if(currentClean == 1) {
        return currentClean  + " day" + hourString;
    }

    // if(currentClean <= 1){
    //     if(hour != 0){
    //         if(hour == 1){
    //             return message + hour + " hour";
    //         }
    //         return message + hour + " hours";
    //     }
    // }
    return message;
};

//// 1. If achievement/goal never reached - 'In progress'
// 2. If achievement previously reached - 'Achievement previously unlocked'
// 3. If achievement currently reached - 'Achievement unlocked'
// 1. Percentage of goal achieved, then hours (or days) remaining to achieve goal
// 2. If more than 100%, text should be '100%' (do not display time remaining)

export const calculationYellowAchievements = () => {
    return (dispatch, getState) => {
        let currentClean = getState().statistic.pornDetail.current_p_clean_days;
        let bestStreak = getState().statistic.pornDetail.best_p_clean_days;

        let isMidnight = false;

        if(currentClean == 0) {
            let res = getState().statistic.pornDetail.p_no_array.indexOf(moment().format('YYYY-MM-DD'));
            let todayDate = moment().format("YYYY-MM-DD");
            let registerDate =   (getState().metaData.metaData.registered_at != undefined) && getState().metaData.metaData.registered_at || "";
            let lastCheckupDate =  (getState().metaData.metaData.last_checkup_at) && getState().metaData.metaData.last_checkup_at || "";
            if(res != -1 || registerDate == todayDate || lastCheckupDate == todayDate) {
                isMidnight = true;
            }
        }
        let achievements = [
            { icon: "B", val: "1", progressPer: "4%", actualProgress: "0%", remainingProgress: "0% - goal starts at midnight"},
            { icon: "B", val: "3", progressPer: "4%", actualProgress: "0%", remainingProgress: "0% - 3 days remaining"},
            { icon: "B", val: "7", progressPer: "4%", actualProgress: "0%", remainingProgress: "0% - 7 days remaining"},
            { icon: "B", val: "14", progressPer: "4%", actualProgress: "0%", remainingProgress: "0% - 14 days remaining"},
            { icon: "B", val: "30", progressPer: "4%", actualProgress: "0%", remainingProgress: "0% - 30 days remaining"},
            { icon: "B", val: "90", progressPer: "4%", actualProgress: "0%", remainingProgress: "0% - 90 days remaining"},
            { icon: "B", val: "180", progressPer: "4%", actualProgress: "0%", remainingProgress: "0% - 180 days remaining"},
            { icon: "B", val: "365", progressPer: "4%", actualProgress: "0%", remainingProgress: "0% - 365 days remaining"},
        ];
        if(!isMidnight){
            let caseBestStreak = 0;
            (bestStreak >= 365) ?
                caseBestStreak = 8 :
                (bestStreak >= 180) ?
                    caseBestStreak = 7 :
                    (bestStreak >= 90) ?
                        caseBestStreak = 6 :
                        (bestStreak >= 30) ?
                            caseBestStreak = 5 :
                            (bestStreak >= 14) ?
                                caseBestStreak = 4 :
                                (bestStreak >= 7) ?
                                    caseBestStreak = 3 :
                                    (bestStreak >= 3) ?
                                        caseBestStreak = 2 :
                                        (bestStreak >= 1) ?
                                            caseBestStreak = 1 :
                                            caseBestStreak = 0;

            for(let i = 0; i < caseBestStreak; i++){
                achievements[i]["icon"] = "L";
            }

            let caseVal = 0;
            (currentClean >= 365) ?
                caseVal = 8 :
                (currentClean >= 180) ?
                    caseVal = 7 :
                    (currentClean >= 90) ?
                        caseVal = 6 :
                        (currentClean >= 30) ?
                            caseVal = 5 :
                            (currentClean >= 14) ?
                                caseVal = 4 :
                                (currentClean >= 7) ?
                                    caseVal = 3 :
                                    (currentClean >= 3) ?
                                        caseVal = 2 :
                                        (currentClean >= 1) ?
                                            caseVal = 1 :
                                            caseVal = 0;

            for(let i = 0; i < caseVal; i++){
                achievements[i]["icon"] = "Y";
            }
            achievements[0].progressPer  = getProgressBarVal(1, currentClean);
            achievements[1].progressPer = getProgressBarVal(3, currentClean);
            achievements[2].progressPer = getProgressBarVal(7, currentClean);
            achievements[3].progressPer = getProgressBarVal(14, currentClean);
            achievements[4].progressPer = getProgressBarVal(30, currentClean);
            achievements[5].progressPer = getProgressBarVal(90, currentClean);
            achievements[6].progressPer = getProgressBarVal(180, currentClean);
            achievements[7].progressPer = getProgressBarVal(365, currentClean);

            achievements[0].remainingProgress  = getRemainingTextAndPer(1, currentClean);
            achievements[1].remainingProgress = getRemainingTextAndPer(3, currentClean);
            achievements[2].remainingProgress = getRemainingTextAndPer(7, currentClean);
            achievements[3].remainingProgress = getRemainingTextAndPer(14, currentClean);
            achievements[4].remainingProgress = getRemainingTextAndPer(30, currentClean);
            achievements[5].remainingProgress = getRemainingTextAndPer(90, currentClean);
            achievements[6].remainingProgress = getRemainingTextAndPer(180, currentClean);
            achievements[7].remainingProgress = getRemainingTextAndPer(365, currentClean);

            achievements[0].actualProgress  = getActualProgressBarVal(1, currentClean);
            achievements[1].actualProgress = getActualProgressBarVal(3, currentClean);
            achievements[2].actualProgress = getActualProgressBarVal(7, currentClean);
            achievements[3].actualProgress = getActualProgressBarVal(14, currentClean);
            achievements[4].actualProgress = getActualProgressBarVal(30, currentClean);
            achievements[5].actualProgress = getActualProgressBarVal(90, currentClean);
            achievements[6].actualProgress = getActualProgressBarVal(180, currentClean);
            achievements[7].actualProgress = getActualProgressBarVal(365, currentClean);
        }
        return Promise.resolve({
            achievements
        });
    }
};

getProgressBarVal = (days, currentClean) => {
    if(currentClean >= days) {
        return "100%";
    }else{
        return Math.floor(4 + ((currentClean * 24) + new Date().getHours()) / (days*24) * 96) + "%";
    }
};

getActualProgressBarVal = (days, currentClean) => {
    if(currentClean >= days) {
        return "100%";
    }else{
        return Math.floor(((currentClean * 24) + new Date().getHours()) / (days*24) * 100) + "%";
    }
};

getRemainingTextAndPer = (days, currentClean) => {
    if(currentClean >= days) {
        return "100%";
    }else{
        let per = "";
        // let perVal = Math.floor(4 + ((currentClean * 24) + new Date().getHours()) / (days*24) * 96);
        let perVal = Math.floor(((currentClean * 24) + new Date().getHours()) / (days*24) * 100);
        if(perVal >= 100){
            return "100%"
        }
        per = perVal + "%";
        let remainingHours = 24 - new Date().getHours();
        let str = "";
        let remainingDays = days - currentClean;
        str = per + " - " + remainingDays + " days remaining";
        if(remainingDays <= 1) {
            str = per + " - " + remainingHours + " hours remaining";
        }
        return str;
    }
};

//Set porn free days
export const setBeforeBeginPornFreeDays = (pornArr, index = 0) => {
    return (dispatch, getState) => {
        let totalElement = (pornArr) && pornArr.length || 0;
        //Remove today object from server
        let today = moment().format("YYYY-MM-DD");
        let toDayObj = find(pornArr, { occurred_at: today });
        if(toDayObj == undefined){
            let oldObj = find(getState().statistic.pornDetail.p_array, { occurred_at: today });
            if(oldObj != undefined){
                if(oldObj.id){
                    dispatch(deletePornDay(oldObj.id));
                }
            }
        }
        if(index < totalElement){
            let obj = pornArr[index];
            let pornData = getState().statistic.pornDetail.p_array;

            let oldPornObj = find(pornData, {occurred_at: obj.occurred_at});
            if(oldPornObj == undefined){
                return dispatch(addUpdatePornDay(pornArr,  obj, true, index));
            }else{
                obj.id = oldPornObj.id;
                return dispatch(addUpdatePornDay(pornArr,  obj, false, index));
            }
        }else {
            dispatch(getPornDays(false,false));
            // dispatch(getTeamDetail());
            // dispatch(getleaderboardIndividualList());
            // dispatch(getleaderboardTeamList());
            return Promise.resolve(true);
        }
    }
};


export const addUpdatePornDay = (pornArr, objPorn, isAdd=true, index) =>{
    return (dispatch, getState) => {
        if(isAdd){
            console.log("update porn days")
            return CallApi(Constant.baseUrlV2+Constant.getPornDays,
                'post',
                objPorn,
                {"Authorization":"Bearer "+getState().user.token})
                .then((response)=> {
                    return dispatch(setBeforeBeginPornFreeDays(pornArr, ++index));
                    //return Promise.resolve();
                })
                .catch((error)=> {
                    // return Promise.reject(error);
                    return dispatch(apiErrorHandler(error));
                });
        }else{
            let updateUrl = Constant.baseUrlV2+Constant.getPornDays+'/'+objPorn.id;
            return CallApi(updateUrl,
                'patch',
                {is_relapse: objPorn.is_relapse},
                {"Authorization":"Bearer "+getState().user.token})
                .then((response)=> {
                    return dispatch(setBeforeBeginPornFreeDays(pornArr, ++index));
                    //return Promise.resolve();
                })
                .catch((error)=>{
                    // return Promise.reject(error);
                    return dispatch(apiErrorHandler(error));
                });
        }
    }
};

//Set Masturbation free days
export const setBeforeBeginMasturbationFreeDays = (MasturbationArr, index = 0) => {
    return (dispatch, getState) => {
        let totalElement = (MasturbationArr) && MasturbationArr.length || 0;

        //Remove today object from server
        let today = moment().format("YYYY-MM-DD");
        let toDayObj = find(MasturbationArr, { occurred_at: today });
        if(toDayObj == undefined){
            let oldObj = find(getState().statistic.mosturbutionDetail.m_array, { occurred_at: today });
            if(oldObj != undefined){
                if(oldObj.id){
                    dispatch(deleteMasturbationDay(oldObj.id));
                }
            }
        }

        if(index < totalElement){
            let obj = MasturbationArr[index];
            let MasturbationData = getState().statistic.mosturbutionDetail.m_array;
            let oldMasturbationObj = find(MasturbationData, {occurred_at: obj.occurred_at});
            if(oldMasturbationObj == undefined){
                return dispatch(addUpdateMasturbationDay(MasturbationArr,  obj, true, index));
            }else{
                obj.id = oldMasturbationObj.id;
                return dispatch(addUpdateMasturbationDay(MasturbationArr,  obj, false, index));
            }
        }else {
            dispatch(getMasturbationDays());
            return true;
        }
    }
};

export const addUpdateMasturbationDay = (MasturbationArr, objMasturbation, isAdd=true, index) =>{
    return (dispatch, getState) => {
        if(isAdd){
            return CallApi(Constant.baseUrlV2+Constant.masturbationDays,
                'post',
                objMasturbation,
                {"Authorization":"Bearer "+getState().user.token})
                .then((response)=> {
                    return dispatch(setBeforeBeginMasturbationFreeDays(MasturbationArr, ++index));
                })
                .catch((error)=>{
                    // return Promise.reject(error);
                    return dispatch(apiErrorHandler(error));
                });
        }else{
            let updateUrl = Constant.baseUrlV2+Constant.masturbationDays+'/'+objMasturbation.id;
            return CallApi(updateUrl,
                'patch',
                {is_relapse: objMasturbation.is_relapse},
                {"Authorization":"Bearer "+getState().user.token})
                .then((response)=> {
                    return dispatch(setBeforeBeginMasturbationFreeDays(MasturbationArr, ++index));
                })
                .catch((error)=>{
                    // return Promise.reject(error);
                    return dispatch(apiErrorHandler(error));
                });
        }
    }
};

//Delete porn dates from backend in greater than today
export const deleteFuturePornDates = (pornArr, index = 0) => {
    return (dispatch, getState) => {
        let allData = cloneDeep(pornArr);
        let futureDates = remove(allData, item => (moment(item.occurred_at).isAfter(moment(), "day")));
        let totalElement = futureDates.length;
        if (index < totalElement) {
            let deleteUrl = Constant.baseUrlV2 + Constant.getPornDays + '/' + futureDates[index].id;
            return CallApi(deleteUrl,
                'delete',
                {},
                {"Authorization": "Bearer " + getState().user.token})
                .then((response) => {
                    return dispatch(deleteFuturePornDates(pornArr, ++index));
                })
                .catch((error) => {
                    // return Promise.reject(error);
                    return dispatch(apiErrorHandler(error));
                });
        }else{
            return true;
        }
    }
};

//Delete Mosturbation dates from backend in greater than today
export const deleteFutureMosturbationDates = (mosturbationArr, index = 0) => {
    return (dispatch, getState) => {
        let allData = cloneDeep(mosturbationArr);
        let futureDates = remove(allData, item => (moment(item.occurred_at).isAfter(moment(), "day")));
        let totalElement = futureDates.length;
        if (index < totalElement) {
            let deleteUrl = Constant.baseUrlV2+Constant.masturbationDays+'/' + futureDates[index].id;
            return CallApi(deleteUrl,
                'delete',
                {},
                {"Authorization": "Bearer " + getState().user.token})
                .then((response) => {
                    return dispatch(deleteFutureMosturbationDates(mosturbationArr, ++index));
                })
                .catch((error) => {
                    // return Promise.reject(error);
                    return dispatch(apiErrorHandler(error));
                });
        }else{
            return true;
        }
    }
};

/*
 Reset porn statistics -
 1. Clear all marked dates from porn calendar
 2. Set all relapse_porn reasons to 0
 3. Delete any custom porn relapse reasons
 4. Set relapse_porn_morning, relapse_porn_afternoon, relapse_porn_evening, relapse_porn_night to 0
 5. Reset stressed_morning, stressed_afternoon, stressed_evening, stressed_night to 0
 temp
 */

export const resetPornStatistics = (pornData, index=0) => {
    return (dispatch, getState) => {
        if(pornData && pornData.length > index) {
            let deleteUrl = Constant.baseUrlV2 + Constant.getPornDays + '/' + pornData[index].id;
            return CallApi(deleteUrl,
                'delete',
                {},
                {"Authorization": "Bearer " + getState().user.token})
                .then((response) => {
                    return dispatch(resetPornStatistics(pornData, ++index));
                })
                .catch((error) => {
                    setTimeout(()=>{
                        return dispatch(resetPornStatistics(pornData, index));
                    }, 1000);
                    // return Promise.reject(error);
                });
        }else {
            let metaData = cloneDeep(getState().metaData.metaData);
            if(metaData == undefined || Object.keys(metaData).length == 0) {
                metaData =  cloneDeep(objDefaultMetaData);
            }

            Object.keys(metaData).map(key => {
                if(key.includes("_porn_") || key.includes("stressed_")) {
                    metaData[key] = 0;
                }
            });

            let oldBackup = cloneDeep(getState().metaData.metaDataBackup.data);

            if(oldBackup == undefined || Object.keys(oldBackup).length == 0) {
                if(getState().metaData.metaData && Object.keys(getState().metaData.metaData).length > 0){
                    oldBackup =  cloneDeep(getState().metaData.metaData);
                }else{
                    oldBackup =  cloneDeep(objDefaultMetaData);
                }
            }
            Object.keys(oldBackup).map(key => {
                if(key.includes("_porn_") || key.includes("stressed_")) {
                    oldBackup[key] = 0;
                }
            });
            dispatch({
                type: META_DATA_BACKUP,
                payload:{
                    date: new Date().toDateString(),
                    data: oldBackup
                }
            });

            return Promise.all([
                dispatch(getPornDays(false, false)),
                dispatch(updateMetaData(metaData))
            ]).then(res=>{
                return Promise.resolve(true);
            }).catch(err=>{
                // return Promise.reject(err);
                return dispatch(apiErrorHandler(error));
            });
        }
    }
};

/*

 Reset masturbation statistics -
 1. Clear all marked dates from masturbation calendar
 2. Set relapse_masturbation_morning, relapse_masturbation_afternoon,
 relapse_masturbation_evening, relapse_masturbation_night to 0
 tempted_masturbation
 * */
export const resetMasturbationStatistics = (masturbationData, index=0) => {
    return (dispatch, getState) => {
        if (masturbationData.length > index) {
            let deleteUrl = Constant.baseUrlV2+Constant.masturbationDays+'/' + masturbationData[index].id;
            return CallApi(deleteUrl,
                'delete',
                {},
                {"Authorization": "Bearer " + getState().user.token})
                .then((response) => {
                    return dispatch(resetMasturbationStatistics(masturbationData, ++index));
                })
                .catch((error) => {
                    return Promise.reject(error);
                });
        }else{
            let metaData = cloneDeep(getState().metaData.metaData);
            Object.keys(metaData).map(key => {
                if(key.includes("masturbation")) {
                    metaData[key] = 0;
                }
            });
            let oldBackup = cloneDeep(getState().metaData.metaDataBackup.data);


            if(oldBackup == undefined || Object.keys(oldBackup).length == 0) {
                if(getState().metaData.metaData && Object.keys(getState().metaData.metaData).length > 0){
                    oldBackup =  cloneDeep(getState().metaData.metaData);
                }else{
                    oldBackup =  cloneDeep(objDefaultMetaData);
                }
            }

            Object.keys(oldBackup).map(key => {
                if(key.includes("masturbation")) {
                    oldBackup[key] = 0;
                }
            });
            dispatch({
                type: META_DATA_BACKUP,
                payload:{
                    date: new Date().toDateString(),
                    data: oldBackup
                }
            });
            return Promise.all([
                dispatch(getMasturbationDays()),
                dispatch(updateMetaData(metaData))
            ]).then(res=>{
                return Promise.resolve(true);
            }).catch(err=>{
                // return Promise.reject(err);
                return dispatch(apiErrorHandler(err));
            });

        }
    }
};
/*
 Reset rewiring progress -
 1. Set progress_desensitation to 0
 2. Set progress_hypofrontality to 0
 3. Set progress_wisdom to 0
 4. Set progress_dopamine_rewiring to 0
 5. Set progress_stress_control to 0
 6. Set all improvement_X to 0
 */
export const resetRewiringProgress = () => {
    return (dispatch, getState) => {
        let metaData = cloneDeep(getState().metaData.metaData);
        Object.keys(metaData).map(key => {
            if(key.includes("progress_") || key.includes("improvement_")) {
                metaData[key] = 0;
            }
        });
        let oldBackup = cloneDeep(getState().metaData.metaDataBackup.data);

        if(oldBackup == undefined || Object.keys(oldBackup).length == 0) {
            if(getState().metaData.metaData && Object.keys(getState().metaData.metaData).length > 0){
                oldBackup =  cloneDeep(getState().metaData.metaData);
            }else{
                oldBackup =  cloneDeep(objDefaultMetaData);
            }
        }
        Object.keys(oldBackup).map(key => {
            if(key.includes("progress_") || key.includes("improvement_")) {
                oldBackup[key] = 0;
            }
        });
        dispatch({
            type: META_DATA_BACKUP,
            payload:{
                date: new Date().toDateString(),
                data: oldBackup
            }
        });
        return Promise.all([
            dispatch(updateMetaData(metaData))
        ]).then(res=>{
            return Promise.resolve(true);
        }).catch(err=>{
            return Promise.reject(err);
        });
    }
};

/*
 Reset rewiring exercises -
 1. Set all exercise_number_X to 1
 */

export const resetRewiringExercises = () => {
    return (dispatch, getState) => {
        let metaData = cloneDeep(getState().metaData.metaData);
        Object.keys(metaData).map(key => {
            if(key.includes("exercise_")) {
                metaData[key] = 1;
            }
        });
        let oldBackup = cloneDeep(getState().metaData.metaDataBackup.data);

        if(oldBackup == undefined || Object.keys(oldBackup).length == 0) {
            if(getState().metaData.metaData && Object.keys(getState().metaData.metaData).length > 0){
                oldBackup =  cloneDeep(getState().metaData.metaData);
            }else{
                oldBackup =  cloneDeep(objDefaultMetaData);
            }
        }
        Object.keys(oldBackup).map(key => {
            if(key.includes("exercise_")) {
                oldBackup[key] = 1;
            }
        });
        dispatch({
            type: META_DATA_BACKUP,
            payload:{
                date: new Date().toDateString(),
                data: oldBackup
            }
        });
        return Promise.all([
            dispatch(updateMetaData(metaData))
        ]).then(res=>{
            return Promise.resolve(true);
        }).catch(err=>{
            // return Promise.reject(err);
            return dispatch(apiErrorHandler(err));
        });
    }
};