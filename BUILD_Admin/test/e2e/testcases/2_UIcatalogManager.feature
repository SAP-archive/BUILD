@uicatalogmanager
Feature: UICatalogManager

@flow
Scenario: Check the UI Catalog is displayed
  Given UICatalog is displayed
  Then I check control named "sap_norman_controls_HotspotImage" exists