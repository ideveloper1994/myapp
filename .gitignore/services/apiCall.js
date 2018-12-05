import axios from 'axios';
import {NetInfo} from "react-native";
import AppConstant from '../helper/constant';
import {EventRegister} from "react-native-event-listeners";

const source = axios.CancelToken.source();

const httpClient = axios.create();
httpClient.defaults.timeout = 10000;

export function CallApi(url, type = 'get', data = {}, header = {}) {
    console.log("API CALL - " + url + " TYPE- " + type)
    let reqHeader = Object.assign(header, {"Accept": "application/json", "Content-Type": "application/json"});
    if (type === 'get') {
        return httpClient.get(url,{headers: reqHeader,cancelToken: source.token})
            .then((response) => {
                console.log("Response - " + url + " TYPE- " + type)
                return Promise.resolve(response.data)
            })
            .catch((err) => {
                console.log("Error - " + url + " TYPE- " + type, err)
                return Promise.reject(err);
            });
    } else if (type === 'post') {
        return httpClient.post(url, data, {headers: reqHeader,cancelToken: source.token})
            .then((response) => {
                console.log("Response - " + url + " TYPE- " + type)
                return Promise.resolve(response)
            })
            .catch((err) => {
                console.log("Error - " + url + " TYPE- " + type, err)
                return Promise.reject(err);
            });
    } else if (type === 'delete') {
        return httpClient.delete(url, {headers: reqHeader,cancelToken: source.token})
            .then((response) => {
                console.log("Response - " + url + " TYPE- " + type)
                return Promise.resolve(response);
            })
            .catch((err) => {
                console.log("Error - " + url + " TYPE- " + type, err)
                return Promise.reject(err);
            });
    } else if (type === 'patch') {
        return httpClient.patch(url, data, {headers: reqHeader,cancelToken: source.token})
            .then((response) => {
                console.log("Response - " + url + " TYPE- " + type)
                return Promise.resolve(response)
            })
            .catch((err) => {
                console.log("Error - " + url + " TYPE- " + type, err)
                return Promise.reject(err);
            });
    }
}

export function checkAccessAvailable(url) {
    const httpClient1 = axios.create();
    httpClient1.defaults.timeout = 30000;
    return httpClient1.get('https://player.vimeo.com').then(res => {
        return Promise.resolve(true);
    }).catch(err => {
        return Promise.reject(false);
    })
}

export const checkForRechability = (isCheckBrainbuddy = true) => {
    return httpClient.get('https://go.brainbuddyapp.com',{cancelToken: source.token}).then(res => {
        // return httpClient.get('https://www.youtube.com/').then(res => {
        return Promise.resolve(AppConstant.REACHABLE);
    }).catch(error => {
        if(error && error.message && error.message == AppConstant.cancelTokenError){
            console.log(AppConstant.CANCEL_TOKEN);
            return Promise.resolve(AppConstant.CANCEL_TOKEN);
        }else{
            return httpClient.get('https://www.google.com',{cancelToken: source.token}).then(res => {
                //Rechability issue
                return Promise.resolve(AppConstant.NOT_REACHABLE_BACKEND);
            }).catch(error => {
                if(error && error.message && error.message == AppConstant.cancelTokenError){
                    console.log(AppConstant.CANCEL_TOKEN);
                    return Promise.resolve(AppConstant.CANCEL_TOKEN);
                }else{
                    return Promise.reject(AppConstant.NOT_REACHABLE);
                }
            })
        }
    })
}

export  function callAppGoesToBackground() {
    source.cancel(AppConstant.cancelTokenError);
}

export  function createNewTocken() {
    source = axios.CancelToken.source();
}
