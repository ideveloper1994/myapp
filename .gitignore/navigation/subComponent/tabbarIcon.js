import React from 'react';
import { Image, View } from 'react-native';
import { connect } from 'react-redux';
import Constant from '../../helper/constant';

class TabbarIcon extends React.Component {

    render() {
        const {badgeVal} = this.props;
        let appColor = this.props.appTheme && Constant[this.props.appTheme] || Constant[Constant.darkTheme];
        return (
            <View style={{
                zIndex: 0,
                width: Constant.screenWidth/5,
                height: 50,
                justifyContent: 'center',
                alignSelf:'center',
                backgroundColor: appColor.tabbarBack}}>
                <Image source={!this.props.focused ? appColor.tabIcon[this.props.tabbar] :
                    appColor.selectedTabIcon[this.props.tabbar]}
                       style={{height: 25,width: 25, alignSelf:'center'}}
                       resizeMode={"contain"}/>
                <View style={{top:0, left:0, right:0, height:1, backgroundColor: appColor.tabbarTopBorder,
                    position:'absolute'}}/>
            </View>
        );
    }
}

const mapStateToProps = state => ({
    appTheme: state.user.appTheme
});

export default connect(mapStateToProps, null)(TabbarIcon);