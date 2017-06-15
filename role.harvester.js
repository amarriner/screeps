var roleUpgrader = require('role.upgrader');
var utils = require('utils');

var roleHarvester = {
    
    /** @param {Creep} creep **/
    run: function(creep) {

        //
        // If this creep is carrying no energy, find a source in the same room 
        // and either harvest it or move towards the closest one
        //
        if (!creep.memory.deliver && creep.carry.energy < creep.carryCapacity) {
            utils.harvest(creep);
        }
        else {
            creep.memory.deliver = true;
        }
        
        if (creep.memory.deliver) {
            
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
                    return (
                            ((structure.structureType == STRUCTURE_SPAWN ||
                            structure.structureType == STRUCTURE_EXTENSION) &&
                            structure.energy < structure.energyCapacity)
                            ||
                            (structure.structureType == STRUCTURE_CONTAINER &&
                            structure.store.energy < structure.storeCapacity / 2)
                            );
                }
            });
            
            //
            // If targets were found
            //
            if (targets.length) {
                
                // creep.say(targets[0].structureType);
                
                //
                // Attempt to transfer energy from the creep to the target
                //
                if (creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    
                    //
                    // Couldn't transfer, too far away. Move towards the target
                    //
                    creep.moveTo(targets[0], {
                        visualizePathStyle: {
                            stroke: '#0ff',
                            lineStyle: 'dashed',
                            opacity: .70,
                        }
                    });
                    
                }
                
                if (creep.carry.energy == 0) {
                        creep.memory.deliver = false;
                }
            }
            
            //
            // No targets found, go back to either the Muster flag or the
            // spawn so the energy node doesn't get jammed up
            //
            else {
                
                //var location = Game.flags['Muster'];
                //if (!location) {
                //    location = Game.spawns['Spawn1'];
                //}
                
                //
                // Only move if this creep is more than 3 units of distance away
                //
                //if (utils.distance(creep.pos, location.pos) > 3) {
                //    creep.moveTo(location);
                //}
                
                roleUpgrader.run(creep);
            }
        }
        
    }
    
}

module.exports = roleHarvester;