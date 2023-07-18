import Page from './Page';

module.exports = function() {
  this.bindHook('sub_setting_nav', function(app) {
    app.notifier = {
      name: '通知',
      component: Page
    }
  });
};