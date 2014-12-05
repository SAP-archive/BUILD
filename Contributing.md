# Project Norman Contribution Page

**About This Document**: Project Norman is composed of the numerous <a href="#Useful Links"> Project Norman Sub-Projects</a>, each of which have their own repository. This document describes how to make contributions to any of these sub-projects. 

##Introduction

So you want to contribute to a Project Norman sub-project? Good choice! There is lots of scope for contribution, and there's plenty to do! Want to get coding straight away? No problem because we want you to get going as fast as possible as well! To make the best use of your valuable time we recommend you take a few minutes to read this page before you dive in. 

You might already know exactly what you do, but if not, you might consider contributing in one or all of the following ways: 

+ **Contribute Bug Reports** - you can contribute by simply reporting bugs you encountered when using Project Norman. When a bug is reported, a committer will look at it and either confirm it as a real bug, close it if it is not an bug, or ask for more details. Approved bugs are either assigned to a committer in GitHub or added to the backlog for future resolution. All bugs remain open until they are fixed. A bug that is about a real bug is closed as soon as the fix is committed. The closing comment explains which version(s) contain the fix. For more information on reporting bugs using the Issue Tracker of the relevant sub-project, see <a href="#Using Issue Tracker"> Using Issue Tracker</a>.

+ **Contribute Bug Fixes**  -  you can contribute by fixing bugs. Simply browse the <a href="Useful Links"> </a>Issue Tracker for the relevant sub-project, and identify a bug you want to fix. Before you begin, make sure that it is reproducible in the latest version of the sub-project, and has not already been fixed. For instructions on how to submit a pull request for your bug fix, please review <a href="#Changing Code and Submitting Your Changes">   Changing Code and Submitting Your Changes</a>. You submit changes to Project Norman sub-projects, such as bug fixes and new or improved features, using pull requests to the relevant sub-project repository.  For guidelines on create a pull request to include your changes into the Master branch of the relevant sub-project, please refer to <a href="#Changing Code and Submitting Your Changes"> Changing Code and Submitting Your Changes</a> section.

+ **Contribute Enhancements and Optimizations** - you can contribute new features or enhancments, or contribute to already scheduled new features. Project Norman welcomes optimizations, new features and enhancments to existing features. However, we do not accept all pull requests, and those we accept have to meet specific standards. Therefore, to ensure that you are spending your time wisely,  prior to coding your proposed enhancments we recommend you propose and disuss new features to core project developer first by creating an Issue labelled <i>Feature Enhancement</i> in the relevant sub-project Issue Tracker. For more information on prosing new features using the Issue Tracker of the relevant sub-project, see <a href="#Using Issue Tracker"> Using Issue Tracker</a>.

    When a core developer responds, discuss the proposed enhancement with them. Once this discussion yields a shared consensus,     you can confidently proceed and create the code. Furthermore, the developer might have some valuable hints and tips that        save you a lot of time of and effort.However, before you do any work beyond conceptual, we recommend you post an Issue with     the label User Story on the Issue Tracker. When a core developer contacts you, discuss the proposed enhancement with them.

    For instructions on how to submit a pull request for your new feature, please review <a href="#Changing Code and Submitting     Your Changes">   Changing Code and Submitting Your Changes</a>

+ **Provide Miscellaneous Information** - inevitably, there is a wealth of information wihch the community would benefit from but that nobody has yet provided. We welcome contributions of all types of project-information, such as test scenarios and results in various environments, performance tests and results, <i>How To</i>  or API documentation, and any other information you think the community will be able to use. Check the bugs in the Issue Tracker in the Project Norman sub-project repository you interested in contributing to. You might be able to provide further information, or a hint that helps other contributors understand the bug. 

+ **Assist other users** - you can contribute valuably to one or more Project Norman sub-projects by helping others users who need support. You can check SAP Community Network (SCN) for support requests. 


##<a name="Using The Issue Tracker"></a> Using Issue Tracker

Please review our our [Communications Guidelines](https://github.wdf.sap.corp/Norman/Norman/blob/master/Communication%20Guidelines.md) document before posting on the Issue Tracker. You can use the Issue Tracker of the relevant sub-project to do the following:

+ <a href="#Ask Questions Using Issue Tracker"> Ask Questions</a>

+ <a href="#Report Bugs Using Issue Tracker"> Report Bugs</a>

+ <a href="#Propose Enhancements Using Issue Tracker"> Propose Enhancements</a>


###<a name="Ask Questions Using Issue Tracker"></a> Asking Questions Using Issue Tracker

1. Click the <b>New Issue</b> button in the Issue Tracker of the relevant <a href="#Useful Links"></a>sub-project.

2. Label the issue as a <i>Question</i>.

3. Ensure the summary reflects the essence of your question, to enable community members to identify if it is releveant to them.

4. Click the <b>Submit Issue</b> button.

   Once an Issue has been created, you can click comment to add further comments or respond.


###<a name="Report Bugs Using Issue Tracker"></a> Report Bugs Using Issue Tracker

1. Before you report a bug, ensure that it is: 
 * A real, current bug
 * Not a duplicate
 * Reproducible

2. To report a bug, click the <i>New Issue</i> button in the Issue Tracker of the relevant <a href="#Useful Links"></a>sub-project.

3. Label the issue as a <i>Bug</i>. 

3. We prioritize bugs reported as follows:
 * A good summary is provided.
 * The bug is well-documented.
 * A minimal example (with screen shots if applicable) is provided.
 * The [recommended bug template](https://github.wdf.sap.corp/Norman/Norman/blob/master/bug_report_template.md) is used.

4. Enter a title that summarizes the issue, so that at a glance the community can identify whether it may be relevant to them. For example, if reporting that a feature on the Projects UI is displaying incorrectly, use 'Display issue with Projects UI', rather than 'UI Issue'. In addition, if the issue is related to a particular backlog item, please include the backlog issue number in the title.

5. Enter a summary is specific to the bug.

6. Click the <b>Submit Issue</b> button.

   To review the complete guidelines for reporting bugs, see [Guidelines for Bug Reports](https://github.wdf.sap.corp/Norman/Norman/blob/master/Guidelines%20for%20Bug%20Reports.md).

   Once an issue has been created, you can click comment to add further comments or respond.


###<a name="Propose Enhancements Using Issue Tracker"></a> Proposing Enhancements Using Issue Tracker 

1. New feature or enhacement proposals can be created using the GitHub Issue Tracker for each sub-project.  

2. Label the issue as a <b>Feature Enhancement</b>.

3. Click the <b>Submit Issue</b> button.

   Once an issue has been created, you can click comment to add further comments or respond.


##<a name="Changing Code and Submitting Your Changes"></a>Changing Code and Submitting Your Changes

Use the following procedure to change code, whether it is a bug fix or a new feature, and submit your changes:

**1.**   Review the [Apache License] (https://github.wdf.sap.corp/Norman/Drive/blob/master/License.txt) (which describes contributions) which outlines both your and the Project Norman Open Source Community's legal rights regarding your contribution.

**2.**  Download, read, sign, and send us our [Individual Contribution License Agreement] (https://github.wdf.sap.corp/Norman/Drive/blob/master/docs/SAP%20Individual%20Contributor%20License%20Agreement.pdf) if you want to submit code as an individual. Alternatively, if you want to submit code on behalf of your employer, a company representative authorized to do so needs to download, fill, and print the [Corporate Contributor License Agreement] (https://github.wdf.sap.corp/Norman/Drive/blob/master/docs/SAP%20Corporate%20Contributor%20License%20Agreement.pdf) form.  

**3.**   Fork the sub-project repo. For more information, see [Fork a Repo] (https://help.github.com/articles/fork-a-repo/).

**4.**   Install the required dependancies and tools. 

**5.**   Implement your new feature or bug fix on your branch, taking the following into consideration:

<ul>
<li>Base all your work off of the <b>master<b/> branch. </li>
<li>Please name your branch to match the new feature of bug fix that you are submitting.</li>
<li>Please do not submit more than one feature or bug fix per pull request.</li>
<li>For consistency, and to enhance the chances that your contribution will be passed for review without corrections required, please read the <a href="https://github.wdf.sap.corp/Norman/Norman/blob/master/Project%20Norman%20Style%20Guide.md">Project Norman Style Guide</a> to ensure that your code conforms to our current approach.</li>
<li>Be sure your author field in Git is filled out correctly, including full name and email address. This enables us to credit you for your contribution.</li>
</ul>

**6.**   Perform the requisite pre-pull request testing procedures. Please include tests to prove your code works. 

**7.**  Push the changes on your fork,  and submit pull request for original repository. Fore more information, see [Using Pull Requests](https://help.github.com/articles/using-pull-requests/).

**Note**:  For guidelines on commit messages, see the [Project Norman Style Guide](https://github.wdf.sap.corp/Norman/Norman/blob/master/Project%20Norman%20Style%20Guide.md).


**8.**   When you have submitted a pull request, a reviewer on the project team reviews your contribution to evaluate whether it can be committed to the master copy of the project, whether further discussion and development for further consideration, or whether it is not accepted as a contribution. It is generally expected that some communication is required with contributors after they have submitted a pull request, and quite rare that a contribution is accepted without qualification on the first attempt.

##<a name="Useful Links"></a>Useful Links

| Links to Sub-Projects  | Links to Sub-Project Issue Trackers |
| ------------- | ------------- |
| [Auth] (https://github.wdf.sap.corp/Norman/Auth)   | [Auth sub-project Issue Tracker](https://github.wdf.sap.corp/Norman/Common/issues)  |
| [DataComposer] (https://github.wdf.sap.corp/Norman/DataComposer)  | [DataComposer sub-project Issue Tracker] (https://github.wdf.sap.corp/Norman/DataComposer/Issues)  |
| [Business Catalog Manager] (https://github.wdf.sap.corp/Norman/BusinessCatalogManager)  | [BusinessCatalogManager sub-project Issue Tracker](https://github.wdf.sap.corp/Norman/BusinessCatalogManager/issues)  |
| [Flow Composer] (https://github.wdf.sap.corp/Norman/FlowComposer)  | [Flow Composer Issue Tracker] (https://github.wdf.sap.corp/Norman/FlowComposer/Issues) |
| [Sample Data Server] (https://github.wdf.sap.corp/Norman/SampleDataServer)  | [SampleDataServer sub-project Issue Tracker](https://github.wdf.sap.corp/Norman/SampleDataServer/issues)  |
| [UX Rule Engine] (https://github.wdf.sap.corp/Norman/UXRuleEngine )  | [UXRuleEngine sub-project Issue Tracker](https://github.wdf.sap.corp/Norman/UXRuleEngine/issues)  |
| [UI Canvas] (https://github.wdf.sap.corp/Norman/UICanvas )  | [UICanvas sub-project Issue Tracker](https://github.wdf.sap.corp/Norman/UICanvas/issues)  |
| [UI Composer] (https://github.wdf.sap.corp/Norman/UIComposer)  | [UIComposer sub-project Issue Tracker](https://github.wdf.sap.corp/Norman/UIComposer/issues)  |
| [Shared Workspace] (https://github.wdf.sap.corp/Norman/SharedWorkspace)  | [SharedWorkspace UIComposer sub-project Issue Tracker](https://github.wdf.sap.corp/Norman/SharedWorkspace/issues)  |
| [UI Catalog Manager] (https://github.wdf.sap.corp/Norman/UICatalogManager)  | [UICatalogManager sub-project Issue Tracker](https://github.wdf.sap.corp/Norman/UICatalogManager/issues)  |
| [Previewer] (https://github.wdf.sap.corp/Norman/Previewer) | [Previewer sub-project Issue Tracker](https://github.wdf.sap.corp/Norman/Previewer/issues)  |
| [User Research] (https://github.wdf.sap.corp/Norman/UserResearch)  | [UserResearch sub-project Issue Tracker](https://github.wdf.sap.corp/Norman/User Resarch/issues)  |
| [Collaboration] (https://github.wdf.sap.corp/Norman/Collaboration)  | [Collaboration sub-project Issue Tracker](https://github.wdf.sap.corp/Norman/Collaboration/issues)  |
| [Shell] (https://github.wdf.sap.corp/Norman/Shell) | [Shell sub-project Issue Tracker](https://github.wdf.sap.corp/Norman/Shell/issues)  |
| [Analytics] (https://github.wdf.sap.corp/Norman/Analytics)  | [Analytics sub-project Issue Tracker](https://github.wdf.sap.corp/Norman/Analytics/issues)
  |
| [Common] (https://github.wdf.sap.corp/Norman/Common)  | [Common sub-project Issue Tracker](https://github.wdf.sap.corp/Norman/Common/issues)  |
| [Projects - aka Project Management] (https://github.wdf.sap.corp/Norman/Projects)  | [Projects sub-project Issue Tracker](https://github.wdf.sap.corp/Norman/Projects/issues)  |

