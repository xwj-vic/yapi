const yapi = require('yapi.js');
const TurndownService = require('turndown');
const notifierModel = require('../models/notifier');
const tools = require('./tools');
const { TYPE } = require("./const");

class Notifier {
  constructor(message = {}, config = {}) {
    this.message = message;
    this.config = config;

    this.notifierModel = yapi.getInst(notifierModel);
  }

  async send() {
    if (!this.message.content || this.message.content.length === 0) {
      yapi.commons.log('yapi-plugin-notifier: 无通知内容');
      return;
    }

    let notifiers = await this.getNotifiers();

    for (let i = 0; i < notifiers.length; i++) {
      await this.sender(notifiers[i], this.dealContent());
    }
  }

  async getNotifiers() {
    return await this.notifierModel.findByProject(this.message.typeid);
  }

  dealContent() {
    const turndownService = new TurndownService();
    const host = this.config.host || "";
    let content = turndownService.turndown(this.message.content);
    try {
      return content.replace(/\]\(\//g, `](${host}/`);
    } catch (error) {
      return content;
    }
  }

  async test(notifier) {
    return await this.sender(notifier, `一条来自${notifier.notifier_name}的测试消息`);
  }

  async sender(notifier, content) {
    if (!notifier.open) {
      return;
    }
    if (notifier.whitelist && notifier.whitelist.length > 0 && !notifier.whitelist.some(v => content.indexOf(v) > -1)) {
      return;
    }
    try {
      content = notifier.signature ? `【${notifier.signature}】${content}` : content;

      const timestamp = new Date().getTime();
      let url = notifier.secret ? `${notifier.hook}&timestamp=${timestamp}&sign=${tools.sign(notifier.secret, timestamp)}` : notifier.hook;
      let res;

      switch (notifier.type) {
        case TYPE.WW:
          res = await tools.sendWWMessage(notifier.hook, content);
          break;
        case TYPE.DINGTALK:
          res = await tools.sendDingTalk(url, `来自【${notifier.notifier_name}】的新通知`, content);
          break;
        case TYPE.SEATALK:
          res = await tools.sendSeaTalkWebhook(url, `来自【${notifier.notifier_name}】的新通知`, content);
          break;
        case TYPE.WEBHOOK:
        default:
          res = await tools.sendWebhook(url, content, this.message);
          break;
      }
      return res.data;
    } catch (error) {
      yapi.commons.log(error, "error");
    }
  }
}

module.exports = Notifier;