@datamodeler
Feature: DataModeler

  @flow
  Scenario: Login with Data Modeller User
    Given I am on the sign up page
    When I signup with random credentials
    Then I am logged in

  @flow
  @OnceLoggedInCreateProject
  Scenario: Once Logged in I'm on the Norman Page
    Given I am on the Landing Page
    When  I click New Project Link
    And  I enter Project Name "TESTPROJECTXLS"
    Then Project "TESTPROJECTXLS" is created

  @flow
  @OpenTheCreatedProject
  Scenario: Once a project is created
    Given Project "TESTPROJECTXLS" exists
    When I click to enter the project
    Then I am in the prototype page
    Then I open data modeler

  @flow
  @CreateBlankDataModel
   Scenario: I choose to create a data Model from an Excel file
    Given Data modeler page is displayed
    #file located in test/testcase folder of this project
    Then I upload XL file: "../files/SalesOrderDataModel.xlsx"

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
    Then I check properties for entity "SalesOrder" are "ID,Name,Author,Amount,Currency,Date" of type "String,String,Numeric,String,Date"


  @flow
  @CheckRelationsForEntitySalesOrderAndAddANewRelation
  Scenario: Create a DataModel: check SalesOrder entity relations
    Given Data modeler page is displayed
    Then I check relations for entity "SalesOrder" are "SalesOrderItem" with cardinality "n"


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
    Then I check properties for entity "SalesOrderItem" are "ID,Quantity" of type "Numeric"


  @flow
  @CheckRelationsForEntitySalesOrderItem
  Scenario: Create a DataModel: check SalesOrderItem entity relations
    Given Data modeler page is displayed
    Then I check relations for entity "SalesOrderItem" are "RelationName" with cardinality "1"

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
    Then I check properties for entity "Product" are "ID,Description,Amount,Currency,Picture" of type "String,Numeric,String,String"


  @flow
  @DeleteSalesOrderItemFromDataModel
  Scenario: Create a DataModel: delete SalesOrderItem
    Given Data modeler page is displayed
    Then I delete Entity named "SalesOrderItem"

  @flow
  @RecreateSalesOrderItemEntityManually
    Given Data modeler page is displayed
    Then I add Entity named "SalesOrderItem"
    Then I add property "Quantity" of type "Numeric" to entity "SalesOrderItem"
    Then I check properties for entity "SalesOrderItem" are "ID,Quantity" of type "Numeric"

  @flow
  @AddingRelationFromAndToSalesOrderItemEntity
    Given Data modeler page is displayed
    #creation
    Then I click on Entity named "SalesOrder"
    Then I add a relation from entity "SalesOrder" to entity "SalesOrderItem" with cardinality "n" named "SalesOrderItem"
    Then I click on Entity named "SalesOrderItem"
    Then I add a relation from entity "SalesOrderItem" to entity "Product" with cardinality "1" named "RelationName"
    #check
    Then I click on Entity named "SalesOrder"
    Then I check relations for entity "SalesOrder" are "SalesOrderItem" with cardinality "n"
    Then I click on Entity named "SalesOrderItem"
    Then I check relations for entity "SalesOrderItem" are "RelationName" with cardinality "1"
