// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { DictionaryStringTo } from './dictionary-types';

export interface WCAGLinkData {
    text: string;
    url?: string;
    title?: string;
}

function standardWcag21Link(
    sectionNumber: string,
    urlFormattedTitle: string,
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
    wcag111: standardWcag21Link('1.1.1', 'non-text-content', 'Non-text Content'),
    wcag121: standardWcag21Link('1.2.1', 'audio-only-and-video-only-prerecorded', 'Audio-only and Video-only (Prerecorded)'),
    wcag122: standardWcag21Link('1.2.2', 'captions-prerecorded', 'Captions (Prerecorded)'),
    wcag123: standardWcag21Link('1.2.3', 'audio-description-or-media-alternative-prerecorded', 'Audio Description or Media Alternative (Prerecorded)'),
    wcag124: standardWcag21Link('1.2.4', 'captions-live', 'Captions (Live)'),
    wcag125: standardWcag21Link('1.2.5', 'audio-description-prerecorded', 'Audio Description (Prerecorded)'),
    wcag126: standardWcag21Link('1.2.6', 'sign-language-prerecorded', 'Sign Language (Prerecorded)'),
    wcag127: standardWcag21Link('1.2.7', 'extended-audio-description-prerecorded', 'Extended Audio Description (Prerecorded)'),
    wcag128: standardWcag21Link('1.2.8', 'media-alternative-prerecorded', 'Media Alternative (Prerecorded)'),
    wcag129: standardWcag21Link('1.2.9', 'audio-only-live', 'Audio-only (Live)'),
    wcag131: standardWcag21Link('1.3.1', 'info-and-relationships', 'Info and Relationships'),
    wcag132: standardWcag21Link('1.3.2', 'meaningful-sequence', 'Meaningful Sequence'),
    wcag133: standardWcag21Link('1.3.3', 'sensory-characteristics', 'Sensory Characteristics'),
    wcag134: standardWcag21Link('1.3.4', 'orientation', 'Orientation'),
    wcag135: standardWcag21Link('1.3.5', 'identify-input-purpose', 'Identify Input Purpose'),
    wcag136: standardWcag21Link('1.3.6', 'identify-purpose', 'Identify Purpose'),
    wcag141: standardWcag21Link('1.4.1', 'use-of-color', 'Use of Color'),
    wcag142: standardWcag21Link('1.4.2', 'audio-control', 'Audio Control'),
    wcag143: standardWcag21Link('1.4.3', 'contrast-minimum', 'Contrast (Minimum)'),
    wcag144: standardWcag21Link('1.4.4', 'resize-text', 'Resize text'),
    wcag145: standardWcag21Link('1.4.5', 'images-of-text', 'Images of Text'),
    wcag146: standardWcag21Link('1.4.6', 'contrast-enhanced', 'Contrast (Enhanced)'),
    wcag147: standardWcag21Link('1.4.7', 'low-or-no-background-audio', 'Low or No Background Audio'),
    wcag148: standardWcag21Link('1.4.8', 'visual-presentation', 'Visual Presentation'),
    wcag149: standardWcag21Link('1.4.9', 'images-of-text-no-exception', 'Images of Text (No Exception)'),
    wcag1410: standardWcag21Link('1.4.10', 'reflow', 'Reflow'),
    wcag1411: standardWcag21Link('1.4.11', 'non-text-contrast', 'Non-text Contrast'),
    wcag1412: standardWcag21Link('1.4.12', 'text-spacing', 'Text Spacing'),
    wcag1413: standardWcag21Link('1.4.13', 'content-on-hover-or-focus', 'Content on Hover or Focus'),
    wcag211: standardWcag21Link('2.1.1', 'keyboard', 'Keyboard'),
    wcag212: standardWcag21Link('2.1.2', 'no-keyboard-trap', 'No Keyboard Trap'),
    wcag213: standardWcag21Link('2.1.3', 'keyboard-no-exception', 'Keyboard (No Exception)'),
    wcag214: standardWcag21Link('2.1.4', 'character-key-shortcuts', 'Character Key Shortcuts'),
    wcag221: standardWcag21Link('2.2.1', 'timing-adjustable', 'Timing Adjustable'),
    wcag222: standardWcag21Link('2.2.2', 'pause-stop-hide', 'Pause, Stop, Hide'),
    wcag223: standardWcag21Link('2.2.3', 'no-timing', 'No Timing'),
    wcag224: standardWcag21Link('2.2.4', 'interruptions', 'Interruptions'),
    wcag225: standardWcag21Link('2.2.5', 're-authenticating', 'Re-authenticating'),
    wcag226: standardWcag21Link('2.2.6', 'timeouts', 'Timeouts'),
    wcag231: standardWcag21Link('2.3.1', 'three-flashes-or-below-threshold', 'Three Flashes or Below Threshold'),
    wcag232: standardWcag21Link('2.3.2', 'three-flashes', 'Three Flashes'),
    wcag233: standardWcag21Link('2.3.3', 'animation-from-interactions', 'Animation from Interactions'),
    wcag241: standardWcag21Link('2.4.1', 'bypass-blocks', 'Bypass Blocks'),
    wcag242: standardWcag21Link('2.4.2', 'page-titled', 'Page Titled'),
    wcag243: standardWcag21Link('2.4.3', 'focus-order', 'Focus Order'),
    wcag244: standardWcag21Link('2.4.4', 'link-purpose-in-context', 'Link Purpose (In Context)'),
    wcag245: standardWcag21Link('2.4.5', 'multiple-ways', 'Multiple Ways'),
    wcag246: standardWcag21Link('2.4.6', 'headings-and-labels', 'Headings and Labels'),
    wcag247: standardWcag21Link('2.4.7', 'focus-visible', 'Focus Visible'),
    wcag248: standardWcag21Link('2.4.8', 'location', 'Location'),
    wcag249: standardWcag21Link('2.4.9', 'link-purpose-link-only', 'Link Purpose (Link Only)'),
    wcag2410: standardWcag21Link('2.4.10', 'section-headings', 'Section Headings'),
    wcag251: standardWcag21Link('2.5.1', 'pointer-gestures', 'Pointer Gestures'),
    wcag252: standardWcag21Link('2.5.2', 'pointer-cancellation', 'Pointer Cancellation'),
    wcag253: standardWcag21Link('2.5.3', 'label-in-name', 'Label in Name'),
    wcag254: standardWcag21Link('2.5.4', 'motion-actuation', 'Motion Actuation'),
    wcag255: standardWcag21Link('2.5.5', 'target-size', 'Target Size'),
    wcag256: standardWcag21Link('2.5.6', 'concurrent-input-mechanisms', 'Concurrent Input Mechanisms'),
    wcag311: standardWcag21Link('3.1.1', 'language-of-page', 'Language of Page'),
    wcag312: standardWcag21Link('3.1.2', 'language-of-parts', 'Language of Parts'),
    wcag313: standardWcag21Link('3.1.3', 'unusual-words', 'Unusual Words'),
    wcag314: standardWcag21Link('3.1.4', 'abbreviations', 'Abbreviations'),
    wcag315: standardWcag21Link('3.1.5', 'reading-level', 'Reading Level'),
    wcag316: standardWcag21Link('3.1.6', 'pronunciation', 'Pronunciation'),
    wcag321: standardWcag21Link('3.2.1', 'on-focus', 'On Focus'),
    wcag322: standardWcag21Link('3.2.2', 'on-input', 'On Input'),
    wcag323: standardWcag21Link('3.2.3', 'consistent-navigation', 'Consistent Navigation'),
    wcag324: standardWcag21Link('3.2.4', 'consistent-identification', 'Consistent Identification'),
    wcag325: standardWcag21Link('3.2.5', 'change-on-request', 'Change on Request'),
    wcag331: standardWcag21Link('3.3.1', 'error-identification', 'Error Identification'),
    wcag332: standardWcag21Link('3.3.2', 'labels-or-instructions', 'Labels or Instructions'),
    wcag333: standardWcag21Link('3.3.3', 'error-suggestion', 'Error Suggestion'),
    wcag334: standardWcag21Link('3.3.4', 'error-prevention-legal-financial-data', 'Error Prevention (Legal, Financial, Data)'),
    wcag335: standardWcag21Link('3.3.5', 'help', 'Help'),
    wcag336: standardWcag21Link('3.3.6', 'error-prevention-all', 'Error Prevention (All)'),
    wcag411: standardWcag21Link('4.1.1', 'parsing', 'Parsing'),
    wcag412: standardWcag21Link('4.1.2', 'name-role-value', 'Name, Role, Value'),
    wcag413: standardWcag21Link('4.1.3', 'status-messages', 'Status Messages'),
    'best-practice': { text: 'Best Practice' }
}
