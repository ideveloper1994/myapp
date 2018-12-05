module.exports = {
    //API Constant
    //Doc https://docs.brainbuddyapp.com/
    baseUrl: 'https://go.brainbuddyapp.com/api/v1/',
    signIn:'users/me/token',
    signUp:'users',

    baseUrlV2: 'https://go.brainbuddyapp.com/api/v2/',

    getPornDays: 'porn-days',
    masturbationDays: 'masturbation-days',
    journalEntries: 'journal-entries',
    resolve: 'resolve',

    backupPost:'backups',
    getStatistic:'users/me/backups/latest',
    getTeam: 'users/me/team',
    getTeamDetail: 'team',
    getTeamChat:'users/me/team/chat/posts',
    sendMessage : 'chat/posts',
    postAdvice: 'advice/posts',
    likePostURL:'advice/posts/',
    unlikePostURL:'advice/hearts/',
    leaderBoardTeam : 'teams',
    leaderBoardIndividual : 'users',
    leaderBoardIndividualPornFreeDays : 'users?order_by=porn_free_days',
    leaderBoardIndividualMonth : 'users?order_by=porn_free_days_for_current_month',
    leaderBoardIndividualYear : 'users?order_by=porn_free_days_for_current_year',
    leaderBoardIndividualWeek : 'users?order_by=porn_free_days_for_current_week',
    leaderBoardIndividualCurrentStreak : 'users?order_by=current_porn_free_streak',
    leaderBoardIndividualBestStreak : 'users?order_by=longest_porn_free_streak',

    leaderBoardIndividualAmerica : 'users?region=america',
    leaderBoardIndividualEurope : 'users?region=europe',
    leaderBoardIndividualAsia : 'users?region=asia',
    leaderBoardIndividualPacific : 'users?region=pacific',
// leaderBoardIndividualAmerica : 'users?region=america&order_by=porn_free_days',
//     leaderBoardIndividualEurope : 'users?region=europe&order_by=porn_free_days',
//     leaderBoardIndividualAsia : 'users?region=asia&order_by=porn_free_days',
//     leaderBoardIndividualPacific : 'users?region=pacific&order_by=porn_free_days',
    leaderBoardTeamOverall : 'teams?order_by=porn_free_days',
    leaderBoardTeamYear : 'teams?order_by=porn_free_days_for_current_year',
    leaderBoardTeamMonth : 'teams?order_by=porn_free_days_for_current_month',
    leaderBoardTeamWeek : 'teams?order_by=porn_free_days_for_current_week',

    helpPost: 'help/posts/',
    metaData: 'meta/',
    userDetail: 'user/',
    letters: 'letters/',

    postAdvicePagination: 'advice-posts',
    helpPostPagination: 'help-posts',
    helpPostCommentPagination: 'comments',
    teamChatPagination: 'team-chats',

    mutes: 'mutes',
    mute: 'mute',
    users: 'users/',

    getDetails: "https://api.ipdata.co",
    user: 'user', //delete user key

    //Create User Archive Notification
    userArchiveNotification: 'user-archive-notifications',
    teamAchievements: 'team-achievements',

    //Community profile
    events: '/events',
    globals: 'globals',
};