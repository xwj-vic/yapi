const yapi = require('yapi.js');
const baseModel = require('models/base.js');
const { TYPE } = require("../utils/const");

class notifierModel extends baseModel {
  getName() {
    return 'fine_notifier';
  }

  getSchema() {
    return {
      uid: Number,
      // 项目id
      project_id: {
        type: Number,
        required: true
      },

      //是否开启
      open: {
        type: Boolean,
        default: true
      },

      // 名称
      notifier_name: {
        type: String,
        required: true
      },

      // 请求签名密钥
      secret: String,

      // 通知签名
      signature: String,

      // 通知范围
      scope: {
        type: String,
        default: "saveLog",
        enmu: ["saveLog"]
      },

      // 通知类型
      type: {
        type: String,
        default: TYPE.WW,
        enmu: Object.values(TYPE)
      },

      // 地址
      hook: String,

      whitelist: [],

      add_time: Number,
      up_time: Number
    };
  }

  save(data) {
    data.add_time = yapi.commons.time();
    data.up_time = yapi.commons.time();
    let notifier = new this.model(data);
    return notifier.save();
  }

  listAll() {
    return this.model
      .find()
      .sort({ _id: -1 })
      .exec();
  }

  find(id) {
    return this.model.findOne({ _id: id });
  }

  findByName(name, project_id) {
    return this.model.findOne({ plan_name: name, project_id });
  }

  findByProject(id) {
    return this.model
      .find({
        project_id: id
      })
      .sort({ _id: -1 })
      .exec();
  }

  update(id, data) {
    data.up_time = yapi.commons.time();
    return this.model.update(
      {
        _id: id
      },
      data
    );
  }

  findOneAndUpdate(condition, data) {
    return this.model.findOneAndUpdate(condition, data, {upsert: true, new: true, setDefaultsOnInsert: true});
  }

  del(id) {
    return this.model.deleteOne({
      _id: id
    });
  }
}

module.exports = notifierModel;