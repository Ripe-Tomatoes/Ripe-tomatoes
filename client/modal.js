  angular.module('loginModalApp', [])
    .controller('modalCtrl', [function(){
      var self = this;

      self.login = function(){
        console.log(self.existingUser);
      };

      self.join = function(){
        console.log(self.newUser);
      };
    }]);