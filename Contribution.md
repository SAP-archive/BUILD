# Welcome to the Project Norman Contribution Page!

So you want to contribute to Project Norman? Good choice! There is lots of scope for contribution, and there's plenty to do! Want to get coding straight away? No problem because we want you to get going as fast as possible as well!

To make the best use of your valuable time we recommend you take a few minutes to read this page before you dive in. It contains everything you need to know in order to get started. 


+ <a href="###What Can I Contribute?">What Can I Contribute?</a>

+ <a href="###How Do I Report Issues?">How Do I Report Issues?</a>

+ <a href="###How Do I Contribute Code?">How Do I Contribute Code?</a>

+ <a href="###Who Contributes to Project Norman Projects?">Who Contributes to Project Norman Projects?</a>


##<a name="What Can I Contribute?"></a>What Can I Contribute?

You might already know exactly what you do, but if not, you might consider contributing in one or all of the following ways: 

+ <a href="#Help Other Drive.SAP Users and Contributors">    Help Other Drive.SAP Users and Contributors</a>

+ <a href="#Analyse Existing Issues">    Analyse Existing Issues</a>

+ <a href="#Report Issues">    Report Issues</a>

+ <a href="#Fix Issues">    Fix Issues</a>

+ <a href="#Propose and Build New Features">    Propose and Build New Features</a>

###<a name="Help Other Drive.SAP Users and Contributors"></a>Help Other Drive.SAP Users and Contributors

You can contribute valuably to Project Norman by helping others users who need support. You will find them, for example, on StackOverflow, or in the SAP Community Network forum.


###<a name="Analyse Existing Issues"></a>Analyze Existing Issues
Check the Issue Tracker in the project repository for issues in an area you are interested in contributing to. You might might be able to provide further information, or a hint that helps other contributors understand the issue. This is a great way to get acquainted with the project. You might want to fix an issue. For more information, see <a href="#Fix Issues">    Fix Issues</a>.

Perhaps there is a new feature being developed that you can contribute to? In this case, simply contact the contributor responsible for the issue using the communication thread for the issue, and make a suggestion or ask if you can help out. Generally contributors are interested to hear what you have to say. Check our Communication Guidelines (link) if you have a moment, so you will know what to expect! 


###<a name="Report Issues"></a>Report Issues
You can contribute by simply reporting issues you encountered when using Project Norman. Before you report a bug, please check in the Issues Tracker first whether it has already been reported by another user.

For guidelines on reporting issues, please refer to <a href="#How Do I Report Issues?">    How Do I Report Issues?</a> section.


###<a name="Fix Issues"></a>Fix Issues

Check the Issue Tracker in the project repository for issues in an area you are interested in fixing. Consider issues that are currently being fixed aswell if they interest you, because the contributor responsible might appreciate the offer of assistance. 

For guidelines on contributing a fix, please refer to <a href="#How Do I Contribute Code?">    How Do I Contribute Code?</a> section.

###<a name="Propose and Build New Features"></a>Propose and Build New Features

We welcome your innovations to Project Norman. If you don't know exactly what you'd like to contribution, why not see if there is something on the project roadmap you find interesting. If you see something, why not give it a go? Contact one of our core developers first though, to make sure nobody else has started it. Even if they have, you might still be able to contribute. In any case, contacting the developer and agreeing on the basic parameters of your proposal is an important if you don't want to risk your contribution being refused. Furthermore, the developer might have some valuable hints and tips that save you a lot of time of and effort. 

For guidelines on contributing an enhancment, please refer to <a href="#How Do I Contribute Code?">    How Do I Contribute Code?</a> section.

##<a name="How Do I Report Issues?"></a>How Do I Report Issues?

Describe the process for reporting issues / How to use issues in Git Hub; how labels are used; how issues are named etc.

Search the [Project Norman GitHub Issue Tracker] (https://github.wdf.sap.corp/Norman/Drive/issues) to make sure the bug has not yet been reported, or that your proposed enhancement hasn't already been started. Once you're certain nobody else is working on your proposed change or fix, you can contact our development team for a quick chat, and maybe we can give you some pointers before you start. You can get their contact details [here](https://github.wdf.sap.corp/Norman/Drive/blob/master/Contributors.md).

Committ messages (describe)_


## Report an Issue

We appreciate all efforts to notify us if something goes wrong. However, we have limite capacity, and only support real bugs that are reported according to the guidelines below.

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
 
### Quick Checklist for Bug Reports

 * Issue report checklist:
 * Real, current bug
 * No duplicate
 * Reproducible
 * Good summary
 * Well-documented
 * Minimal example
 * Use the [template](http://openui5.org/bugreport_template.txt)

You are encouraged to use [this template](http://openui5.org/bugreport_template.txt).

Please report bugs in English, so all users can understand them.

If the bug appears to be a regression introduced in a new version of UI5, try to find the closest versions between which it was introduced and take special care to make sure the issue is not caused by your application's usage of any internal method which changed its behavior.


### Issue handling process

When an issue is reported, a committer will look at it and either confirm it as a real issue (by giving the "approved" label), close it if it is not an issue, or ask for more details. Approved issues are then either assigned to a committer in GitHub, reported in our internal issue handling system, or left open as "contribution welcome" for easy or not urgent fixes.

An issue that is about a real bug is closed as soon as the fix is committed. The closing comment explains which patch version(s) of UI5 will contain the fix.


### Reporting Security Issues

If you find a security issue, please act responsibly and report it not in the public issue tracker, but directly to us, so we can fix it before it can be exploited:
 * SAP Customers: if the found security issue is not covered by a published security note, please report it by creating a customer message at https://service.sap.com/message.
 * Researchers/non-Customers: please send the related information to secure@sap.com using [PGP for e-mail encryption](http://global.sap.com/pc/security/keyblock.txt).
Also refer to the general [SAP security information page](http://www54.sap.com/pc/tech/application-foundation-security/software/security-at-sap/report.html).


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


### Issue Reporting Disclaimer

We want to improve the quality of UI5 and good bug reports are welcome! But our capacity is limited, so we cannot handle questions or consultation requests and we cannot afford to ask for required details. So we reserve the right to close or to not process insufficient bug reports in favor of those which are very cleanly documented and easy to reproduce. Even though we would like to solve each well-documented issue, there is always the chance that it won't happen - remember: OpenUI5 is Open Source and comes without warranty.

Bug report analysis support is very welcome! (e.g. pre-analysis or proposing solutions)


##<a name="How Do I Contribute Code?"></a>How Do I Contribute Code?

Most likely, you want to contribute code to fix an existing bug, enhancement an existing feature, or add a new feature. This section describes how to do the following: (This list should be cross-applicable for both fixes and enhancements (with special mention to ensure that they have reviewed the earlier sections referring to making sure they've checked whether its been done, are familiar with guidelines etc.)


1. Search the issue tracker to make sure the bug has not yet been reported, or that your proposed enhancement hasn't already been started by somebody else. 
 
2. Contact our development team for a quick chat. While we deeply appreciate your efforts, we do not accept and support all new features or bug fixes submitted by contributors.  Use the DL for the project,  or the project blog, to contact a member of the core development team and describe your idea before you start. The developer may agree to support your new feature, in which case he can probably provide you with some valuable advice, or recommendations for modifications. In cases where the developer does not support your new feature, she can provide you with an explanation, and perhaps recommend an alternative.
 
**       We do not accept proposal for new features through the Issue Tracker. They will be removed.**

3. Review the [Apache License] (https://github.wdf.sap.corp/Norman/Drive/blob/master/License.txt) (which describes contributions) which outlines both your and the Project Norman Open Source Community's legal rights regarding your contribution.

4. Download, read, sign, and send us our [Individual Contribution License Agreement] (https://github.wdf.sap.corp/Norman/Drive/blob/master/docs/SAP%20Individual%20Contributor%20License%20Agreement.pdf) if you want to submit code as an individual. Alternatively, if you want to submit code on behalf of your employer, a company representative authorized to do so needs to download, fill, and print the [Corporate Contributor License Agreement] (https://github.wdf.sap.corp/Norman/Drive/blob/master/docs/SAP%20Corporate%20Contributor%20License%20Agreement.pdf) form.  

5. Download the GiTHub Repository for the project. (link to instructions on how to)

6. Install the required tools. (link to suitable documents in wiki)
 
7. Implement your new feature or bug fix on your branch. For consistency, and to enhance the chances that your contribution will be passed for review without corrections required, please review our coding guidelines to ensure that your code conforms to our current approach. (link to coding guidelines)

8. Perform the requisite pre-pull request testing procedures (link to description of these in the wiki - overlap with guidelines)

9. Make a pull request, and wait for a response from the project team reviewer or committer for the area to which your bug fix or enhancment applies. (link to how to make a pull request) + (link to our specific committe message procedure - probably on our guidelines)


###<a name="What are the Project Norman Development Guidelines?"></a>What are the Project Norman Development Guidelines?
Integrate this with the above (i.e. what are the things that need to be provide for 1. a bug fix; 2. a new feature) - in a sense, what to do before (see above), and then the adherence to guidelines are two sepearate processes.

Abstract definition of the languages, styles, quality issues (they can impact whether the contribution is adopted and integrated - this should also be stressed in earlier section, along with the warning that not all pull requests are accepted). Include links to specific wiki pages, where this information is stored.



1. Base all your work off of the devel branch. The devel branch is where active development happens. We do not merge patches directly into master.

2. Name your branch to match the new feature of bug fix that you are submitting.

3. Limit yourself to one feature or bug fix per pull request.

4. Include tests that prove your code works.

5. Follow the MDG style guide for code and commit messages.

Be sure your author field in git is properly filled out with your full name and email address so we can credit you.



##<a name="Who Contributes to Project Norman Projects?"></a>Who Contributes to Project Norman Projects?

The Project Norman Open Source community comprises the following roles:

+ <a href="#Users">Users</a>


+ <a href="#Contributors">Contributors</a>


+ <a href="#Committers">Comitters</a>


+ <a href="#Reviewers">Reviewers</a>


+ <a href="#Public Management Committee Member">Public Management Committee </a>


###<a name="Users"></a>Users

Without our users, Project Norman has no business purpose, and therefore their satisfaction is our goal. However, users' experience of creating apps for their businesses using Project Norman is also an invaluable source of user information for the Project Norman open source community. In addition, users police the work of open source community contributors by logging bug requests when they notice something isn't working as it should. Most current contributors are users who saw something in Project Norman that they wanted to be involved with, and started contributing.

###<a name="Contributors"></a>Contributors

Describe contributor's roles and rights. Describe how they can become Committers  (or who they can become)

Describe development desirable skill levels (with suggestions for where they might be useful). The Apache approach is to point beginners to areas where the can begin working straight away, without have to learn much in advance, but also to make sure that the don't change anything that impacts an expert contributor negatively.

You can find out more about our current reviewers and contributors on the [Contributors] (https://github.wdf.sap.corp/Norman/Drive/blob/master/Contributors.md)  page.

###<a name="Reviewers"></a>Reviewers

Reviewers are responsible for reviewing all code and documentation submissions to projects. Reviewers are respsible for ensuring that submissions meet the agreed requirments in terms of scope, code-quality, and functionality. In order to optimize the chances for your submissions to pass the review stage, we recommend you review the submission guidelines (link) and code guidelines (link.)

The number of reviewers per project varies with the size of the project and the number of contribution.

Established contributors in a project can be enabled as reviewers for that project if they receive the support of the project steering committee. It can be useful to be a committer. 

You can find out more about our current reviewers and contributors on the [Contributors] (https://github.wdf.sap.corp/Norman/Drive/blob/master/Contributors.md)  page.

When you have submitted a pull request, a qualified review on the project team reviews your contribution to evaluate whether it can be committed to the master copy of the project, whether further discussion and development for further consideration, or whether it is not accepted as a contribution. It is generally expected that some communication is required with contributors after they have submitted a pull request, and quite rare that a contribution is accepted without qualification on the first attempt.

Reviewers are generally experts in the environment to which the contribution applies, and are also Committers.

Outline terms of how these decisions are made, how contributions are recognized/rewarded, how conflicts are resolved, how a lazy consensus is a useful tool, how features that have been agreed upon earlier, and that conform to coding guidelines, have a dramatically improved chance of being accepted straight away. 




###<a name="Committers"></a>Committers

Committers are responsible for commiting changes submitted by pull request and passed by a reviewer.


Established contributors in a project can be enabled as reviewers for that project if they receive the support of the project steering committee. It can be useful to be a committer. For example, providing support for Project Norman to a customer, being a committer could be a big selling poin of their skills for the customer.  

You can find out more about our current reviewers and contributors on the [Contributors] (https://github.wdf.sap.corp/Norman/Drive/blob/master/Contributors.md)  page.


###<a name="Project Steering Committee"></a>Public Management Committee

Each project is run on day to day basis by the contributors, and operates under the guidance of a dedicated Project Steering Committee. Project Steering Committees are responsible for providing oversight of project developments, securing and organizing resources, removing obtacles, and resolving conflicts. Each Project Steering Committee, in turn, operates under the guidance of the Project Norman Steering Committee. For more information on the composition and roles of these steering committees, and the Project Norman project structure, see [Project Norman Project Managment](https://github.wdf.sap.corp/Norman/Norman/wiki/Project-Norman-Project-Management).
