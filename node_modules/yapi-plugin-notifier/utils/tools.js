const axios = require("axios");
const https = require('https');
const crypto = require('crypto');
const { TYPE } = require("./const");

exports.sendWWMessage = async (url, content) => {
  return await axios.post(url, {
    "msgtype": "markdown",
    "markdown": {
      content
    }
  });
};

exports.sendDingTalk = async (url, title, text) => {
  return await axios.post(url, {
    "msgtype": "markdown",
    "markdown": {
      title,
      text
    }
  });
};

exports.sendWebhook = async (url, content, data) => {
  return await axios.post(url, {
    data,
    content
  });
};

exports.sendSeaTalkWebhook = async (url, content, data) => {
  const agent = new https.Agent({
    rejectUnauthorized: false
  });
  return await axios.post(url, {
    "tag": "markdown",
    "markdown": {
      "content": '<mention-tag target="seatalk://user?id=0"/>' + content + ':\n\n' + data,
    }
  },{ httpsAgent: agent });
};

exports.inferNotifierType = url => {
  if (url.trim().indexOf("https://qyapi.weixin.qq.com") === 0) {
    return TYPE.WW;
  }
  if (url.indexOf("https://oapi.dingtalk.com/robot/send") === 0) {
    return TYPE.DINGTALK;
  }
  if (url.indexOf("https://openapi.seatalk.io/webhook/group") === 0) {
    return TYPE.SEATALK;
  }
  return TYPE.WEBHOOK;
}

exports.sign = (secret, timestamp) => {
  const str = crypto.createHmac('sha256', secret).update(timestamp + "\n" + secret)
    .digest()
    .toString('base64');
  return encodeURIComponent(str);
}
