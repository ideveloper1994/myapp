import {
    TEAM_DETAIL,
    TEAM_MEMBER_ARRAY,
    TEAM_CHAT_MESSAGE_ARRAY,
    INDIVIDUAL_LEADER_BOARD,
    USER_USERNAME_EDIT,
    TEAM_LEADER_BOARD,
    TEAM_ACHIEVEMENT_DETAILS,
    TEAM_CHAT_PAGINATION,
    ENCOURAGE_POPUP,
    TEAM_ACHIEVEMENTES,
    TEAM_ACHIEVEMENTES_PAGINATION,
    TEAM_CHAT_DISPLAY_LIST, CONGRATULATE_POPUP,
    TEAM_MEMBER_EVENT_DETAILS,
    TEAM__MEMBER_EVENT_PAGINATION_DETAILS,
    MEMBER_DETAIL,
    USER_EVENT_DETAILS,
    USER_EVENT_PAGINATION_DETAILS, GLOBAL_STATISCTIC, SEEN_USER_EVENTS, APP_BADGE_COUNT, EVENT_BADGE_COUNT,
    START_EVENT_VIEWS,
    SET_CURRENT_USER_DATA
} from './types'
import {CallApi} from '../services/apiCall';
import Constant from '../services/apiConstant';
import {find, filter, groupBy, indexOf, cloneDeep, sortBy, uniqBy, remove, flatMap, max} from 'lodash';
import {apiErrorHandler, manageAppBadgeCount, updateUserDetail} from "./userActions";
import AppConstant from '../helper/constant';
import {AsyncStorage, PushNotificationIOS} from 'react-native';
import {calculatePornDay} from "./statisticAction";
import moment from 'moment';

export const getTeamDetail = () => {
    return (dispatch, getState) => {
        return CallApi(Constant.baseUrlV2 + Constant.getTeamDetail, 'get', {}, {"Authorization": "Bearer " + getState().user.token})
            .then((response) => {
                let members = response.data.members;
                // members.sort(compare);
                try {
                    members = sortBy(members, ['porn_free_days.total']).reverse();
                } catch (e) {
                    members = response.data.members;
                }
                let maxVal = members[0].porn_free_days.total;
                members.map(obj => {
                    obj.progressVal = parseInt((obj.porn_free_days.total / maxVal) * 100) + "%";
                    if (obj.is_current_user) {
                        dispatch({
                            type: USER_USERNAME_EDIT,
                            payload: (obj.name) ? obj.name : "Unknown"
                        });
                        obj.name = (obj.name) ? "You (" + obj.name + ")" : "You (null)";
                        obj.porn_free_days.longest_streak = getState().statistic.pornDetail.best_p_clean_days || 0;
                        obj.porn_free_days.current_streak = getState().statistic.pornDetail.current_p_clean_days || 0;
                    } else {
                        obj.name = (obj.name) ? obj.name : "null";
                    }
                    return obj;
                });
                const teamDetail = {
                    name: response.data.name,
                    rankings: response.data.ranking,
                    porn_free_days: response.data.porn_free_days,
                };
                if (JSON.stringify(getState().team.teamDetail) !== teamDetail) {
                    dispatch({
                        type: TEAM_DETAIL,
                        payload: teamDetail,
                    });
                }
                if (JSON.stringify(getState().team.memberArray) !== members) {
                    dispatch({
                        type: TEAM_MEMBER_ARRAY,
                        payload: members,
                    });
                }
                dispatch(
                    calculateTeamAchievements()
                );
            })
            .catch((error) => {
                // return Promise.reject(error);
                return dispatch(apiErrorHandler(error));
            })
    };
};

export const getTeamChat = (nextPageUrl = null, isBadgeCount = false) => {
    return (dispatch, getState) => {
        let apiUrl = Constant.baseUrlV2 + Constant.teamChatPagination;
        if (nextPageUrl) {
            apiUrl = nextPageUrl;
        }
        return CallApi(apiUrl, 'get', {}, {"Authorization": "Bearer " + getState().user.token})
            .then((response) => {
                //Managed Badge count
                if (!nextPageUrl) {
                    try {
                        if (response.data && response.data.length > 0) {
                            let lastMessageId = response.data[0].id.toString();
                            if (isBadgeCount) {
                                AsyncStorage.getItem("lastMessageId").then(res => {
                                    if (res) {
                                        AsyncStorage.setItem("lastMessageId", lastMessageId);
                                        let asyncLastMessageId = parseInt(res);
                                        let lastObj = find(response.data, {id: asyncLastMessageId});
                                        let indexOfLast = response.data.indexOf(lastObj);
                                        let newMessages = response.data.slice(0, indexOfLast);
                                        let allOtherUsers = filter(newMessages, x => x.creator.is_current_user === false);
                                        let totalCount = getState().user.appBadgeCount + allOtherUsers.length;
                                        dispatch(manageAppBadgeCount(totalCount));
                                        if (AppConstant.isIOS) {
                                            PushNotificationIOS.setApplicationIconBadgeNumber(totalCount + getState().team.eventBadgeCount);
                                        }
                                    }
                                    AsyncStorage.setItem("lastMessageId", lastMessageId);
                                });
                            } else {
                                AsyncStorage.setItem("lastMessageId", lastMessageId);
                            }
                        }
                    } catch (e) {
                    }
                }
                let teamChat = getState().team.teamChatMessageArray || [];
                if (nextPageUrl) {
                    teamChat = teamChat.concat(response.data);
                } else {
                    teamChat = response.data;
                }
                let obj = cloneDeep(response);
                delete obj['data'];
                teamChat = uniqBy(teamChat, 'id');
                teamChat = sortBy(teamChat, obj => obj.id);


                if (nextPageUrl) {
                    let nextUrl = getState().team.teamAchievementsPagination;
                    if (nextUrl.next_page_url) {
                        dispatch(getTeamAchievements(nextUrl.next_page_url, teamChat));
                    } else {
                        if (obj.next_page_url) {
                            dispatch(combineTeamChatAndAchievements(teamChat, getState().team.teamAchievements, true, false));
                        } else {
                            dispatch(combineTeamChatAndAchievements(teamChat, getState().team.teamAchievements, false, false));
                        }
                    }
                } else {
                    dispatch(getTeamAchievements(null, teamChat));
                }
                return Promise.all([
                    dispatch({
                        type: TEAM_CHAT_MESSAGE_ARRAY,
                        payload: teamChat.reverse(),
                    }),
                    dispatch({
                        type: TEAM_CHAT_PAGINATION,
                        payload: obj
                    }),
                ]).then(res => {
                    return Promise.resolve(true);
                });
            })
            .catch((error) => {
                return dispatch(apiErrorHandler(error));
            })
    };
};

export const getTeamAchievements = (nextPageUrl = null, teamChat = [], noMoreChat = false) => {
    return (dispatch, getState) => {
        let apiUrl = Constant.baseUrlV2 + Constant.teamAchievements;
        if (nextPageUrl) {
            apiUrl = nextPageUrl;
        }
        return CallApi(apiUrl, 'get', {}, {"Authorization": "Bearer " + getState().user.token})
            .then((response) => {
                let teamAchiements = getState().team.teamAchievements || [];
                if (nextPageUrl) {
                    teamAchiements = teamAchiements.concat(response.data);
                } else {
                    teamAchiements = response.data;
                }
                teamAchiements = uniqBy(teamAchiements, 'id');
                let obj = cloneDeep(response);
                delete obj['data'];

                if (noMoreChat) {
                    let teamChatList = getState().team.teamChatMessageArray || [];
                    if (obj.next_page_url) {
                        dispatch(combineTeamChatAndAchievements(teamChatList, teamAchiements, false, true));
                    } else {
                        dispatch(combineTeamChatAndAchievements(teamChatList, teamAchiements, false, false));
                    }
                } else {
                    let teamChatPagination = getState().team.teamChatPagination;
                    let isNextTeamchatPage = (teamChatPagination.next_page_url != null);
                    let isNextAchievementsPage = (obj.next_page_url != null);
                    dispatch(combineTeamChatAndAchievements(teamChat, teamAchiements, isNextTeamchatPage, isNextAchievementsPage));
                }
                dispatch({
                    type: TEAM_ACHIEVEMENTES,
                    payload: teamAchiements,
                });
                dispatch({
                    type: TEAM_ACHIEVEMENTES_PAGINATION,
                    payload: obj
                })
                return Promise.resolve(true);
                // });
            })
            .catch((error) => {
                return dispatch(apiErrorHandler(error));
            })
    };
};

export const combineTeamChatAndAchievements = (teamChatList, achievements, teamChatHasNextUrl, teamAchievementsHasNextUrl) => {
    return (dispatch, getState) => {
        try {
            let teamChat = teamChatList;
            teamChat = sortBy(teamChat, obj => obj.id);
            achievements = filter(achievements, {type: 'streak'});
            achievements = sortBy(achievements, function (o) {
                return new moment(o.occurred_at);
            });
            let newList = [];
            newList = newList.concat(teamChat);
            newList = newList.concat(achievements);
            newList = sortBy(newList, function (o) {
                return new moment(o.occurred_at);
            });
            let teamchatDate = teamChat[0] || undefined;
            let achievementDate = achievements[0] || undefined;
            if (teamChatHasNextUrl || teamAchievementsHasNextUrl) {
                if (teamchatDate != undefined && achievementDate != undefined) {
                    let isTeamChatMax = false;
                    let maxDateToDisplay = moment();
                    if (moment(teamchatDate.occurred_at).toDate() > moment(achievementDate.occurred_at).toDate()) {
                        isTeamChatMax = true;
                        maxDateToDisplay = moment(teamchatDate.occurred_at);
                    } else {
                        maxDateToDisplay = moment(achievementDate.occurred_at);
                    }
                    remove(newList, item => (!moment(item.occurred_at).isSame(maxDateToDisplay))
                        ? moment(item.occurred_at).isBefore(maxDateToDisplay) : true);
                }
            }
            newList.map((team, index) => {
                let nextIndex = index + 1;
                team.isShowUser = false;
                if (newList.length > nextIndex) {
                    let nextMessage = newList[nextIndex];
                    if (nextMessage.type) {
                        team.isShowUser = true;
                    } else if (team.creator && team.creator.id !== nextMessage.creator.id) {
                        team.isShowUser = true;
                    }
                }
            });
            newList = newList.reverse();
            dispatch({
                type: TEAM_CHAT_DISPLAY_LIST,
                payload: newList
            })
        } catch (e) {
            if (__DEV__) {
                alert(e)
            }
        }
    }
};

export const addTeamChat = (objMessage, messageType = "", achievementObjID = 0) => {
    return (dispatch, getState) => {
        return CallApi(Constant.baseUrlV2 + Constant.teamChatPagination, 'post', objMessage,
            {"Authorization": "Bearer " + getState().user.token})
            .then((response) => {
                if (messageType == "Encourage") {
                    let encourageDetail = cloneDeep(getState().user.encouragePopup.encourageDetail);
                    let obj = find(encourageDetail, {id: objMessage.recipient_user_id});
                    if (obj) {
                        let indexOfMessage = encourageDetail.indexOf(obj)
                        if (indexOfMessage >= 0) {
                            encourageDetail.splice(indexOfMessage, 1);
                        }
                    }
                    encourageDetail.push({
                        id: objMessage.recipient_user_id,
                        dateTime: response.data.data.occurred_at
                    });
                    dispatch({
                        type: ENCOURAGE_POPUP,
                        payload: {
                            isShow: false,
                            default: getState().user.encouragePopup.detail,
                            encourageDetail: encourageDetail
                        }
                    });
                } else if (messageType == "Congratulate") {
                    let congratulateDetails = cloneDeep(getState().user.congratulatePopup);
                    let obj = find(congratulateDetails.congratulateDetail, {id: achievementObjID});
                    if (obj == undefined) {
                        congratulateDetails.congratulateDetail.push({
                            dateTime: response.data.data.occurred_at,
                            id: achievementObjID
                        });
                        dispatch({
                            type: CONGRATULATE_POPUP,
                            payload: congratulateDetails
                        });
                    }
                }
                let chatDetail = getState().team.teamChatMessageArray;
                chatDetail.splice(0, 0, response.data.data);
                // let teamAchiements = getState().team.teamAchievements || [];
                // dispatch(combineTeamChatAndAchievements(chatDetail,teamAchiements));
                let teamChatDisplayList = cloneDeep(getState().team.teamChatDisplayList) || [];
                teamChatDisplayList.splice(0, 0, response.data.data);
                dispatch({
                    type: TEAM_CHAT_DISPLAY_LIST,
                    payload: teamChatDisplayList
                })

                dispatch({
                    type: TEAM_CHAT_MESSAGE_ARRAY,
                    payload: chatDetail,
                });
                return Promise.resolve(response);
            })
            .catch((error) => {
                // return Promise.reject(error);
                return dispatch(apiErrorHandler(error));
            })
    };
};

function compare(a, b) {
    const genreA = (a.porn_free_days.total != undefined) && a.porn_free_days.total || a.porn_free_days.counts.total;
    const genreB = (b.porn_free_days.total != undefined) && b.porn_free_days.total || b.porn_free_days.counts.total;
    let comparison = 0;
    if (genreA < genreB) {
        comparison = 1;
    } else if (genreA > genreB) {
        comparison = -1;
    }
    return comparison;
}

//Leader board
export const getleaderboardIndividualList = (isFromLogin = false) => {
    return (dispatch, getState) => {
        return CallApi(Constant.baseUrl + Constant.leaderBoardIndividual, 'get', {}, {"Authorization": "Bearer " + getState().user.token})
            .then((response) => {
                if (!isFromLogin) {
                    //dispatch(getLeaderBoardIndividualPornFreeDays());
                    dispatch(getLeaderBoardIndividualCurrentStreak());
                    dispatch(getLeaderBoardIndividualBestStreak());
                    dispatch(getLeaderBoardIndividualYear());
                    dispatch(getLeaderBoardIndividualMonth());
                    dispatch(getLeaderBoardIndividualWeek());
                    dispatch(getLeaderBoardIndividualAmerica());
                    dispatch(getLeaderBoardIndividualAsia());
                    dispatch(getLeaderBoardIndividualEurope());
                    dispatch(getLeaderBoardIndividualPacific());
                }
                dispatch({
                    type: INDIVIDUAL_LEADER_BOARD,
                    payload: {
                        key: "overall",
                        values: response.data.users
                    }
                });
                return Promise.resolve()
            }).catch((err) => {
                // return Promise.reject(err);
                return dispatch(apiErrorHandler(err));
            })
    }
};

export const getLeaderBoardIndividualFilterData = (stateLabel) => {
    return (dispatch, getState) => {
        switch (stateLabel) {
            case "Overall":
                return dispatch(getleaderboardIndividualList(true))
            case "This year":
                return dispatch(getLeaderBoardIndividualYear())
            case "This month":
                return dispatch(getLeaderBoardIndividualMonth())
            case "This week":
                return dispatch(getLeaderBoardIndividualWeek())
            case "America":
                return dispatch(getLeaderBoardIndividualAmerica())
            case "Europe":
                return dispatch(getLeaderBoardIndividualEurope())
            case "Asia":
                return dispatch(getLeaderBoardIndividualAsia())
            case "Pacific":
                return dispatch(getLeaderBoardIndividualPacific())
        }
    }
}

export const getLeaderBoardIndividualYear = () => {
    return (dispatch, getState) => {
        return CallApi(Constant.baseUrl + Constant.leaderBoardIndividualYear, 'get', {}, {"Authorization": "Bearer " + getState().user.token})
            .then((response) => {
                dispatch({
                    type: INDIVIDUAL_LEADER_BOARD,
                    payload: {
                        key: "year",
                        values: response.data.users
                    }
                });
                return Promise.resolve()
            }).catch((err) => {
                // return Promise.reject(err);
                return dispatch(apiErrorHandler(err));
            })
    }
};

export const getLeaderBoardIndividualMonth = () => {
    return (dispatch, getState) => {
        return CallApi(Constant.baseUrl + Constant.leaderBoardIndividualMonth, 'get', {}, {"Authorization": "Bearer " + getState().user.token})
            .then((response) => {
                dispatch({
                    type: INDIVIDUAL_LEADER_BOARD,
                    payload: {
                        key: "month",
                        values: response.data.users
                    }
                });
                return Promise.resolve()
            }).catch((err) => {
                // return Promise.reject(err);
                return dispatch(apiErrorHandler(err));
            })
    }
};

export const getLeaderBoardIndividualWeek = () => {
    return (dispatch, getState) => {
        return CallApi(Constant.baseUrl + Constant.leaderBoardIndividualWeek, 'get', {}, {"Authorization": "Bearer " + getState().user.token})
            .then((response) => {
                dispatch({
                    type: INDIVIDUAL_LEADER_BOARD,
                    payload: {
                        key: "week",
                        values: response.data.users
                    }
                });
                return Promise.resolve()
            }).catch((err) => {
                // return Promise.reject(err);
                return dispatch(apiErrorHandler(err));
            })
    }
};

export const getLeaderBoardIndividualBestStreak = () => {
    return (dispatch, getState) => {
        return CallApi(Constant.baseUrl + Constant.leaderBoardIndividualBestStreak, 'get', {}, {"Authorization": "Bearer " + getState().user.token})
            .then((response) => {
                return dispatch({
                    type: INDIVIDUAL_LEADER_BOARD,
                    payload: {
                        key: "bestStreak",
                        values: response.data.users
                    }
                });
            }).catch((err) => {
                // return Promise.reject(err);
                return dispatch(apiErrorHandler(err));
            })
    }
};

export const getLeaderBoardIndividualCurrentStreak = () => {
    return (dispatch, getState) => {
        return CallApi(Constant.baseUrl + Constant.leaderBoardIndividualCurrentStreak, 'get', {}, {"Authorization": "Bearer " + getState().user.token})
            .then((response) => {
                return dispatch({
                    type: INDIVIDUAL_LEADER_BOARD,
                    payload: {
                        key: "currentStreak",
                        values: response.data.users
                    }
                });
            }).catch((err) => {
                // return Promise.reject(err);
                return dispatch(apiErrorHandler(err));
            })
    }
};

export const getLeaderBoardIndividualAmerica = () => {
    return (dispatch, getState) => {
        return CallApi(Constant.baseUrl + Constant.leaderBoardIndividualAmerica, 'get', {}, {"Authorization": "Bearer " + getState().user.token})
            .then((response) => {
                dispatch({
                    type: INDIVIDUAL_LEADER_BOARD,
                    payload: {
                        key: "america",
                        values: response.data.users
                    }
                });
                return Promise.resolve()

            }).catch((err) => {
                // return Promise.reject(err);
                return dispatch(apiErrorHandler(err));
            })
    }
};

export const getLeaderBoardIndividualAsia = () => {
    return (dispatch, getState) => {
        return CallApi(Constant.baseUrl + Constant.leaderBoardIndividualAsia, 'get', {}, {"Authorization": "Bearer " + getState().user.token})
            .then((response) => {
                dispatch({
                    type: INDIVIDUAL_LEADER_BOARD,
                    payload: {
                        key: "asia",
                        values: response.data.users
                    }
                });
                return Promise.resolve()

            }).catch((err) => {
                return Promise.reject(err);
            })
    }
};

export const getLeaderBoardIndividualEurope = () => {
    return (dispatch, getState) => {
        return CallApi(Constant.baseUrl + Constant.leaderBoardIndividualEurope, 'get', {}, {"Authorization": "Bearer " + getState().user.token})
            .then((response) => {
                dispatch({
                    type: INDIVIDUAL_LEADER_BOARD,
                    payload: {
                        key: "europe",
                        values: response.data.users
                    }
                });
                return Promise.resolve()

            }).catch((err) => {
                // return Promise.reject(err);
                return dispatch(apiErrorHandler(err));
            })
    }
};

export const getLeaderBoardIndividualPacific = () => {
    return (dispatch, getState) => {
        return CallApi(Constant.baseUrl + Constant.leaderBoardIndividualPacific, 'get', {}, {"Authorization": "Bearer " + getState().user.token})
            .then((response) => {
                dispatch({
                    type: INDIVIDUAL_LEADER_BOARD,
                    payload: {
                        key: "pacific",
                        values: response.data.users
                    }
                });
                return Promise.resolve()

            }).catch((err) => {
                return Promise.reject(err);
            })
    }
};

export const getleaderboardTeamList = (isFromLogin = false) => {
    return (dispatch, getState) => {
        return CallApi(Constant.baseUrl + Constant.leaderBoardTeam, 'get', {}, {"Authorization": "Bearer " + getState().user.token})
            .then((response) => {
                if (!isFromLogin) {
                    dispatch(getLeaderBoardTeamYear());
                    dispatch(getLeaderBoardTeamMonth());
                    dispatch(getLeaderBoardTeamWeek());
                }
                dispatch({
                    type: TEAM_LEADER_BOARD,
                    payload: {
                        key: "overall",
                        values: response.data.teams
                    }
                });
                return Promise.resolve()
            }).catch((err) => {
                // return Promise.reject(err);
                return dispatch(apiErrorHandler(err));
            })
    }
};

export const getLeaderBoardTeamFilterData = (stateLabel) => {
    return (dispatch, getState) => {
        switch (stateLabel) {
            case "Overall":
                return dispatch(getleaderboardTeamList(true))
            case "This year":
                return dispatch(getLeaderBoardTeamYear())
            case "This month":
                return dispatch(getLeaderBoardTeamMonth())
            case "This week":
                return dispatch(getLeaderBoardTeamWeek())
        }
    }
};

export const getLeaderBoardTeamYear = () => {
    return (dispatch, getState) => {
        return CallApi(Constant.baseUrl + Constant.leaderBoardTeamYear, 'get', {}, {"Authorization": "Bearer " + getState().user.token})
            .then((response) => {
                dispatch({
                    type: TEAM_LEADER_BOARD,
                    payload: {
                        key: "year",
                        values: response.data.teams
                    }
                });
                return Promise.resolve()
            }).catch((err) => {
                // return Promise.reject(err);
                return dispatch(apiErrorHandler(err));
            })
    }
};

export const getLeaderBoardTeamMonth = () => {
    return (dispatch, getState) => {
        return CallApi(Constant.baseUrl + Constant.leaderBoardTeamMonth, 'get', {}, {"Authorization": "Bearer " + getState().user.token})
            .then((response) => {
                dispatch({
                    type: TEAM_LEADER_BOARD,
                    payload: {
                        key: "month",
                        values: response.data.teams
                    }
                });
                return Promise.resolve()

            }).catch((err) => {
                // return Promise.reject(err);
                return dispatch(apiErrorHandler(err));
            })
    }
};

export const getLeaderBoardTeamWeek = () => {
    return (dispatch, getState) => {
        return CallApi(Constant.baseUrl + Constant.leaderBoardTeamWeek, 'get', {}, {"Authorization": "Bearer " + getState().user.token})
            .then((response) => {
                dispatch({
                    type: TEAM_LEADER_BOARD,
                    payload: {
                        key: "week",
                        values: response.data.teams
                    }
                });
                return Promise.resolve()
            }).catch((err) => {
                // return Promise.reject(err);
                return dispatch(apiErrorHandler(err));
            })
    }
};

export const calculateTeamAchievements = () => {
    return (dispatch, getState) => {
        let teamCleanDay = 0;

        let data = getState().team.teamDetail.porn_free_days || null;
        if (data) {
            if('counts' in data){
                teamCleanDay = data.counts.total || 0;
            }else{
                teamCleanDay = data.total || 0;
            }
        }
        let teamAchievements = [
            {icon: "B", val: "10"},
            {icon: "B", val: "30"},
            {icon: "B", val: "50"},
            {icon: "B", val: "100"},
            {icon: "B", val: "180"},
            {icon: "B", val: "365"},
            {icon: "B", val: "500"},
            {icon: "B", val: "1000"},
        ];

        let caseVal = -1;
        if (teamCleanDay > 1000) {
            caseVal = 7;
        } else if (teamCleanDay > 500) {
            caseVal = 6;
        } else if (teamCleanDay > 365) {
            caseVal = 5;
        } else if (teamCleanDay > 180) {
            caseVal = 4;
        } else if (teamCleanDay > 100) {
            caseVal = 3;
        } else if (teamCleanDay > 50) {
            caseVal = 2;
        } else if (teamCleanDay > 30) {
            caseVal = 1;
        } else if (teamCleanDay > 10) {
            caseVal = 0;
        }
        for (let i = 0; i <= caseVal; i++) {
            teamAchievements[i]["icon"] = "Y";
        }
        if (JSON.stringify(getState().team.teamAchievementDetail) !== teamAchievements) {
            dispatch({
                type: TEAM_ACHIEVEMENT_DETAILS,
                payload: teamAchievements
            });
        }

        return Promise.resolve({
            teamAchievements
        });
    }
};

//Mutes Team Member
export const muteTeamMember = (userId) => {
    return (dispatch, getState) => {
        let muteUrl = Constant.baseUrlV2 + Constant.users + userId + "/" + Constant.mute;
        return CallApi(muteUrl, 'post', {},
            {"Authorization": "Bearer " + getState().user.token})
            .then((response) => {
                let teamData = getState().team.memberArray;
                let obj = find(teamData, {id: userId});
                let indexOfMember = teamData.indexOf(obj);
                teamData[indexOfMember].current_user_has_muted = true;
                dispatch({
                    type: TEAM_MEMBER_ARRAY,
                    payload: cloneDeep(teamData),
                });
                //return dispatch(getTeamDetail())
                return Promise.resolve(response)
            }).catch((err) => {
                // return Promise.reject(err);
                return dispatch(apiErrorHandler(err));
            })
    }
};

//UnMute Team Member
export const unMuteTeamMember = (userId) => {
    return (dispatch, getState) => {
        let muteUrl = Constant.baseUrlV2 + Constant.users + userId + "/" + Constant.mute;
        return CallApi(muteUrl, 'delete', {}, {"Authorization": "Bearer " + getState().user.token})
            .then((response) => {
                let teamData = getState().team.memberArray;
                let obj = find(teamData, {id: userId});
                let indexOfMember = teamData.indexOf(obj);
                teamData[indexOfMember].current_user_has_muted = false;
                dispatch({
                    type: TEAM_MEMBER_ARRAY,
                    payload: cloneDeep(teamData),
                });
                //return dispatch(getTeamDetail())
                return Promise.resolve(response);
            }).catch((err) => {
                // return Promise.reject(err);
                return dispatch(apiErrorHandler(err));
            })
    }
};

//Get User Events
export const getEventsDetails = (userId, nextPageUrl = null, isCurrentUser = true, isFromNotification = false, postId = null) => {
    return (dispatch, getState) => {
        let url = null;
        if (nextPageUrl) {
            url = nextPageUrl;
        } else if (userId != '' && userId != 0) {
            url = Constant.baseUrlV2 + Constant.users + userId + Constant.events;
        }

        if (url) {
            return CallApi(url, 'get', {}, {"Authorization": "Bearer " + getState().user.token})
                .then((response) => {
                    if (isCurrentUser) {
                        let teamMemeberEvent = [];
                        if (nextPageUrl) {
                            teamMemeberEvent = getState().team.userEventList.concat(response.data);
                        } else {
                            teamMemeberEvent = response.data;
                        }
                        let obj = cloneDeep(response);
                        delete obj['data'];
                        teamMemeberEvent = uniqBy(teamMemeberEvent, 'id');
                        // teamMemeberEvent = sortBy(teamMemeberEvent, obj => obj.id).reverse();
                        //From which activity need to managed dots}
                        let startEventViews = getState().team.startEventViews;
                        if (startEventViews == null) {
                            let allId = flatMap(teamMemeberEvent, obj => obj.id);
                            let maxId = max(allId);
                            dispatch({
                                type: SEEN_USER_EVENTS,
                                payload: allId,
                            })
                            if (response.data && response.data.length > 0) {
                                dispatch({
                                    type: START_EVENT_VIEWS,
                                    payload: maxId
                                })
                            } else {
                                dispatch({
                                    type: START_EVENT_VIEWS,
                                    payload: 0
                                })
                            }
                        }
                        try {
                            if (response.data && response.data.length > 0) {
                                let lastEventId = teamMemeberEvent[0].id.toString();
                                AsyncStorage.getItem("lastEventId").then(res => {
                                    if (res) {
                                        if (startEventViews != null) {
                                            let asyncLasEventId = parseInt(res);
                                            if (lastEventId != asyncLasEventId) {
                                                let newObjects = filter(teamMemeberEvent, obj => obj.id > asyncLasEventId);
                                                let allOtherUsersEvents = filter(newObjects, x => x.user.id !== userId);
                                                let currentUserEvents = filter(newObjects, x => x.user.id == userId);
                                                if(currentUserEvents.length > 0){
                                                    let seenUserEvents = getState().team.seenUserEvents;
                                                    let userEventIds = flatMap(currentUserEvents, obj => obj.id);
                                                    dispatch({
                                                        type: SEEN_USER_EVENTS,
                                                        payload: seenUserEvents.concat(userEventIds),
                                                    });
                                                }
                                                let totalCount = getState().team.eventBadgeCount + allOtherUsersEvents.length;
                                                if (AppConstant.isIOS) {
                                                    PushNotificationIOS.setApplicationIconBadgeNumber(totalCount + getState().user.appBadgeCount);
                                                }
                                                if (totalCount >= 0) {
                                                    dispatch(manageActivityEventBadgeCount(totalCount));
                                                } else {
                                                    dispatch(manageActivityEventBadgeCount(0));
                                                }
                                            }
                                        }
                                    }
                                    AsyncStorage.setItem("lastEventId", lastEventId);
                                });
                            }
                        } catch (e) {
                        }

                        if (postId) {
                            // let mainId = filter(response.data,x=>x.entity.id == postId);
                            // if(mainId.length > 0 && mainId[0]['id']){
                            //     dispatch(manageSeenEvents(mainId[0]['id']));
                            //     dispatch(manageActivityEventBadgeCount(0));
                            // }
                        }
                        dispatch({
                            type: USER_EVENT_DETAILS,
                            payload: teamMemeberEvent,
                        });
                        dispatch({
                            type: USER_EVENT_PAGINATION_DETAILS,
                            payload: obj
                        });
                    } else {
                        let teamMemeberEvent = [];
                        if (nextPageUrl) {
                            teamMemeberEvent = getState().team.teamMemberEventList.concat(response.data);
                        } else {
                            teamMemeberEvent = response.data;
                        }
                        let obj = cloneDeep(response);
                        delete obj['data'];
                        teamMemeberEvent = uniqBy(teamMemeberEvent, 'id');
                        teamMemeberEvent = sortBy(teamMemeberEvent, obj => obj.id).reverse();
                        dispatch({
                            type: TEAM_MEMBER_EVENT_DETAILS,
                            payload: teamMemeberEvent,
                        });
                        dispatch({
                            type: TEAM__MEMBER_EVENT_PAGINATION_DETAILS,
                            payload: obj
                        });
                    }
                    return Promise.resolve(true)
                })
                .catch((error) => {
                    return dispatch(apiErrorHandler(error));
                })
        }
        return;
    };
};

//Get User Events
export const getMemberDetail = (memberId, isCurrentUser = true) => {
    return (dispatch, getState) => {
        dispatch({
            type: MEMBER_DETAIL,
            payload: null,
        })
        dispatch({
            type: TEAM_MEMBER_EVENT_DETAILS,
            payload: [],
        })
        dispatch({
            type: TEAM__MEMBER_EVENT_PAGINATION_DETAILS,
            payload: null,
        });
        let url = Constant.baseUrlV2 + Constant.users + memberId;
        return CallApi(url, 'get', {}, {"Authorization": "Bearer " + getState().user.token})
            .then((response) => {
                if(isCurrentUser){
                    dispatch({
                        type: SET_CURRENT_USER_DATA,
                        payload: response.data
                    });
                }
                dispatch({
                    type: MEMBER_DETAIL,
                    payload: response.data,
                });
                return Promise.resolve(true)
            })
            .catch((error) => {
                return dispatch(apiErrorHandler(error));
            })
    };
};

//Get User Events
export const updateUserDetails = (bioData) => {
    return (dispatch, getState) => {
        let userDetail = getState().user.userDetails;
        userDetail.biography = bioData;
        let memberDetail = getState().team.memberDetail;
        memberDetail.biography = bioData;
        dispatch({
            type: MEMBER_DETAIL,
            payload: memberDetail,
        })
        return dispatch(updateUserDetail(userDetail));
    };
};

//Get User Events
export const manageSeenEvents = (id) => {
    return (dispatch, getState) => {
        let seenUserEvents = getState().team.seenUserEvents;
        if (seenUserEvents.indexOf(id) < 0) {
            seenUserEvents.push(id)
        }
        return dispatch({
            type: SEEN_USER_EVENTS,
            payload: cloneDeep(seenUserEvents),
        })
    };
};


//Manage Activity Event badge count
export const manageActivityEventBadgeCount = (count) => {
    return (dispatch, getState) => {
        return dispatch({
            type: EVENT_BADGE_COUNT,
            payload: cloneDeep(count)
        });
    }
};

//Global statisctic
export const getGlobalStatistic = () => {
    return (dispatch, getState) => {
        let callUrl = Constant.baseUrlV2 + Constant.globals;
        return CallApi(callUrl, 'get', {}, {"Authorization": "Bearer " + getState().user.token})
            .then((response) => {
                dispatch({
                    type: GLOBAL_STATISCTIC,
                    payload: response.data,
                });
                return Promise.resolve(response);
            }).catch((err) => {
                // return Promise.reject(err);
                return dispatch(apiErrorHandler(err));
            })
    }
};

//Managed from which activty need to start views
export const manageStartEventViews = (activityId) => {
    return (dispatch, getState) => {
        return dispatch({
            type: START_EVENT_VIEWS,
            payload: activityId
        });
    }
};
