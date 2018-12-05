import {
    APP_SET_USER_DATA,
    USER_EMAIL_CHANGED,
    USER_PASS_CHANGED,
    START_LOADING,
    VISIBLE_TAB,
    REWIRING_PLAY,
    SET_USER_DETAIL,
    SET_COMPLETED_EXERCISES,
    SETTING_NOTIFICATIONS,
    SETTING_TEAMCHAT_NOTIFICATIONS,
    SET_READ_TODAY_LATTER,
    SET_API_CALL_DATE,
    TODAY_INSTANCES,
    FIRST_TIME_APP_OPEN_IN_DAY,
    IS_ASK_FOR_CHECKUP,
    IS_NETWORK_AVAILABLE,
    SET_SAFE_AREA_INTENT,
    SET_SAFE_AREA_INTENT_X,
    SUBSCRIPTION_CHECK_DATE,
    SHOW_CHECKUP_POPUP,
    SHOW_REWIRING_POPUP,
    SHOW_REWIRING_PROGRESS_POPUP,
    STREAK_GOAL_ACHIEVED_POPUP,
    MANAGED_SHOW_STREAK_POPUP,
    POPUP_QUEUE,
    TODAY_LIFE_TREEE,
    SHOW_STREAK_POPUP,
    APP_BADGE_COUNT,
    INTERNET_FILTER,
    APPTHEME_TYPE,
    RESET_STORE, SET_META_DATA, SET_LETTERS,
    SHOW_MONTHLY_POPUP,
    SHOW_MONTHLY_CHALLENGE_POPUP,
    MONTHLY_CHALLENGE_ACHIEVED,
    ENCOURAGE_POPUP,
    CONGRATULATE_POPUP,
    SET_DO_NOT_DISTURB,
    SHOW_TEAM_ACHIEVEMENT_POPUP
} from './types'
import {AsyncStorage, Linking, NativeModules, NetInfo, Alert} from 'react-native';
import {CallApi, checkForRechability} from '../services/apiCall'
import Constant from '../services/apiConstant'
import { getPornDays, getMasturbationDays } from './statisticAction';
import {
    getTeamDetail, getTeamChat, getleaderboardIndividualList,
    getleaderboardTeamList, getTeamAchievements, getGlobalStatistic, getEventsDetails, getMemberDetail
} from './teamAction';
import { getHelpPostDetail } from './helpPostActions';
import { getAdviceDetail } from './postAdviceAction';
import { getAllMetaData, updateMetaData, updateMetaDataNoCalculation} from './metadataActions';
import { getAllLetters } from './lettersActions';
import {manageNotification} from '../helper/localNotification';
import moment from 'moment';
import _ from 'lodash';
import {appDefaultReducer} from "../reducers/defaultReducer";
import {
    resetAllAsyncStorageData, showThemeAlert, getCurrentMonth, showNoInternetAlert, showServerNotReachable,
    showAPICallError, backendNotReachable
} from "../helper/appHelper";
import { EventRegister } from 'react-native-event-listeners'
import AppConstant from '../helper/constant';
import OneSignal from "react-native-onesignal";
let nativeCall = (AppConstant.isIOS) && NativeModules.checkBundle || null;

let isAlertShown = false;

export const loginUser = (email, password, isNewUser =  false) => {
    return (dispatch, getState) => {
        dispatch({
            type: START_LOADING,
            payload: true,
        });
        return CallApi(Constant.baseUrl+Constant.signIn,'get',{},{"Auth-User":email,"Auth-Password":password})
            .then((response)=>{
                let user = {
                    email:email,
                    password:password,
                    token:response.data.token
                };
                AsyncStorage.setItem('user',JSON.stringify(user),(res)=>{});

                dispatch({
                    type: APP_SET_USER_DATA,
                    payload: response.data,
                });
                dispatch({
                    type: APP_SET_USER_DATA,
                    payload: response.data,
                });
                return dispatch(loadDataAfterLogin(isNewUser, true))
            })
            .catch((error)=>{
                dispatch({
                    type: START_LOADING,
                    payload: false,
                });
                let data = {};
                if(error != undefined){
                    if(error.response.status == 401){
                        data.Heading="Incorrect Details";
                        data.Description = "Your email or password is incorrect. Please check your details and try again.";
                        data.status = 401;
                    }else if(error.response.status == 500){
                        data.Heading="Server error";
                        data.Description = "Hmm something has gone wrong on our end. We should have this fixed soon.";
                        data.status = 500;
                    }else if(error.status == 408 || error.message.includes("Network Error")) {
                        data.Heading = "Brainbuddy";
                        data.Description = "Please Check Internet Connection!!!";
                        data.status = 501;
                    }
                }else{
                    data.Heading="Brainbuddy";
                    data.Description = "Something went wrong, please try again";
                    data.status = 501;
                }
                return Promise.reject(data);
            })
    };
};

export const loadDataAfterLogin = (isNewUser = false, isFromLogin = false, isFromBackgeround = false) => {
    return (dispatch, getState) => {
        return checkForRechability().then(reachabilityStatus=>{
            if(reachabilityStatus === AppConstant.REACHABLE){
                if(isNewUser) {
                    let userObj = getState().user.userDetails;
                    return Promise.all([
                        dispatch(updateUserDetail(userObj)),
                        dispatch(getAllMetaData()),
                        dispatch(getPornDays()),
                        dispatch(getMasturbationDays()),
                    ]).then(res=> {
                        if(isFromLogin){
                            console.log('calling when signUp');
                            dispatch(getTeamDetail());
                            dispatch(getAllLetters());
                            dispatch(getTeamChat());
                            dispatch(getAdviceDetail());
                            dispatch(getHelpPostDetail());
                            dispatch(getleaderboardTeamList(true));
                            dispatch(getUserDetail());
                            dispatch(getleaderboardIndividualList(true));
                        }
                        dispatch({
                            type: START_LOADING,
                            payload: false,
                        });
                        return Promise.resolve(true);
                    }).catch((error) => {
                        console.log("Error loadDataAfterLogin ---> ",error)
                        return Promise.reject(error)
                    });
                }else{
                    if(isFromLogin){
                        console.log('calling when login')
                        return Promise.all([
                            dispatch(getAllMetaData()),
                            dispatch(getUserDetail()),
                            dispatch(getPornDays(false,false)),
                            dispatch(getMasturbationDays())
                        ]).then(res=> {
                            dispatch(getAllLetters());
                            dispatch(getTeamDetail());
                            dispatch(getTeamChat());
                            dispatch(getAdviceDetail());
                            dispatch(getHelpPostDetail());
                            dispatch(getleaderboardTeamList(true));
                            dispatch(getleaderboardIndividualList(true));
                            dispatch({
                                type: START_LOADING,
                                payload: false,
                            });
                            return Promise.resolve(true);
                        }).catch((error) => {
                            console.log("Error loadDataAfterLogin ---> ",error)
                            return Promise.reject(error)
                        });
                    }else{
                        if(isFromBackgeround){
                            //From background open
                            return dispatch(getAllMetaData())
                                .then(res => {
                                    return dispatch(getPornDays(false, false))
                                }).then(res => {
                                    return dispatch(getTeamChat(null,true))
                                }).then(res => {
                                    dispatch(getMasturbationDays(false))
                                    if(getState().user.userDetails.id){
                                        dispatch(getEventsDetails(getState().user.userDetails.id,null,true));
                                        // dispatch(getMemberDetail(getState().user.userDetails.id))
                                    }
                                    dispatch({
                                        type: START_LOADING,
                                        payload: false,
                                    });
                                    return Promise.resolve(true);
                                }).catch((error) => {
                                    console.log("Error loadDataAfterLogin ---> ", error)
                                    return Promise.reject(error)
                                });
                        }else{
                            //New open
                            dispatch(getTeamChat(null,true));
                            return dispatch(getAllMetaData())
                                .then(res => {
                                    return dispatch(getPornDays(false,false))
                                }).then(res => {
                                    return dispatch(getUserDetail());
                                }).then(res=>{
                                    dispatch(getMasturbationDays(false))
                                }).then(res => {
                                    dispatch(getTeamDetail());
                                    dispatch(getEventsDetails(getState().user.userDetails.id,null,true));
                                    dispatch({
                                        type: START_LOADING,
                                        payload: false,
                                    });
                                    return Promise.resolve(true);
                                }).catch((error) => {
                                    console.log("Error loadDataAfterLogin ---> ", error)
                                    return Promise.reject(error)
                                });
                        }
                    }
                }
            }else if(reachabilityStatus === AppConstant.NOT_REACHABLE_BACKEND){
                backendNotReachable();
            }
        }).catch(err=>{
            if(typeof err === 'object'){
                return dispatch(apiErrorHandler(err));
            }else{
                if(err && err === AppConstant.NOT_REACHABLE){
                    if(getState().user.isConnected){
                        showServerNotReachable();
                    }else{
                        showNoInternetAlert();
                    }
                }
            }
        })
    }
}

export const createUser = (email, password) => {
    return (dispatch, getState) => {
        dispatch({
            type: START_LOADING,
            payload: true,
        });
        return CallApi(Constant.baseUrl + Constant.signUp, 'post', {email: email, password: password}, {})
            .then((response) => {
                return dispatch(loginUser(email, password, true));
            })
            .catch((error) => {
                dispatch({
                    type: START_LOADING,
                    payload: false,
                });
                let data = {};
                if(error != undefined){
                    if(error.response.status == 409) {
                        data.Heading="Incorrect Details";
                        data.Description = "A user with this email address already exists. Please check your details and try again.";
                        data.status = 409;
                    }else if(error.response.status == 500){
                        data.Heading="Server error";
                        data.Description = "Hmm something has gone wrong on our end. We should have this fixed soon.";
                        data.status = 500;
                    }else if(error.response.status == 408 || error.response.message.includes("Network Error")) {
                        data.Heading="Brainbuddy";
                        data.Description = "Something went wrong, please try again.";
                        data.status = 501;
                    }
                }else{
                    data.Heading="Brainbuddy";
                    data.Description = "Something went wrong, please try again.";
                    // data.status = 501;
                }
                return Promise.reject(data);

            })
    };
};

export const setNewUser = (userObj) => {
    return (dispatch, getState) => {
        dispatch({
            type: SET_USER_DETAIL,
            payload: userObj
        });
    };
};

export const updateUserDetail = (userDetail) => {
    return (dispatch, getState) => {
        if(userDetail){
            userDetail.name = userDetail.name ||'Unknown'
            return CallApi(Constant.baseUrlV2+Constant.userDetail,'patch',userDetail,{"Authorization":"Bearer "+getState().user.token})
                .then((response)=>{
                    dispatch({
                        type: SET_USER_DETAIL,
                        payload: response.data.data,
                    });
                    return Promise.resolve(true);
                })
                .catch((error)=>{
                    // return Promise.reject(error);
                    return dispatch(apiErrorHandler(error));
                })
        }
    };
};

export const getUserDetail = () => {
    return (dispatch, getState) => {
        return CallApi(Constant.baseUrlV2+Constant.userDetail,'get',{},{"Authorization":"Bearer "+getState().user.token})
            .then((response)=>{
                if(response.data.id){
                    // dispatch(getMemberDetail(response.data.id));
                }
                dispatch({
                    type: SET_USER_DETAIL,
                    payload: response.data,
                });
                return Promise.resolve(true);
            })
            .catch((error)=>{
                // return Promise.reject(error);
                return dispatch(apiErrorHandler(error));
            })
    };
};

//Delete User account
export const deleteUserAccount = () => {
    return (dispatch, getState) => {
        return CallApi(Constant.baseUrlV2+Constant.user,'delete',{},{"Authorization":"Bearer "+getState().user.token})
            .then((response)=>{
                return Promise.resolve(true);
            })
            .catch((error)=>{
                // return Promise.reject(error);
                return dispatch(apiErrorHandler(error));
            })
    };
};

export const emailChanged = (text) => {
    return { type: USER_EMAIL_CHANGED, payload: text };
};

export const startLoading = (text) => {
    return { type: START_LOADING, payload: text };
};

export const passChanged = (text) => {
    return { type: USER_PASS_CHANGED, payload: text };
};

export const tabChanged = (tabName) => {
    return (dispatch, getState) => {
        if (AppConstant.isIOS) {
            if (tabName == "team") {
                nativeCall.manageKeyboard(true);
            } else {
                nativeCall.manageKeyboard(false);
            }
        }
        dispatch({type: VISIBLE_TAB, payload: tabName});
        if (tabName == 'milestone' || tabName == 'team') {
            dispatch(activeAppManagedTab(tabName))
        }
        return;
    }
};

//Audio Activity
export const setRewiringPlayer = (rewiringPlay) => {
    return (dispatch, getState) => {
        dispatch({
            type: REWIRING_PLAY,
            payload: rewiringPlay
        });
    };
};

//Setting Notification
export const setNotification = (notification) => {
    return (dispatch, getState) => {
        dispatch({
            type: SETTING_NOTIFICATIONS,
            payload: notification
        });
    };
};
//setting team chat notification
export const setTeamChatNotification = (notification) => {
    return (dispatch, getState) => {
        dispatch({
            type: SETTING_TEAMCHAT_NOTIFICATIONS,
            payload: notification
        });
    };
};

//Set completed exercises

export const setCompletedExercises = (exercisesName) => {
    return (dispatch, getState) => {
        let completedExercises = getState().user.completedExercises;
        let today = new Date().toDateString();
        let exericieses = [];
        if(completedExercises.date != today){
            exericieses = [exercisesName];
        }else{
            exericieses = completedExercises.exercises;
            if(exericieses.indexOf(exercisesName) < 0){
                exericieses.push(exercisesName);
            }
        }
        dispatch({
            type: SET_COMPLETED_EXERCISES,
            payload: {
                date: today,
                exercises: exericieses
            }
        });
    };
};

export const setReadLatterDone = (previousAchieved) => {
    return (dispatch, getState) => {
        let obj = {
            date:  new Date().toDateString(),
            previousAchieved: previousAchieved
        };
        dispatch({
            type: SET_READ_TODAY_LATTER,
            payload: obj
        });
        return Promise.resolve(true);
    };
};

export const setDoneAPICallForToday = () => {
    return (dispatch, getState) => {
        dispatch({
            type: SET_API_CALL_DATE,
            payload: new Date().toDateString()
        });
        return Promise.resolve(true);
    };
};

export const manageTodayInstances = (instance) => {
    return (dispatch, getState) => {
        dispatch({
            type: TODAY_INSTANCES,
            payload: instance
        });
        return Promise.resolve(true);
    };
};

//Manage local notification
export const setUpLocalNotificationAlerts = () => {
    return (dispatch, getState) => {
        try{
            let last_checkup_at = (getState().metaData.metaData.last_checkup_at != undefined) &&
                getState().metaData.metaData.last_checkup_at || "";
            let checkup_time = (getState().metaData.metaData.checkup_time != undefined) &&
                getState().metaData.metaData.checkup_time || 18;

            let userName = (getState().user && getState().user.userDetails && getState().user.userDetails.name)
                && getState().user.userDetails.name || "";

            let settingNotifications = getState().user.settingNotifications;

            let streakGoal = "";
            let calculatedObj = getState().statistic.currentGoal || 0;
            let currentClean = getState().statistic.pornDetail.current_p_clean_days || 0;
            let remainingHour = (calculatedObj.goalDays*24) - ((currentClean*24) + new Date().getHours());
            let todayDate = moment().format("YYYY-MM-DD");
            let pornObj = _.find(getState().statistic.pornDetail.p_array, { occurred_at: todayDate, is_relapse: false });

            if(remainingHour <= 24 && last_checkup_at == todayDate && pornObj != undefined) {
                let tomorrow = moment().add(1, 'days').format('YYYY-MM-DD');
                streakGoal = "Streak goal achieved. Congratulations on 24 hours clean";
                if(calculatedObj.goalDays != 1) {
                    streakGoal = "Streak goal achieved. Congratulations on "+ calculatedObj.goalDays +" days clean! \ud83c\udf89";
                }
                // let objGoalAchieved = {isShown: false,showDate: tomorrow,achievedGoal: calculatedObj.goalDays};
                // let obj = getState().user.showGoalAchieved;
                // console.log("objGoalAchieved",objGoalAchieved, obj)
                // if(_.isEqual(obj, objGoalAchieved)) {
                // }else {
                //     dispatch({
                //         type: MANAGED_SHOW_STREAK_POPUP,
                //         payload: objGoalAchieved
                //     });
                //     console.log(objGoalAchieved);
                // }
            }
            // else {
            //     let obj = getState().user.showGoalAchieved;
            //     if(!obj.isShown) {
            //         let todayDate = moment().format("YYYY-MM-DD");
            //         let yesterdayDate = moment().subtract(1, 'days').format('YYYY-MM-DD');
            //         let yesterdayPornObj = _.find(getState().statistic.pornDetail.p_array,
            //             { occurred_at: yesterdayDate, is_relapse: false });
            //         console.log(yesterdayPornObj);
            //
            //         if(yesterdayPornObj != undefined && obj.showDate === todayDate){
            //             //&& obj.achievedGoal === calculatedObj.previousAchieved) {
            //             console.log("inside iffff - do nothing")
            //         }else{
            //             let showGoalAchieved = {
            //                 isShown: false,
            //                 showDate: "",
            //                 achievedGoal: 0
            //             };
            //             console.log("inside else - set no goal completed")
            //             if(_.isEqual(obj, showGoalAchieved)){
            //             }else {
            //                 if(obj.showDate != ""){
            //                     dispatch({
            //                         type: MANAGED_SHOW_STREAK_POPUP,
            //                         payload: showGoalAchieved
            //                     });
            //                     console.log(showGoalAchieved);
            //                 }
            //             }
            //         }
            //     }
            // }
            manageNotification(checkup_time, last_checkup_at, userName, settingNotifications, streakGoal);
            return true;
        }catch (e){
            console.log("error - setUpLocalNotificationAlerts", e);
        }
    };
};

export const manageStreakAchievedPopup = (detail)   => {
    return (dispatch, getState) => {
        return dispatch({
            type: SHOW_STREAK_POPUP,
            payload: detail
        });
    };
};


//Manage streak achieved popup
export const manageAchievedPopup = (detail) => {
    return (dispatch, getState) => {
        return dispatch({
            type: MANAGED_SHOW_STREAK_POPUP,
            payload: detail
        });
    };
};


//first time open app in a day  //false true true
//objFirstAsk.isAskForUpdateCalendar, false   => no popup

//nextProps.setDateforTodayOpen(true, false); == if popup

export const setDateforTodayOpen = (isAskForUpdate, isNewOpen, isFromInitial=false) => {
    return (dispatch, getState) => {
        let isAsked = isAskForUpdate;
        let todayDate = new Date().toDateString();
        if(isFromInitial) {
            isAsked = getState().user.isOpenFirstTime.isAskForUpdateCalendar;
            todayDate = getState().user.isOpenFirstTime.date;
        }
        dispatch({
            type: FIRST_TIME_APP_OPEN_IN_DAY,
            payload: {
                date: todayDate,
                isAskForUpdateCalendar: isAsked,
                isNewOpen: isNewOpen
            }
        });
        return Promise.resolve(true);
    };
};

//Managed Popup Here
//Manage ask for checkup popup
export const setAskedForCheckupPopup = (isAsked) => {
    return (dispatch, getState) => {
        return dispatch({
            type: IS_ASK_FOR_CHECKUP,
            payload: isAsked
        });
    };
};

//Manage checkup popup
export const manageCheckupPopup = (showCheckupDetail) => {
    return (dispatch, getState) => {
        if(showCheckupDetail.isShow) {
            let obj = _.cloneDeep(getState().user.popupQueue);
            obj.checkup = (showCheckupDetail.isShow) ? showCheckupDetail : null;
            dispatch({
                type: POPUP_QUEUE,
                payload: obj
            });
        }
        return dispatch({
            type: SHOW_CHECKUP_POPUP,
            payload: showCheckupDetail
        });
    };
};

//Manage rewiring popup
export const manageRewiringPopup = (showRewiringDetail) => {
    return (dispatch, getState) => {
        return dispatch({
            type: SHOW_REWIRING_POPUP,
            payload: showRewiringDetail
        });
    };
};

//Manage team achievement popup
export const manageTeamAchievementPopup = (teamAchievementDetail) => {
    return (dispatch, getState) => {
        return dispatch({
            type: SHOW_TEAM_ACHIEVEMENT_POPUP,
            payload: teamAchievementDetail
        });
    };
};

//Manage Monthly Challenge popup
export const manageMonthlyChallengePopup = (monthlyDetail) => {
    return (dispatch, getState) => {
        let obj = _.cloneDeep(getState().user.popupQueue);
        obj.monthlyChallenge = (monthlyDetail.isShow) && true || null;
        dispatch({
            type: POPUP_QUEUE,
            payload: obj
        });
        return dispatch({
            type: SHOW_MONTHLY_CHALLENGE_POPUP,
            payload: monthlyDetail
        });
    };
};

export const manageMonthlyChallengeAchieved = (details) => {
    return (dispatch, getState) => {
        return dispatch({
            type: MONTHLY_CHALLENGE_ACHIEVED,
            payload: details
        });
    };
};

//Manage Rewired popup
export const manageRewiredProgressPopup = (isShow, isSetPrev = false, isNewUpdate = false, rewiredData = null ) => {
    return (dispatch, getState) => {
        let obj = _.cloneDeep(getState().user.popupQueue);
        obj.rewired = (isShow) && true || null;
        dispatch({
            type: POPUP_QUEUE,
            payload: obj
        });

        let totalRewiringPercentage = getState().statistic.totalRewiringPercentage;
        let circularRewiringPercentage = getState().statistic.circularRewiringPercentage;

        if(rewiredData) {
            totalRewiringPercentage =  rewiredData.totalRewiringPercentage;
            circularRewiringPercentage =  rewiredData.circularRewiringPercentage;
        }

        let prevPrec = getState().user.showRewindProgressPopUp.rewindDetail.prevProgress;
        if(isSetPrev || prevPrec > totalRewiringPercentage) {
            prevPrec = ((getState().user.showRewindProgressPopUp.rewindDetail.totalRewiringPercentage % 10) == 0) ?
                getState().user.showRewindProgressPopUp.rewindDetail.totalRewiringPercentage : 0;
        }

        let showRewindProgressPopUp = {
            isShow: (isNewUpdate) ? getState().user.showRewindProgressPopUp.isShow : isShow,
            rewindDetail: {
                totalRewiringPercentage : totalRewiringPercentage,
                circularRewiringPercentage : circularRewiringPercentage,
                avatar_id: getState().user.userDetails.avatar_id,
                prevProgress: prevPrec,
            }
        };
        return dispatch({
            type: SHOW_REWIRING_PROGRESS_POPUP,
            payload: showRewindProgressPopUp
        });
    };
};

//Manage Encourage popup
export const manageEncouragePopup = (detail)   => {
    return (dispatch, getState) => {
        return dispatch({
            type: ENCOURAGE_POPUP,
            payload: detail
        });
    };
};

//Manage Congratulate popup
export const manageCongatulatePopup = (detail)   => {
    return (dispatch, getState) => {
        return dispatch({
            type: CONGRATULATE_POPUP,
            payload: detail
        });
    };
};


//Set setIsNetworkAvailable - isConnected = true or false
export const setIsNetworkAvailable = (isConnected) => {
    return (dispatch, getState) => {
        if(!isConnected){
            NetInfo.isConnected.fetch().then(isConnected => {
                if(isConnected){
                    return dispatch({
                        type: IS_NETWORK_AVAILABLE,
                        payload: true
                    });
                }else{
                    return dispatch({
                        type: IS_NETWORK_AVAILABLE,
                        payload: false
                    });
                }
            });
        }else{
            return dispatch({
                type: IS_NETWORK_AVAILABLE,
                payload: isConnected
            });
        }
    };
};


export const setSafeAreaIntent = (data) => {
    return (dispatch, getState) => {
        if(AppConstant.isIOS){
            return dispatch({
                type: SET_SAFE_AREA_INTENT,
                payload: data
            });
        }
    }
};

export const setSafeAreaIntentX = (data) => {
    return (dispatch, getState) => {
        if(AppConstant.isIOS){
            return dispatch({
                type: SET_SAFE_AREA_INTENT_X,
                payload: data
            });}
    }
};

export const removeSafeArea = (isDefault=false) => {
    return (dispatch,getState) => {
        if(AppConstant.isIOS) {
            let obj = _.cloneDeep(getState().user.safeAreaInsetsDefault);
            if (!isDefault) {
                obj.bottom = 0;
            }
            return dispatch({
                type: SET_SAFE_AREA_INTENT_X,
                payload: obj
            })
        }
    }
};

// export const setSafeAreaIntent = (data) => {
//     return (dispatch, getState) => {
//         return dispatch({
//             type: SET_SAFE_AREA_INTENT,
//             payload: data
//         });
//     }
// };
//
// export const setSafeAreaIntentX = (data) => {
//     return (dispatch, getState) => {
//         return dispatch({
//             type: SET_SAFE_AREA_INTENT_X,
//             payload: data
//         });
//     }
// };
//
// export const removeSafeArea = (isDefault=false) => {
//     return (dispatch,getState) => {
//         let obj = _.cloneDeep(getState().user.safeAreaInsetsDefault);
//         if(!isDefault){
//             obj.bottom=0;
//         }
//         return dispatch({
//             type:SET_SAFE_AREA_INTENT_X,
//             payload:obj
//         })
//     }
// };

//Set Subscription in process
export const setSubscriptionInProcess = (flag) => {
    return (dispatch, getState) => {
        return dispatch({
            type: SUBSCRIPTION_CHECK_DATE,
            payload: flag
        });
    }
};

//Manage popup queue
export const managePopupQueue = (obj) => {
    return (dispatch, getState) => {
        return dispatch({
            type: POPUP_QUEUE,
            payload: obj
        });
    }
};

//Manage Today life Tree
export const manageLifeTreeOnToday = (obj) => {

    return (dispatch, getState) => {
        return dispatch({
            type: TODAY_LIFE_TREEE,
            payload: obj
        });
    }
};

//Manage App badge count
export const manageAppBadgeCount = (count) => {
    return (dispatch, getState) => {
        return dispatch({
            type: APP_BADGE_COUNT,
            payload: _.cloneDeep(count)
        });
    }
};

//Manage Internet Filter
export const manageInternetFilter = (internetFilter) => {
    return (dispatch, getState) => {
        this.manaheInternetFilterNative(internetFilter);
        return dispatch({
            type: INTERNET_FILTER,
            payload: _.cloneDeep(internetFilter)
        });
    }
};

manaheInternetFilterNative = (alteredData) => {
    let kBlockList = "blockAllList";
    let kBlockWebsite = "websites";
    let kBlockKeyword = "keywords";
    let NativeInternetFilter = NativeModules.InternetFilter;
    try{
        let webSiteBlockes = [];
        let isBlockAllAdultWebSite = alteredData[0][kBlockList][0].value;

        let allWeb = alteredData[1][kBlockWebsite][0].allWebSite;
        allWeb.forEach(obj=>{
            webSiteBlockes.push({action: {type: "block"},trigger: {"url-filter": ".*"+ obj.name  +".*"}});
        });

        let allKeywod = alteredData[2][kBlockKeyword][0].allKeywords;
        allKeywod.forEach(obj=>{
            webSiteBlockes.push({action: {type: "block"},trigger: {"url-filter": ".*"+ obj.name  +".*"}});
        });

        if(webSiteBlockes.length == 0 && !isBlockAllAdultWebSite){
            webSiteBlockes.push({action: {type: "ignore-previous-rules"},trigger: {"url-filter": ".*"}});
        }
        let objStr = JSON.stringify(webSiteBlockes);

        NativeInternetFilter.setSites(objStr, isBlockAllAdultWebSite,(error, events) => {
            // console.log("call");
        });
    }catch (e){
        console.log("Err - manageWebsiteBlock", e);
    }
}

//call api when app comes from background to foreground
export const activeAppManagedTab = (selectedTab = null) => {
    return (dispatch, getState) => {
        let tabName = getState().user.visibleTab;
        if(selectedTab){
            tabName = selectedTab
        }
        switch (tabName){
            case "today":
                break;
            case "statistic":
                break;
            case "team":
                if(getState().user.isConnected){
                    dispatch(getleaderboardTeamList(true));
                    dispatch(getTeamDetail());
                    dispatch(getTeamChat());
                    dispatch(getGlobalStatistic());
                    break;
                }
            case "milestone":
                if(getState().user.isConnected){
                    AsyncStorage.getItem('isShowReligiousContent').then((isShow)=>{
                        if(isShow == null){
                            setTimeout(()=>{
                                showThemeAlert({
                                    title: " Show religious content?",
                                    message: "Do you want to see posts containing religious content?",
                                    leftBtn: "Yes",
                                    leftPress: ()=>{
                                        Promise.all([dispatch(updateMetaDataNoCalculation({wants_religious_content: true}))]).then(res=>{
                                            dispatch(getHelpPostDetail());
                                            dispatch(getAdviceDetail());
                                        })
                                        //dispatch(updateMetaDataNoCalculation({wants_religious_content: true}));
                                        AsyncStorage.setItem('isShowReligiousContent',"Yes");
                                    },
                                    rightBtn: "No",
                                    rightPress: ()=>{
                                        Promise.all([dispatch(updateMetaDataNoCalculation({wants_religious_content: false}))]).then(res=>{
                                            dispatch(getHelpPostDetail());
                                            dispatch(getAdviceDetail());
                                        })
                                        //dispatch(updateMetaData({wants_religious_content: false}));
                                        AsyncStorage.setItem('isShowReligiousContent',"No");
                                    },
                                });
                            },400);
                        }else {
                            dispatch(getHelpPostDetail());
                            dispatch(getAdviceDetail());
                        }
                        dispatch(getEventsDetails(getState().user.userDetails.id,null,true));
                    });
                }
                break;
            case "more":
                break;
        }
    }
};

//call letter api
export const managedLetterAPI = (isCall = false) => {
    return (dispatch, getState) => {
        if(isCall){
            dispatch(getAllLetters());
        }else{
            let today = new Date().toDateString()
            AsyncStorage.getItem('letterAPICall').then((letter)=>{
                if(letter){
                    if(letter !== today){
                        dispatch(getAllLetters());
                    }
                }else {
                    dispatch(getAllLetters());
                }
                AsyncStorage.setItem('letterAPICall',today);
            });
        }
    }
};

//App Theme type
export const setAppTheme = (type, isCallApi = true) => {
    return (dispatch, getState) => {
        dispatch({
            type: APPTHEME_TYPE,
            payload: type
        });
        if(isCallApi){
            if(type == AppConstant.lightTheme){
                dispatch(updateMetaDataNoCalculation({colour_theme: "light"}));
            }else{
                dispatch(updateMetaDataNoCalculation({colour_theme: "default"}));
            }
        }
        return Promise.resolve(true);
    };
};

//Reset Store
export const resetStoreData = () => {
    return (dispatch, getState) => {
        appDefaultReducer.user.safeAreaInsetsData = getState().user.safeAreaInsetsDefault;
        appDefaultReducer.user.safeAreaInsetsDefault = getState().user.safeAreaInsetsDefault;
        appDefaultReducer.navigation = getState().navigation
        return dispatch({
            type: RESET_STORE,
            payload: appDefaultReducer
        });
    };
};

//User Archive Notification
export const userArchiveNotification = () => {
    return (dispatch, getState) => {
        return CallApi(Constant.baseUrlV2+Constant.userArchiveNotification,'post',{},{"Authorization":"Bearer "+getState().user.token})
            .then((response)=> {
                return Promise.resolve(response);
            })
            .catch((error)=>{
                // return Promise.reject(error);
                return dispatch(apiErrorHandler(error));
            })
    };
};

//set do not distub
export const setDoNotDisturbEnable = (doNotDisturb) => {
    return (dispatch, getState) => {
        return dispatch({
            type: SET_DO_NOT_DISTURB,
            payload: doNotDisturb
        });
    };
};

export const sendTagOneSignal = () => {
    return (dispatch, getState) => {
        try{
            let userId = getState().user.userDetails.id;
            if(userId && userId != 0) {
                userId = userId.toString();
                if (AppConstant.isIOS) {
                    //Send tag if permission enabled
                    OneSignal.getPermissionSubscriptionState((status) => {
                        if (status && status.notificationsEnabled) {
                            // Getting the tags from the server and use the received object
                            OneSignal.getTags((receivedTags) => {
                                try {
                                    if (receivedTags == null || receivedTags == undefined || Object.keys(receivedTags).length === 0 || (receivedTags.id && receivedTags.id !== userId)) {
                                        OneSignal.sendTag("id", userId);
                                    }
                                } catch (e) {
                                    if (__DEV__) {
                                        alert(e)
                                    }
                                }
                            });
                        }
                    });
                } else {
                    OneSignal.getTags((receivedTags) => {
                        try {
                            if (receivedTags === null || receivedTags == undefined || (receivedTags.id && receivedTags.id !== userId)) {
                                OneSignal.sendTag("id", userId);
                            }
                            console.log(receivedTags);
                        } catch (e) {
                            if (__DEV__) {
                                alert(e)
                            }
                        }
                    });
                }
            }
        }catch (e){
            if(__DEV__){
                alert(e)
            }
        }
    };
}

//Global error handling
export const apiErrorHandler = (error) => {
    return (dispatch, getState) => {
        console.log("-----------Error-----------");
        console.log(error);
        if(error && typeof error === 'object' && error.message && error.message == AppConstant.cancelTokenError){
            return;
        }
        if(__DEV__){
            alert(JSON.stringify(error))
        }
        if(error && typeof error === 'object' && error.response){
            if(error.response && error.response.status){
                let errorCode = error.response.status;
                // if(error && error.response && error.response.status){
                //     if(error.response.data && error.response.data.errors && error.response.data.errors.length > 0 && error.response.data.errors[0]){
                //         messageFroServer = error.response.data.errors[0].toString();
                //     }
                // }
                switch (errorCode){
                    case 401:
                        //Authenticaltion error
                        EventRegister.emit('RedirectToLogin');
                        return;
                    case 403:
                        break;
                    case 500:
                    case 501:
                    case 502:
                    case 503:
                    case 504:
                    case 505:
                    case 506:
                    case 507:
                    case 508:
                    case 509:
                    case 510:
                    case 520:
                    case 521:
                    case 522:
                    case 523:
                    case 524:
                    case 525:
                    case 526:
                    case 527:
                    case 530:
                        showAPICallError({
                            title: "Uh oh",
                            message: "We’re fixing an issue with our server. Please try again in a little while." + "(Error " + errorCode + ")",
                            leftBtn: "OK"});
//                        Alert.alert("Hmm something has gone wrong on our end. We should have this fixed soon.");
                        break;
                    default:
                        showAPICallError({
                            title: "Uh oh",
                            message: "We’re fixing an issue with our server. Please try again in a little while." + "(Error " + errorCode + ")",
                            //message: "Something has gone wrong on our end. We should have this fixed soon." + "(Error " + errorCode + ")",
                            leftBtn: "OK"});
                        break;
                }
            }
        }else{
            return checkForRechability().then(resStatus=>{
                if(resStatus === AppConstant.NOT_REACHABLE_BACKEND){
                    backendNotReachable();
                    return Promise.reject(error);
                }
            }).catch(errStatus=>{
                if(errStatus === AppConstant.NOT_REACHABLE){
                    if(getState().user.isConnected){
                        showServerNotReachable();
                    }else{
                        showNoInternetAlert();
                    }
                }
                return Promise.reject(error);
            })
        }
        return Promise.reject(error);
    };
};