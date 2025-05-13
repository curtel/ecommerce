const crypto = require('crypto');
const axios = require('axios');
const moment = require('moment');
const CryptoJS = require('crypto-js'); // npm install crypto-js
const { v4: uuid } = require('uuid');
require('dotenv').config();
const config = {
  appid: "2554",
  key1: "sdngKKJmqEMzvh5QQcdD2A9XBSKUNaYn",
  key2: "trMrHtvjo6myautxDUiAcYsVtaeQ8nhf",
  endpoint: "https://sandbox.zalopay.com.vn/v001/tpe/createorder"
};
// Helper functions
const helpers = {
  /**
   * Generate MAC for ZaloPay request
   * @param {Object} data Request data
   * @returns {String} MAC string
   */
  generateMac: (order) => {
    const data = config.appid + "|" + order.apptransid + "|" + order.appuser + "|" + order.amount + "|" + order.apptime + "|" + order.embeddata + "|" + order.item;
    const mac = CryptoJS.HmacSHA256(data, config.key1).toString();
    return mac;
  },

  /**
   * Generate MAC for ZaloPay redirect validation
   * @param {Object} data Redirect data
   * @returns {String} MAC string
   */
  generateRedirectMac: (data) => {
    const checksumData = `${data.appid}|${data.apptransid}|${data.pmcid}|${data.bankcode}|${data.amount}|${data.discountamount}|${data.status}`;

    return crypto.createHmac('sha256', config.key2)
      .update(checksumData)
      .digest('hex');
  },

  /**
   * Verify redirect data from ZaloPay
   * @param {Object} data Redirect data
   * @returns {Boolean} Is valid
   */
  verifyRedirect: (data) => {
    const checksum = helpers.generateRedirectMac(data);
    return checksum === data.checksum;
  },

  /**
   * Create unique app transaction ID
   * @returns {String} App transaction ID
   */
  getAppTransId: () => {
    // Format: yymmdd_appid_6-digit-random-number
    return `${moment().format('YYMMDD')}_${uuid()}`;
  },

  /**
   * Get endpoint based on environment
   * @param {String} type Endpoint type
   * @returns {String} Endpoint URL
   */
  getEndpoint: (type) => {
    const env = config.sandbox ? 'sandbox' : 'production';
    return config.endpoints[type][env];
  }
};

// API functions
const api = {
  /**
   * Create ZaloPay order
   * @param {Object} orderData Order data
   * @returns {Promise} ZaloPay response
   */
  createOrder: async (orderData, orderId) => {
    try {
      // APP INFO
      const embeddata = JSON.stringify({
        redirecturl: `${process.env.FRONT_END || 'http://localhost:3000'}/payment/result?orderId=${orderId}`,
        merchantinfo: "E-commerce payment"
      });

      const items = orderData.items.map(item => ({
        itemid: item._id.toString(),
        itemname: item.name,
        itemprice: item.price,
        itemquantity: item.quantity
      }));
      const appTransId = helpers.getAppTransId();

      const order = {
        appid: config.appid,
        apptransid: appTransId,
        apptime: Date.now(),
        appuser: orderData.userId,
        amount: orderData.totalAmount * 23000,
        item: JSON.stringify(items),
        description: `Payment for order #${orderData._id}`,
        embeddata: embeddata,
        bankcode: ""
      };

      order.mac = helpers.generateMac(order);

      // Send request
      const endpoint = config.endpoint;
      // ZaloPay expects form-urlencoded data
      const response = await axios.post(endpoint, order, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      return response.data;
    } catch (error) {
      console.error('ZaloPay createOrder error:', error.response ? error.response.data : error.message);
      throw new Error('Failed to create ZaloPay order');
    }
  },

  /**
   * Get ZaloPay order status
   * @param {String} appTransId App transaction ID
   * @returns {Promise} ZaloPay response
   */
  getOrderStatus: async (appTransId) => {
    try {
      // Prepare request data
      const reqData = {
        appid: config.appid,
        apptransid: appTransId
      };

      // Generate MAC
      reqData.mac = helpers.generateMac(reqData);

      // Send request
      const endpoint = helpers.getEndpoint('getOrderStatus');
      const response = await axios.post(endpoint, reqData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      return response.data;
    } catch (error) {
      console.error('ZaloPay getOrderStatus error:', error.response ? error.response.data : error.message);
      throw new Error('Failed to get ZaloPay order status');
    }
  },

  /**
   * Get bank list
   * @returns {Promise} ZaloPay response
   */
  getBankList: async () => {
    try {
      // Prepare request data
      const reqtime = Date.now().toString();

      const reqData = {
        appid: config.appid,
        reqtime
      };

      // Generate MAC
      const mac = crypto.createHmac('sha256', config.key1)
        .update(`${config.appid}|${reqtime}`)
        .digest('hex');

      reqData.mac = mac;

      // Send request
      const endpoint = helpers.getEndpoint('getBankList');
      const response = await axios.post(endpoint, reqData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      return response.data;
    } catch (error) {
      console.error('ZaloPay getBankList error:', error.response ? error.response.data : error.message);
      throw new Error('Failed to get ZaloPay bank list');
    }
  }
};

module.exports = {
  config,
  helpers,
  api
}; 
