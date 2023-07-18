import React, { Component } from "react";
import PropTypes from "prop-types";
import { Tag, Input, Tooltip, Icon } from 'antd';

export default class EditableTagGroup extends Component {
  static propTypes = {
    items: PropTypes.array,
    changeItems: PropTypes.func
  };

  constructor(props) {
    super(props);
    this.state = {
      tags: props.items || [],
      inputVisible: false,
      inputValue: ''
    };
  }

  handleClose = removedTag => {
    const { changeItems } = this.props;
    const tags = this.state.tags.filter(tag => tag !== removedTag);
    this.setState({ tags });
    changeItems(tags);
  };

  showInput = () => {
    this.setState({ inputVisible: true }, () => this.input.focus());
  };

  handleInputChange = e => {
    this.setState({ inputValue: e.target.value });
  };

  handleInputConfirm = () => {
    const { inputValue } = this.state;
    const { changeItems } = this.props;
    let { tags } = this.state;
    if (inputValue && tags.indexOf(inputValue) === -1) {
      tags = [...tags, inputValue];
    }
    this.setState({
      tags,
      inputVisible: false,
      inputValue: ''
    });
    changeItems(tags);
  };

  saveInputRef = input => (this.input = input);

  render() {
    const { tags, inputVisible, inputValue } = this.state;
    return (
      <div>
        {tags.map((tag, index) => {
          const isLongTag = tag.length > 10;
          const tagElem = (
            <Tag key={tag} closable={index !== 0} onClose={() => this.handleClose(tag)}>
              {isLongTag ? `${tag.slice(0, 10)}...` : tag}
            </Tag>
          );
          return isLongTag ? (
            <Tooltip title={tag} key={tag}>
              {tagElem}
            </Tooltip>
          ) : (
            tagElem
          );
        })}
        {inputVisible && (
          <Input
            ref={this.saveInputRef}
            type="text"
            size="small"
            style={{ width: 78 }}
            value={inputValue}
            onChange={this.handleInputChange}
            onBlur={this.handleInputConfirm}
            onPressEnter={this.handleInputConfirm}
          />
        )}
        {!inputVisible && tags.length < 10 && (
          <Tag onClick={this.showInput} style={{ background: '#fff', borderStyle: 'dashed' }}>
            <Icon type="plus" /> 新增关键字
          </Tag>
        )}
      </div>
    );
  }
}