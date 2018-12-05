

let whyRelapse = [
    {key: "Bored", total: 0},
    {key: "Stress", total: 0},
    {key: "Anxiety", total: 0},
    {key: "Tired", total: 0},
    {key: "Alone", total: 0},
    {key: "Pain", total: 0},
    {key: "Horny", total: 0},
];

let whenRelapse = {
    Morning: 0,
    Afternoon: 0,
    Evening: 0,
    Night: 0,
};

let whenStressed = {
    Morning: 0,
    Afternoon: 0,
    Evening: 0,
    Night: 0,
};
export const statisticDefault = {
    backup_data:{
        userName:'Unknown'
    },
    j_array: [],

    other_detail:[],

    journal_date_wise_list: {},

    pornDetail: {
        p_array: [],
        p_no_array: [],
        p_yes_array: [],
        clean_p_days_per_month:{},
        relapsed_p_days_per_weekdays:[],
        total_p_clean_days:'',
        current_p_clean_days:'',
        best_p_clean_days:'',
    },
    pornWhyIRelapse: whyRelapse,
    pornWhenIRelapse: whenRelapse,
    pornWhenIStressed: whenStressed,
    mosturbutionDetail : {
        m_array: [],
        m_no_array: [],
        m_yes_array: [],
        clean_m_days_per_month:{},
        relapsed_m_days_per_weekdays:[],
        total_m_clean_days:'',
        current_m_clean_days:'',
        best_m_clean_days:'',
    },
    totalRewiringPercentage: 0,
    circularRewiringPercentage: 4,
    masturbationWhenIRelapse: whenRelapse,

    currentGoal: {
        Heading: "",
        Description: "",
        per: 4, //0 means 4%
        goalDays: 1,
        previousAchieved: 0,
        previousMessage: "",
    }
};