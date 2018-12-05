import Constant from "../../helper/constant";

let settingNotifications = [
    {title: 'Checkup reminders', isSelected: true, value: 'checkupReminders'},
    {title: 'Streak goals', isSelected: true, value: 'streakGoal'},
    {title: 'Morning motivation', isSelected: false, value: 'morningMotivation', selectedTime: "8am"},
];

let settingTeamChatNotifications = [
    {title: 'Normal', isSelected: true, value: 'long'},
    {title: 'Discreet', isSelected: false, value: 'discreet'},
    {title: 'None', isSelected: false, value: 'none'},
];

let internetFilterSetting = [
    {"blockAllList":[
            {title: "Automatic blacklist disabled", value: false, type: "blockList", objDuration:{
                    duration: "",
                    startingDate: "", endingDate: "", daysLeft: 0 }
            },
        ]},
    {"websites":[
            {title: 'Add website...', pageName: 'blockWebsites', type: "website",
                allWebSite: []},
        ]},
    {"keywords":[
            {title: 'Add keyword...', pageName: 'blockKeywords', allKeywords: [], type: "keyword"},
        ]}
];

export const userDefault = {
    email: process.env.NODE_ENV === 'development' ? "test724@brainbuddyapp.com" : "",
    password: process.env.NODE_ENV === 'development' ? "test1234" : "",
    userName:"",
    token:"",
    safeAreaInsetsData:{top:0,bottom:0,left:0,right:0},
    safeAreaInsetsDefault:{top:0,bottom:0,left:0,right:0},
    temp:{},
    isLoading:false,
    visibleTab: 'today',   //Visible tab
    rewiringPlay:{
        isPlaying: false,
        progressVal: 0,
    },
    userDetails:{
        id: 0,
        name: "Unknown",
        age: 0,
        gender: "male",
        region: "america",
        motivation: "both",
        orientation: "heterosexual",
        avatar_id: 0,
        notification_type: 'long',
    },
    completedExercises: {
        date: new Date().toDateString(),
        exercises: []
    },
    settingNotifications: settingNotifications,
    settingTeamChatNotifications: settingTeamChatNotifications,
    showCheckupPopUp:{
        isShow: false,
        checkUpDetail: {}
    },
    showRewiringPopUp:{
        isShow: false,
        rewiringDetail:{}
    },
    showStreakGoalPopUp:{
        isShow: false,
        achivedGoal: 0,
        displayDate: "",
        inProcess: false,
        whileGoal: 0,
    },
    readLatterDate: {
        date: "",
        previousAchieved: 0,
    },
    dateForAPICall: "",
    todayViewInstance: null,
    isOpenFirstTime: {
        date: "",
        isAskForUpdateCalendar: false,
        isNewOpen: true
    },
    isAskForCheckup: false,
    isConnected: true,
    subscriptionInProcess: false,
    showRewindProgressPopUp:{
        isShow: false,
        rewindDetail:{ totalRewiringPercentage : 4,
            circularRewiringPercentage : 0,
            prevProgress: 0
        },
    },
    streakGoalAchievedPopUp:{
        isShow: false,
        streakGoalDetail:
            {letters:[],
                currentGoal:{
                    Heading: "",
                    Description: "",
                    per: 4, //0 means 4%
                    goalDays: 1,
                    previousAchieved: 0,
                    previousMessage: ""}
            }
    },
    showGoalAchieved: {
        isShown: false,
        showDate: "",
        achievedGoal: 0
    },
    popupQueue: {
        checkup: null,
        streakGoal: null,
        rewired: null,
        monthlyChallenge: null
    },
    todayLifeTree:{
        isShow: false,
        isCompleted: false,
        completedDate: ""
    },
    appBadgeCount: 0,
    internetFilterList: internetFilterSetting,
    appTheme: Constant.darkTheme,
    monthlyChallengePopup: {
        isShow: false,
        monthlyDetail: {
            month: new Date().getMonth(),
            description: "",
            title: "",
            progressPer: "4%",
            actualProgress: 4,
            remainingProgress: 0,
            iconType: "Y",
            popupType: 'today'
        }
    },
    monthlyChallengeAchived:{
        month: 0,
        year: 0,
        showDate: null,
    },
    encouragePopup:{
        detail:{
            name: "",
            userId: 0,
        },
        isShow: false,
        encourageDetail:[]
    },
    congratulatePopup:{
        detail:{},
        isShow: false,
        congratulateDetail:[]
    },
    doNotDisturb: {
        isSelected: true
    },
    teamAchievementPopUp:{
        isShow: false,
        teamAchievementDetail:{}
    },
    heartCount:0,
    userCommunity: null
};