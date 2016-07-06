var utils = require('utils');

var roleBuilder = {
    
    /** param {Creep} creep **/
    run: function(creep) {
        
        //
        // If the creep is currently building, but has is not carrying
        // any energy, set the building memory flag to false
        //
        if (creep.memory.building && creep.carry.energy == 0) {
            creep.memory.building = false;
        }
        
        //
        // If the creep is not building, and is carrying its full
        // capacity of enery, set the building memory flag to true
        //
        if (!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
            creep.memory.building = true;
        }
        
        //
        // If this creep should be (or is already) building
        //
        if(creep.memory.building) {
            
            //
            // Reset creep's harvesting flag
            //
            creep.memory.harvesting = undefined;
            
            //
            // Find any construction sites in this room
            //
            var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
            
            //
            // If there are any construction sites
            //
            if(targets.length) {
                
                //
                // Attempt to build 
                //
                if(creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
                    
                    //
                    // Couldn't build, too far away. Move to the site
                    //
                    creep.moveTo(targets[0]);
                }
            }
            
            //
            // Else no targets available to build, suicide
            //
            else {
                creep.suicide();
            }
        }
        
        //
        // Not building, harvest
        //
        else {
        
            utils.harvest(creep, creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES));
            
        }
    }
};

module.exports = roleBuilder;