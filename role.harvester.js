var utils = require('utils');

var roleHarvester = {
    
    /** @param {Creep} creep **/
    run: function(creep) {
        
        //
        // If this creep is carrying less their max energy capacity, 
        // find a source in the same room and either harvest it or 
        // move towards the closest one
        //
        if (creep.carry.energy < creep.carryCapacity) {
          
            utils.harvest(creep);
            
        }
        
        //
        // Else this creep is at its carrying capacity, so drop
        // the energy off somewhere
        //
        else {
            
            //
            // Reset creep's harvesting memory
            //
            creep.memory.harvesting = undefined;
            
            //
            // Find valid targets for energy refill. Includes the sctructure
            // types listed in the filter where those structures have less
            // energy than their capacity
            //
            var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION ||
                            structure.structureType == STRUCTURE_SPAWN ||
                            structure.structureType == STRUCTURE_TOWER ||
                            structure.structureType == STRUCTURE_CONTROLLER) &&
                            structure.energy < structure.energyCapacity;
                }
            });
            
            //
            // If targets were found
            //
            if (targets.length) {
                
                //
                // Attempt to transfer energy from the creep to the target
                //
                if (creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    
                    //
                    // Couldn't transfer, too far away. Move towards the target
                    //
                    creep.moveTo(targets[0]);
                    
                }
            }
            
            //
            // No targets found, go back to spawn so the energy node doesn't 
            // get jammed up
            //
            else {
                
                //
                // Only move if this creep is more than 3 units of distance away
                //
                if (utils.distance(creep.pos, Game.spawns.Spawn1.pos) > 3) {
                    creep.moveTo(Game.spawns.Spawn1);
                }
            }
        }
        
    }
    
}

module.exports = roleHarvester;