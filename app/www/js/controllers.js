angular.module('starter.controllers', ['starter.services'])

.controller('DashCtrl', function($scope,$timeout,$ionicPopup,$ionicModal,$rootScope,User,Socket) {
  //var token = window.localStorage.getItem('EcoVolt-token');
  var token = true;
  if (token) {
      init();
  } else {
    $ionicModal.fromTemplateUrl('templates/register.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.registerObj = {};
      modal.show();
    });
  }
  $scope.register = function () {
    User.register($scope.registerObj)
  };
  $scope.items = null;
  function init() {
    $scope.device = {};
    var devices = [{
      deviceId: 322,
      title: 'Телевизор',
      icon: 'img/icons/screen54.svg',
      time: 200,
      status: true
    },{
      deviceId: 321,
      title: 'Настольная лампа',
      icon: 'img/icons/lamps7.svg',
      status: null
    }];
    Socket.getDevicesWithStatus(devices).then(function (data) {
      $timeout(function () {
        $scope.items = data;
      });
    });
    $rootScope.$on('status', function (type, data) {
      if (data.afterTimer) {
        $scope.items.map(function (item, index) {
          if (item.deviceId == data.deviceId) {
            $timeout(function () {
              $scope.items[index].status = !data.status;
              $scope.items[index].time = 0
            });
          }
        })
      }
    });
    $scope.setTimer = function (data) {
      function addZero(i) {
        if (i < 10) {
          i = "0" + i;
        }
        return i;
      }
      var status = data.status?'выключено':'включено';
      var date = (addZero(moment().hours())+':'+addZero(moment().add(1,'minutes').minute()));
      var content;
      if (data.timer) {
        content = '<p class="text-center">через '+ moment(moment(data.timer).diff(moment())).minute()+1 + ' минут</p>';
      } else {
        content = '<input type="time" value="'+date+'" style="text-align: center" id="timeDate">';
      }
      $ionicPopup.confirm({
        title: 'Устройство будет ' + status,
        template: content,
        okText: data.status?'Выключить':'Включить',
        cancelText: 'Отмена',
        okType: data.status?'button-assertive':'button-balanced'
      }).then(function (res) {
        if (res) {
          var formDate = document.getElementById('timeDate').value.split(':');
          var now = new Date().setHours(formDate[0],formDate[1]);
          Socket.setTimer(data, now)
        }
      })
    };
    $scope.allItems = [{
      icon: 'img/icons/screen54.svg'
    },{
      icon: 'img/icons/pc6.svg'
    },{
      icon: 'img/icons/computers27.svg'
    },{
      icon: 'img/icons/beverage1.svg'
    },{
      icon: 'img/icons/bowl12.svg'
    },{
      icon: 'img/icons/cooking47.svg'
    },{
      icon: 'img/icons/iron3.svg'
    },{
      icon: 'img/icons/washingmachine4.svg'
    }];
    $scope.enable = function (device) {
      Socket.changeStatus(device);
    };
    $ionicModal.fromTemplateUrl('templates/add-device.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.addDeviceModal = modal;
    });
    $scope.addDeviceOpen = function () {
      $scope.addDeviceModal.show();
    };
    $scope.addDevice = function (device) {
      $scope.items.push(device);
      $scope.addDeviceModal.hide();
      $scope.device = {};
    };
    $scope.closeAddDevice = function () {
      $scope.addDeviceModal.hide();
      $scope.device = {};
    };
    $scope.refresh = function () {
      Socket.getDevicesWithStatus($scope.items).then(function (data) {
        $timeout(function () {
          $scope.items = data;
        });
      });
      $scope.$broadcast('scroll.refreshComplete');
    }
  }
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
})
.controller('StatisticsCtrl', function($scope) {
      var chart = new Chartist.Line('.ct-chart', {
        labels: ['Апрель', 'Май', 'Июнь'],
        series: [
          [12, 13, 10, 20],
          [100, 130, 120, 120]
        ]
      }, {
        low: 0
      });

// Let's put a sequence number aside so we can use it in the event callbacks
      var seq = 0,
          delays = 80,
          durations = 500;

// Once the chart is fully created we reset the sequence
      chart.on('created', function() {
        seq = 0;
      });

// On each drawn element by Chartist we use the Chartist.Svg API to trigger SMIL animations
      chart.on('draw', function(data) {
        seq++;

        if(data.type === 'line') {
          // If the drawn element is a line we do a simple opacity fade in. This could also be achieved using CSS3 animations.
          data.element.animate({
            opacity: {
              // The delay when we like to start the animation
              begin: seq * delays + 1000,
              // Duration of the animation
              dur: durations,
              // The value where the animation should start
              from: 0,
              // The value where it should end
              to: 1
            }
          });
        } else if(data.type === 'label' && data.axis === 'x') {
          data.element.animate({
            y: {
              begin: seq * delays,
              dur: durations,
              from: data.y + 100,
              to: data.y,
              // We can specify an easing function from Chartist.Svg.Easing
              easing: 'easeOutQuart'
            }
          });
        } else if(data.type === 'label' && data.axis === 'y') {
          data.element.animate({
            x: {
              begin: seq * delays,
              dur: durations,
              from: data.x - 100,
              to: data.x,
              easing: 'easeOutQuart'
            }
          });
        } else if(data.type === 'point') {
          data.element.animate({
            x1: {
              begin: seq * delays,
              dur: durations,
              from: data.x - 10,
              to: data.x,
              easing: 'easeOutQuart'
            },
            x2: {
              begin: seq * delays,
              dur: durations,
              from: data.x - 10,
              to: data.x,
              easing: 'easeOutQuart'
            },
            opacity: {
              begin: seq * delays,
              dur: durations,
              from: 0,
              to: 1,
              easing: 'easeOutQuart'
            }
          });
        } else if(data.type === 'grid') {
          // Using data.axis we get x or y which we can use to construct our animation definition objects
          var pos1Animation = {
            begin: seq * delays,
            dur: durations,
            from: data[data.axis.units.pos + '1'] - 30,
            to: data[data.axis.units.pos + '1'],
            easing: 'easeOutQuart'
          };

          var pos2Animation = {
            begin: seq * delays,
            dur: durations,
            from: data[data.axis.units.pos + '2'] - 100,
            to: data[data.axis.units.pos + '2'],
            easing: 'easeOutQuart'
          };

          var animations = {};
          animations[data.axis.units.pos + '1'] = pos1Animation;
          animations[data.axis.units.pos + '2'] = pos2Animation;
          animations['opacity'] = {
            begin: seq * delays,
            dur: durations,
            from: 0,
            to: 1,
            easing: 'easeOutQuart'
          };

          data.element.animate(animations);
        }
      });

// For the sake of the example we update the chart every time it's created with a delay of 10 seconds
      chart.on('created', function() {
        if(window.__exampleAnimateTimeout) {
          clearTimeout(window.__exampleAnimateTimeout);
          window.__exampleAnimateTimeout = null;
        }
        window.__exampleAnimateTimeout = setTimeout(chart.update.bind(chart), 12000);
      });
})
.controller('RegisterCtrl', function($scope,User) {
    User.register();
});
