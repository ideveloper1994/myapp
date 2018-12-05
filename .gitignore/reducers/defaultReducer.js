import {userDefault} from './default/userDefault';
import {helpPostDefault} from './default/helpPostDefault';
import {letterDefault} from './default/letterDefault';
import {metaDataDefault} from './default/metadataDefault';
import {postAdviceDefault} from './default/postAdviceDefault';
import {statisticDefault} from './default/statisticDefault';
import {teamDefault} from './default/teamDefault';

export const appDefaultReducer = {
    user: userDefault,
    statistic: statisticDefault,
    team: teamDefault,
    advice: postAdviceDefault,
    helpPost: helpPostDefault,
    metaData: metaDataDefault,
    letters: letterDefault
};