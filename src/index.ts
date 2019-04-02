import * as Axe from 'axe-core';
import { SarifConverter } from './sarif-converter';
import { wcagLinkData } from './wcag';
import { ResultDecorator } from './result-decorator';
import { rulesWCAGConfiguration } from './wcag-mappings';
import { DocumentUtils } from './document-utils';
import { MessageDecorator } from './message-decorator';
import { configuration } from './custom-rule-configurations';
import { CheckMessageTransformer } from './check-message-transformer';
import { HelpUrlGetter } from './help-url-getter';
import { SarifLog } from './sarif/sarifLog';

export function axeToSarif(axeResults: Axe.AxeResults): SarifLog {
    const messageDecorator = new MessageDecorator(
        configuration,
        new CheckMessageTransformer(),
    );

    const helpUrlGetter = new HelpUrlGetter(configuration);
    const resultDecorator = new ResultDecorator(
        new DocumentUtils(),
        messageDecorator,
        ruleId => helpUrlGetter.getHelpUrl(ruleId),
    );

    resultDecorator.setWCAGConfiguration(rulesWCAGConfiguration);

    const sarifConverter = new SarifConverter(wcagLinkData);

    // AxeResults -> ScannerResults
    const scannerResults = resultDecorator.decorateResults(axeResults);

    // ScannerResults -> ISarifLog
    return sarifConverter.convert(scannerResults, {}); // TODO - ScannerOptions w/ scanName, testCaseId, scanId
}
