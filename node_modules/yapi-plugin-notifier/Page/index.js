import React, { Component } from "react";
import PropTypes from "prop-types";
import { Tabs, Icon, Layout, Tooltip, Row, Popconfirm, message } from "antd";
const { Content, Sider } = Layout;
import axios from 'axios';

import AddContent from "./Notifier";
import './index.scss';

export default class Notifier extends Component {
  static propTypes = {
    projectId: PropTypes.number
  };

  constructor(props) {
    super(props);
    this.state = {
      hooks: [],
      currentHook: {},
      delIcon: null,
      currentKey: -2
    };
  }

  async componentWillMount() {
    this._isMounted = true;
    await this.getNotifiers();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  // 获取测试计划列表
  async getNotifiers() {
    let projectId = this.props.projectId;
    let result = await axios.get('/api/plugin/fine/notifier?project_id=' + projectId);
    if (result.data.errcode === 0) {
      if (result.data.data) {
        const hooks = result.data.data;
        this.handleClick(0, hooks[0], hooks);
      }
    }
  }

  handleClick = (key, data, curValue) => {
    if (data) {
      var state = curValue ? {
        hooks: curValue,
        currentHook: data,
        currentKey: key,
        isDelete: false
      } : {
        currentHook: data,
        currentKey: key,
        isDelete: false
      }
      this.setState(state);
    }
  };

  addParams = () => {
    let hasNew = this.state.hooks.some(value => value._id === 0);
    if (hasNew) {
      message.error("请先保存当前新建的通知！");
      return;
    }
    let data = { _id: 0, notifier_name: "通知" + Math.random().toString(36).substr(2, 3), project_id: this.props.projectId, open: true };
    let hooks = [].concat(data, this.state.hooks);
    this.handleClick(0, data, hooks);
  };

  // 删除
  async delParams(key) {
    let hooks = this.state.hooks;
    let currHooks = hooks.filter((val, index) => {
      return index !== key;
    });
    let delHook = hooks.find((val, index) => index === key);
    this.handleClick(0, currHooks[0], currHooks);
    if (delHook._id) {
      try {
        await axios.post(`/api/plugin/fine/notifier/del?id=${delHook._id}&project_id=${this.props.projectId}`);
        this.state.isDelete= true
      } catch (error) {
        console.log(error)
      }
    }
  }

  enterItem = key => {
    this.setState({ delIcon: key });
  };

  // 保存设置
  async onSave(value) {
    let result = await axios.post("/api/plugin/fine/notifier/save", value);
    this.saveResult(result);
  }

  saveResult = (result) => {
    if (
      result.data &&
      result.data.errcode &&
      result.data.errcode !== 40011
    ) {
      message.error(result.data.errmsg);
    } else {
      message.success("保存成功");
      let currHook = result.data.data;
      let hooks = this.state.hooks;
      hooks.some((val, index) => {
        if (val._id ===0 || val._id === currHook._id) {
          hooks[index] = currHook;
          return true;
        }
      });
      this.setState({
        currentHook: currHook,
        hooks
      });
    }
  }

  //  提交保存信息
  onSubmit = (value) => {
    this.onSave(value);
  };

  // 动态修改计划名称
  handleInputChange = (value, currentKey) => {
    let newValue = [].concat(this.state.hooks);
    newValue[currentKey].notifier_name = value || "通知" + Math.random().toString(36).substr(2, 3);
    this.setState({ hooks: newValue });
  };

  render() {
    const { hooks, currentKey,isDelete } = this.state;

    let notifierNames = [];

    const hookSettingItems = hooks.map((item, index) => {
      if (isDelete) {
        return null;
      }
      index !== currentKey && notifierNames.push(item.notifier_name);
      return (
        <Row
          key={index}
          className={"menu-item " + (index === currentKey ? "menu-item-checked" : "")}
          onClick={() => this.handleClick(index, item)}
          onMouseEnter={() => this.enterItem(index)}
        >
          <span className="notifier-icon-style">
            <span className="notifier-name" style={{ color: !item._id && "#2395f1" }}>
              {item.notifier_name}
            </span>
            <Popconfirm
              title="确认删除此通知?"
              onConfirm={e => {
                e.stopPropagation();
                this.delParams(index);
              }}
              okText="确定"
              cancelText="取消"
            >
              <Icon
                type="delete"
                className="interface-delete-icon"
                style={{
                  display: this.state.delIcon == index ? "block" : "none"
                }}
              />
            </Popconfirm>
          </span>
        </Row>
      );
    });

    return (
      <div>
        <Layout className="fine-notifier-panel">
          <Sider width={195} style={{ background: "#fff"}}>
            <Row className="hook-list-header menu-item">
              <div className="notifier-icon-style">
                <h3>
                  通知列表&nbsp;<Tooltip placement="top" title="在这里添加通知">
                    <Icon type="question-circle-o" />
                  </Tooltip>
                </h3>
                <Tooltip title="添加通知">
                  <Icon type="plus" onClick={() => this.addParams()} />
                </Tooltip>
              </div>
            </Row>
            <div className="notifier-slider">
              {hookSettingItems}
            </div>
          </Sider>
          <Layout className="notifier-content">
            <Content key={this.state.currentHook._id} style={{
                        display: hooks.length > 0 ? "block" : "none",
                        padding: "0 24 24 24"
                      }}>
              <Tabs tabPosition="top">
                <Tabs.TabPane tab={
                  <span>
                    通知设置
                  </span>
                  }
                  key="1"
                >
                  <AddContent
                    notifier={this.state.currentHook}
                    onSubmit={e => this.onSubmit(e, currentKey)}
                    handleNameInput={e => this.handleInputChange(e, currentKey)}
                    showResults={e => this.showResults(e)}
                    notifierNames={notifierNames}
                  />
                </Tabs.TabPane>
              </Tabs>
            </Content>
            <Content style={{
                        display: hooks.length === 0 ? "block" : "none",
                        padding: 24,
                        textAlign: "center"
                      }}>
              暂无通知，请在左侧添加新的通知
            </Content>
          </Layout>
        </Layout>
      </div>
    );
  }
}