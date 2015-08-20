#Contributing to BUILD

We want to make it simple and rewarding to contribute to BUILD based on the following principles:  

+ As easy and transparent as possible to contribute.
+ Free, permanent, and public availability of the most up-to-date code base.
+ On-going maintenance and enhancement under a collaborative software development model.
+ High quality, consistent product performance and usability.
+ Commercial-friendly, mutually-assuring, standard license agreements.
+ Faithful adherence to evolving BUILD coding standards.
+ Respectful, honest, and technically-oriented communications throughout.
+ Security as the number one priority. 

View the [BUILD Community Guidelines](https://github.com/SAP/BUILD/wiki/Community-Guidelines) here.

##Our Development Process
BUILD is composed of multiple modules, each of which have their own repository. 

There are core developers for each BUILD module responsible for scheduled developments and for liaising with contributors. You can communicate with the core developers for a BUILD module via the Issue Tracker for that module. For more information, see [Using the Issue Tracker](https://github.com/SAP/BUILD/wiki/Using-the-Issue-Tracker).

You can read about **Making Contributions** to BUILD in the next section of this document.

You can read about **Changing Code and Submitting Your Changes** in the final section of this document.  

##Making Contributions

You might know what you want to do. Otherwise consider contributing to BUILD in one or all of the following ways: 

+ **Contribute Bug Reports** - When you report a bug, a code reviewer/committer on the core development team reviews it, approves it as a real bug, asks you for for more details, or closes it. Approved bugs are either assigned to a committer in GitHub to fix or added to the backlog for future resolution. All bugs remain open until they are fixed. The closing comment explains which version(s) contain the fix. You can report bugs, or review and have conversations with other contributors about existing issues with the <code>Bug</code> label. Click [Reporting Bugs Using the Issue Tracker](https://github.com/SAP/BUILD/wiki/Using-the-Issue-Tracker) for more information.

+ **Contribute Bug Fixes** - browse the [Issue Tracker](https://github.com/SAP/BUILD/wiki/Using-the-Issue-Tracker) for the relevant module, and identify a bug with the label **Please Contribute** you want to fix. Before you begin, make sure the bug it is reproducible in the latest version of the module, and has not already been fixed. All code should conform to the [BUILD Coding Style Guide](https://github.com/SAP/BUILD/wiki/Coding-Guidelines-for-Angular-JS). For instructions on how to submit a pull request to include your bug fix in the latest version of the relevant module, see the _*Changing Code and Submitting Your Changes*_ section below.

+ **Contribute Enhancements and Optimizations** - you can contribute new features or enhancements, or contribute to already scheduled new features (with the label **Please Contribute**) in the [Issue Tracker](https://github.com/SAP/BUILD/wiki/Using-the-Issue-Tracker) for any BUILD module. However, we don't automatically accept all new features, so we recommend you propose and discuss new features with a core BUILD developer prior to coding your enhancements. You can contact members of the BUILD core development team [using the Issue Tracker](https://github.com/SAP/BUILD/wiki/Using-the-Issue-Tracker). There team member of [individual BUILD modules are listed here](https://github.com/SAP/BUILD/wiki/Community-Roles). The core developer might have some valuable hints and tips that save you a lot of time of and effort. All code should conform to the [BUILD Coding Style Guide](https://github.com/SAP/BUILD/wiki/Coding-Guidelines-for-Angular-JS). When you're done you can submit a pull request to include your code. For more information see the _*Changing Code and Submitting Your Changes*_ section below.

+ **Provide Miscellaneous Information** - inevitably, there is a wealth of information which the community would benefit from but that nobody has yet provided. We welcome all types of project-information, such as test scenarios and results in various environments, performance tests and results, How To or API documentation, and any other information you think the community will be able to use. Check the bugs in the GitHub Issue Tracker in the BUILD module you interested in contributing to. You might be able to provide further information, or a hint that helps other contributors understand the bug. View [Using the Issue Tracker](https://github.com/SAP/BUILD/wiki/Using-the-Issue-Tracker) for more information.

+ **Assist other users** - you can contribute to BUILD by helping others users who need support. You can check SAP Community Network (SCN) for support requests, or review the relevant BUILD module [Issue Tracker](https://github.com/SAP/BUILD/wiki/Using-the-Issue-Tracker).

##Changing Code and Submitting Your Changes

Use the following procedure to change code, whether it is a bug fix or a new feature, and submit your changes:

1. Review the [License file](https://github.com/SAP/BUILD/blob/master/LICENSE.txt) which outlines both your and the BUILD Open Source Community's legal rights regarding your contribution. 

2. Download, read, sign, and send us our [Individual Contribution License Agreement](https://github.com/SAP/BUILD/blob/master/docs/SAP%20License%20Agreements/SAP%2BIndividual%2BContributor%2BLicense%2BAgreement.pdf) if you want to submit code as an individual. Alternatively, if you want to submit code on behalf of your employer, a company representative authorized to do so needs to download, fill, and print the [Corporate Contributor License Agreement](https://github.com/SAP/BUILD/blob/master/docs/SAP%20License%20Agreements/SAP%2BCorporate%2BContributor%2BLicense%2BAgreement.pdf) form.

3. Fork the module. For more information, see [Fork a Repo](https://help.github.com/articles/fork-a-repo/).

4. Install the required dependencies and tools.

5. Implement your new feature or bug fix on your branch, taking the following into consideration:

+ Base all your work off of the master branch.
+ Please name your branch to match the new feature of bug fix that you are submitting.
+ Please do not submit more than one feature or bug fix per pull request.
+ Implement your new feature or bug fix on your branch.
+ For consistency, and to enhance the chances that your contribution will be passed for review without corrections required, ensure that your code conforms to our current approach. For more information, see the [BUILD Style Guide](https://github.com/SAP/BUILD/wiki/Coding-Guidelines-for-Angular-JS).
+Be sure your author field in Git is filled out correctly, including full name and email address. This enables us to credit you for your contribution.

**Next**, perform the requisite pre-pull request testing procedures. Please include tests to prove your code works.
[link to go in here]

**Next**, push the changes on your fork, and submit pull request for original repository. For more information, see [Using Pull Requests](https://help.github.com/articles/using-pull-requests/).

**Note**: For guidelines on commit messages, see the [BUILD Style Guide](https://github.com/SAP/BUILD/wiki/Coding-Guidelines-for-Angular-JS).

**Finally**, when you have submitted a pull request, a reviewer on the project team reviews your contribution to evaluate whether it can be committed to the master copy of the project, whether further discussion and development for further consideration, or whether it is not accepted as a contribution. It is generally expected that some communication is required with contributors after they have submitted a pull request, and quite rare that a contribution is accepted without qualification on the first attempt. To identify reviewers and committers for each module, click [here](https://github.com/SAP/BUILD/wiki/Community-Roles).

###Links to Contribution-Related Documents

+ [Communications Guidelines](https://github.com/SAP/BUILD/wiki/Communication-Guidelines)
+ [BUILD Style Guide](https://github.com/SAP/BUILD/wiki/BUILD-Style-Guide)
+ [Community Roles](https://github.com/SAP/BUILD/wiki/Community%20Roles.md)
+ [Apache License](https://github.com/SAP/BUILD/wiki/License)
+ [Individual Contribution License Agreement](https://github.com/SAP/BUILD/blob/master/docs/SAP%20License%20Agreements/SAP%2BIndividual%2BContributor%2BLicense%2BAgreement.pdf) 
+ [Corporate Contributor License Agreement](https://github.com/SAP/BUILD/blob/master/docs/SAP%20License%20Agreements/SAP%2BCorporate%2BContributor%2BLicense%2BAgreement.pdf) 
+ [Guidelines for Bug Reports](https://github.com/SAP/BUILD/wiki/Guidelines-for-Bug-Reports)
+ [Community Guidelines](https://github.com/SAP/BUILD/wiki/Community-Guidelines)
