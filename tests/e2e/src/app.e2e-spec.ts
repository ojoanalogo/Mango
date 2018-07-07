import { AppPage } from './app.po';

describe('workspace-project App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should display page title', () => {
    page.navigateTo();
    expect(page.getTitle()).toEqual('Mango');
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getPageTitle()).toContain('Hello Mango');
  });
});
