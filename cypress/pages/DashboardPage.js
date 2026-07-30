class DashboardPage {
  elements = {
    dashboardHeader: () => cy.get(".oxd-topbar-header-breadcrumb-module"),
    userDropdown: () => cy.get(".oxd-userdropdown-tab"),
    sidebarMenu: () => cy.get(".oxd-sidepanel"),
    adminMenuItem: () => cy.get('.oxd-main-menu-item-wrapper').contains("Admin"),
  };

  isDashboardVisible() {
    this.elements.dashboardHeader().should("be.visible").and("contain.text", "Dashboard");
    return this;
  }

  goToAdminMenu() {
    this.elements.sidebarMenu().should("be.visible");
    this.elements.adminMenuItem().should("be.visible").click();
    return this;
  }
}

export default new DashboardPage();
