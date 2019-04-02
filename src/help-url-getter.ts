import { RulesConfiguration } from './ruleresults';

export class HelpUrlGetter {
    constructor(private readonly ruleConfigs: RulesConfiguration[]) {}

    public getHelpUrl(ruleId: string): string {
        const customHelpUrl = this._getCustomHelpUrl(ruleId);
        return customHelpUrl;
    }

    private _getCustomHelpUrl(ruleId: string): string {
        for (let index = 0; index < this.ruleConfigs.length; index++) {
            const config = this.ruleConfigs[index];
            if (
                config.rule.id === ruleId &&
                config.rule.helpUrl !== undefined
            ) {
                return config.rule.helpUrl;
            }
        }

        return '';
    }
}
