var roleUpgrader = require('role.upgrader');
var utils = require('utils');

var roleRepairer = {
    
    /** param {Creep} creep **/
    run: function(creep) {
        
        //
        // If we're out of energy, go get some
        //
        if (creep.carry.energy < creep.carryCapacity) {
            utils.harvest(creep);
            return;
        }
        
        //
        // Find the closest damaged structure (if any)
        //
        var closestDamagedStructure = creep.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => structure.hits < structure.hitsMax
        });
        
        //
        // If we found one, repair it
        //
        if (closestDamagedStructure) {
            
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
            
        }
        
        //
        // If there's nothing to repair, upgrade
        //
        else {
            roleUpgrader.run(creep);
        }
        
    }
};

module.exports = roleRepairer;