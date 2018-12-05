import getSceneIndicesForInterpolationInputRange from "react-navigation-stack/src/utils/getSceneIndicesForInterpolationInputRange";
import {Easing, Animated, I18nManager} from 'react-native';

const MyCustomTransition = (index, position) => {
    const inputRange = [index - 1, index, index + 1];
    const opacity = position.interpolate({
        inputRange,
        outputRange: [1, 1, 1],
    });
    return {
        opacity,
    };
};

const MyCustomFadeTransition = (index, position) => {
    const inputRange = [index - 1, index, index + 1];
    const opacity = position.interpolate({
        inputRange,
        outputRange: [0.9, 1, 1],
    });
    return {
        opacity,
    };
};

const forInitial = (props) => {
    const {navigation, scene} = props;

    const focused = navigation.state.index === scene.index;
    const opacity = focused ? 1 : 0;
    // If not focused, move the scene far away.
    const translate = focused ? 0 : 1000000;
    return {
        opacity,
        transform: [{translateX: translate}, {translateY: translate}],
    };
}

const forHorizontal = (props) => {
    const {layout, position, scene} = props;

    if (!layout.isMeasured) {
        return forInitial(props);
    }
    const interpolate = getSceneIndicesForInterpolationInputRange(props);

    if (!interpolate) return {opacity: 0};

    const {first, last} = interpolate;
    const index = scene.index;
    const opacity = position.interpolate({
        inputRange: [first, first + 0.01, index, last - 0.01, last],
        outputRange: [0, 1, 1, 0.85, 0],
    });

    const width = layout.initWidth;
    const translateX = position.interpolate({
        inputRange: [first, index, last],
        outputRange: I18nManager.isRTL
            ? [-width, 0, width * 0.3]
            : [width, 0, width * -0.3],
    });
    const translateY = 0;

    return {
        opacity,
        transform: [{translateX}, {translateY}],
    };
}

const forVertical = (props) => {
    const {layout, position, scene} = props;

    if (!layout.isMeasured) {
        return forInitial(props);
    }
    const interpolate = getSceneIndicesForInterpolationInputRange(props);

    if (!interpolate) return {opacity: 0};

    const {first, last} = interpolate;
    const index = scene.index;
    const opacity = position.interpolate({
        inputRange: [first, first + 0.01, index, last - 0.01, last],
        outputRange: [0, 1, 1, 0.85, 0],
    });

    const height = layout.initHeight;
    const translateY = position.interpolate({
        inputRange: [first, index, last],
        outputRange: [height, 0, 0],
    });
    const translateX = 0;

    return {
        opacity,
        transform: [{translateX}, {translateY}],
    };
}

/**
 *  fadeIn and fadeOut
 */
const forFade = (props) => {
    const {layout, position, scene} = props;

    if (!layout.isMeasured) {
        return forInitial(props);
    }
    const interpolate = getSceneIndicesForInterpolationInputRange(props);

    if (!interpolate) return {opacity: 0};

    const {first, last} = interpolate;
    const index = scene.index;
    const opacity = position.interpolate({
        inputRange: [first, index, last],
        outputRange: [0, 1, 1],
    });

    return {
        opacity,
    };
}

let CustomSlideDownTransition = (index, position, height) => {
    const translateY = position.interpolate({
        inputRange: [0, index],
        outputRange: [height, 0]
    });
    return {transform: [{translateY}]};
};


let CustomSlideUpTransition = (index, position, height) => {
    const translateX = 0;
    const translateY = position.interpolate({
        inputRange: ([index - 1, index, index + 1]: Array<number>),
        outputRange: ([height, 0, 0]: Array<number>)
    });
    return {
        transform: [{translateX}, {translateY}]
    };
};

let CustomSlideFromRightTransition = (index, position, width) => {
    const translateX = position.interpolate({
        inputRange: [index - 1, index, index + 1],
        outputRange: [width, 0, 0]
    });
    return {transform: [{translateX}]};
};


let lastAnimation = {};

export const NewTransitionConfiguration = () => {
    return {
        transitionSpec: {
            duration: 400,
            easing: Easing.out(Easing.poly(5)),
            timing: Animated.timing,
            useNativeDriver: true,
        },
        screenInterpolator: sceneProps => {
            const {position, layout, scene, index, scenes} = sceneProps
            const toIndex = index
            const thisSceneIndex = scene.index
            const height = layout.initHeight
            const width = layout.initWidth

            const lastSceneIndex = scenes[scenes.length - 1].index

            // Test whether we're skipping back more than one screen
            if (lastSceneIndex - toIndex >= 1) {
                // Do not transoform the screen being navigated to
                if (scene.index === toIndex) return
                // Hide all screens in between
                if (scene.index !== lastSceneIndex) return {opacity: 0}
                // Slide top screen down

                if (lastAnimation.transition && lastAnimation.transition === "myCustomSlideRightTransition") {
                    // console.log("Horizontal")
                    return forHorizontal(sceneProps)
                }
                // return CustomSlideDownTransition(thisSceneIndex, position, height);

                try {
                    if (!JSON.stringify(sceneProps.scenes).includes('entryPage')) {
                        return forVertical(sceneProps);
                    }
                } catch (e) {
                    // return forVertical(sceneProps);
                }
            }

            if (lastSceneIndex > 1 || toIndex > 1 || thisSceneIndex > 1) {
                // console.log("My Fade Animation")
                return MyCustomTransition(index, position);
            }

            const {route} = scene;
            const params = route.params || {}; // <- That's new
            const transition = params.transition || 'default'; // <- That's new

            if (sceneProps.scene.isActive) {
                if (params.transition) {
                    lastAnimation = params;
                }
            }
            return {
                myCustomTransition: MyCustomFadeTransition(index, position),
                fadeIn: MyCustomFadeTransition(index, position),
                default: MyCustomTransition(index, position),
                myCustomSlideUpTransition: forVertical(sceneProps),
                myCustomSlideRightTransition: forHorizontal(sceneProps),
                noTransition: MyCustomFadeTransition(index, position),
            }[transition];

            return MyCustomTransition(index, position);
        },
    }
};

export const AndroidTransitionConfiguration = () => {
    return {
        transitionSpec: {
            duration: 400,
            easing: Easing.out(Easing.poly(5)),
            timing: Animated.timing,
            useNativeDriver: true,
        },
        screenInterpolator: sceneProps => {
            const {position, layout, scene, index, scenes} = sceneProps
            const toIndex = index
            const thisSceneIndex = scene.index
            const height = layout.initHeight
            const width = layout.initWidth

            const lastSceneIndex = scenes[scenes.length - 1].index

            // Test whether we're skipping back more than one screen
            if (lastSceneIndex - toIndex >= 1) {
                // Do not transoform the screen being navigated to
                if (scene.index === toIndex) return
                // Hide all screens in between
                if (scene.index !== lastSceneIndex) return {opacity: 0}
                // Slide top screen down

                // if(lastAnimation.transition && lastAnimation.transition === "myCustomSlideRightTransition"){
                //     console.log("Horizontal")
                //     return forHorizontal(sceneProps)
                // }
            }
            //
            // if(lastSceneIndex > 1 || toIndex > 1 || thisSceneIndex > 1) {
            //     console.log("My Fade Animation")
            //     return MyCustomTransition(index, position);
            // }

            const {route} = scene;
            const params = route.params || {}; // <- That's new
            const transition = params.transition || 'default'; // <- That's new

            if (sceneProps.scene.isActive) {
                if (params.transition) {
                    lastAnimation = params;
                }
            }
            return {
                // myCustomTransition: MyCustomTransition(index, position),
                // default: MyCustomTransition(index, position),
                // myCustomSlideUpTransition: CustomSlideUpTransition(index, position, height),
                // myCustomSlideRightTransition: CustomSlideFromRightTransition(index, position, width),

                myCustomTransition: MyCustomFadeTransition(index, position),
                fadeIn: MyCustomFadeTransition(index, position),
                default: MyCustomTransition(index, position),
                myCustomSlideUpTransition: MyCustomTransition(index, position),
                myCustomSlideRightTransition: forHorizontal(sceneProps),
                noTransition: MyCustomFadeTransition(index, position),
            }[transition];
            return MyCustomTransition(index, position);
        },
    }
};

export const CardTransitionConfiguration = () => {
    return {
        transitionSpec: {
            duration: 400,
            easing: Easing.out(Easing.poly(5)),
            timing: Animated.timing,
            useNativeDriver: true,
        },
        screenInterpolator: sceneProps => {
            const {position, layout, scene, index, scenes} = sceneProps
            const toIndex = index
            const thisSceneIndex = scene.index
            const height = layout.initHeight
            const width = layout.initWidth
            const {route} = scene;
            const params = route.params || {}; // <- That's new
            const transition = params.transition || 'default'; // <- That's new
            return {
                // myCustomTransition: MyCustomTransition(index, position),
                // default: MyCustomTransition(index, position),
                // myCustomSlideUpTransition: CustomSlideUpTransition(index, position, height),
                myCustomSlideRightTransition: forHorizontal(sceneProps),
                default: forHorizontal(sceneProps),
                noTransition: MyCustomFadeTransition(index, position),
            }[transition];
            return MyCustomFadeTransition(index, position);
        },
    }
};
