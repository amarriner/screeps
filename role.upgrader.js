var utils = require('utils');

var roleUpgrader = {
    
    /** param {Creep} creep **/
    run: function(creep) {
        
        //
        // If the creep is currently upgrading, but has is not carrying
        // any energy, set the upgrading memory flag to false
        //
        if (creep.memory.upgrading && creep.carry.energy == 0) {
            creep.memory.upgrading = false;
        }
        
        //
        // If the creep is not upgrading, and is carrying its full
        // capacity of enery, set the upgrading memory flag to true
        //
        if (!creep.memory.upgrading && creep.carry.energy == creep.carryCapacity) {
            creep.memory.upgrading = true;
        }
        
        //
        // If this creep should be upgrading (or already is)
        //
        if (creep.memory.upgrading) {
            
            //
            // Reset creep's harvesting memory
            //
            creep.memory.harvesting = undefined;
            
            // 
            // Attempt to upgrade the controller
            //
            if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                
                //
                // Couldn't upgrade because the creep is too far away, move towards it
                //
                creep.moveTo(creep.room.controller);
            }
        }
        
        //
        // Else, this creep needs to harvest more energy
        //
        else {
            utils.harvest(creep);            
        }
        
        
    }
};

module.exports = roleUpgrader;