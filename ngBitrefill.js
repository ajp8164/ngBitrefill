'use strict';

angular.module('ngBitrefill')
  .provider('bitrefill', function() {
    var apiKey,
        apiPass;
        
    this.setCredentials = function(key, password) {
      this.apiKey = key;
      this.apiPass = password;
    }
    
    function Bitrefill(cfg, $log, $http) {
      if (!(this instanceof Bitrefill))
        return new Bitrefill(cfg)

      this.cfg = cfg
      this.$log = $log;
      this.$http = $http;

      /*assert(this.cfg, 'cfg is required')
      assert(this.cfg.key, 'cfg.key is required')
      assert(this.cfg.secret, 'cfg.secret is required')
      assert(this.cfg.url, 'cfg.url is required')*/
      this.authurl = "https://" + this.cfg.key + ":" + this.cfg.secret + "@" + this.cfg.url;
    }
    
    Bitrefill.prototype.handleDataResponse = function(response, cb) {
      var data = JSON.parse(response.data);
      if (data.error) {
        cb(data.error);
      } else if (data.errorMessage) {
        cb(data.errorMessage);
      } else {
        cb(null, data);
      }
    };
    
    Bitrefill.prototype.handleErrorResponse = function(response, cb) {
      this.$log.error(response.status + ': ' + response.data);
      cb(response.data);
    };
    
    Bitrefill.prototype.request = function(config, cb) {
      var self = this;
      this.$http(config).then(function successCallback(response) {
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
        url: this.authurl + "/lookup_number",
        data: {
          number: number,
          operatorSlug: operator || undefined
        }
      };
      
      this.request(params, cb);
    };

    Bitrefill.prototype.placeOrder = function(number, operator, pack, email, cb) {
      var params = {
        method: "POST",
        url: this.authurl + "/order",
        data: {
          number: number,
          valuePackage: pack,
          operatorSlug: operator,
          email: email
        }
      };
      
      this.request(params, cb);
    };

    Bitrefill.prototype.orderStatus = function(order_id, cb) {
      var params = {
        method: "GET",
        url: this.authurl + "/order/" + order_id
      };
      
      this.request(params, cb);
    };

    
    this.$get = function($log, $http) {
      if (!this.apiKey || !this.apiPass) {
        throw new Error("BitrefillService is not configured. " +
                            "Call setCredentials(apiKey, apiPass) on it's provider");
      }
      
      var bitrefill = new Bitrefill({
        key: this.apiKey,
        secret: this.apiPass,
        url: 'api.bitrefill.com/v1'
      }, $log, $http);
      
      return bitrefill;
    };
});