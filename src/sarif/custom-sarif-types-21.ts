// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
export const enum SarifLogVersion21 {
    version = '2.1.0',
}

export namespace Result {
    export const enum kind {
        notApplicable = 'notApplicable',
        pass = 'pass',
        fail = 'fail',
        review = 'review',
        open = 'open',
        informational = 'informational',
    }

    export const enum level {
        none = 'none',
        note = 'note',
        warning = 'warning',
        error = 'error',
    }
}

/**
 * Encapsulates a message intended to be read by the end user.
 */
export interface Message {
    /**
     * A plain text message string.
     */
    text?: string;

    /**
     * The resource id for a plain text message string.
     */
    messageId?: string;

    /**
     * A rich text message string.
     */
    richText?: string;

    /**
     * The resource id for a rich text message string.
     */
    richMessageId?: string;

    /**
     * An array of strings to substitute into the message string.
     */
    arguments?: string[];
}
