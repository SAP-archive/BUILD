# Project Norman Contribution Page

##Introduction

So you want to contribute to a Project Norman project? Good choice! There is lots of scope for contribution, and there's plenty to do! Project Norman is composed of the numerous <a href="#Links to Project Norman Sub-Projects"> Project Norman Sub-Projects</a>, each of which have their own repository. This document describes how to make contributions to any of these sub-projects. 

Want to get coding straight away? No problem because we want you to get going as fast as possible as well! To make the best use of your valuable time we recommend you take a few minutes to read this page before you dive in. It contains the following sections:

+ <a href="#What Can I Contribute?">   What Can I Contribute?</a>

+ <a href="#How Do I Report Issues?">   How Do I Report Issues?</a>

+ <a href="#How Do I Make Changes to Product Norman Sub-Projects?"> How Do I Make Changes to Product Norman Sub-Projects?</a>

+ <a href="#Links to Project Norman Sub-Projects">Links to Project Norman Sub-Projects

You might already know exactly what you do, but if not, you might consider contributing in one or all of the following ways: 

+ <a href="#Help Other Users and Contributors">    Help Other Drive.SAP Users and Contributors</a>

+ <a href="#Analyse Existing Issues">    Analyse Existing Issues</a>

+ <a href="#Report Issues">    Report Issues</a>

+ <a href="#Fix Issues">    Fix Issues</a>

+ <a href="#Propose and Build New Features">    Propose and Build New Features</a>

###<a name="Help Other Users and Contributors"></a>Help Other Drive.SAP Users and Contributors

You can contribute valuably to one or more Project Norman sub-projects by helping others users who need support. You will find them, for example, on StackOverflow, or in the SAP Community Network forum.


###<a name="Analyse Existing Issues"></a>Analyze Existing Issues
Check the Issue Tracker in the Project Norman sub-project repository you interested in contributing to. You might be able to provide further information, or a hint that helps other contributors understand the issue. This is a great way to get acquainted with the project. You might want to fix an issue. For more information, see <a href="#Fix Issues">    Fix Issues</a>.


###<a name="Report Issues"></a>Report Issues
You can contribute by simply reporting issues you encountered when using Project Norman. 

For more comprehensive guidelines on reporting issues, please refer to <a href="#How Do I Report Issues?">    How Do I Report Issues?</a> section.

###<a name="Fix Issues"></a>Fix Issues

Check the Issue Tracker in repository for the Project Norman sub-project for issues you are interested in fixing. Consider issues that are currently being fixed aswell if they interest you, because the contributor responsible might appreciate the offer of assistance. 

For guidelines on contributing a fix, please refer to <a href="#How Do I Make Changes to Product Norman Sub-Projects?">    How Do I Make Changes to Product Norman Sub-Projects?</a> section.

###<a name="Propose and Build New Features"></a>Propose and Build New Features

We welcome your innovations to Project Norman. If you don't know exactly what you'd like to contribution, why not see if there is something on the in the Issue Tracker back log you find interesting. If you see something, why not give it a go? However, to ensure you are not wasting your valuable time, contact one of our core developers through the mailing list and discuss the proposed enhancement with them.

***!!!We do not accept proposal for new features through the Issue Tracker. They will be removed!!!***

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

You submit changes to Project Norman sub-projects, such as bug fixes and new or improved features, using pull requests to the relevant sub-project repository. Therefore, prior to coding changes, you should ensure that you are spending your time wisely. We do not accept all pull requests, and those we accept have to meet specific standards by proposing and disussing new features with our core developers via mailing list. Furthermore, the developer might have some valuable hints and tips that save you a lot of time of and effort.

For more information on Project Norman mailing lists, see our [Communications Guidelines](https://github.wdf.sap.corp/Norman/Norman/blob/master/Communication%20Guidelines.md).

For more information on the roles of contributors, committers, reviews, and project steering committe, see the  [Community Roles](https://github.wdf.sap.corp/Norman/Norman/blob/master/Community Roles.md).

Once this discussion yields a shared consensus, you can confidently proceed and create the code and submit your change using the following procedure:

**1.**   Review the [Apache License] (https://github.wdf.sap.corp/Norman/Drive/blob/master/License.txt) (which describes contributions) which outlines both your and the Project Norman Open Source Community's legal rights regarding your contribution.

**2.**  Download, read, sign, and send us our [Individual Contribution License Agreement] (https://github.wdf.sap.corp/Norman/Drive/blob/master/docs/SAP%20Individual%20Contributor%20License%20Agreement.pdf) if you want to submit code as an individual. Alternatively, if you want to submit code on behalf of your employer, a company representative authorized to do so needs to download, fill, and print the [Corporate Contributor License Agreement] (https://github.wdf.sap.corp/Norman/Drive/blob/master/docs/SAP%20Corporate%20Contributor%20License%20Agreement.pdf) form.  

**3.**   Fork the sub-project repo and then clone the fork. For more information, see [Fork a Repo] (https://help.github.com/articles/fork-a-repo/).

**4.**   Install the required tools. 

**5.**   Implement your new feature or bug fix on your branch, taking the following into consideration:

<ul>
<li>Base all your work off of the <b>dev<b/> branch. The devel branch is where active development happens. We do not merge patches directly into <b>master</b>.</li>
<li>Please name your branch to match the new feature of bug fix that you are submitting.</li>
<li>Please do not submit more than one feature or bug fix per pull request.</li>
<li>For consistency, and to enhance the chances that your contribution will be passed for review without corrections required, please read the <a href="https://github.wdf.sap.corp/Norman/Norman/blob/master/Project%20Norman%20Style%20Guide.md">Project Norman Style Guide</a> to ensure that your code conforms to our current approach.</li>
<li>Be sure your author field in Git is filled out correctly, including full name and email address. This enables us to credit you for your contribution.</li>
</ul>

**6.**   Perform the requisite pre-pull request testing procedures. Please include tests to prove your code works. 

**7.**  Push the changes on your fork,  and submit pull request for original repository. Fore more information, see [Using Pull Requests](https://help.github.com/articles/using-pull-requests/).

**Note**:  For guidelines on commit messages, see the [Project Norman Guidelines](https://github.wdf.sap.corp/Norman/Norman/blob/master/Project%20Norman%20Style%20Guide.md).


**8.**   Wait for a response from the project team reviewer or committer for the area to which your bug fix or enhancment applies. For more information on the the reviewing process, see <a href="#Reviewers">Reviewers</a>



###<a name="Links to Project Norman Sub-Projects"></a>Project Norman Sub-Projects
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
