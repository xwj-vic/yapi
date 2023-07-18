const baseController = require('controllers/base.js');
const yapi = require('yapi.js');
const notifierModel = require('../models/notifier');
const tools = require("../utils/tools");
const notifier = require("../utils/notifier");

class notifierController extends baseController {
  constructor(ctx) {
    super(ctx);

    this.notifierModel = yapi.getInst(notifierModel);
  }

  async getNotifiers(ctx) {
    try {
      const projectId = ctx.params.project_id;
      if ((await this.checkAuth(projectId, 'project', 'view')) !== true) {
        return (ctx.body = yapi.commons.resReturn(null, 406, '没有权限'));
      }
      let notifiers = await this.notifierModel.findByProject(projectId)
      ctx.body = yapi.commons.resReturn(notifiers);
    } catch (e) {
      ctx.body = yapi.commons.resReturn(null, 401, e.message);
    }
  }

  async saveNotifier(ctx) {
    let params = ctx.request.body;

    params = yapi.commons.handleParams(params, {
      notifier_name: 'string',
      hook: 'string',
      type: 'string',
      signature: 'string',
      secret: 'string'
    });

    if ((await this.checkAuth(params.project_id, 'project', 'edit')) !== true) {
      return (ctx.body = yapi.commons.resReturn(null, 405, '没有权限编辑'));
    }

    if (!params.notifier_name) {
      return (ctx.body = yapi.commons.resReturn(null, 400, '通知名不能为空'));
    }

    if (!params.hook) {
      return (ctx.body = yapi.commons.resReturn(null, 400, '通知地址不能为空'));
    }
    if (params.hook.trim().indexOf("http") === -1) {
      return (ctx.body = yapi.commons.resReturn(null, 400, '通知地址只支持http请求'));
    }

    // if (!Object.values(TYPE).includes(params.type)) {
    //   return (ctx.body = yapi.commons.resReturn(null, 400, '通知类型不支持'));
    // }

    let checkRepeat = await this.notifierModel.findByName(params.notifier_name, params.project_id);

    if (checkRepeat) {
      return (ctx.body = yapi.commons.resReturn(null, 401, '通知名不能重复'));
    }
    
    try {
      let data = {
        project_id: params.project_id,
        notifier_name: params.notifier_name,
        open: params.open,
        hook: encodeURI(params.hook),
        type: tools.inferNotifierType(params.hook),
        signature: params.signature,
        secret: params.secret,
        whitelist: params.whitelist,
        uid: this.getUid()
      }
      let notifier;
      if (params.id) {
        await this.notifierModel.update(params.id, data);
        notifier = await this.notifierModel.find(params.id);
      } else {
        notifier = await this.notifierModel.save(data);
      }
      ctx.body = yapi.commons.resReturn(notifier);
    } catch (e) {
      ctx.body = yapi.commons.resReturn(null, 401, e.message);
    }
  }

  async delNotifier(ctx) {
    try {
      const id = ctx.params.id;

      if (!id) {
        return (ctx.body = yapi.commons.resReturn(null, 400, 'id不能为空'));
      }

      if ((await this.checkAuth(ctx.params.project_id, 'project', 'edit')) !== true) {
        return (ctx.body = yapi.commons.resReturn(null, 405, '没有权限删除'));
      }

      let result = await this.notifierModel.del(id)

      ctx.body = yapi.commons.resReturn(result);
    } catch (e) {
      ctx.body = yapi.commons.resReturn(null, 402, e.message);
    }
  }

  async testNotifier(ctx) {
    try {
      let params = ctx.request.body;
  
      params = yapi.commons.handleParams(params, {
        notifier_name: 'string',
        hook: 'string',
        type: 'string',
        signature: 'string',
        secret: 'string'
      });
  
      if ((await this.checkAuth(params.project_id, 'project', 'view')) !== true) {
        return (ctx.body = yapi.commons.resReturn(null, 405, '没有权限操作'));
      }

      if (params.hook.trim().indexOf("http") === -1) {
        return (ctx.body = yapi.commons.resReturn(null, 400, '通知地址只支持http请求'));
      }

      let result = await new notifier({}, {}).test({
        open: true,
        notifier_name: params.notifier_name,
        hook: encodeURI(params.hook),
        type: tools.inferNotifierType(params.hook),
        signature: params.signature,
        secret: params.secret
      });

      ctx.body = yapi.commons.resReturn(result, result ? 0 : 400, result ? "发送成功" : "请检查相关参数");
    } catch (e) {
      ctx.body = yapi.commons.resReturn(null, 401, e.message);
    }
  }
}

module.exports = notifierController;