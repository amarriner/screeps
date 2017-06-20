var utils = require('utils');

var roleDefender = {
    
    /** @param {Creep} creep **/
    run: function(creep) {
        
        //
        // Find the closest hostile creep, and attack it
        //
        var hostile = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
        
        if (hostile) {
            
            var result = creep.attack(hostile);
            switch (result) {
                case ERR_NOT_IN_RANGE:
                    creep.moveTo(hostile);
                    break;
                case OK:
                    break;
                default:
                    // console.log();
                    break;
            }
            
        }
        
        else {
            creep.suicide();
        }
        
    },
};

module.exports = roleDefender;