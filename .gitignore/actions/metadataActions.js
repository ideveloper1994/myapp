import {
    SET_META_DATA,
    TOTAL_REWIRING_PERCENTAGE,
    PORN_WHY_RELAPSE,
    PORN_WHEN_RELAPSE,
    M_WHEN_RELAPSE,
    IMPROVEMEMT_PERCENTAGE,
    ADD_NEW_CHECKUP_QUESTION,
    SET_MORNING_ROUTINE,
    SET_DONE_MORNING_ROUTINE,
    SET_REWIRING_BARS,
    PORN_WHEN_STRESSED,
    SET_SELECTED_OPTIONAL_EXERCISES,
    META_DATA_BACKUP,
    MEDITATION_TIME,
    TODAY_SCREEN_EXERCISES, SHOW_REWIRING_PROGRESS_POPUP,
    SET_DO_NOT_DISTURB
} from './types'
import {CallApi} from '../services/apiCall';
import Constant from '../services/apiConstant';
import {findIndex, find, filter, indexOf, cloneDeep, sortBy} from 'lodash';
import moment from 'moment';
import {
    deletePornDay,
    addPornDays,
    updatePornDay,
    addMasturbationDays,
    resolveMasturbationDay,
    updateMasturbationDay,
    deleteMasturbationDay,
    getPornDays,
    getMasturbationDays,
    resolvePornDay
} from './statisticAction';
import { manageRewiredProgressPopup, manageLifeTreeOnToday, apiErrorHandler, setAppTheme } from './userActions';
import { getTeamDetail,
    getleaderboardTeamList,
    getleaderboardIndividualList
} from './teamAction';
import AppConstant from '../helper/constant';

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


export const getAllMetaData = () => {
    return (dispatch, getState) => {
        return CallApi(Constant.baseUrlV2+Constant.metaData,'get',{},{"Authorization":"Bearer "+getState().user.token})
            .then((response)=> {
                let oldBackup = getState().metaData.metaDataBackup;
                if(oldBackup == undefined || oldBackup.date != new Date().toDateString() || Object.keys(oldBackup.data).length == 0){
                    dispatch({
                        type: META_DATA_BACKUP,
                        payload:{
                            date: new Date().toDateString(),
                            data: response.data
                        }
                    });
                }

                //SetTheme
                let currentTheme = getState().user.appTheme || Constant.darkTheme;
                if(response.data.colour_theme){
                    if(response.data.colour_theme == "light" && currentTheme != AppConstant.lightTheme){
                        dispatch(setAppTheme(AppConstant.lightTheme, false));
                    }else if(response.data.colour_theme != "light" && currentTheme != AppConstant.darkTheme){
                        dispatch(setAppTheme(AppConstant.darkTheme, false));
                    }
                }
                //Set Meditation Time
                if(response.data.meditation_time){
                    let appMeditationTime = getState().metaData.meditationTime || 10;
                    if(appMeditationTime !== response.data.meditation_time){
                        if(appMeditationTime != 10){
                            //set app meditation time to server
                            dispatch(setMeditationTime(appMeditationTime))
                        }else{
                            //set server time to app
                            dispatch(setMeditationTime(response.data.meditation_time, false))
                        }
                    }
                }

                if(JSON.stringify(getState().metaData.metaData) !== JSON.stringify(response.data)){
                    return Promise.all([
                        dispatch({
                            type: SET_META_DATA,
                            payload: response.data,
                        })
                    ]).then(res => {
                        dispatch(calculateRewiringProgress());
                        dispatch(calculatePornWhyIRelapse());
                        dispatch(calculatePornWhenIRelapse());
                        dispatch(calculateMasturbationWhenIRelapse());
                        dispatch(calculateImprovementByActivity());
                    });
                }

                dispatch(calculateRewiringProgress());
                dispatch(calculatePornWhyIRelapse());
                dispatch(calculatePornWhenIRelapse());
                dispatch(calculateMasturbationWhenIRelapse());
                dispatch(calculateImprovementByActivity());
                return Promise.resolve(true);
            })
            .catch((error)=>{
                dispatch(calculateRewiringProgress());
                dispatch(calculatePornWhyIRelapse());
                dispatch(calculatePornWhenIRelapse());
                dispatch(calculateMasturbationWhenIRelapse());
                dispatch(calculateImprovementByActivity());
                // return Promise.reject(error);
                return dispatch(apiErrorHandler(error));
            })
    };

};

export const updateMetaData = (updatedData, improveData=[]) => {
    return (dispatch, getState) => {
        let metaData = getState().metaData.metaData;
        if(metaData == undefined || Object.keys(metaData).length == 0) {
            metaData =  cloneDeep(objDefaultMetaData);
        }
        let oldBackup = cloneDeep(getState().metaData.metaDataBackup.data);
        if(oldBackup == undefined || Object.keys(oldBackup).length == 0) {
            if(Object.keys(getState().metaData.metaData).length > 0){
                oldBackup =  cloneDeep(getState().metaData.metaData);
            }else{
                oldBackup =  cloneDeep(objDefaultMetaData);
            }
        }
        if(improveData.length > 0){
            improveData.forEach(obj=>{
                let objKey = Object.keys(obj)[0];
                switch (objKey) {
                    case "Wisdom":
                        updatedData["progress_wisdom"] = metaData.progress_wisdom + obj[objKey];
                        oldBackup["progress_wisdom"] = oldBackup.progress_wisdom + obj[objKey];
                        break;
                    case "Hypofrontality":
                        updatedData["progress_hypofrontality"] = metaData.progress_hypofrontality + obj[objKey];
                        oldBackup["progress_hypofrontality"] = oldBackup.progress_hypofrontality + obj[objKey];
                        break;
                    case "Dopamine":
                        updatedData["progress_dopamine_rewiring"] = metaData.progress_dopamine_rewiring + obj[objKey];
                        oldBackup["progress_dopamine_rewiring"] = oldBackup.progress_dopamine_rewiring + obj[objKey];
                        break;
                    case "Stress":
                        updatedData["progress_stress_control"] = metaData.progress_stress_control + obj[objKey];
                        oldBackup["progress_stress_control"] = oldBackup.progress_stress_control + obj[objKey];
                        break;
                    default: break;
                }
            })
        }
        Object.keys(updatedData).map(key => {
            if(key.includes("exercise") || key.includes("at") || key.includes("time")){
                oldBackup[key] = updatedData[key];
                metaData[key] = updatedData[key];
            }
        });

        //Update old metadata backup

        const metaDataPayload = {
            date: new Date().toDateString(),
            data: oldBackup
        };
        dispatch({
            type: META_DATA_BACKUP,
            payload: metaDataPayload
        });

        dispatch({
            type: SET_META_DATA,
            payload: metaData
        })

        return CallApi(Constant.baseUrlV2+Constant.metaData,'patch',updatedData,{"Authorization":"Bearer "+getState().user.token})
            .then((response)=> {
                return Promise.all([
                    dispatch({
                        type: SET_META_DATA,
                        payload: response.data.data,
                    })
                ]).then(res => {
                    dispatch(calculateRewiringProgress());
                    dispatch(calculatePornWhyIRelapse());
                    dispatch(calculatePornWhenIRelapse());
                    dispatch(calculateMasturbationWhenIRelapse());
                    dispatch(calculateImprovementByActivity());
                });
            })
            .catch((error)=>{
                dispatch(updateMetaDataNoCalculation(updatedData));
                return dispatch(apiErrorHandler(error));
                // return Promise.reject(error);
            })
    };
};

export const updateMetaDataNoCalculation = (updatedData) => {
    return (dispatch, getState) => {
        return CallApi(Constant.baseUrlV2+Constant.metaData,'patch',updatedData,{"Authorization":"Bearer "+getState().user.token})
            .then((response)=> {
                return Promise.all([
                    dispatch({
                        type: SET_META_DATA,
                        payload: response.data.data,
                    })
                ]).then(res => {
                    return Promise.resolve(true);
                });
            })
            .catch((error)=>{
                return dispatch(apiErrorHandler(error));
                // return Promise.reject(error);
            })
    };
}

export const setCheckupData = (selectedAnswer, isYesterday = false) => {
    return (dispatch, getState) => {
        try{
            let answerKeys = Object.keys(selectedAnswer);

            //let metaData = getState().metaData.metaData;
            let metaData = cloneDeep(getState().metaData.metaDataBackup.data);

            if(metaData === undefined || Object.keys(metaData).length === 0) {
                if(Object.keys(getState().metaData.metaData).length > 0){
                    metaData =  cloneDeep(getState().metaData.metaData);
                }else{
                    metaData =  cloneDeep(objDefaultMetaData);
                }
            }

            let strDateKey = moment().format('YYYY-MM-DD');

            if(isYesterday) {
                strDateKey = moment().subtract(1, 'days').format('YYYY-MM-DD');
            }
            answerKeys.forEach(queKey => {
                let answers = selectedAnswer[queKey];
                switch(queKey){
                    case "1":
                        let answer = selectedAnswer[queKey][0].str;
                        let pornObj = {
                            is_relapse: selectedAnswer[queKey][0].str === "No",
                            occurred_at: strDateKey
                        };
                        let oldPornObj = find(getState().statistic.pornDetail.p_array, { occurred_at: strDateKey });
                        if(answer === "Yes") {
                            dispatch(manageLifeTreeOnToday({isShow: true,isCompleted: false, completedDate: ""}));
                            if(isYesterday){
                                if(oldPornObj !== undefined) {
                                    pornObj.id = oldPornObj.id;
                                    dispatch(updatePornDay(pornObj));
                                }else{
                                    // dispatch(manageLifeTreeOnToday({}));
                                    dispatch(addPornDays(pornObj));
                                }
                            }else {
                                //Remaining second to midNight
                                pornObj.resolve_delay = ((24*3600) - ((new Date().getHours() * 3600) + (new Date().getMinutes() * 60) + new Date().getSeconds()));
                                //pornObj.is_resolved = false;
                                if(oldPornObj !== undefined) {
                                    pornObj.id = oldPornObj.id;
                                    if(oldPornObj.is_resolved){
                                        dispatch(deletePornDay(pornObj.id)).then(res=>{
                                            let newObj = {
                                                is_relapse: false,
                                                occurred_at: strDateKey,
                                                resolve_delay: ((24*3600) - ((new Date().getHours() * 3600) + (new Date().getMinutes() * 60) + new Date().getSeconds()))
                                            };
                                            dispatch(addPornDays(newObj));
                                        });
                                    }else{
                                        dispatch(updatePornDay(pornObj));
                                    }
                                }else{
                                    dispatch(addPornDays(pornObj));
                                }
                            }
                        }else{
                            dispatch(manageLifeTreeOnToday({isShow: false,isCompleted: false, completedDate: ""}));
                            //pornObj.is_resolved = true;
                            if(oldPornObj !== undefined) {
                                //pornObj.id = oldPornObj.id;
                                dispatch(resolvePornDay(oldPornObj));
                            }else{
                                dispatch(addPornDays(pornObj));
                            }
                        }
                        if(answer === "Yes") {
                            metaData.progress_desensitation += 4;
                            metaData.progress_dopamine_rewiring += 3;
                            metaData.progress_hypofrontality += 3;
                        }else{
                            metaData.progress_desensitation -= 4;
                            metaData.progress_dopamine_rewiring -= 3;
                            metaData.progress_hypofrontality -= 3;
                        }
                        break;
                    case "2":
                        answers.forEach(obj =>{
                            if(obj.str === "Anxiety"){
                                metaData.relapse_porn_anxiety += 1;
                            }else if(obj.str === "Boredom"){
                                metaData.relapse_porn_bored += 1;
                            }else if(obj.str === "Stress"){
                                metaData.relapse_porn_stress += 1;
                            }else if(obj.str === "Arousal"){
                                metaData.relapse_porn_horny += 1;
                            }else if(obj.str === "Pain"){
                                metaData.relapse_porn_pain += 1;
                            }else if(obj.str === "Tiredness"){
                                metaData.relapse_porn_tired += 1;
                            }else if(obj.str === "Loneliness"){
                                metaData.relapse_porn_alone += 1;
                            }else {
                                let key = "relapse_porn_" + obj.str.toString().toLowerCase();
                                if(metaData[key] !== undefined){
                                    metaData[key] += 1;
                                }else{
                                    metaData[key] = 1;
                                }
                            }
                        });
                        break;
                    case "3":
                        answers.forEach(obj =>{
                            if(obj.str == "Morning"){
                                metaData.relapse_porn_morning += 1;
                            }else if(obj.str == "Afternoon"){
                                metaData.relapse_porn_afternoon += 1;
                            }else if(obj.str == "Evening"){
                                metaData.relapse_porn_evening += 1;
                            }else if(obj.str == "Night") {
                                metaData.relapse_porn_night += 1;
                            }
                        });
                        break;
                    case "4":
                        if(selectedAnswer[queKey][0].str == "Yes") {
                            metaData.progress_desensitation += 1;
                        }
                        break;
                    case "5":
                        if(selectedAnswer[queKey][0].str == "Morning") {
                            metaData.tempted_porn_morning += 1;
                        }else if(selectedAnswer[queKey][0].str == "Afternoon") {
                            metaData.tempted_porn_afternoon += 1;
                        }else if(selectedAnswer[queKey][0].str == "Evening") {
                            metaData.tempted_porn_evening += 1;
                        }else{
                            metaData.tempted_porn_night += 1;
                        }
                        break;
                    case "6":
                        let answerM = selectedAnswer[queKey][0].str;
                        let masturbationObj = {
                            is_relapse: answerM == "No",
                            occurred_at: strDateKey
                        };
                        let oldMosturbutionObj = find(getState().statistic.mosturbutionDetail.m_array, { occurred_at: strDateKey });
                        if(isYesterday) {
                            if(oldMosturbutionObj != undefined) {
                                masturbationObj.id = oldMosturbutionObj.id;
                                dispatch(updateMasturbationDay(masturbationObj));
                            }else{
                                dispatch(addMasturbationDays(masturbationObj));
                            }
                        }else{
                            if(answerM == "Yes") {
                                //Remaining second to midNight
                                masturbationObj.resolve_delay = ((24*3600) - ((new Date().getHours() * 3600) + (new Date().getMinutes() * 60) + new Date().getSeconds())-30);
                                if(oldMosturbutionObj != undefined) {
                                    masturbationObj.id = oldMosturbutionObj.id;
                                    if(oldMosturbutionObj.is_resolved){
                                        dispatch(deleteMasturbationDay(oldMosturbutionObj.id)).then(res=>{
                                            let newObj = {
                                                is_relapse: false,
                                                occurred_at: strDateKey,
                                                resolve_delay: ((24*3600) - ((new Date().getHours() * 3600) + (new Date().getMinutes() * 60) + new Date().getSeconds())-30)
                                            };
                                            dispatch(addMasturbationDays(newObj));
                                        });
                                    }else{
                                        dispatch(updateMasturbationDay(masturbationObj));
                                    }
                                }else{
                                    dispatch(addMasturbationDays(masturbationObj));
                                }
                            }else {
                                if(oldMosturbutionObj != undefined) {
                                    dispatch(resolveMasturbationDay(oldMosturbutionObj));
                                }else{
                                    dispatch(addMasturbationDays(masturbationObj));
                                }
                            }
                        }
                        if(answerM == "Yes") {
                            metaData.progress_dopamine_rewiring += 1;
                        }
                        break;
                    case "7":
                        answers.forEach(obj =>{
                            if(obj.str == "Morning") {
                                metaData.relapse_masturbation_morning += 1;
                            }else if(obj.str == "Afternoon") {
                                metaData.relapse_masturbation_afternoon += 1;
                            }else if(obj.str == "Evening") {
                                metaData.relapse_masturbation_evening += 1;
                            }else if(obj.str == "Night") {
                                metaData.relapse_masturbation_night += 1;
                            }
                        });
                        break;
                    case "8":
                        break;

                    case "9":
                        if(selectedAnswer[queKey][0].str == "Yes") {
                            metaData.progress_dopamine_rewiring += 3;
                        }else if(selectedAnswer[queKey][0].str == "Somewhat") {
                            metaData.progress_dopamine_rewiring += 1;
                        }else{
                        }
                        break;
                    case "10":
                        if(selectedAnswer[queKey][0].str == "No") {
                            metaData.progress_dopamine_rewiring += 4;
                        }
                        break;
                    case "11":
                        if(selectedAnswer[queKey][0].str == "Yes") {
                            metaData.progress_dopamine_rewiring += 1;
                            metaData.improvement_attraction += 2;
                        }else{
                            metaData.improvement_attraction -= 1;
                        }
                        break;
                    case "12":
                        if(selectedAnswer[queKey][0].str == "Yes") {
                            metaData.progress_dopamine_rewiring += 1;
                        }
                        break;

                    case "13":
                        if(selectedAnswer[queKey][0].str == "Yes") {
                            metaData.progress_stress_control -= 1;
                        }else{
                            metaData.progress_stress_control += 1;
                        }
                        break;
                    case "14":
                        if(selectedAnswer[queKey][0].str == "Morning") {
                            metaData.stressed_morning += 1;
                        }else if(selectedAnswer[queKey][0].str == "Afternoon") {
                            metaData.stressed_afternoon += 1;
                        }else if(selectedAnswer[queKey][0].str == "Evening") {
                            metaData.stressed_evening += 1;
                        }else{
                            metaData.stressed_night += 1;
                        }
                        break;

                    case "15":break;

                    case "16":
                        answers.forEach(obj =>{
                            if(obj.str == "More self-confidence"){
                                metaData.improvement_confidence += 1;
                            }else if(obj.str == "Stronger voice"){
                                metaData.improvement_voice += 1;
                            }else if(obj.str == "More energy"){
                                metaData.improvement_energy += 1;
                            }else if(obj.str == "Clear mind"){
                                metaData.improvement_mind += 1;
                            }else if(obj.str == "Better sleep"){
                                metaData.improvement_sleep += 1;
                            }else if(obj.str == "Healthier appearance"){
                                metaData.improvement_health += 1;
                            }else if(obj.str == "More alive"){
                                metaData.improvement_alive += 1;
                            }
                        });
                        break;
                    case "17":
                        break
                    default: break;
                }
            });
            Object.keys(metaData).forEach((key) => metaData[key] = metaData[key] < 0 ? 0 :  metaData[key]);

            //here set last checkup date
debugger;
            let todayDate = moment().format('YYYY-MM-DD');
            if(isYesterday){
                if(metaData.last_checkup_at !== todayDate){
                    metaData.last_checkup_at = strDateKey;
                }
            }else {
                metaData.last_checkup_at = strDateKey;
            }
            delete metaData.registered_at;

            return CallApi(Constant.baseUrlV2+Constant.metaData,'patch',metaData,{"Authorization":"Bearer "+getState().user.token})
                .then((response)=> {
                    if(isYesterday){
                        dispatch({
                            type: META_DATA_BACKUP,
                            payload: {
                                data: cloneDeep(response.data.data),
                                date: new Date().toDateString(),
                            }
                        })
                    }
                    return Promise.all([
                        dispatch({
                            type: SET_META_DATA,
                            payload: response.data.data,
                        })
                    ]).then(res => {
                        dispatch(getPornDays(false,false));
                        // dispatch(getTeamDetail());
                        // dispatch(getleaderboardTeamList());
                        // dispatch(getleaderboardIndividualList());
                        dispatch(getMasturbationDays(false));
                        dispatch(calculateRewiringProgress());
                        dispatch(calculatePornWhyIRelapse());
                        dispatch(calculatePornWhenIRelapse());
                        dispatch(calculateMasturbationWhenIRelapse());
                        dispatch(calculateImprovementByActivity());
                        return Promise.resolve(true);
                    });
                })
                .catch((error)=>{
                    return dispatch(apiErrorHandler(error));
                })
        }catch (e){
            if(__DEV__){
                alert(e)
            }
            alert("Something went wrong.");
            return Promise.reject(e);
        }
    };
};

//Calculate Rewiring progress and total
export const calculateRewiringProgress = () => {
    return (dispatch, getState) => {
        let metaData = getState().metaData.metaData;
        if(metaData == undefined || Object.keys(metaData).length == 0){
            metaData =  cloneDeep(objDefaultMetaData);
        }
        let perDesensitation = Math.floor(4 + (( metaData.progress_desensitation / 500 ) * 96));
        let perDopamine = Math.floor(4 + (( metaData.progress_dopamine_rewiring / 400 ) * 96));
        let perHypofrontality = Math.floor(4 + (( metaData.progress_hypofrontality / 400 ) * 96));
        let perStress = Math.floor(4 + (( metaData.progress_stress_control / 100 ) * 96));
        let perWisdom = Math.floor(4 + ((metaData.progress_wisdom / 100 ) * 96));

        let aPerDesensitation = Math.floor((metaData.progress_desensitation / 500 ) * 100);
        let aPerDopamine = Math.floor(( metaData.progress_dopamine_rewiring / 400 ) * 100);
        let aPerHypofrontality = Math.floor(( metaData.progress_hypofrontality / 400 ) * 100);
        let aPerStress = Math.floor(( metaData.progress_stress_control / 100 ) * 100);
        let aPerWisdom = Math.floor((metaData.progress_wisdom / 100 ) * 100);

        perDesensitation = (perDesensitation > 100) && 100 || perDesensitation;
        perDopamine = (perDopamine > 100) && 100 || perDopamine;
        perHypofrontality = (perHypofrontality > 100) && 100 || perHypofrontality;
        perStress = (perStress > 100) && 100 || perStress;
        perWisdom = (perWisdom > 100) && 100 || perWisdom;

        aPerDesensitation = (aPerDesensitation > 100) && 100 || aPerDesensitation;
        aPerDopamine = (aPerDopamine > 100) && 100 || aPerDopamine;
        aPerHypofrontality = (aPerHypofrontality > 100) && 100 || aPerHypofrontality;
        aPerStress = (aPerStress > 100) && 100 || aPerStress;
        aPerWisdom = (aPerWisdom > 100) && 100 || aPerWisdom;

        let rewiringProgress = [
            { progressName: "Desensitation", progressPer: perDesensitation + "%",
                fillColor:"rgb(5,195,249)", key: "Desensitation", actualPer: aPerDesensitation + "%"},
            { progressName: "Dopamine rewiring",
                progressPer: perDopamine + "%", fillColor:"rgb(239,76,129)", key: "Dopamine",
                actualPer: aPerDopamine + "%"},
            { progressName: "Hypofrontality",
                progressPer: perHypofrontality + "%", fillColor:"rgb(251,176,67)", key: "Hypofrontality",
                actualPer: aPerHypofrontality + "%"},
            { progressName: "Stress control",
                progressPer: perStress + "%", fillColor:"rgb(121,112,255)", key: "Stress",
                actualPer: aPerStress + "%"},
            { progressName: "Wisdom",
                progressPer: perWisdom + "%", fillColor:"rgb(91,196,189)", key: "Wisdom",
                actualPer: aPerWisdom + "%"},
        ];
        let aTotal = Math.round(Math.floor(((aPerDesensitation + aPerDopamine + aPerHypofrontality + aPerStress + aPerWisdom) / 500) * 100));
        let cirularPer = 2 + ( aTotal * 0.98 );

        if(getState().statistic.totalRewiringPercentage != aTotal ||
            getState().statistic.circularRewiringPercentage != cirularPer){
            dispatch({
                type: TOTAL_REWIRING_PERCENTAGE,
                payload: {
                    totalRewiringPercentage : aTotal,
                    circularRewiringPercentage :  cirularPer
                }
            });
        }

        // setTimeout(()=>{
        dispatch(manageRewiredProgressPopup(false,false,true,{totalRewiringPercentage: aTotal, circularRewiringPercentage: cirularPer}));
        // },800);
        if(JSON.stringify(getState().metaData.rewiringProgress) !== JSON.stringify(rewiringProgress)){
            return dispatch({
                type: SET_REWIRING_BARS,
                payload: rewiringProgress
            });
        }
        return;
    }
};

//porn - 'Why I relapse' chart
export const calculatePornWhyIRelapse = () => {
    return (dispatch, getState) => {
        let metaData = getState().metaData.metaData;

        if (metaData == undefined || Object.keys(metaData).length == 0) {
            metaData = cloneDeep(objDefaultMetaData);
        }
        let keys = Object.keys(metaData);

        let newObj = filter(keys, function (o) {
            return o.includes('relapse_porn_') && !o.includes("relapse_porn_morning")
                && !o.includes("relapse_porn_afternoon") && !o.includes("relapse_porn_evening") && !o.includes("relapse_porn_night")
        });
        let arrRelapse = [];
        arrRelapse = newObj.map(obj => {
            return obj.replace("relapse_porn_", "");
        });
        let whyRelapse = [];
        // newObj.push("relapse_porn_test")
        // metaData["relapse_porn_test"] = 1;
        // newObj.push("relapse_porn_testing")
        // metaData["relapse_porn_testing"] = 0;

        let totalRelapses = 0;
        newObj.forEach(obj => {
            totalRelapses += metaData[obj];
        });

        newObj.forEach(obj => {
            let key = obj.replace("relapse_porn_", "").replace(/\w\S*/g, function (txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            });
            let keyObj = {
                key: key,
                total: getPrecentage(metaData[obj], totalRelapses)
            };
            if (obj == "relapse_porn_bored" || obj == "relapse_porn_stress" || obj == "relapse_porn_anxiety"
                || obj == "relapse_porn_tired" || obj == "relapse_porn_alone" || obj == "relapse_porn_pain" || obj == "relapse_porn_horny") {
                whyRelapse.push(keyObj);
            } else {
                if (metaData[obj] > 0) {
                    whyRelapse.push(keyObj);
                }
            }
        });
        whyRelapse = sortBy(whyRelapse, obj => obj.total).reverse();
        if (JSON.stringify(getState().statistic.pornWhyIRelapse) != JSON.stringify(whyRelapse)) {
            return dispatch({
                type: PORN_WHY_RELAPSE,
                payload: whyRelapse
            });
        }
        return;
    }
};

//porn - 'When I relapse' chart and When Stressed

export const calculatePornWhenIRelapse = () => {
    return (dispatch, getState) => {

        let metaData = getState().metaData.metaData;

        if(metaData == undefined || Object.keys(metaData).length == 0) {
            metaData =  cloneDeep(objDefaultMetaData);
        }
        let totalRelapses = metaData.relapse_porn_morning + metaData.relapse_porn_afternoon
            + metaData.relapse_porn_evening + metaData.relapse_porn_night;
        let whenRelapse = {
            Morning: getPrecentage(metaData.relapse_porn_morning, totalRelapses),
            Afternoon: getPrecentage(metaData.relapse_porn_afternoon, totalRelapses),
            Evening: getPrecentage(metaData.relapse_porn_evening, totalRelapses),
            Night: getPrecentage(metaData.relapse_porn_night, totalRelapses),
        };
        if (JSON.stringify(getState().statistic.pornWhenIRelapse) != JSON.stringify(whenRelapse)) {
            dispatch({
                type: PORN_WHEN_RELAPSE,
                payload: whenRelapse
            });
        }
        //Calculate when stressed
        let totalStressed = metaData.stressed_morning + metaData.stressed_afternoon
            + metaData.stressed_evening + metaData.stressed_night;
        let stressed = {
            Morning: getPrecentage(metaData.stressed_morning, totalStressed),
            Afternoon: getPrecentage(metaData.stressed_afternoon, totalStressed),
            Evening: getPrecentage(metaData.stressed_evening, totalStressed),
            Night: getPrecentage(metaData.stressed_night, totalStressed),
        };
        if (JSON.stringify(getState().statistic.pornWhenIStressed) != JSON.stringify(stressed)) {
            return dispatch({
                type: PORN_WHEN_STRESSED,
                payload: stressed
            });
        }
        return;
    }
};

//Masturbation - 'When I relapse' chart

export const calculateMasturbationWhenIRelapse = () => {
    return (dispatch, getState) => {
        let metaData = getState().metaData.metaData;

        if(metaData == undefined || Object.keys(metaData).length == 0) {
            metaData =  cloneDeep(objDefaultMetaData);
        }
        let totalRelapses = metaData.relapse_masturbation_morning + metaData.relapse_masturbation_afternoon
            + metaData.relapse_masturbation_evening + metaData.relapse_masturbation_night;
        let whenRelapse = {
            Morning: getPrecentage(metaData.relapse_masturbation_morning, totalRelapses),
            Afternoon: getPrecentage(metaData.relapse_masturbation_afternoon, totalRelapses),
            Evening: getPrecentage(metaData.relapse_masturbation_evening, totalRelapses),
            Night: getPrecentage(metaData.relapse_masturbation_night, totalRelapses),
        };
        if (JSON.stringify(getState().statistic.masturbationWhenIRelapse) != JSON.stringify(whenRelapse)) {
            return dispatch({
                type: M_WHEN_RELAPSE,
                payload: whenRelapse
            });
        }
        return;
    }
};

getPrecentage = (val, total) => {
    if(total <= 0){
        return 0;
    }
    return Math.round(Math.floor(val/total * 100));
};

//Rewiring- calculate Improvement progress bar

export const calculateImprovementByActivity = () => {
    return (dispatch, getState) => {
        let metaData = getState().metaData.metaData;
        if(metaData == undefined || Object.keys(metaData).length == 0) {
            metaData =  cloneDeep(objDefaultMetaData);
        }
        let improvementPercentage = [
            { icon: (Math.round(4 + (metaData.improvement_mind/10)*96) >= 100) && "Y" || "B",
                val: "mind",
                progressPer: Math.round(4 + (metaData.improvement_mind/10)*96) + "%",
                valPer: Math.round(4 + (metaData.improvement_mind/10)*96),
                actualPer: Math.round((metaData.improvement_mind/10)*100) + "%"
            },
            { icon: (Math.round(4 + (metaData.improvement_energy/10)*96) >= 100) && "Y" || "B",
                val: "energy",
                progressPer: Math.round(4 + (metaData.improvement_energy/10)*96) + "%",
                valPer: Math.round(4 + (metaData.improvement_energy/10)*96),
                actualPer: Math.round((metaData.improvement_energy/10)*100) + "%"
            },
            { icon: (Math.round(4 + (metaData.improvement_attraction/10)*96) >= 100) && "Y" || "B",
                val: "attraction",
                progressPer: Math.round(4 + (metaData.improvement_attraction/10)*96) + "%",
                valPer: Math.round(4 + (metaData.improvement_attraction/10)*96),
                actualPer: Math.round((metaData.improvement_attraction/10)*100) + "%"
            },
            { icon: (Math.round(4 + (metaData.improvement_sleep/10)*96) >= 100) && "Y" || "B",
                val: "sleep",
                progressPer: Math.round(4 + (metaData.improvement_sleep/10)*96) + "%",
                valPer: Math.round(4 + (metaData.improvement_sleep/10)*96),
                actualPer: Math.round((metaData.improvement_sleep/10)*100) + "%"
            },
            { icon: (Math.round(4 + (metaData.improvement_voice/10)*96) >= 100) && "Y" || "B",
                val: "voice",
                progressPer: Math.round(4 + (metaData.improvement_voice/10)*96) + "%",
                valPer: Math.round(4 + (metaData.improvement_voice/10)*96),
                actualPer: Math.round((metaData.improvement_voice/10)*100) + "%"
            },
            { icon: (Math.round(4 + (metaData.improvement_health/10)*96) >= 100) && "Y" || "B",
                val: "health",
                progressPer: Math.round(4 + (metaData.improvement_health/10)*96) + "%",
                valPer: Math.round(4 + (metaData.improvement_health/10)*96),
                actualPer: Math.round((metaData.improvement_health/10)*100) + "%"
            },
            { icon: (Math.round(4 + (metaData.improvement_confidence/10)*96) >= 100) && "Y" || "B",
                val: "confidence",
                progressPer: Math.round(4 + (metaData.improvement_confidence/10)*96) + "%",
                valPer: Math.round(4 + (metaData.improvement_confidence/10)*96),
                actualPer: Math.round((metaData.improvement_confidence/10)*100) + "%"
            },
            { icon: (Math.round(4 + (metaData.improvement_alive/10)*96) >= 100) && "Y" || "B",
                val: "alive",
                progressPer:  Math.round(4 + (metaData.improvement_alive/10)*96) + "%",
                valPer: Math.round(4 + (metaData.improvement_alive/10)*96),
                actualPer: Math.round((metaData.improvement_alive/10)*100) + "%"
            },
        ];
        // let improvementPercentage = {
        //     mind: Math.round(4 + (metaData.improvement_mind/10)*96) + "%",
        //     energy: Math.round(4 + (metaData.improvement_energy/10)*96) + "%",
        //     attraction: Math.round(4 + (metaData.improvement_attraction/10)*96) + "%",
        //     sleep: Math.round(4 + (metaData.improvement_sleep/10)*96) + "%",
        //     voice: Math.round(4 + (metaData.improvement_voice/10)*96) + "%",
        //     health: Math.round(4 + (metaData.improvement_health/10)*96) + "%",
        //     confidence: Math.round(4 + (metaData.improvement_confidence/10)*96) + "%",
        //     alive: Math.round(4 + (metaData.improvement_alive/10)*96) + "%",
        // };

        if (JSON.stringify(getState().metaData.improvementPercentage) != JSON.stringify(improvementPercentage)) {
            return dispatch({
                type: IMPROVEMEMT_PERCENTAGE,
                payload: improvementPercentage
            });
        }
        return;
    }
};

//Add new checkup question
export const addNewCheckupQuestion = (allquestion) => {
    return (dispatch, getState) => {
        return dispatch({
            type: ADD_NEW_CHECKUP_QUESTION,
            payload: allquestion
        });
    }
};


//Set Morning routine
export const setMorningRoutine = (morningRoutine) => {
    return (dispatch, getState) => {
        if (JSON.stringify(getState().metaData.morningRoutine) != JSON.stringify(morningRoutine)) {
            return dispatch({
                type: SET_MORNING_ROUTINE,
                payload: morningRoutine
            });
        }
        return;
    }
};

// Audio exercise,Wisdom,progress_wisdom +1
// Breathing practice,Stress control,progress_stress_control +1
// Choose path,Wisdom,progress_wisdom +1
// Did you know,Wisdom,progress_wisdom +1
// Emotion,Dopamine rewiring,progress_dopamine_rewiring +1
// Faith,-,
//     Healthy activity,Dopamine rewiring,progress_dopamine_rewiring +1
// Kegals,-,
//     Meditation,"Hypofrontality, stress relief","progress_hypofrontality +3,  progress_stress_control +1"
// Stress relief,Stress control,progress_stress_control +1
// Thought control,Hypofrontality,progress_hypofrontality +1
// Letters,Wisdom,progress_wisdom +

//On complete morning routine
export const setCompletedMorningRoutine = (pageName) => {
    return (dispatch, getState) => {
        let today = new Date().toDateString();
        let morningRoutine = getState().metaData.morningRoutine;
        let completedMorningRoutine = getState().metaData.completedMorningRoutine.routineActivities;
        let completedObj = find(morningRoutine,{pageName : pageName});
        if(completedObj != undefined) {
            if(completedMorningRoutine.indexOf(completedObj) < 0) {
                completedMorningRoutine.push(completedObj);
            }
        }else{
            completedMorningRoutine = [];
        }
        return dispatch({
            type: SET_DONE_MORNING_ROUTINE,
            payload: {
                completedDate: today,
                routineActivities: completedMorningRoutine
            }
        });
    }
};

export const onCompletedMorningRoutine = (pageName) => {
    return (dispatch, getState) => {
        return dispatch({
            type: SET_DONE_MORNING_ROUTINE,
            payload: {
                completedDate: new Date().toDateString(),
                routineActivities: []
            }
        });
    }
};

//SET SELECTED OPTIONAL EXERCISES
export const setSelectedOptionalExercises = (optionalExercises) => {
    return (dispatch, getState) => {
        return dispatch({
            type: SET_SELECTED_OPTIONAL_EXERCISES,
            payload: optionalExercises
        });
    }
};

//SET SELECTED TODAY SCREEN EXERCISES
export const setSelectedTodayExercises = (todayExercises) => {
    return (dispatch, getState) => {
        return dispatch({
            type: TODAY_SCREEN_EXERCISES,
            payload: todayExercises
        });
    }
};

//for diagnostic screen
export const getAllLatestMetaData = () => {
    return (dispatch, getState) => {
        return CallApi(Constant.baseUrlV2+Constant.metaData,'get',{},{"Authorization":"Bearer "+getState().user.token})
            .then((response)=> {
                if(JSON.stringify(getState().metaData.metaData) !== JSON.stringify(response.data)){
                    dispatch({
                        type: SET_META_DATA,
                        payload: response.data,
                    });
                }
                return Promise.resolve(response.data)
            })
            .catch((error)=>{
                // return Promise.reject(error);
                return dispatch(apiErrorHandler(error));
            })
    };
};

export const getAllLatestUserData = () => {
    return (dispatch, getState) => {
        return CallApi(Constant.baseUrlV2+Constant.userDetail,'get',{},{"Authorization":"Bearer "+getState().user.token})
            .then((response)=>{
                return Promise.resolve(response.data);
            })
            .catch((error)=>{
                return dispatch(apiErrorHandler(error));
                // return Promise.reject(error);
            })
    };
};

//set meditation time
export const setMeditationTime = (meditationTime, isCallApi = true) => {
    return (dispatch, getState) => {
        dispatch({
            type: MEDITATION_TIME,
            payload: meditationTime
        });
        if(isCallApi){
            dispatch(updateMetaData({meditation_time: meditationTime}));
        }
        return Promise.resolve(true);
    }
};