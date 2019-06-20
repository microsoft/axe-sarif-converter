// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as Axe from 'axe-core';
import * as Sarif from 'sarif';
import { formatSarifResultMessage } from './sarif-result-message-formatter';

describe('sarif-result-message-formatter formatSarifResultMessage', () => {
    const expectedResults: Sarif.Message[] = [
        // fail
        {
            text:
                'Fix all of the following: stub_node_message_all[0]. stub_node_message_none[0]. ' +
                'Fix any of the following: stub_node_message_any[0]. stub_node_id_any[1].',
            markdown:
                'Fix all of the following:\n- stub_node_message_all[0].\n- stub_node_message_none[0].\n\n' +
                'Fix any of the following:\n- stub_node_message_any[0].\n- stub_node_id_any[1].',
        },
        // not fail
        {
            text:
                'The following tests passed: stub_node_message_all[0]. stub_node_message_none[0]. ' +
                'stub_node_message_any[0]. stub_node_id_any[1].',
            markdown:
                'The following tests passed:\n- stub_node_message_all[0].\n- stub_node_message_none[0].\n' +
                '- stub_node_message_any[0].\n- stub_node_id_any[1].',
        },
    ];

    let stub_node: Axe.NodeResult;
    beforeAll(() => {
        stub_node = {
            any: [
                {
                    id: 'stub_node_id_any[0]',
                    message: 'stub_node_message_any[0]',
                },
                {
                    id: 'stub_node_id_any[1]',
                },
            ],
            all: [
                {
                    id: 'stub_node_id_all[0]',
                    message: 'stub_node_message_all[0]',
                },
            ],
            none: [
                {
                    id: 'stub_node_id_none[0]',
                    message: 'stub_node_message_none[0]',
                },
            ],
        } as Axe.NodeResult;
    });

    it('produces expected Sarif Message for kind: fail', () => {
        const actualResults: Sarif.Message = formatSarifResultMessage(
            stub_node,
            'fail',
        );

        expect(actualResults).toEqual(expectedResults[0]);
    });

    it('produces expected Sarif Message for kind: pass', () => {
        const actualResults: Sarif.Message = formatSarifResultMessage(
            stub_node,
            'pass',
        );

        expect(actualResults).toEqual(expectedResults[1]);
    });
});
