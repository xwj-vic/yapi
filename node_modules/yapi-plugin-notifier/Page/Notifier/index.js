import React, { Component } from "react";
import PropTypes from "prop-types";
import { Form, Switch, Button, Input, Tooltip, Icon, message } from "antd";
import axios from 'axios';
const FormItem = Form.Item;

import List from "./list";

// layout
const formItemLayout = {
  labelCol: {
    lg: { span: 5 },
    xs: { span: 24 },
    sm: { span: 10 }
  },
  wrapperCol: {
    lg: { span: 16 },
    xs: { span: 24 },
    sm: { span: 12 }
  },
  className: "form-item"
};
const tailFormItemLayout = {
  wrapperCol: {
    sm: {
      span: 16,
      offset: 11
    }
  }
};

@Form.create()
export default class Add extends Component {
  static propTypes = {
    form: PropTypes.object,
    notifier: PropTypes.object,
    onSubmit: PropTypes.func,
    handleNameInput: PropTypes.func,
    notifierNames: PropTypes.array
  };

  constructor(props) {
    super(props);
    this.state = {
      notifier_data: props.notifier
    };
  }

  handleSubmit = async () => {
    const { form, notifier, onSubmit } = this.props;
    const { notifier_data } = this.state;
    let params = {
      id: notifier._id,
      project_id: notifier.project_id,
      open: notifier_data.open,
      hook: notifier_data.hook,
      whitelist: notifier_data.whitelist
    };
    form.validateFields(async (err, values) => {
      if (!err) {
        let assignValue = Object.assign(params, values);
        onSubmit(assignValue);
      }
    });
  };

  handleTest = async () => {
    const { form, notifier } = this.props;
    let params = {
      project_id: notifier.project_id
    };
    form.validateFields(async (err, values) => {
      if (!err) {
        let assignValue = Object.assign(params, values);
        let result = await axios.post("/api/plugin/fine/notifier/test", assignValue);
        if (result.data.errcode === 0 && result.data.data && (result.data.data.errcode === 0 || result.data.data.code === 0)) {
          message.success("消息已发送");
        } else if (result.data.errcode === 0 && result.data.data) {
          message.error("发送失败：" + result.data.data.errmsg);
        } else {
          message.error("发送失败：" + result.data.errmsg);
        }
      }
    });
  }

  // 是否开启
  onChange = v => {
    let notifier_data = this.state.notifier_data;
    notifier_data.open = v;
    this.setState({
      notifier_data: notifier_data
    });
  }

  changeWhitelist = v => {
    let notifier_data = this.state.notifier_data;
    notifier_data.whitelist = v;
    this.setState({
      notifier_data: notifier_data
    });
  }

  render() {
    const { notifierNames } = this.props;
    const { getFieldDecorator } = this.props.form;
    return (
      <div className="m-panel">
        <Form>
          <FormItem
            label="是否开启通知"
            {...formItemLayout}
          >
            <Switch
              checked={this.state.notifier_data.open}
              onChange={this.onChange}
              checkedChildren="开"
              unCheckedChildren="关"
            />
          </FormItem>

          <div>
            <FormItem {...formItemLayout} label="通知名称">
              {getFieldDecorator("notifier_name", {
                rules: [
                  {
                    required: true,
                    message: "请输入通知名称"
                  },
                  {
                    validator: (rule, value, callback) => {
                      if (value) {
                        if (notifierNames.includes(value)) {
                          callback("通知名称重复");
                        } else if (!/\S/.test(value)) {
                          callback("请输入通知名称");
                        } else {
                          callback();
                        }
                      } else {
                        callback();
                      }
                    }
                  }
                ],
                validateTrigger: "onBlur",
                initialValue: this.state.notifier_data.notifier_name
              })(<Input onChange={e => this.props.handleNameInput(e.target.value)} />)}
            </FormItem>

            <FormItem {...formItemLayout}
              label={
                <span>
                  通知地址&nbsp;
                  <Tooltip title="直接复制企业微信、钉钉机器人完整地址或自定义webhook的地址">
                    <Icon type="question-circle-o" />
                  </Tooltip>
                </span>
              }>
              {getFieldDecorator("hook", {
                rules: [
                  {
                    required: true,
                    message: "请输入通知 Webhook 地址"
                  }
                ],
                validateTrigger: "onBlur",
                initialValue: this.state.notifier_data.hook
              })(<Input placeholder="企业微信、钉钉机器人、SeaTalk机器人完整地址或自定义webhook的地址" />)}
            </FormItem>

            <FormItem {...formItemLayout}
              label={
                <span>
                  通知签名&nbsp;
                  <Tooltip title="配置后消息形式为：【签名】消息内容">
                    <Icon type="question-circle-o" />
                  </Tooltip>
                </span>
              }>
              {getFieldDecorator("signature", {
                initialValue: this.state.notifier_data.signature
              })(<Input placeholder="选填：拼接在消息之前的签名信息" />)}
            </FormItem>

            <FormItem {...formItemLayout}
              label={
                <span>
                  请求密钥
                  &nbsp;<a href="https://ding-doc.dingtalk.com/doc#/serverapi2/qf2nxq/uKPlK">文档</a>&nbsp;
                  <Tooltip title="参考钉钉机器人安全设置的加签文档，设置后会在url上拼接&timestamp=XXX&sign=XXX">
                    <Icon type="question-circle-o" />
                  </Tooltip>
                </span>
              }>
              {getFieldDecorator("secret", {
                initialValue: this.state.notifier_data.secret
              })(<Input placeholder="选填：加签密钥，钉钉机器人和自定义webhook支持" />)}
            </FormItem>

            <FormItem {...formItemLayout}
              label={
                <span>
                  白名单&nbsp;
                  &nbsp;<a href="https://github.com/congqiu/yapi-plugin-notifier/blob/master/README.md#%E7%99%BD%E5%90%8D%E5%8D%95%E9%85%8D%E7%BD%AE">文档</a>&nbsp;
                  <Tooltip title="设置后只有消息(markdown格式)中包含白名单中任意关键词才会推送，最多添加10个">
                    <Icon type="question-circle-o" />
                  </Tooltip>
                </span>
              }>
              {(<List items={this.state.notifier_data.whitelist} changeItems={e => this.changeWhitelist(e)} />)}
            </FormItem>
          </div>
          <FormItem {...tailFormItemLayout}>
            <Button type="primary" htmlType="submit" icon="save" size="large" onClick={this.handleSubmit}>
              保存
            </Button>
            <Button htmlType="submit" icon="poweroff" size="large" className="test-btn" onClick={this.handleTest}>
              测试发送
            </Button>
          </FormItem>
        </Form>
      </div>
    );
  }
}
