
function AppCtrl($route, $resource, $xhr) {
    $route.parent(this)
    $xhr.defaults.headers.post['Content-Type']='application/json';
    // this.Tournament = $resource('/jsonapi/rest/tournament/:id', {id: '@id'})
    var that = this
    this.mainScope = this
    this.entityClasses = []
    this.resources = []
    this.entityCache = {}
    //the HTTP actions used by the application. verifyCache=true is needed to
    //prevent caching by angular
    var actions = {
        'get':    {method:'GET', verifyCache: true},
        'save':   {method:'POST'},
        'query':  {method:'GET', isArray:true, verifyCache: true},
        'remove': {method:'DELETE'},
        'delete': {method:'DELETE'}
    }
    $xhr('GET', '/jsonapi/rest/metadata', function(code, response){
        that.metadata = response
        for (var m in response.models) {
            var model = response.models[m]
            that.entityClasses.push(model.model)
            that.resources.push($resource(model.url+'/:id', {id: '@id'}, actions))
        }

        that.selectClass(0)
    })
}
AppCtrl.$inject = ['$route', '$resource', '$xhr']
AppCtrl.prototype = {
    log: function(obj){
        console.log(obj)
        return obj
    },
    selectClass: function(idx){
        var that = this.mainScope
        that.newEntityMode = true
        if (idx != undefined) {
            that.entityClass = that.entityClasses[idx]
            that.entityResource = that.resources[idx]
        }
        that.entity = new that.entityResource()
        //these 2 instruction forces angular to run all formatters, so that.entity object will
        //have properties, otherwise it would be an empty object, which is not good for us.
        //the trick is, that IMHO it clears the DOM elements in the browser...
        that.properties = []; that.$eval()
        //... so when that.properties will be assigned here, it has to build the DOM elements
        //again and run all formatters.
        that.properties = that.metadata.models[that.entityClass].properties
        that.getAllEntities()
        //this second $eval is here to prevent flickering in the browser
        that.$eval()
        //copy default values to entity
        for (var idx in that.properties) {
            var prop = that.properties[idx]
            if (prop.default) {
                that.entity[prop.name] = prop.default
            }
        }
    },
    submit: function(){
        var that = this
        if (this.isNewEntityMode()) {
            this.createEntity(this.entity, function(){
                that.selectClass()
            })
        } else {
            this.modifyEntity(function(e){
                that.selectClass()
            })
        }
    },
    cancel: function(){
        this.selectClass()
    },
    isNewEntityMode: function(){
        return this.newEntityMode
    },
    removeEntity: function(entity){
        var that = this
        this.deleteEntity(entity, function(){
            that.getAllEntities()
        })
    },
    resolve: function(refClass, id){
        var that = this
        var idx = that.entityClasses.indexOf(refClass)
        if (!idx) return
        var entityResource = that.resources[idx]
        entityResource.get({id: id}, this.wrapErrorHandler(function(entity){
            that.addToCache(refClass, entity)
        }))
    },
    addToCache: function(entityClass, entity){
        if (!this.entityCache[entityClass]) this.entityCache[entityClass] = {}
        this.entityCache[entityClass][entity.id] = entity
    },
    // search the entity in the entityCache, and if found, returns the entity's mainProperty.
    // the entity specified by its class and id
    // @parameter refClass the entity's class (for example, "Country", or "Player")
    // @parameter id the entity's id (integer)
    getMainProperty: function(refClass, id){
        if (id && this.entityCache[refClass] && this.entityCache[refClass][id]) {
            return this.entityCache[refClass][id][this.metadata.models[refClass].mainProperty]
        }
    },
    
    wrapErrorHandler: function(func){
        func = func || function(){}
        return function(e){
            if (e.error) {
                alert(e.error)
            } else {
                func(e)
            }
        }
    },
    createEntity: function(entity, afterFunc){
        this.entity = new this.entityResource(entity)
        this.entity.$save(this.wrapErrorHandler(afterFunc))
    },
    modifyEntity: function(afterFunc){
        this.entity.$save(this.wrapErrorHandler(afterFunc))
    },
    getEntity: function(id){
        var that = this
        this.entityResource.get({id: id}, this.wrapErrorHandler(function(entity){
            that.entity = entity
            that.newEntityMode = false
        }))
    },
    deleteEntity: function(entity, afterFunc){
        entity.$delete(this.wrapErrorHandler(afterFunc))
    },
    getAllEntities: function(){
        var that = this
        this.entityResource.query(this.wrapErrorHandler(function(list){
            that.entities = list
            for(var i in list) {
                that.addToCache(that.entityClass, list[i])
            }
        }))
    }
}
function View1Ctrl(){}
function View2Ctrl(){}
