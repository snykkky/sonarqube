/*
 * SonarQube
 * Copyright (C) 2009-2024 SonarSource SA
 * mailto:info AT sonarsource DOT com
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */
import { ButtonPrimary, ButtonSecondary, FlagMessage, RadioButton, Spinner } from 'design-system';
import { noop } from 'lodash';
import * as React from 'react';
import GlobalNewCodeDefinitionDescription from '../../../components/new-code-definition/GlobalNewCodeDefinitionDescription';
import NewCodeDefinitionDaysOption from '../../../components/new-code-definition/NewCodeDefinitionDaysOption';
import NewCodeDefinitionPreviousVersionOption from '../../../components/new-code-definition/NewCodeDefinitionPreviousVersionOption';
import { NewCodeDefinitionLevels } from '../../../components/new-code-definition/utils';
import { translate } from '../../../helpers/l10n';
import { Branch } from '../../../types/branch-like';
import { NewCodeDefinition, NewCodeDefinitionType } from '../../../types/new-code-definition';
import { validateSetting } from '../utils';
import NewCodeDefinitionSettingAnalysis from './NewCodeDefinitionSettingAnalysis';
import NewCodeDefinitionSettingReferenceBranch from './NewCodeDefinitionSettingReferenceBranch';

export interface ProjectBaselineSelectorProps {
  analysis?: string;
  branch?: Branch;
  branchList: Branch[];
  branchesEnabled?: boolean;
  component: string;
  newCodeDefinitionType?: NewCodeDefinitionType;
  newCodeDefinitionValue?: string;
  previousNonCompliantValue?: string;
  projectNcdUpdatedAt?: number;
  days: string;
  globalNewCodeDefinition: NewCodeDefinition;
  isChanged: boolean;
  onCancel: () => void;
  onSelectDays: (value: string) => void;
  onSelectReferenceBranch: (value: string) => void;
  onSelectSetting: (value: NewCodeDefinitionType) => void;
  onSubmit: (e: React.SyntheticEvent<HTMLFormElement>) => void;
  onToggleSpecificSetting: (selection: boolean) => void;
  referenceBranch?: string;
  saving: boolean;
  selectedNewCodeDefinitionType?: NewCodeDefinitionType;
  overrideGlobalNewCodeDefinition: boolean;
}

function branchToOption(b: Branch) {
  return { label: b.name, value: b.name, isMain: b.isMain };
}

export default function ProjectNewCodeDefinitionSelector(
  props: Readonly<ProjectBaselineSelectorProps>,
) {
  const {
    analysis,
    branch,
    branchList,
    branchesEnabled,
    component,
    newCodeDefinitionType,
    newCodeDefinitionValue,
    previousNonCompliantValue,
    projectNcdUpdatedAt,
    days,
    globalNewCodeDefinition,
    isChanged,
    overrideGlobalNewCodeDefinition,
    referenceBranch,
    saving,
    selectedNewCodeDefinitionType,
  } = props;

  const isValid = validateSetting({
    numberOfDays: days,
    overrideGlobalNewCodeDefinition,
    referenceBranch,
    selectedNewCodeDefinitionType,
  });

  if (branch === undefined) {
    return null;
  }

  return (
    <form className="it__project-baseline-selector" onSubmit={props.onSubmit}>
      <div className="sw-mb-4 sw-mt-8" role="radiogroup">
        <RadioButton
          checked={!overrideGlobalNewCodeDefinition}
          className="sw-mb-4"
          onCheck={() => props.onToggleSpecificSetting(false)}
          value="general"
        >
          <span>{translate('project_baseline.global_setting')}</span>
        </RadioButton>

        <div className="sw-ml-4">
          <GlobalNewCodeDefinitionDescription globalNcd={globalNewCodeDefinition} />
        </div>

        <RadioButton
          checked={overrideGlobalNewCodeDefinition}
          className="sw-mt-8"
          onCheck={() => props.onToggleSpecificSetting(true)}
          value="specific"
        >
          {translate('project_baseline.specific_setting')}
        </RadioButton>
      </div>

      <div className="sw-flex sw-flex-col sw-gap-4" role="radiogroup">
        <NewCodeDefinitionPreviousVersionOption
          disabled={!overrideGlobalNewCodeDefinition}
          onSelect={props.onSelectSetting}
          selected={
            overrideGlobalNewCodeDefinition &&
            selectedNewCodeDefinitionType === NewCodeDefinitionType.PreviousVersion
          }
        />
        <NewCodeDefinitionDaysOption
          days={days}
          currentDaysValue={
            newCodeDefinitionType === NewCodeDefinitionType.NumberOfDays
              ? newCodeDefinitionValue
              : undefined
          }
          previousNonCompliantValue={previousNonCompliantValue}
          updatedAt={projectNcdUpdatedAt}
          disabled={!overrideGlobalNewCodeDefinition}
          isChanged={isChanged}
          isValid={isValid}
          onChangeDays={props.onSelectDays}
          onSelect={props.onSelectSetting}
          selected={
            overrideGlobalNewCodeDefinition &&
            selectedNewCodeDefinitionType === NewCodeDefinitionType.NumberOfDays
          }
          settingLevel={NewCodeDefinitionLevels.Project}
        />
        {branchesEnabled && (
          <NewCodeDefinitionSettingReferenceBranch
            branchList={branchList.map(branchToOption)}
            disabled={!overrideGlobalNewCodeDefinition}
            onChangeReferenceBranch={props.onSelectReferenceBranch}
            onSelect={props.onSelectSetting}
            referenceBranch={referenceBranch ?? ''}
            selected={
              overrideGlobalNewCodeDefinition &&
              selectedNewCodeDefinitionType === NewCodeDefinitionType.ReferenceBranch
            }
            settingLevel={NewCodeDefinitionLevels.Project}
          />
        )}
        {!branchesEnabled && newCodeDefinitionType === NewCodeDefinitionType.SpecificAnalysis && (
          <NewCodeDefinitionSettingAnalysis
            onSelect={noop}
            analysis={analysis ?? ''}
            branch={branch.name}
            component={component}
            selected={
              overrideGlobalNewCodeDefinition &&
              selectedNewCodeDefinitionType === NewCodeDefinitionType.SpecificAnalysis
            }
          />
        )}
      </div>
      <div className="sw-mt-4">
        {isChanged && (
          <FlagMessage variant="info" className="sw-mb-4">
            {translate('baseline.next_analysis_notice')}
          </FlagMessage>
        )}
        <div className="sw-flex sw-items-center">
          <ButtonPrimary type="submit" disabled={!isValid || !isChanged || saving}>
            {translate('save')}
          </ButtonPrimary>
          <ButtonSecondary
            className="sw-ml-2"
            disabled={saving || !isChanged}
            onClick={props.onCancel}
          >
            {translate('cancel')}
          </ButtonSecondary>
          <Spinner className="sw-ml-2" loading={saving} />
        </div>
      </div>
    </form>
  );
}
