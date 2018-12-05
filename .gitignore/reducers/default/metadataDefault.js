import _ from 'lodash';

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
    "exercise_number_profile",
    "improvement_mind",
    "improvement_energy","improvement_attraction","improvement_sleep","improvement_voice",
    "improvement_health","improvement_confidence","improvement_alive",
    "stressed_morning","stressed_afternoon","stressed_evening","stressed_night","registered_at","last_checkup_at"];
const metaData = {};
keys.forEach((key) => metaData[key] = key.includes('exercise') ? 1 : 0);

let metaDataBackup = {
    date: "",
    data: _.cloneDeep(metaData)
};
let checkupQuestions = {
    "1": {
        question : "Was today a porn clean day?",
        answer: [
            { str: "Yes", nexQuestion: 4, icon: "G"},
            { str: "No", ansStr: "No, I relapsed", nexQuestion: 2, icon: "R"},
        ],
    },
    "2": {
        question : "Why did you use porn?",
        answer: [
            { str: "Anxiety", nexQuestion: 3, icon: "R"},
            { str: "Boredom", nexQuestion: 3, icon: "R"},
            { str: "Stress", nexQuestion: 3, icon: "R"},
            { str: "Arousal", nexQuestion: 3, icon: "R"},
            { str: "Pain", nexQuestion: 3, icon: "R"},
            { str: "Tiredness", nexQuestion: 3, icon: "R"},
            { str: "Loneliness", nexQuestion: 3, icon: "R"},
            { str: "Add a new reason", nexQuestion: 3, icon: "R", isAddNew: true},
        ],
        isMultipleSelection: true,
    },
    "3": {
        question : "When did you use porn?",
        answer: [
            { str: "Morning", nexQuestion: 6, icon: "R"},
            { str: "Afternoon", nexQuestion: 6, icon: "R"},
            { str: "Evening", nexQuestion: 6, icon: "R"},
            { str: "Night", nexQuestion: 6, icon: "R"},
        ],
        isMultipleSelection: true
    },
    "4": {
        question : "Did you feel tempted?",
        answer: [
            { str: "No", nexQuestion: 6, icon: "G"},
            { str: "Yes", ansStr: "Yes, I felt tempted", nexQuestion: 5, icon: "R"},
        ],
    },
    "5": {
        question : "When did you feel tempted?",
        answer: [
            { str: "Morning", nexQuestion: 6, icon: "R"},
            { str: "Afternoon", nexQuestion: 6, icon: "R"},
            { str: "Evening", nexQuestion: 6, icon: "R"},
            { str: "Night", nexQuestion: 6, icon: "R"},
        ],
    },
    "6": {
        question : "Was today a masturbation clean day?",
        answer: [
            { str: "Yes", nexQuestion: 8, icon: "G"},
            { str: "No", ansStr: "No, I masturbated", nexQuestion: 7, icon: "R"},
        ],
    },
    "7": {
        question : "What time did you masturbate?",
        answer: [
            { str: "Morning", nexQuestion: 8, icon: "R"},
            { str: "Afternoon", nexQuestion: 8, icon: "R"},
            { str: "Evening", nexQuestion: 8, icon: "R"},
            { str: "Night", nexQuestion: 8, icon: "R"},
        ],
        isMultipleSelection: true
    },
    "8": {
        question : "Did you have sex today?",
        answer: [
            { str: "Yes", nexQuestion: 9, icon: "G"},
            { str: "No", nexQuestion: 11, icon: "G"},
        ],
    },
    "9": {
        question : "Did you find the sex pleasurable?",
        answer: [
            { str: "Yes", nexQuestion: 10, icon: "G"},
            { str: "Somewhat", nexQuestion: 10, icon: "O"},
            { str: "No", nexQuestion: 10, icon: "R"},
        ],
    },
    "10": {
        question : "Did you think about porn during sex?",
        answer: [
            { str: "No", nexQuestion: 11, icon: "G"},
            { str: "Yes", nexQuestion: 11, icon: "R"},
        ],
    },
    "11": {
        question : "Did you feel any real life sexual attraction today?",
        answer: [
            { str: "Yes", nexQuestion: 12, icon: "G"},
            { str: "No", nexQuestion: 12, icon: "O"},
        ],
    },
    "12": {
        question : "Did you notice any spontaneous erections today?",
        answer: [
            { str: "Yes", nexQuestion: 13, icon: "G"},
            { str: "No", nexQuestion: 13, icon: "O"},
        ],
    },
    "13": {
        question : "Did you feel stressed or anxious today?",
        answer: [
            { str: "No", nexQuestion: 15, icon: "G"},
            { str: "Yes", nexQuestion: 14, icon: "R"},
        ],
    },
    "14": {
        question : "When did you feel most stressed?",
        answer: [
            { str: "Morning", nexQuestion: 15, icon: "R"},
            { str: "Afternoon", nexQuestion: 15, icon: "R"},
            { str: "Evening", nexQuestion: 15, icon: "R"},
            { str: "Night", nexQuestion: 15, icon: "R"},
        ],
    },
    "15": {
        question : "Overall, how was your day?",
        answer: [
            { str: "Good", nexQuestion: 16, icon: "G"},
            { str: "Average", nexQuestion: 16, icon: "O"},
            { str: "Bad", nexQuestion: 16, icon: "R"},
        ],
    },
    "16": {
        question : "Select any positive benefits you noticed today.",
        answer: [
            { str: "More self-confidence", nexQuestion: 0, icon: "G"},
            { str: "Stronger voice", nexQuestion: 0, icon: "G"},
            { str: "More energy", nexQuestion: 0, icon: "G"},
            { str: "Clear mind", nexQuestion: 0, icon: "G"},
            { str: "Better sleep", nexQuestion: 0, icon: "G"},
            { str: "Healthier appearance", nexQuestion: 0, icon: "G"},
            { str: "More alive", nexQuestion: 0, icon: "G"},
        ],
        isMultipleSelection: true
    },
    "17": {
        question : "Select any symptoms you felt after your relapse.",
        answer: [
            { str: "Tiredness or lethargy", nexQuestion: 0, icon: "R"},
            { str: "Feeling unmotivated", nexQuestion: 0, icon: "R"},
            { str: "Reduced desire to socialize", nexQuestion: 0, icon: "R"},
            { str: "Feeling guilty", nexQuestion: 0, icon: "R"},
            { str: "General anxiety", nexQuestion: 0, icon: "R"},
            { str: "Difficulty concentrating", nexQuestion: 0, icon: "R"},
            { str: "Lack of confidence", nexQuestion: 0, icon: "R"},
        ],
        isMultipleSelection: true
    },
};

let rewiringProgress = [
    { progressName: "Desensitation", progressPer: "4%", fillColor:"rgb(5,195,249)", key: "Desensitation"},
    { progressName: "Dopamine rewiring", progressPer: "4%", fillColor:"rgb(239,76,129)", key: "Dopamine"},
    { progressName: "Hypofrontality", progressPer: "4%", fillColor:"rgb(251,176,67)", key: "Hypofrontality"},
    { progressName: "Stress control", progressPer: "4%", fillColor:"rgb(121,112,255)", key: "Stress"},
    { progressName: "Wisdom", progressPer: "4%", fillColor:"rgb(91,196,189)", key: "Wisdom"},
];

let selectedOptionalExercise= [
    {title: 'Brain Training', isSelected: true, pageName: 'brainActivity'},
    {title: 'Emotional growth', isSelected: true, pageName: 'emotionalActivity'},
    {title: 'Visualize', isSelected: true, pageName: 'visualizationActivityIOS'},
    {title: 'Healthy Activity', isSelected: true, pageName: 'healthyActivity'},

    {title: 'Meditation', isSelected: true, pageName: 'medicationActivity'},
    {title: 'Thought control', isSelected: true, pageName: 'thoughtActivity'},
    {title: 'Breathing practice', isSelected: true, pageName: 'breathingActivity'},

    {title: 'Stress relief', isSelected: true, pageName: 'stressRelief'},

    {title: 'Audio Exercise', isSelected: true, pageName: 'audioActivity'},
    {title: 'Choose your path', isSelected: true, pageName: 'chooseYourPathActivity'},
    {title: 'Story', isSelected: true, pageName: 'storyDetail'},
    {title: 'Did you know?', isSelected: true, pageName: 'didYouKnow'},

    {title: 'Kegal Exercises', isSelected: true, pageName: 'kegalsActivity'},
    {title: 'Faith and scripture', isSelected: false, pageName: 'faithActivity'},
    {title: 'Letters to Yourself', isSelected: true, pageName: 'lettersToYourSelf'},

    {title: 'Life tree', isSelected: true, pageName: 'lifeTree'},
    {title: 'Journal', isSelected: false, pageName: 'journal'},
];

let todayScreenExercise= [
    {title: 'Brain Training', isSelected: true, pageName: 'brainActivity'},
    {title: 'Emotional growth', isSelected: true, pageName: 'emotionalActivity'},
    {title: 'Visualize', isSelected: true, pageName: 'visualizationActivity'},
    {title: 'Healthy Activity', isSelected: true, pageName: 'healthyActivity'},

    {title: 'Meditation', isSelected: true, pageName: 'medicationActivity'},
    {title: 'Thought control', isSelected: true, pageName: 'thoughtActivity'},
    {title: 'Breathing practice', isSelected: true, pageName: 'breathingActivity'},

    {title: 'Stress relief', isSelected: true, pageName: 'stressRelief'},

    {title: 'Audio Exercise', isSelected: true, pageName: 'audioActivity'},
    {title: 'Choose your path', isSelected: true, pageName: 'chooseYourPathActivity'},
    {title: 'Story', isSelected: true, pageName: 'storyDetail'},
    {title: 'Did you know?', isSelected: true, pageName: 'didYouKnow'},

    {title: 'Kegal Exercises', isSelected: true, pageName: 'kegalsActivity'},
    {title: 'Faith and scripture', isSelected: false, pageName: 'faithActivity'},
    {title: 'Letters to yourself', isSelected: true, pageName: 'lettersToYourSelf'},

    {title: 'Life tree', isSelected: true, pageName: 'lifeTree'},
    {title: 'Journal', isSelected: false, pageName: 'journal'},
    {title: 'About You', isSelected: true, pageName: 'aboutYouActivity'}
];

let improvementPercentage = [
    { icon: "B", val: "mind", progressPer: "4%", valPer: 4, actualPer: "0%"},
    { icon: "B", val: "energy", progressPer: "4%", valPer: 4, actualPer: "0%"},
    { icon: "B", val: "attraction", progressPer: "4%", valPer: 4, actualPer: "0%"},
    { icon: "B", val: "sleep", progressPer: "4%", valPer: 4, actualPer: "0%"},
    { icon: "B", val: "voice", progressPer: "4%", valPer: 4, actualPer: "0%"},
    { icon: "B", val: "health", progressPer: "4%", valPer: 4, actualPer: "0%"},
    { icon: "B", val: "confidence", progressPer: "4%", valPer: 4, actualPer: "0%"},
    { icon: "B", val: "alive", progressPer: "4%", valPer: 4, actualPer: "0%"},
];

export const metaDataDefault = {
    metaData: _.cloneDeep(metaData),
    improvementPercentage: improvementPercentage,
    checkupQuestions: checkupQuestions,
    morningRoutine: [],
    completedMorningRoutine: {
        completedDate: "",
        routineActivities: []
    },
    rewiringProgress: rewiringProgress,
    selectedOptionalExercise: selectedOptionalExercise,
    metaDataBackup: metaDataBackup,
    meditationTime: 10,
    todayScreenExercise: todayScreenExercise
};