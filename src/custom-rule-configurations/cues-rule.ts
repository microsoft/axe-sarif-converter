import * as AxeUtils from '../axe-utils';
import { RulesConfiguration } from '../ruleresults';
import {
    getNativeWidgetElementType,
    createNativeWidgetConfiguration,
} from './native-widgets-default';
import {
    generateHTMLCuesDictionary,
    generateARIACuesDictionary,
} from '../cues';

export const cuesConfiguration: RulesConfiguration = createNativeWidgetConfiguration(
    'cues',
    'cues-collector',
    evaluateCues,
);

export function evaluateCues(node: HTMLElement): boolean {
    //@ts-ignore
    this.data({
        element: getNativeWidgetElementType(node),
        accessibleName: AxeUtils.getAccessibleText(node, false),
        htmlCues: generateHTMLCuesDictionary(node),
        ariaCues: generateARIACuesDictionary(node),
    });

    return true;
}
