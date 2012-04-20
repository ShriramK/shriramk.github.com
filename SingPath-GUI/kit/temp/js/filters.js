/* http://docs.angularjs.org/#!angular.filter */

function pad3(s) {
    if (!s) return '000'
    s = s.toString()
    if (s.length == 1) return '00' + s
    if (s.length == 2) return '0' + s
    return s
}
function convertDateToUTC(date) {
    if (!date) return date
    return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),
        date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds(),
        date.getUTCMilliseconds())
}

angular.filter('dynformat', function(obj, prop) {
    if (prop.type == 'DateTime') {
        return angular.filter.date.call(this, obj, 'yyyy-MM-dd HH:mm:ss')
    } else if (prop.type == 'Reference' && obj) {
        var res = this.getMainProperty(prop.reference, obj)
        if (res) return obj + ', ' + res
    }
    return obj
})

angular.formatter('bool', {
    parse: function(value){
        if (!value) return null
        if (value === 'true') return true
        return false
    },
    format: function(value){
        if (value === true) return 'true'
        if (value === false) return 'false'
        return ''
    }
})

angular.formatter('datetime', {
    parse: function(value){
        var s = angular.fromJson('"'+value+'"')
        if (s && typeof(s) == 'object') return s
        return null
    },
    format: function(value){
        value = convertDateToUTC(value)
        var s = angular.filter.date.call(this, value, 'yyyy-MM-ddTHH:mm:ss')
        if (s) {
            s += '.' + pad3(value.getTime() % 1000) + 'Z'
        }
        return s
    }
})

angular.formatter('intlist', {
    parse: function(value){
        if (value) {
            var s = JSON.parse(value)
            if (s && typeof(s) == 'object') return s
        }
        return []
    },
    format: function(value){
        return '['+value.toString().replace(/,/g, ', ')+']'
    }
})
