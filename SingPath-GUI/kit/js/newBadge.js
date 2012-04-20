/* Controllers used in home.html */

function newBadgeCtrl($scope) {
  // Main content class
  $scope.contentClass = "newBadge";
  
  // Set popUp details
  $scope.popUp = {
    // This name is used for switching between all popUps in the common_pop_up.html include
    "name": "newBadge",
    
    // General popUp display class
    "class": "show",
    
    // Shown on the top-left
    "label": "Badge Information",
    
    // Continue Playing btn details
    "btns": [
      {
        "label": "Continue Playing",
        "title": "Continue Playing",
        
        // Manage btn visibility
        "show" : function() { return true }
      }
    ]
  }
}
