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
