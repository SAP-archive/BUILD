We appreciate all efforts to notify us if something goes wrong. However, we have limite capacity, and only support real bugs that are reported according to the guidelines below.

<b>We do not accept proposal for new features through the Issue Tracker. They will be removed.</b>

Once you have acquainted yourself with the guidelines, you can go to project Issue Tracker to report the issue.


### Requirements for a bug report

Please conform you bug report to the following:
 1. **Only real bugs**: please do your best to make sure to only report real bugs. You should not report:
   * issues caused by application code or any code outside Project Norman.
   * issues that you cannot reproduce.
   * something that behaves just different from what you expected. A bug is when something behaves different than specified. When in doubt, ask in a forum.
   * requests for help in achieving a task in Project Norman. Please use a support forum like stackoverflow to request help.
   * feature requests. Features requests are removed from the project Issue Tracker automatically. For guidelines on contributing an enhancment, please refer to <a href="#Propose and Build New Features">    Propose and Build New Features</a> section.
 2. No duplicate: please search the issue tracker and make sure you bug has been reported previously.
 3. Good summary: please ensure the summary is specific to the issue.
 4. Current bug: the bug can be reproduced in the most current version. Please state the tested version!
 5. Reproducible bug: Please provide steps to reproduce the error, including:
   * a URL to access the example
   * any required user/password information. However, please ensure you don't reveal any proprietary security credentials.
   * detailed and complete step-by-step instructions to reproduce the bug
 6. Precise description:
   * precisely state the expected and the actual behavior
   * give information about the used browser/device and its version, if possible also the behavior in other browsers/devices
   * if the bug is appears on a UI, please attach a screenshot with callouts describing the problem.
   * generally give as much additional information as possible. (But find the right balance: don not invest hours for a very obvious and easy to solve issue. When in doubt, give more information.)
 7. Minimal example: it is highly encouraged to provide a minimal example to reproduce in e.g. jsbin: isolate the application code which triggers the issue and strip it down as much as possible as long as the issue still occurs. If several files are required, you can create a gist. This may not always be possible and sometimes be overkill, but it always helps analyzing a bug.
 8. Only one bug per report: open different tickets for different issues


You are encouraged to use [this template](https://github.wdf.sap.corp/Norman/Norman/blob/master/bug_report_template.md).

Please report bugs in English, so all users can understand them.

If the bug appears to be a regression introduced in a new version of UI5, try to find the closest versions between which it was introduced and take special care to make sure the issue is not caused by your application's usage of any internal method which changed its behavior.

 
### Quick Checklist for Bug Reports

 * Issue report checklist:
 * Real, current bug
 * No duplicate
 * Reproducible
 * Good summary
 * Well-documented
 * Minimal example
 * Use the [template](https://github.wdf.sap.corp/Norman/Norman/blob/master/bug_report_template.md)


### Issue handling process

When an issue is reported, a committer will look at it and either confirm it as a real issue (by giving the "approved" label), close it if it is not an issue, or ask for more details. Approved issues are then either assigned to a committer in GitHub, reported in our internal issue handling system, or left open as "contribution welcome" for easy or not urgent fixes.

An issue that is about a real bug is closed as soon as the fix is committed. The closing comment explains which patch version(s) of UI5 will contain the fix.


### Usage of Labels

Github offers labels to categorize issues. We defined the following labels so far:

Labels for issue categories:
 * bug: this issue is a bug in the code
 * documentation: this issue is about wrong documentation
 * enhancement: this is not a bug report, but an enhancement request

Status of open issues:
 * unconfirmed: this report needs confirmation whether it is really a bug (no label; this is the default status)
 * approved: this issue is confirmed to be a bug
 * author action: the author is required to provide information
 * contribution welcome: this fix/enhancement is approved and you are invited to contribute it

Status/resolution of closed issues:
 * fixed: a fix for the issue was provided
 * duplicate: the issue is also reported in a different ticket and is handled there
 * invalid: for some reason or another this issue report will not be handled further (maybe lack of information or issue does not apply anymore)
 * works: not reproducible or working as expected
 * wontfix: while acknowledged to be an issue, a fix cannot or will not be provided

The labels can only be set and modified by committers.
