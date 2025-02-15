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
import { withTheme } from '@emotion/react';
import styled from '@emotion/styled';
import {
  LAYOUT_FOOTER_HEIGHT,
  LAYOUT_GLOBAL_NAV_HEIGHT,
  LargeCenteredLayout,
  PageContentFontWrapper,
  Spinner,
  themeBorder,
  themeColor,
} from 'design-system';
import * as React from 'react';
import { useCallback, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
import Suggestions from '../../../components/embed-docs-modal/Suggestions';
import '../../../components/search-navigator.css';
import { translate, translateWithParameters } from '../../../helpers/l10n';
import {
  addSideBarClass,
  addWhitePageClass,
  removeSideBarClass,
  removeWhitePageClass,
} from '../../../helpers/pages';
import { getQualityGateUrl } from '../../../helpers/urls';
import { useQualityGatesQuery } from '../../../queries/quality-gates';
import { QualityGate } from '../../../types/types';
import '../styles.css';
import Details from './Details';
import List from './List';
import ListHeader from './ListHeader';

export default function App() {
  const { data, isLoading } = useQualityGatesQuery();
  const { name } = useParams();
  const navigate = useNavigate();
  const {
    qualitygates: qualityGates,
    actions: { create: canCreate },
  } = data ?? { qualitygates: [], actions: { create: false } };

  const openDefault = useCallback(
    (qualityGates?: QualityGate[]) => {
      if (!qualityGates || qualityGates.length === 0) {
        return;
      }
      const defaultQualityGate = qualityGates.find((gate) => Boolean(gate.isDefault));
      if (!defaultQualityGate) {
        return;
      }
      navigate(getQualityGateUrl(defaultQualityGate.name), { replace: true });
    },
    [navigate],
  );

  useEffect(() => {
    addWhitePageClass();
    addSideBarClass();

    return () => {
      removeWhitePageClass();
      removeSideBarClass();
    };
  }, []);

  useEffect(() => {
    if (!name) {
      openDefault(qualityGates);
    }
  }, [name, openDefault, qualityGates]);

  return (
    <LargeCenteredLayout id="quality-gates-page">
      <PageContentFontWrapper className="sw-body-sm">
        <Helmet
          defer={false}
          titleTemplate={translateWithParameters(
            'page_title.template.with_category',
            translate('quality_gates.page'),
          )}
        />
        <div className="sw-grid sw-gap-x-12 sw-gap-y-6 sw-grid-cols-12 sw-w-full">
          <Suggestions suggestions="quality_gates" />

          <StyledContentWrapper
            className="sw-col-span-3 sw-px-4 sw-py-6 sw-border-y-0 sw-rounded-0"
            style={{
              height: `calc(100vh - ${LAYOUT_GLOBAL_NAV_HEIGHT + LAYOUT_FOOTER_HEIGHT}px)`,
            }}
          >
            <ListHeader canCreate={canCreate} />
            <Spinner loading={isLoading}>
              <List qualityGates={qualityGates} currentQualityGate={name} />
            </Spinner>
          </StyledContentWrapper>

          {name !== undefined && (
            <div
              className="sw-col-span-9 sw-overflow-y-auto"
              style={{
                height: `calc(100vh - ${LAYOUT_GLOBAL_NAV_HEIGHT + LAYOUT_FOOTER_HEIGHT}px)`,
              }}
            >
              <StyledContentWrapper className="sw-my-12">
                <Details qualityGateName={name} />
              </StyledContentWrapper>
            </div>
          )}
        </div>
      </PageContentFontWrapper>
    </LargeCenteredLayout>
  );
}

const StyledContentWrapper = withTheme(styled.div`
  box-sizing: border-box;
  border-radius: 4px;
  background-color: ${themeColor('filterbar')};
  border: ${themeBorder('default', 'filterbarBorder')};
  overflow-x: hidden;
`);
