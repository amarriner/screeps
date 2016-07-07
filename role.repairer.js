var roleBuilder = require('role.builder');
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
            
            console.log('Repairer ' + creep.name + ' moving to ' + closestDamagedStructure.id + ' (' + closestDamagedStructure.structureType + ')');
          
            //
            // Attempt repair
            //
            var result = creep.repair(closestDamagedStructure);
            console.log(result);
            if (result)  {
                console.log('could not repair');
              
                //
                // Too far away, move to it
                //
                creep.moveTo(closestDamagedStructure);
              
            }
            
        }
        
        //
        // If there's nothing to repair, build
        //
        else {
            console.log('Nothing to repair for ' + creep.name + ', build instead');
            roleBuilder.run(creep);
        }
        
    }
};

module.exports = roleRepairer;