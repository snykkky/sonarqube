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
import * as React from 'react';
import { translate, translateWithParameters } from '../../helpers/l10n';
import { formatMeasure } from '../../helpers/measures';
import { MetricType } from '../../types/metrics';
import { ButtonLink } from '../controls/buttons';

interface Props {
  count: number;
  showMore: () => void;
  showLess?: () => void;
  total: number;
  showMoreAriaLabel?: string;
  showLessAriaLabel?: string;
}

export default class ListStyleFacetFooter extends React.PureComponent<Props> {
  handleShowMoreClick = () => {
    this.props.showMore();
  };

  handleShowLessClick = () => {
    if (this.props.showLess) {
      this.props.showLess();
    }
  };

  render() {
    const { count, total, showMoreAriaLabel, showLessAriaLabel } = this.props;
    const hasMore = total > count;
    const allShown = Boolean(total && total === count);

    return (
      <div className="note spacer-top spacer-bottom text-center">
        {translateWithParameters('x_show', formatMeasure(count, MetricType.Integer))}

        {hasMore && (
          <ButtonLink
            className="spacer-left"
            aria-label={showMoreAriaLabel}
            onClick={this.handleShowMoreClick}
          >
            {translate('show_more')}
          </ButtonLink>
        )}

        {this.props.showLess && allShown && (
          <ButtonLink
            className="spacer-left"
            aria-label={showLessAriaLabel}
            onClick={this.handleShowLessClick}
          >
            {translate('show_less')}
          </ButtonLink>
        )}
      </div>
    );
  }
}
