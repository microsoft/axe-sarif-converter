/// <reference path="../axe-extension.ts" />
import * as AxeUtils from '../axe-utils';
import { RulesConfiguration } from '../ruleresults';
import {
    getNativeWidgetElementType,
    createNativeWidgetConfiguration,
} from './native-widgets-default';

export const widgetFunctionConfiguration: RulesConfiguration = createNativeWidgetConfiguration(
    'widget-function',
    'widget-function-collector',
    evaluateWidgetFunction,
    AxeUtils.hasCustomWidgetMarkup,
);

export function evaluateWidgetFunction(node: HTMLElement): boolean {
    // tslint:disable-next-line:max-line-length
    const ariaAttributes = [
        'aria-autocomplete',
        'aria-checked',
        'aria-expanded',
        'aria-level',
        'aria-modal',
        'aria-multiline',
        'aria-multiselectable',
        'aria-orientation',
        'aria-placeholder',
        'aria-pressed',
        'aria-readonly',
        'aria-required',
        'aria-selected',
        'aria-sort',
        'aria-valuemax',
        'aria-valuemin',
        'aria-valuenow',
        'aria-valuetext',
    ];

    // tslint:disable-next-line:no-invalid-this
    this.data({
        element: getNativeWidgetElementType(node),
        accessibleName: AxeUtils.getAccessibleText(node, false),
        role: node.getAttribute('role'),
        ariaAttributes: AxeUtils.getAttributes(node, ariaAttributes),
        tabIndex: node.getAttribute('tabindex'),
    });
    return true;
}
