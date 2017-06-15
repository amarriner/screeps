var roleUpgrader = require('role.upgrader');
var utils = require('utils');

var roleRepairer = {
    
    /** param {Creep} creep **/
    run: function(creep) {
        
        //
        // If we're out of energy, go get some
        //
        if (!creep.memory.deliver && creep.carry.energy < creep.carryCapacity) {
            utils.harvest(creep);
        }
        else {
            creep.memory.deliver = true;
        }
        
        if (creep.memory.deliver) {
            //
            // Find the closest damaged structure (if any)
            //
            var sites = utils.sortSites('repair', creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => structure.hits < (structure.hitsMax / 3)
            }));
        
            //
            // If we found one, repair it
            //
            if (sites.length) {
            
                var closestDamagedStructure = sites[0];
                
                // console.log('Repairer ' + creep.name + ' moving to ' + closestDamagedStructure.id + ' (' + closestDamagedStructure.structureType + ')');
              
                //
                // Attempt repair
                //
                if (creep.repair(closestDamagedStructure) == ERR_NOT_IN_RANGE) {
    
                    //
                    // Too far away, move to it
                    //
                    creep.moveTo(closestDamagedStructure);
                  
                }
                    
                if (creep.carry.energy == 0) {
                    creep.memory.deliver = false;
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