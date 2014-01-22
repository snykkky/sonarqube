/*
 * SonarQube, open source software quality management tool.
 * Copyright (C) 2008-2013 SonarSource
 * mailto:contact AT sonarsource DOT com
 *
 * SonarQube is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * SonarQube is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */
package org.sonar.server.issue.ws;

import com.google.common.collect.Lists;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.runners.MockitoJUnitRunner;
import org.sonar.api.component.Component;
import org.sonar.api.issue.ActionPlan;
import org.sonar.api.issue.Issue;
import org.sonar.api.issue.IssueFinder;
import org.sonar.api.issue.IssueQuery;
import org.sonar.api.issue.action.Action;
import org.sonar.api.issue.internal.DefaultIssue;
import org.sonar.api.issue.internal.DefaultIssueComment;
import org.sonar.api.issue.internal.WorkDayDuration;
import org.sonar.api.rule.RuleKey;
import org.sonar.api.rules.Rule;
import org.sonar.api.server.ws.SimpleRequest;
import org.sonar.api.user.User;
import org.sonar.api.utils.DateUtils;
import org.sonar.core.issue.DefaultActionPlan;
import org.sonar.core.issue.DefaultIssueQueryResult;
import org.sonar.core.issue.workflow.Transition;
import org.sonar.core.user.DefaultUser;
import org.sonar.server.issue.ActionService;
import org.sonar.server.issue.IssueService;
import org.sonar.server.technicaldebt.InternalRubyTechnicalDebtService;
import org.sonar.server.text.RubyTextService;
import org.sonar.server.user.MockUserSession;
import org.sonar.server.user.UserSession;
import org.sonar.server.ws.WsTester;

import java.util.ArrayList;
import java.util.List;

import static com.google.common.collect.Lists.newArrayList;
import static org.mockito.Matchers.any;
import static org.mockito.Matchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@RunWith(MockitoJUnitRunner.class)
public class IssueShowWsHandlerTest {

  @Mock
  IssueFinder issueFinder;

  @Mock
  IssueService issueService;

  @Mock
  ActionService actionService;

  @Mock
  InternalRubyTechnicalDebtService technicalDebtService;

  @Mock
  RubyTextService textService;

  List<Issue> issues;
  DefaultIssueQueryResult result;

  WsTester tester;

  @Before
  public void setUp() throws Exception {
    issues = new ArrayList<Issue>();
    result = new DefaultIssueQueryResult(issues);
    Component component = mock(Component.class);
    when(component.key()).thenReturn("org.sonar.Sonar");
    result.addProjects(newArrayList(component));
    result.addRules(newArrayList(Rule.create("squid", "AvoidCycle").setName("Avoid cycle")));
    when(issueFinder.find(any(IssueQuery.class))).thenReturn(result);

    tester = new WsTester(new IssuesWs(new IssueShowWsHandler(issueFinder, issueService, actionService, technicalDebtService, textService)));
  }

  @Test
  public void show_issue() throws Exception {
    String issueKey = "ABCD";
    Issue issue = new DefaultIssue()
      .setKey(issueKey)
      .setComponentKey("org.sonar.server.issue.IssueClient")
      .setProjectKey("org.sonar.Sonar")
      .setRuleKey(RuleKey.of("squid", "AvoidCycle"))
      .setLine(12)
      .setEffortToFix(2.0)
      .setMessage("Fix it")
      .setResolution("FIXED")
      .setStatus("CLOSED")
      .setSeverity("MAJOR")
      .setCreationDate(DateUtils.parseDateTime("2014-01-22T19:10:03+0100"));
    issues.add(issue);

    MockUserSession.set();
    SimpleRequest request = new SimpleRequest().setParam("key", issueKey);
    tester.execute("show", request).assertJson(getClass(), "show_issue.json");
  }

  @Test
  public void show_issue_with_action_plan() throws Exception {
    Issue issue = createStandardIssue()
      .setActionPlanKey("AP-ABCD")
      .setCreationDate(DateUtils.parseDateTime("2014-01-22T19:10:03+0100"));
    issues.add(issue);

    result.addActionPlans(newArrayList((ActionPlan) new DefaultActionPlan().setKey("AP-ABCD").setName("Version 4.2")));

    MockUserSession.set();
    SimpleRequest request = new SimpleRequest().setParam("key", issue.key());
    tester.execute("show", request).assertJson(getClass(), "show_issue_with_action_plan.json");
  }

  @Test
  public void show_issue_with_users() throws Exception {
    Issue issue = createStandardIssue()
      .setAssignee("john")
      .setReporter("steven")
      .setAuthorLogin("henry");
    issues.add(issue);

    result.addUsers(Lists.<User>newArrayList(
      new DefaultUser().setLogin("john").setName("John"),
      new DefaultUser().setLogin("steven").setName("Steven"),
      new DefaultUser().setLogin("henry").setName("Henry")
    ));

    MockUserSession.set();
    SimpleRequest request = new SimpleRequest().setParam("key", issue.key());
    tester.execute("show", request).assertJson(getClass(), "show_issue_with_users.json");
  }

  @Test
  public void show_issue_with_technical_debt() throws Exception {
    WorkDayDuration technicalDebt = WorkDayDuration.of(1, 2, 0);
    Issue issue = createStandardIssue()
      .setTechnicalDebt(technicalDebt);
    issues.add(issue);

    when(technicalDebtService.format(technicalDebt)).thenReturn("2 hours 1 minutes");

    MockUserSession.set();
    SimpleRequest request = new SimpleRequest().setParam("key", issue.key());
    tester.execute("show", request).assertJson(getClass(), "show_issue_with_technical_debt.json");
  }

  @Test
  public void show_issue_with_dates() throws Exception {
    Issue issue = createStandardIssue()
      .setCreationDate(DateUtils.parseDateTime("2014-01-22T19:10:03+0100"))
      .setUpdateDate(DateUtils.parseDateTime("2014-01-23T19:10:03+0100"))
      .setCloseDate(DateUtils.parseDateTime("2014-01-24T19:10:03+0100"));
    issues.add(issue);

    MockUserSession.set();
    SimpleRequest request = new SimpleRequest().setParam("key", issue.key());
    tester.execute("show", request).assertJson(getClass(), "show_issue_with_dates.json");
  }

  @Test
  public void show_issue_with_comments() throws Exception {
    Issue issue = createStandardIssue()
      .addComment(
        new DefaultIssueComment()
          .setKey("COMMENT-ABCD")
          .setMarkdownText("*My comment*")
          .setUserLogin("john")
          .setCreatedAt(DateUtils.parseDateTime("2014-01-23T19:10:03+0100"))
      );
    issues.add(issue);
    result.addUsers(newArrayList((User) new DefaultUser().setLogin("john").setName("John")));

    when(textService.markdownToHtml("*My comment*")).thenReturn("<b>My comment</b>");

    MockUserSession.set();
    SimpleRequest request = new SimpleRequest().setParam("key", issue.key());
    tester.execute("show", request).assertJson(getClass(), "show_issue_with_comments.json");
  }

  @Test
  public void show_issue_with_transitions() throws Exception {
    Issue issue = createStandardIssue()
      .setStatus("RESOLVED")
      .setResolution("FIXED");
    issues.add(issue);

    when(issueService.listTransitions(eq(issue), any(UserSession.class))).thenReturn(newArrayList(Transition.create("reopen", "RESOLVED", "REOPEN")));

    MockUserSession.set().setLogin("john");
    SimpleRequest request = new SimpleRequest().setParam("key", issue.key());
    tester.execute("show", request).assertJson(getClass(), "show_issue_with_transitions.json");
  }

  @Test
  public void show_issue_with_actions() throws Exception {
    Issue issue = createStandardIssue()
      .setStatus("OPEN");
    issues.add(issue);

    MockUserSession.set().setLogin("john");
    SimpleRequest request = new SimpleRequest().setParam("key", issue.key());
    tester.execute("show", request).assertJson(getClass(), "show_issue_with_actions.json");
  }

  @Test
  public void show_issue_with_actions_defined_by_plugins() throws Exception {
    Issue issue = createStandardIssue()
      .setStatus("OPEN");
    issues.add(issue);

    Action action = mock(Action.class);
    when(action.key()).thenReturn("link-to-jira");
    when(actionService.listAvailableActions(issue)).thenReturn(newArrayList(action));

    MockUserSession.set().setLogin("john");
    SimpleRequest request = new SimpleRequest().setParam("key", issue.key());
    tester.execute("show", request).assertJson(getClass(), "show_issue_with_actions_defined_by_plugins.json");
  }

  private DefaultIssue createStandardIssue(){
    return new DefaultIssue()
      .setKey("ABCD")
      .setComponentKey("org.sonar.server.issue.IssueClient")
      .setProjectKey("org.sonar.Sonar")
      .setRuleKey(RuleKey.of("squid", "AvoidCycle"))
      .setCreationDate(DateUtils.parseDateTime("2014-01-22T19:10:03+0100"));
  }
}
