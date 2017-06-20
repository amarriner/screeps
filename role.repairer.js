var roleUpgrader = require('role.upgrader');
var utils = require('utils');

var roleRepairer = {
    
    /** param {Creep} creep **/
    run: function(creep) {
        
        //
        // If we're out of energy, go get some
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
            // Sometimes they get stuck if they're trying to get to a destination 
            // that has already been fully repaired. Clear the destination
            // if that's the case
            //
            if (creep.memory.destination) {
                if (Game.getObjectById(creep.memory.destination).hits === Game.getObjectById(creep.memory.destination).hitsMax) {
                    creep.memory.destination = undefined;
                }
            }
            
            if (!creep.memory.destination) {
                
                //
                // Find the closest damaged structure (if any)
                //
                var sites = utils.sortSites('repair', creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => structure.hits < structure.hitsMax
                }));
        
                //
                // If we found one, repair it
                //
                if (sites.length) {
                    creep.memory.destination = sites[0].id;
                }
            }
            
            if (creep.memory.destination) {
                
                var closestDamagedStructure = Game.getObjectById(creep.memory.destination);
               
                //
                // Attempt repair
                //
                var result = creep.repair(closestDamagedStructure);
                switch(result) {
                    
                    case ERR_NOT_IN_RANGE:
                        creep.moveTo(closestDamagedStructure);
                        break;
                        
                    case ERR_NOT_ENOUGH_RESOURCES:
                        creep.memory.deliver = false;
                        creep.memory.destination = undefined;
                        break;
                        
                    case OK:
                        break;
                        
                    default:
                        console.log('**** Cannot repair: ' + result);
                        break;
                  
                }
                    
                //
                // Out of energy, go get some next tick
                //
                if (creep.carry.energy === 0) {
                    creep.memory.deliver = false;
                    creep.memory.destination = undefined;
                }
                
            }
            
            //
            // If there's nothing to repair, upgrade
            //
            else {
                roleUpgrader.run(creep);
            }
            
        }
    }
};

module.exports = roleRepairer;