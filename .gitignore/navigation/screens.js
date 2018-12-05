import Constant from '../helper/constant';

import entryPage from '../screens/entryView';

//Welcome Flow
import initialPage from '../screens/initialComponent';
import welcome from '../screens/account/welcome/welcome';
import login from '../screens/account/signIn/login';
import signUp from '../screens/account/signUp/signUp';
import welcomeBack from '../screens/account/welcome/welcomeBack';
import quiz from '../screens/account/welcome/quiz/quiz';
import assessmentComplete from '../screens/account/welcome/quizResult/assessmentComplete';
import result from '../screens/account/welcome/quizResult/result'
import symptomsDetail from '../screens/account/welcome/symptoms/symptomsDetail';
import symptoms from '../screens/account/welcome/symptoms/symptoms';
import symptomsList from '../screens/account/welcome/components/symptoms/symptomsList';
import stories from '../screens/account/welcome/story/stories';
import achievement from '../screens/account/welcome/quiz/achievement';
import getStarted from '../screens/account/welcome/getStarted/getStarted';
import completeSettingCheckup from '../screens/account/welcome/getDetail/completeSettingCheckup';
import showNotificationList from '../screens/account/welcome/getDetail/showNotificationList';
import introTour from '../screens/account/welcome/introTour/introTour';
import introSlider from '../screens/account/welcome/introSlider/introSlider';
import getPasscode from '../screens/account/welcome/passcode/passcode';
import beforeBeginDetails from '../screens/account/welcome/getDetail/beforeBeginDetails';
import beforeBeginLogin from '../screens/account/welcome/getDetail/beforeBeginLogin';
import beforeBeginToday from '../screens/account/welcome/getDetail/beforeBeginToday';

import TabbarView from './appTabbar';

//Today Views
import checkUp from '../screens/today/checkup/checkUp';
import checkUpComplete from '../screens/today/checkup/checkupComplete';

import completeMorningRoutine from '../screens/today/component/completeMorningRoutine';
import completeOptionalActivity from '../screens/today/component/completeOptionalActivity';
import aboutYouComplete from '../screens/today/exercises/aboutYou/aboutYouComplete';
import howDidUDo from '../screens/today/component/howDidUDo';

import healthyActivity from '../screens/today/exercises/healthyActivity/healthyActivity';
import didYouKnow from '../screens/today/exercises/didYouKnow/didYouKnow';
import storyDetail from '../screens/today/exercises/story/storyDetail';
import audioActivity from '../screens/today/exercises/audioExercise/audioPlayerActivity';
import visualizationActivity from '../screens/today/exercises/visualization/visulizationActivityNew';
import thoughtActivity from '../screens/today/exercises/thoughtControl/thoughtActivity';
import chooseYourPathActivity from '../screens/today/exercises/chooseYourPath/chooseYourPathActivity';
import breathingActivity from '../screens/today/exercises/breathingPractice/breathingActivity';
import kegalsActivity from '../screens/today/exercises/kegalsActivity/kegalsActivity';
import kegalsInstruction from '../screens/today/exercises/kegalsActivity/kegalsInstruction';
import stressRelief from '../screens/today/exercises/stressRelief/stressRelief';
import brainActivity from '../screens/today/exercises/brainTraining/brainTraining';
import exerciseInstruction from '../screens/today/component/exerices/instructionComponent';
import emotionalActivity from '../screens/today/exercises/emotionalGrowth/emotionalGrowthActivity';
import medicationActivity from '../screens/today/exercises/meditation/meditationActivity';
import aboutYouActivity from '../screens/today/exercises/aboutYou/aboutUserActivity';
import faithActivity from '../screens/today/exercises/faith/faithDetail';
import lettersToYourSelf from '../screens/today/exercises/letterToYourself/lettersToYourselfActivity';
import readLetter from '../screens/today/exercises/letterToYourself/readLetter';

import leaderboard from '../screens/tabs/team/component/leaderboard';

//Milestone
import postAdvice from '../screens/tabs/milestones/postAdvice';
import postAdviceCreate from '../screens/tabs/milestones/component/postAdvice/postAdviceCreate';
import postComment from '../screens/tabs/milestones/component/helpOthers/comment/addComment';
import adviceComment from '../screens/tabs/milestones/component/postAdvice/comment/addComment';
import newHelpPost from '../screens/tabs/milestones/component/helpOthers/comment/newHelpPost';

//More Tab

import feelingTempted from '../screens/tabs/more/component/feelingTempted/feelingTempted';

// import feelingTempted from '../screens/tabs/more/component/feelingTemptedOld/feelingTempted';
import feelingTemptedSlider from '../screens/tabs/more/component/feelingTemptedOld/subComponents/feelingTemptedSlider';
import meditationActivity from '../screens/tabs/more/component/feelingTemptedOld/meditationActivity';

import journalEntry from '../screens/tabs/more/component/journal/journalEntry';
import journalCompose from '../screens/tabs/more/component/journal/journalCompose';

import lifeTree from '../screens/tabs/more/component/lifeTree/lifeTree';

import savedAdvice from '../screens/tabs/more/component/advice/savedAdvice';

import completedAudioExercises from '../screens/tabs/more/component/audioExercises/completedAudioExercises';
import settingAudioActivity from '../screens/tabs/more/component/audioExercises/audioActivity';

import moreSettings from '../screens/tabs/more/component/settings/settings';

import settingMotivation from '../screens/tabs/more/component/settings/subComponents/settingMotivation'
import settingProfile from '../screens/tabs/more/component/settings/subComponents/settingProfile'
import editStreaks from '../screens/tabs/more/component/settings/subComponents/editStreaks'
import recommendedExercises from '../screens/tabs/more/component/settings/subComponents/recommendedExercises'
import optionalExercises from '../screens/tabs/more/component/settings/subComponents/optionalExercises'
import checkupTime from '../screens/tabs/more/component/settings/subComponents/checkupTime'
import meditationTime from '../screens/tabs/more/component/settings/subComponents/meditationTime'
import notifications from '../screens/tabs/more/component/settings/subComponents/notifications'
import helpFAQ from '../screens/tabs/more/component/settings/subComponents/helpFAQ/helpFAQ'
import contactUs from '../screens/tabs/more/component/settings/subComponents/contactUs'
import diagnostics from '../screens/tabs/more/component/settings/subComponents/diagnostics'
import reset from '../screens/tabs/more/component/settings/subComponents/reset'
import privacyPolicy from '../screens/tabs/more/component/settings/subComponents/privacyPolicy'
import subscriptionDetail from '../screens/tabs/more/component/settings/subComponents/subscriptionDetail'
import termsOfUse from '../screens/tabs/more/component/settings/subComponents/termsOfUse'
import changeAvatarImage from '../screens/tabs/more/component/settings/subComponents/changeAvatarImage'

import editPornCalendar from '../screens/tabs/more/component/settings/subComponents/editCalender/subComponents/pornCalender';
import editMasturbationCalendar from '../screens/tabs/more/component/settings/subComponents/editCalender/subComponents/masturbationCalender';
import enterPin from '../screens/tabs/more/component/settings/subComponents/enterPin';
import enterDiagnosticsPin from '../screens/tabs/more/component/settings/subComponents/enterDiagnosticsPin';

import muteTeamMemberNotification from '../screens/tabs/more/component/settings/subComponents/notification/muteTeamMember';
import doNotDisturbNotification from '../screens/tabs/more/component/settings/subComponents/notification/doNotDisturb';

import internetFilter from './../screens/tabs/more/component/settings/subComponents/internetFilter/internetFilter';
import blockDuration from './../screens/tabs/more/component/settings/subComponents/internetFilter/blockduration';
import addWebsite from './../screens/tabs/more/component/settings/subComponents/internetFilter/addWebsite';
import addKeyword from './../screens/tabs/more/component/settings/subComponents/internetFilter/addKeyword';
import blockAdultWebSite from './../screens/tabs/more/component/settings/subComponents/internetFilter/blockAdultWebSite';

import filterDetail from './../screens/tabs/more/component/settings/subComponents/internetFilter/detailList';
import accountData from '../screens/tabs/more/component/settings/subComponents/accountData/accountData';
import viewUserDetails from '../screens/tabs/more/component/settings/subComponents/accountData/viewUserDetails';

//Community Profile
import communityProfile from '../screens/tabs/communityProfile/communityProfile';
import manageBiography from '../screens/tabs/communityProfile/addBiography';

const disableNavigationOptions = {
    gesturesEnabled: false,
    shadowRadius: 0,
    gestureResponseDistance:{
        horizontal: 0,
        vertical: 0
    },
}
const cardNavigationOptions = {
    gesturesEnabled: true,
    shadowRadius: 0,
    gestureResponseDistance:{
        horizontal: Constant.isIOS && Constant.screenWidth/2 || 0,
    },
}
const modalNavigationOptions = {
    gesturesEnabled: true,
    shadowRadius: 0,
}

import TeamStackNavigator from '../screens/tabs/team/showTeam';

export const screens = {
    entryPage: {
        screen: entryPage,
        navigationOptions: disableNavigationOptions
    },
    initialPage: {
        screen: initialPage,
        navigationOptions: disableNavigationOptions
    },
    welcome: {
        screen: welcome,
        navigationOptions: disableNavigationOptions
    },
    login: {
        screen: login,
        navigationOptions: disableNavigationOptions
    },
    signUp: {
        screen: signUp,
        navigationOptions: disableNavigationOptions
    },
    welcomeBack: {
        screen: welcomeBack,
        navigationOptions: disableNavigationOptions
    },
    quiz: {
        screen: quiz,
        navigationOptions: disableNavigationOptions
    },
    assessmentComplete: {
        screen: assessmentComplete,
        navigationOptions: disableNavigationOptions
    },
    result: {
        screen: result,
        navigationOptions: disableNavigationOptions
    },
    symptomsDetail: {
        screen: symptomsDetail,
        navigationOptions: disableNavigationOptions
    },
    symptoms: {
        screen: symptoms,
        navigationOptions: disableNavigationOptions
    },
    symptomsList: {
        screen: symptomsList,
        navigationOptions: disableNavigationOptions
    },
    stories: {
        screen: stories,
        navigationOptions: disableNavigationOptions
    },
    achievement: {
        screen: achievement,
        navigationOptions: disableNavigationOptions
    },
    getStarted: {
        screen: getStarted,
        navigationOptions: disableNavigationOptions
    },
    completeSettingCheckup: {
        screen: completeSettingCheckup,
        navigationOptions: disableNavigationOptions
    },
    showNotificationList: {
        screen: showNotificationList,
        navigationOptions: disableNavigationOptions
    },
    introTour: {
        screen: introTour,
        navigationOptions: disableNavigationOptions
    },
    introSlider: {
        screen: introSlider,
        navigationOptions: disableNavigationOptions
    },
    getPasscode: {
        screen: getPasscode,
        navigationOptions: disableNavigationOptions
    },
    beforeBegin: {
        screen: beforeBeginDetails,
        navigationOptions: disableNavigationOptions
    },
    beforeBeginLogin: {
        screen: beforeBeginLogin,
        navigationOptions: disableNavigationOptions
    },
    beforeBeginToday: {
        screen: beforeBeginToday,
        navigationOptions: disableNavigationOptions
    },
    rootTabNavigation:{
        screen: TabbarView,
        navigationOptions: disableNavigationOptions
    },
    today:{
        screen: TabbarView,
        navigationOptions: disableNavigationOptions
    },
    //Today Tab

    healthyActivity:{
        screen: healthyActivity,
        navigationOptions: modalNavigationOptions,
    },
    didYouKnow:{
        screen: didYouKnow,
        navigationOptions: modalNavigationOptions,
    },
    storyDetail:{
        screen: storyDetail,
        // navigationOptions: modalNavigationOptions,
    },
    audioActivity:{
        screen: audioActivity,
        navigationOptions: modalNavigationOptions,
    },
    visualizationActivity:{
        screen: visualizationActivity,
        navigationOptions: modalNavigationOptions,
    },
    thoughtActivity:{
        screen: thoughtActivity,
        navigationOptions: modalNavigationOptions,
    },
    chooseYourPathActivity:{
        screen: chooseYourPathActivity,
        navigationOptions: modalNavigationOptions,
    },
    breathingActivity:{
        screen: breathingActivity,
        navigationOptions: modalNavigationOptions,
    },
    kegalsActivity:{
        screen: kegalsActivity,
        navigationOptions: modalNavigationOptions,
    },
    kegalsInstruction:{
        screen: kegalsInstruction,
        navigationOptions: modalNavigationOptions,
    },
    stressRelief:{
        screen: stressRelief,
        navigationOptions: modalNavigationOptions,
    },
    brainActivity:{
        screen: brainActivity,
        navigationOptions: modalNavigationOptions,
    },
    exerciseInstruction:{
        screen: exerciseInstruction,
        navigationOptions: modalNavigationOptions,
    },
    emotionalActivity:{
        screen: emotionalActivity,
        navigationOptions: modalNavigationOptions,
    },
    medicationActivity:{
        screen: medicationActivity,
        navigationOptions: modalNavigationOptions,
    },
    aboutYouActivity:{
        screen: aboutYouActivity,
        navigationOptions: modalNavigationOptions,
    },
    faithActivity:{
        screen: faithActivity,
        navigationOptions: modalNavigationOptions,
    },
    lettersToYourSelf:{
        screen: lettersToYourSelf,
        navigationOptions: modalNavigationOptions,
    },
    readLetter:{
        screen: readLetter,
        navigationOptions: modalNavigationOptions,
    },
    completeMorningRoutine:{
        screen: completeMorningRoutine,
        navigationOptions: modalNavigationOptions,
    },
    howDidUDo:{
        screen: howDidUDo,
        navigationOptions: disableNavigationOptions,
    },
    completeOptionalActivity:{
        screen: completeOptionalActivity,
        navigationOptions: modalNavigationOptions,
    },
    aboutYouComplete:{
        screen: aboutYouComplete,
        navigationOptions: modalNavigationOptions,
    },
    checkUp:{
        screen: checkUp,
        navigationOptions: disableNavigationOptions,
    },
    checkUpComplete:{
        screen: checkUpComplete,
        navigationOptions: modalNavigationOptions,
    },
    journalActivity:{
        screen: journalCompose,
        navigationOptions: modalNavigationOptions,
    },

//Statisctic tab
    leaderboard:{
        screen: leaderboard,
        navigationOptions: modalNavigationOptions,
    },

    //MileStone
    adviceComment:{
        screen: adviceComment,
        navigationOptions: cardNavigationOptions,
    },
    postComment:{
        screen: postComment,
        navigationOptions: cardNavigationOptions,
    },

    //More Tab

    feelingTempted: {
        screen: feelingTempted,
        navigationOptions: cardNavigationOptions,
    },
    escapeMeditationActivity: {
        screen: meditationActivity,
        navigationOptions: disableNavigationOptions,
    },
    feelingTemptedSlider: {
        screen: feelingTemptedSlider,
        navigationOptions: cardNavigationOptions,
    },
    journalEntry: {
        screen: journalEntry,
        navigationOptions: cardNavigationOptions,
    },
    journalCompose: {
        screen: journalCompose,
        navigationOptions: cardNavigationOptions,
    },
    lifeTree: {
        screen: lifeTree,
        navigationOptions: cardNavigationOptions,
    },
    savedAdvice: {
        screen: savedAdvice,
        navigationOptions: cardNavigationOptions,
    },
    completedAudioExercises: {
        screen: completedAudioExercises,
        navigationOptions: cardNavigationOptions,
    },
    settingAudioActivity: {
        screen: settingAudioActivity,
        navigationOptions: cardNavigationOptions,
    },
    moreSettings: {
        screen: moreSettings,
        navigationOptions: cardNavigationOptions,
    },
    settingMotivation: {
        screen: settingMotivation,
        navigationOptions: cardNavigationOptions,
    },
    settingProfile: {
        screen: settingProfile,
        navigationOptions: cardNavigationOptions,
    },
    changeAvatarImage: {
        screen: changeAvatarImage,
        navigationOptions: disableNavigationOptions,
    },
    editStreaks: {
        screen: editStreaks,
        navigationOptions: cardNavigationOptions,
    },
    recommendedExercises: {
        screen: recommendedExercises,
        navigationOptions: cardNavigationOptions,
    },
    optionalExercises: {
        screen: optionalExercises,
        navigationOptions: cardNavigationOptions,
    },
    checkupTime: {
        screen: checkupTime,
        navigationOptions: cardNavigationOptions,
    },
    notifications: {
        screen: notifications,
        navigationOptions: cardNavigationOptions,
    },
    meditationTime: {
        screen: meditationTime,
        navigationOptions: cardNavigationOptions,
    },
    helpFAQ: {
        screen: helpFAQ,
        navigationOptions: cardNavigationOptions,
    },
    contactUs: {
        screen: contactUs,
        navigationOptions: cardNavigationOptions,
    },
    diagnostics: {
        screen: diagnostics,
        navigationOptions: cardNavigationOptions,
    },
    reset: {
        screen: reset,
        navigationOptions: cardNavigationOptions,
    },
    privacyPolicy: {
        screen: privacyPolicy,
        navigationOptions: cardNavigationOptions,
    },
    subscriptionDetail: {
        screen: subscriptionDetail,
        navigationOptions: cardNavigationOptions,
    },
    termsOfUse: {
        screen: termsOfUse,
        navigationOptions: cardNavigationOptions,
    },
    editPornCalendar: {
        screen: editPornCalendar,
        navigationOptions: cardNavigationOptions,
    },
    editMasturbationCalendar: {
        screen: editMasturbationCalendar,
        navigationOptions: cardNavigationOptions,
    },
    enterPin: {
        screen: enterPin,
        navigationOptions: cardNavigationOptions,
    },
    enterDiagnosticsPin: {
        screen: enterDiagnosticsPin,
        navigationOptions: cardNavigationOptions,
    },
    muteTeamMemberNotification: {
        screen: muteTeamMemberNotification,
        navigationOptions: cardNavigationOptions,
    },
    doNotDisturbNotification: {
        screen: doNotDisturbNotification,
        navigationOptions: cardNavigationOptions,
    },
    internetFilterActivity:{
        screen: internetFilter,
        navigationOptions: disableNavigationOptions,
    },
    internetFilter:{
        screen: internetFilter,
        navigationOptions: cardNavigationOptions,
    },
    addWebsite:{
        screen: addWebsite,
        navigationOptions: cardNavigationOptions,
    },
    addKeyword:{
        screen: addKeyword,
        navigationOptions: cardNavigationOptions,
    },
    blockAdultWebSite:{
        screen: blockAdultWebSite,
        navigationOptions: cardNavigationOptions,
    },
    blockDuration:{
        screen: blockDuration,
        navigationOptions: cardNavigationOptions,
    },
    filterDetail:{
        screen: filterDetail,
        navigationOptions: cardNavigationOptions,
    },
    accountData:{
        screen: accountData,
        navigationOptions: cardNavigationOptions,
    },
    viewUserDetails:{
        screen: viewUserDetails,
        navigationOptions: cardNavigationOptions,
    },
    communityProfile:{
        screen: communityProfile,
        navigationOptions: cardNavigationOptions,
    },
    manageBiography:{
        screen: manageBiography,
        navigationOptions: modalNavigationOptions,
    }
};