@norman
Feature: DataModeler

  @flow
  @Signup  
  Scenario: Sign Up with Valid Credentials
    Given I am on the sign up page
    When I enter valid signup details
    Then I am logged in

  @flow
  @OnceLoggedInCreateProject
  Scenario: Once Logged in you are on the Norman Page
    Given I am on the Landing Page
    When  I click New Project Link
    And  I enter Project Name "TESTPROJECTXLS"
    Then Project "TESTPROJECTXLS" is created

  @OpenTheCreatedProject
  Scenario: Once a project is created
    Given Project "TESTPROJECTXLS" exists
    When I click to enter the project
    Then I am in the prototype page
    Then I click on go to data model

  @flow
  @CreateBlankDataModel
  Scenario: I choose to create a data Model from an Excel file
    Given The create model page is displayed
    Then I upload XL file: "..\..\..\testcase\Sales Order Data model.xlsx"
    Then I click on Reorder Horizontally

  @flow
  @CheckSalesOrderEntityExistsAndClickOnIt
  Scenario: Create a DataModel: Check that SalesOrder entity is existing
    Given Data modeler page is displayed
    Given Exists Entity "SalesOrder"
    Then I click on Entity named "SalesOrder"

  @flow
  @CheckPropertiesForEntitySalesOrderAndANewPorperty
  Scenario: Create a DataModel: check SalesOrder entity properties
    Given Data modeler page is displayed
    #  ID's type is not to be considered in the second list, so the first type is for the second property
    Then I check properties for entity "SalesOrder" are "ID,Name,Author,Amount,Currency,Date" of type "String,String,Decimal,String,DateTime"


  @flow
  @CheckRelationsForEntitySalesOrderAndAddANewRelation
  Scenario: Create a DataModel: check SalesOrder entity relations
    Given Data modeler page is displayed
    Then I check relations for entity "SalesOrder" are "SalesOrderSet" with cardinality "n"

    

  @flow
  @CheckSalesOrderItemEntityExistsAndClickOnIt
  Scenario: Create a DataModel: Check that SalesOrderItem entity is existing
    Given Data modeler page is displayed
    Given Exists Entity "SalesOrderItem"
    Then I click on Entity named "SalesOrderItem"

  @flow
  @CheckPropertiesForEntitySalesOrderItem
  Scenario: Create a DataModel: check SalesOrderItem entity properties
    Given Data modeler page is displayed
    #  ID's type is not to be considered in the second list, so the first type is for the second property
    Then I check properties for entity "SalesOrderItem" are "ID,Quantity" of type "Decimal"


  @flow
  @CheckRelationsForEntitySalesOrderItem
  Scenario: Create a DataModel: check SalesOrderItem entity relations
    Given Data modeler page is displayed
    Then I check relations for entity "SalesOrderItem" are "Relation" with cardinality "1"

  @flow
  @CheckProductEntityExistsAndClickOnIt
  Scenario: Create a DataModel: Check that Product entity is existing
    Given Data modeler page is displayed
    Given Exists Entity "Product"
    Then I click on Entity named "Product"

  @flow
  @CheckPropertiesForEntityProduct
  Scenario: Create a DataModel: check Product entity properties
    Given Data modeler page is displayed
    #  ID's type is not to be considered in the second list, so the first type is for the second property
    Then I check properties for entity "Product" are "ID,Description,Amount,Currency,Picture" of type "String,Decimal,String,String"

  @flow
  @DeleteProductEntityFromDataModelAndReorderVertically
  Scenario: Create a DataModel: delete Product entity
    Given Data modeler page is displayed
    Then I delete Entity named "Product"
    Then I click on Reorder Horizontally
    
  @flow
  @UploadExcelFile
  Scenario: Create a DataModel: uploading Excel file
    Given Data modeler page is displayed
    Then I upload XL file: "..\..\..\testcase\Product.xlsx"
    Then I click on Reorder Horizontally

  @flow
  @CheckProduct2EntityExistsAndClickOnIt
  Scenario: Create a DataModel: Check that Product2 entity is existing
    Given Data modeler page is displayed
    Given Exists Entity "Product"
    Then I click on Entity named "Product2"

  @flow
  @CheckPropertiesForEntityProduct
  Scenario: Create a DataModel: check Product2 entity properties
    Given Data modeler page is displayed
    #  ID's type is not to be considered in the second list, so the first type is for the second property
    Then I check properties for entity "Product2" are "ID,Description,Amount,Currency,Picture" of type "String,Decimal,String,String"

  @flow
  @CheckRelationsForEntitySalesOrderAndAddANewRelation
  Scenario: Create a DataModel: check SalesOrder entity relations
    Given Data modeler page is displayed
    Then I check relations for entity "SalesOrder" are "SalesOrderSet" with cardinality "n"
    Then I add a relation from entity "SalesOrder" to entity "Product" with cardinality "1" named "SalesOrderToProduct"
    Then I check relations for entity "SalesOrder" are "SalesOrderSet,SalesOrderToProduct" with cardinality "n,1"

  @flow
  @BackToPrototypePageAndClickOnGotoPageFlow
  Scenario: Create a DataModel: go back to prototype page and click on Go To Page Flow
  Given Data modeler page is displayed
  Then I click Prototype in Nav Bar
  Then I click on go to page flow

  @flow
  @GeneratePageFlowAndRun
  Scenario: Page Flow: Generate page flow and run app
    Given Page Flow page is displayed
    Then I click on Generate Flow
    Then I choose Master Detail in Read Only and click on Generate
    Then I click on Run
    Then I check a new Tab exists