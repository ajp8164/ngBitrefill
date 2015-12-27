'use strict';

angular.module('ngBitrefill', ['base64'])
  .provider('bitrefill', function() {
    var apiKey,
        apiSecret;
        
    this.setCredentials = function(key, secret) {
      this.apiKey = key;
      this.apiSecret = secret;
    }
    
    this.$get = function($log, $http, $base64) {
      var that = this;
      if (!that.apiKey || !that.apiSecret) {
        throw new Error("Bitrefill service is not configured. " +
                        "Call setCredentials(apiKey, apiSecret) on it's provider");
      }
      
      function Bitrefill() {
        this.baseUrl = "https://api.bitrefill.com/v1";
      }
      
      Bitrefill.prototype.handleDataResponse = function(response, cb) {
        var data = response.data;
        if (data.error) {
          cb(data.error);
        } else if (data.errorMessage) {
          cb(data.errorMessage);
        } else {
          cb(null, data);
        }
      };
      
      Bitrefill.prototype.handleErrorResponse = function(response, cb) {
        $log.error(response.status + ': ' + JSON.stringify(response.data));
        cb(response.status == 500 ? 'Server error' : response.data);
      };
      
      Bitrefill.prototype.request = function(config, cb) {
        var self = this;
        config.headers = {
          Authorization: 'Basic ' + $base64.encode(that.apiKey + ':' + that.apiSecret)
        };
        config.url = this.baseUrl + config.url;
        $http(config).then(function successCallback(response) {
          self.handleDataResponse(response, cb);
        }, function errorCallback(response) {
          self.handleErrorResponse(response, cb);
        });

      }

      Bitrefill.prototype.inventory = function(cb) {
        var params = {
          method: 'GET',
          url: this.authurl + "/inventory/"
        };
        
        this.request(params, cb);
      };

      Bitrefill.prototype.lookupNumber = function(number, operator, cb) {
        if (typeof operator == 'function') {
          operator = null;
          cb = operator;
        }
        var params = {
          method: 'GET',
          url: "/lookup_number",
          params: {
            number: number,
            operatorSlug: operator || undefined
          }
        };
        
        this.request(params, cb);
      };

      Bitrefill.prototype.placeOrder = function(number, operator, pack, email, refundAddress, cb) {
        var params = {
          method: "POST",
          url: "/order",
          data: {
            number: number,
            valuePackage: pack,
            operatorSlug: operator,
            email: email,
            refund_btc_address: refundAddress
          }
        };
        
        this.request(params, cb);
      };

      Bitrefill.prototype.orderStatus = function(order_id, cb) {
        var params = {
          method: "GET",
          url: "/order/" + order_id
        };
        
        this.request(params, cb);
      };

      return new Bitrefill();
    };
});