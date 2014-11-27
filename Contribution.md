# Welcome to the Project Norman Contribution Page!

So you want to contribute to a Project Norman project? Good choice! There is lots of scope for contribution, and there's plenty to do! As you may know, Project Norman is composed of the numerous <a href="#Project Norman Sub-Projects"> Project Norman Sub-Projects</a>, each of which have their own repository. This document desibes contirubiton guidelines that should be applied if you are make contributions to any of these sub-project repositories.

Want to get coding straight away? No problem because we want you to get going as fast as possible as well! To make the best use of your valuable time we recommend you take a few minutes to read this page before you dive in. It contains everything you need to know in order to get started. 

+ <a href="#What Can I Contribute?">   What Can I Contribute?</a>

+ <a href="#How Do I Report Issues?">   How Do I Report Issues?</a>

+ <a href="#How Do I Make Changes to Product Norman Sub-Projects?"> How Do I Make Changes to Product Norman Sub-Projects?</a>

+ <a href="#Who Contributes to Project Norman Projects?">   Who Contributes to Project Norman Projects?</a>


##<a name="What Can I Contribute?"></a>What Can I Contribute?

You might already know exactly what you do, but if not, you might consider contributing in one or all of the following ways: 

+ <a href="#Help Other Drive.SAP Users and Contributors">    Help Other Drive.SAP Users and Contributors</a>

+ <a href="#Analyse Existing Issues">    Analyse Existing Issues</a>

+ <a href="#Report Issues">    Report Issues</a>

+ <a href="#Fix Issues">    Fix Issues</a>

+ <a href="#Propose and Build New Features">    Propose and Build New Features</a>

###<a name="Help Other Drive.SAP Users and Contributors"></a>Help Other Drive.SAP Users and Contributors

You can contribute valuably to one or more Project Norman sub-projects by helping others users who need support. You will find them, for example, on StackOverflow, or in the SAP Community Network forum.


###<a name="Analyse Existing Issues"></a>Analyze Existing Issues
Check the Issue Tracker in the Project Norman sub-project repository you interested in contributing to. You might might be able to provide further information, or a hint that helps other contributors understand the issue. This is a great way to get acquainted with the project. You might want to fix an issue. For more information, see <a href="#Fix Issues">    Fix Issues</a>.


###<a name="Report Issues"></a>Report Issues
You can contribute by simply reporting issues you encountered when using Project Norman. 

For more comprehensive guidelines on reporting issues, please refer to <a href="#How Do I Report Issues?">    How Do I Report Issues?</a> section.

###<a name="Fix Issues"></a>Fix Issues

Check the Issue Tracker in repository for the Project Norman sub-project for issues you are interested in fixing. Consider issues that are currently being fixed aswell if they interest you, because the contributor responsible might appreciate the offer of assistance. 

For guidelines on contributing a fix, please refer to <a href="#How Do I Make Changes to Product Norman Sub-Projects?">    How Do I Make Changes to Product Norman Sub-Projects?</a> section.

###<a name="Propose and Build New Features"></a>Propose and Build New Features

We welcome your innovations to Project Norman. If you don't know exactly what you'd like to contribution, why not see if there is something on the project roadmap you find interesting. If you see something, why not give it a go? However, to ensure you are not wasting your valuable time, contact one of our core developers through the mailing list and discuss the proposed enhacement with them.

***We do not accept proposal for new features through the Issue Tracker. They will be removed.***

For guidelines on contributing an enhancement, please refer to <a href="#How Do I Make Changes to Product Norman Sub-Projects?">   How Do I Make Changes to Product Norman Sub-Projects?</a> section.

##<a name="How Do I Report Issues?"></a> How Do I Report Issues?

Ideally, you should report bugs in the Issue Tracker of the Project Norman sub-project repository most relevant to the issue. To report and issue, you simple open the Issue Tracker in the sub-project, and click the <b>New Issue</b> button. 

We appreciate all efforts to notify us if something goes wrong. However, we have limited capacity, and only support real bugs that are reported with the following criteria: 

 * It must be a real, current bug
 * It must not be a duplicate
 * It must be producible
 * It must have a good summary
 * It must be well-documented
 * It must contains a minimal example
 * It must conform to this [template](https://github.wdf.sap.corp/Norman/Norman/blob/master/bug_report_template.md)

For more comprehensive guidelines for submitting bug reports, please refer to [Bug Reporting Guidelines](https://github.wdf.sap.corp/Norman/Norman/blob/master/Contributing.md).

Once you have acquainted yourself with the guidelines, you can go to project Issue Tracker to report the issue.

##<a name="How Do I Make Changes to Product Norman Sub-Projects?"></a>How Do I Make Changes to Product Norman Sub-Projects?

You submit changes to Project Norman sub-projects, such as bug fixes and new or improved features, using pull requests to the relevent sub-project repository. However, prior to making changes to your branched version of the project, you should ensure that you are spending your time wisely. We do not accept all pull requests, and those we accept have to meet specific standards. Therefore, prior to creating new code, you should always disuss new features with our core developers. Communication about enhancments is via mailing lists. These identify "virtual meeting rooms" where conversations happen asynchronously, which is a general requirement for groups that are so geographically distributed to cover all time zones. Furthermore, the developer might have some valuable hints and tips that save you a lot of time of and effort.  Once this discussion yields a shared consensus, you can confidentaly proceed and create the code.

**To create code for your enhancment of bug fix, do the following**:

**1.**   Download the GiTHub Repository for the project. (link to instructions on how to)

**2.**   Install the required tools. (link to suitable documents in wiki)
 
**3.**   Implement your new feature or bug fix on your branch, taking the following into consideration:

<ul>
<li>Base all your work off of the devel branch. The devel branch is where active development happens. We do not merge patches directly into master.</li>
<li>Name your branch to match the new feature of bug fix that you are submitting.</li>
<li>Limit yourself to one feature or bug fix per pull request.</li>
<li>Include tests that prove your code works.</li>
<li>For consistency, and to enhance the chances that your contribution will be passed for review without corrections required, please review our coding guidelines to ensure that your code conforms to our current approach. (link to coding guidelines).</li>
<li>Be sure your author field in git is properly filled out with your full name and email address so we can credit you.</li>
</ul>
**4.**   Perform the requisite pre-pull request testing procedures (link to description of these in the wiki - overlap with guidelines)

**Before you submit your completed code, do the following**: 

**5.**   Review the [Apache License] (https://github.wdf.sap.corp/Norman/Drive/blob/master/License.txt) (which describes contributions) which outlines both your and the Project Norman Open Source Community's legal rights regarding your contribution.

**6.**  Download, read, sign, and send us our [Individual Contribution License Agreement] (https://github.wdf.sap.corp/Norman/Drive/blob/master/docs/SAP%20Individual%20Contributor%20License%20Agreement.pdf) if you want to submit code as an individual. Alternatively, if you want to submit code on behalf of your employer, a company representative authorized to do so needs to download, fill, and print the [Corporate Contributor License Agreement] (https://github.wdf.sap.corp/Norman/Drive/blob/master/docs/SAP%20Corporate%20Contributor%20License%20Agreement.pdf) form.  


**To submit your completed code, do the following**:

**7.**   Make a pull request, and wait for a response from the project team reviewer or committer for the area to which your bug fix or enhancment applies. 

For more information on making a pull request, see [https://help.github.com/articles/creating-a-pull-request](Creating a Pull Request)

For guidelines on commit messages, see the [https://github.wdf.sap.corp/Norman/Norman/blob/master/Project%20Norman%20Style%20Guide.md](Project Norman Guidelines).

**After you have submitter your completed code, do the following**:

**8.**   Wait for a reviewer to review and approve your code. When you have submitted a pull request, a qualified review on the project team reviews your contribution to evaluate whether it can be committed to the master copy of the project, whether further discussion and development for further consideration, or whether it is not accepted as a contribution. It is generally expected that some communication is required with contributors after they have submitted a pull request, and quite rare that a contribution is accepted without qualification on the first attempt.



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

Reviewers are generally experts in the environment to which the contribution applies, and are also Committers.

Established contributors in a project can be enabled as reviewers for that project if they receive the support of the project steering committee. It can be useful to be a committer. 

You can find out more about our current reviewers and contributors on the [Contributors] (https://github.wdf.sap.corp/Norman/Drive/blob/master/Contributors.md)  page.


###<a name="Committers"></a>Committers

Committers are responsible for commiting changes submitted by pull request and passed by a reviewer.

Established contributors in a project can be enabled as reviewers for that project if they receive the support of the project steering committee. It can be useful to be a committer. For example, providing support for Project Norman to a customer, being a committer could be a big selling poin of their skills for the customer.  

You can find out more about our current reviewers and contributors on the [Contributors] (https://github.wdf.sap.corp/Norman/Drive/blob/master/Contributors.md)  page.


###<a name="Project Steering Committee"></a>Public Management Committee

Each project is run on day to day basis by the contributors, and operates under the guidance of a dedicated Project Steering Committee. Project Steering Committees are responsible for providing oversight of project developments, securing and organizing resources, removing obtacles, and resolving conflicts. Each Project Steering Committee, in turn, operates under the guidance of the Project Norman Steering Committee. For more information on the composition and roles of these steering committees, and the Project Norman project structure, see [Project Norman Project Managment](https://github.wdf.sap.corp/Norman/Norman/wiki/Project-Norman-Project-Management).


###<a name="Project Norman Sub-Projects"></a>Project Norman Sub-Projects
+ [Auth] (https://github.wdf.sap.corp/Norman/Auth) 
+ [Data Composer] (https://github.wdf.sap.corp/Norman/DataComposer)
+ [Data Model Editor] (https://github.wdf.sap.corp/Norman/DataModelEditor)
+ [Flow Composer] (https://github.wdf.sap.corp/Norman/FlowComposer)
+ [Sample Data Server] (https://github.wdf.sap.corp/Norman/SampleDataServer)
+ [UX Rule Engine] (https://github.wdf.sap.corp/Norman/UXRuleEngine )
+ [UI Canvas] (https://github.wdf.sap.corp/Norman/UICanvas )
+ [UI Composer] (https://github.wdf.sap.corp/Norman/UIComposer)
+ [Shared Workspace] (https://github.wdf.sap.corp/Norman/SharedWorkspace)
+ [UI Catalog Manager] (https://github.wdf.sap.corp/Norman/UICatalogManager)
+ [Previewer] (https://github.wdf.sap.corp/Norman/Previewer)
+ [User Research] (https://github.wdf.sap.corp/Norman/UserResearch)
+ [Collaboration] (https://github.wdf.sap.corp/Norman/Collaboration)
+ [Shell] (https://github.wdf.sap.corp/Norman/Shell)
+ [Analytics] (https://github.wdf.sap.corp/Norman/Analytics)
+ [Common] (https://github.wdf.sap.corp/Norman/Common)
+ [Projects - aka Project Management] (https://github.wdf.sap.corp/Norman/Projects)
