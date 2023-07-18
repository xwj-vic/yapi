const yapi =require('yapi.js');
const notifierController = require('./controllers/notifier');
const notifier = require('./utils/notifier');

module.exports = function(options={}){
  const originalSaveLog = this.commons.saveLog;

  this.commons.saveLog = function() {
    const args = Array.prototype.slice.call(arguments);
    originalSaveLog.apply(this, args);

    try {
      const logData = args[0];
      if (logData && logData.type === 'project') {
        new notifier(logData, options).send();
      }
    } catch(err) {
      yapi.commons.log(err, 'error');
    }
  }

  this.bindHook('add_router', function(addRouter){
    addRouter({
      controller: notifierController,
      method: 'get',
      path: 'fine/notifier',
      action: 'getNotifiers'
    });
    addRouter({
      controller: notifierController,
      method: 'post',
      path: 'fine/notifier/save',
      action: 'saveNotifier'
    });
    addRouter({
      controller: notifierController,
      method: 'post',
      path: 'fine/notifier/del',
      action: 'delNotifier'
    });
    addRouter({
      controller: notifierController,
      method: 'post',
      path: 'fine/notifier/test',
      action: 'testNotifier'
    });
  });
}