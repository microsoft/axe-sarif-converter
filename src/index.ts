import * as Axe from 'axe-core';
import { CheckMessageTransformer } from './check-message-transformer';
import { configuration } from './custom-rule-configurations';
import { DocumentUtils } from './document-utils';
import { HelpUrlGetter } from './help-url-getter';
import { MessageDecorator } from './message-decorator';
import { ResultDecorator } from './result-decorator';
import { SarifConverter } from './sarif-converter';
import { SarifLog } from './sarif/sarifLog';
import { wcagLinkData } from './wcag';
import { rulesWCAGConfiguration } from './wcag-mappings';

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
    // TODO - ScannerOptions w/ scanName, testCaseId, scanId
    return sarifConverter.convert(scannerResults, {});
}
