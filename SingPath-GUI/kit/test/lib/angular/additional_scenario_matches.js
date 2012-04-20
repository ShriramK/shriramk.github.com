// Simply return the calced value
angular.scenario.matcher('value', function(callback) {
  callback.call(this, this.actual);
  return true;
});
