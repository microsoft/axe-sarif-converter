// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { DictionaryStringTo } from './dictionary-types';

export interface WCAGLinkData {
    text: string;
    url?: string;
    title?: string;
}

function standardWcag21Link(
    urlFormattedTitle: string,
    sectionNumber: string,
    title: string,
): WCAGLinkData {
    return {
        text: `WCAG ${sectionNumber}`,
        title: title,
        url: `https://www.w3.org/WAI/WCAG21/Understanding/${urlFormattedTitle}`,
    };
}

// prettier-ignore
export const axeTagsToWcagLinkData: DictionaryStringTo<WCAGLinkData> = {
    wcag111: standardWcag21Link('non-text-content', '1.1.1', 'Non-text Content'),
    wcag121: standardWcag21Link('audio-only-and-video-only-prerecorded', '1.2.1', 'Audio-only and Video-only (Prerecorded)'),
    wcag122: standardWcag21Link('captions-prerecorded', '1.2.2', 'Captions (Prerecorded)'),
    wcag123: standardWcag21Link('audio-description-or-media-alternative-prerecorded', '1.2.3', 'Audio Description or Media Alternative (Prerecorded)'),
    wcag124: standardWcag21Link('captions-live', '1.2.4', 'Captions (Live)'),
    wcag125: standardWcag21Link('audio-description-prerecorded', '1.2.5', 'Audio Description (Prerecorded)'),
    wcag126: standardWcag21Link('sign-language-prerecorded', '1.2.6', 'Sign Language (Prerecorded)'),
    wcag127: standardWcag21Link('extended-audio-description-prerecorded', '1.2.7', 'Extended Audio Description (Prerecorded)'),
    wcag128: standardWcag21Link('media-alternative-prerecorded', '1.2.8', 'Media Alternative (Prerecorded)'),
    wcag129: standardWcag21Link('audio-only-live', '1.2.9', 'Audio-only (Live)'),
    wcag131: standardWcag21Link('info-and-relationships', '1.3.1', 'Info and Relationships'),
    wcag132: standardWcag21Link('meaningful-sequence', '1.3.2', 'Meaningful Sequence'),
    wcag133: standardWcag21Link('sensory-characteristics', '1.3.3', 'Sensory Characteristics'),
    wcag134: standardWcag21Link('orientation', '1.3.4', 'Orientation'),
    wcag135: standardWcag21Link('identify-input-purpose', '1.3.5', 'Identify Input Purpose'),
    wcag136: standardWcag21Link('identify-purpose', '1.3.6', 'Identify Purpose'),
    wcag141: standardWcag21Link('use-of-color', '1.4.1', 'Use of Color'),
    wcag142: standardWcag21Link('audio-control', '1.4.2', 'Audio Control'),
    wcag143: standardWcag21Link('contrast-minimum', '1.4.3', 'Contrast (Minimum)'),
    wcag144: standardWcag21Link('resize-text', '1.4.4', 'Resize text'),
    wcag145: standardWcag21Link('images-of-text', '1.4.5', 'Images of Text'),
    wcag146: standardWcag21Link('contrast-enhanced', '1.4.6', 'Contrast (Enhanced)'),
    wcag147: standardWcag21Link('low-or-no-background-audio', '1.4.7', 'Low or No Background Audio'),
    wcag148: standardWcag21Link('visual-presentation', '1.4.8', 'Visual Presentation'),
    wcag149: standardWcag21Link('images-of-text-no-exception', '1.4.9', 'Images of Text (No Exception)'),
    wcag1410: standardWcag21Link('reflow', '1.4.10', 'Reflow'),
    wcag1411: standardWcag21Link('non-text-contrast', '1.4.11', 'Non-text Contrast'),
    wcag1412: standardWcag21Link('text-spacing', '1.4.12', 'Text Spacing'),
    wcag1413: standardWcag21Link('content-on-hover-or-focus', '1.4.13', 'Content on Hover or Focus'),
    wcag211: standardWcag21Link('keyboard', '2.1.1', 'Keyboard'),
    wcag212: standardWcag21Link('no-keyboard-trap', '2.1.2', 'No Keyboard Trap'),
    wcag213: standardWcag21Link('keyboard-no-exception', '2.1.3', 'Keyboard (No Exception)'),
    wcag214: standardWcag21Link('character-key-shortcuts', '2.1.4', 'Character Key Shortcuts'),
    wcag221: standardWcag21Link('timing-adjustable', '2.2.1', 'Timing Adjustable'),
    wcag222: standardWcag21Link('pause-stop-hide', '2.2.2', 'Pause, Stop, Hide'),
    wcag223: standardWcag21Link('no-timing', '2.2.3', 'No Timing'),
    wcag224: standardWcag21Link('interruptions', '2.2.4', 'Interruptions'),
    wcag225: standardWcag21Link('re-authenticating', '2.2.5', 'Re-authenticating'),
    wcag226: standardWcag21Link('timeouts', '2.2.6', 'Timeouts'),
    wcag231: standardWcag21Link('three-flashes-or-below-threshold', '2.3.1', 'Three Flashes or Below Threshold'),
    wcag232: standardWcag21Link('three-flashes', '2.3.2', 'Three Flashes'),
    wcag233: standardWcag21Link('animation-from-interactions', '2.3.3', 'Animation from Interactions'),
    wcag241: standardWcag21Link('bypass-blocks', '2.4.1', 'Bypass Blocks'),
    wcag242: standardWcag21Link('page-titled', '2.4.2', 'Page Titled'),
    wcag243: standardWcag21Link('focus-order', '2.4.3', 'Focus Order'),
    wcag244: standardWcag21Link('link-purpose-in-context', '2.4.4', 'Link Purpose (In Context)'),
    wcag245: standardWcag21Link('multiple-ways', '2.4.5', 'Multiple Ways'),
    wcag246: standardWcag21Link('headings-and-labels', '2.4.6', 'Headings and Labels'),
    wcag247: standardWcag21Link('focus-visible', '2.4.7', 'Focus Visible'),
    wcag248: standardWcag21Link('location', '2.4.8', 'Location'),
    wcag249: standardWcag21Link('link-purpose-link-only', '2.4.9', 'Link Purpose (Link Only)'),
    wcag2410: standardWcag21Link('section-headings', '2.4.10', 'Section Headings'),
    wcag251: standardWcag21Link('pointer-gestures', '2.5.1', 'Pointer Gestures'),
    wcag252: standardWcag21Link('pointer-cancellation', '2.5.2', 'Pointer Cancellation'),
    wcag253: standardWcag21Link('label-in-name', '2.5.3', 'Label in Name'),
    wcag254: standardWcag21Link('motion-actuation', '2.5.4', 'Motion Actuation'),
    wcag255: standardWcag21Link('target-size', '2.5.5', 'Target Size'),
    wcag256: standardWcag21Link('concurrent-input-mechanisms', '2.5.6', 'Concurrent Input Mechanisms'),
    wcag311: standardWcag21Link('language-of-page', '3.1.1', 'Language of Page'),
    wcag312: standardWcag21Link('language-of-parts', '3.1.2', 'Language of Parts'),
    wcag313: standardWcag21Link('unusual-words', '3.1.3', 'Unusual Words'),
    wcag314: standardWcag21Link('abbreviations', '3.1.4', 'Abbreviations'),
    wcag315: standardWcag21Link('reading-level', '3.1.5', 'Reading Level'),
    wcag316: standardWcag21Link('pronunciation', '3.1.6', 'Pronunciation'),
    wcag321: standardWcag21Link('on-focus', '3.2.1', 'On Focus'),
    wcag322: standardWcag21Link('on-input', '3.2.2', 'On Input'),
    wcag323: standardWcag21Link('consistent-navigation', '3.2.3', 'Consistent Navigation'),
    wcag324: standardWcag21Link('consistent-identification', '3.2.4', 'Consistent Identification'),
    wcag325: standardWcag21Link('change-on-request', '3.2.5', 'Change on Request'),
    wcag331: standardWcag21Link('error-identification', '3.3.1', 'Error Identification'),
    wcag332: standardWcag21Link('labels-or-instructions', '3.3.2', 'Labels or Instructions'),
    wcag333: standardWcag21Link('error-suggestion', '3.3.3', 'Error Suggestion'),
    wcag334: standardWcag21Link('error-prevention-legal-financial-data', '3.3.4', 'Error Prevention (Legal, Financial, Data)'),
    wcag335: standardWcag21Link('help', '3.3.5', 'Help'),
    wcag336: standardWcag21Link('error-prevention-all', '3.3.6', 'Error Prevention (All)'),
    wcag411: standardWcag21Link('parsing', '4.1.1', 'Parsing'),
    wcag412: standardWcag21Link('name-role-value', '4.1.2', 'Name, Role, Value'),
    wcag413: standardWcag21Link('status-messages', '4.1.3', 'Status Messages'),
    'best-practice': { text: 'Best Practice' }
}
