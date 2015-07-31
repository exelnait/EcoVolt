angular.module('starter.services', [])
.service('User', function ($rootScope,$http) {
    $rootScope.appId = 123;
    return {
      register: function (data) {
        $http.get('http://178.62.66.132:3000/register', {
          username: data.email,
          password: data.password
        }).success(function (data) {
          console.log(data)
        });
      },
      login: function (data) {
        $http.get('http://178.62.66.132:3000/login', {
          username: data.email,
          password: data.password
        }).success(function (data) {
          console.log(data)
        });
      }
    }
})
.service('Socket', function ($q,$rootScope) {
    var socket = io('http://178.62.66.132:3000', {
      query: {
        type: 'app',
        id: 123
      }
    });
    socket.on('status', function (data) {
      console.log('ON: status', data);
      $rootScope.$broadcast('status', data)
    });
    socket.on('changeStatus', function (data) {
      console.log('ON: changeStatus', data);
      $rootScope.$broadcast('changeStatus', data)
    });
    socket.on('connect', function(){
      console.log('Connected')
    });
    socket.on('disconnect', function(){
      console.log('Disconnected')
    });
    return {
      emit: function (channel, data, promise) {
        var d = $q.defer();
        console.log('EMIT:' + channel, data);
        if (promise) {
          var listener = $rootScope.$on(channel, function (scope, data) {
            d.resolve(data);
            listener();
          });
        }
        socket.emit(channel, data);
        return d.promise;
      },
      getDevicesWithStatus: function (devices) {
        var self = this;
        var d = $q.defer();
        devices.map(function (device, index) {
          if (device.deviceId == 321) {
            self.emit('status', {
              type: 'device',
              deviceId: device.deviceId,
              appId: $rootScope.appId
            }, true).then(function (data) {
              device.status = !data.status;
              device.time = moment(moment().diff(moment(data.time))).minute();
              device.timer = data.timer
            })
          }
        });
        d.resolve(devices);
        return d.promise
      },
      changeStatus: function (device) {
        var dev = angular.copy(device);
        dev.appId = $rootScope.appId;
        dev.type = 'device';
        dev.status = !device.status;
        this.emit('changeStatus', dev, true).then(function (data) {
          console.log('Статус изменен', data)
          device.time = 0;
        })
      },
      setTimer: function (device, timer) {
        var dev = angular.copy(device);
        dev.appId = $rootScope.appId;
        dev.type = 'device';
        dev.status = device.status;
        dev.timer = timer;
        this.emit('setTimer', dev, true).then(function (data) {
          console.log('Таймер поставлен', data)
        })
      }
    };
})

