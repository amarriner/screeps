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
            creep.memory.destination = undefined;
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
            if (!creep.memory.destination) {
                var targets = utils.sortSites('fill', creep.room.find(FIND_STRUCTURES));
            
                //
                // Loop through the targets to find the next one that needs energy
                //
                var ndx;
                for (var i = 0; i < targets.length; i++) {
                
                    switch (targets[i].structureType) {
                        case STRUCTURE_SPAWN:
                        case STRUCTURE_EXTENSION:
                        case STRUCTURE_TOWER:
                            if (targets[i].energy < targets[i].energyCapacity) {
                                ndx = i;
                                i = targets.length;
                            }
                            break;
                        case STRUCTURE_CONTAINER:
                            if (_.sum(targets[i].store) < targets[i].storeCapacity) {
                                ndx = i;
                                i = targets.length;
                            }
                            break;
                    }
                }
            
                //
                // If we found a structure to fill
                //
                if (ndx !== undefined) {   
                    creep.memory.destination = targets[ndx].id;
                }
            }
                
            if (creep.memory.destination) {
                
                var destination = Game.getObjectById(creep.memory.destination);
                
                //
                // Attempt to transfer energy from the creep to the target
                //
                var result = creep.transfer(destination, RESOURCE_ENERGY);
                switch(result) {
                    //
                    // Couldn't transfer, too far away. Move towards the target
                    //
                    case ERR_NOT_IN_RANGE:
                        creep.moveTo(destination, {
                            visualizePathStyle: {
                                stroke: '#0ff',
                                lineStyle: 'dashed',
                                opacity: 0.70,
                            }
                        });
                        break;
                    
                    //
                    // The structure is full
                    //
                    case ERR_FULL:
                        creep.memory.destination = undefined;
                        break;
                    
                }
                
                if (creep.carry.energy === 0) {
                    creep.memory.deliver = false;
                    creep.memory.destination = undefined;
                }
            }
            
            //
            // No targets found, upgrade
            //
            else {
                
                roleUpgrader.run(creep);
                
            }
        }
        
    }
    
};

module.exports = roleHarvester;