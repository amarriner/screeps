var roleUpgrader = require('role.upgrader');
var utils = require('utils');

var roleBuilder = {
    
    /** param {Creep} creep **/
    run: function(creep) {
        
        var target;
        var result;

        //
        // If the creep is currently building, but has is not carrying
        // any energy
        // OR
        // if the constructionSite in memory no longer exists:
        // set the building memory flag to false
        //
        if ((creep.memory.building && creep.carry.energy === 0) ||
            !Game.getObjectById(creep.memory.destination)) {
            creep.memory.building = false;
            creep.memory.destination = undefined;
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
            // If we're already at a construction site and currently building,
            // don't bother looking for other sites
            //
            if (!creep.memory.destination) {
                
                //
                // Find any construction sites in this room, sorted by priorty
                //
                target = creep.pos.findClosestByPath(
                    utils.sortSites('build', creep.room.find(FIND_CONSTRUCTION_SITES)));
                    
                if (target) {
                    creep.memory.destination = target.id;
                }
                
            }
            
            if (creep.memory.destination) {
                
                //
                // Attempt to build 
                //
                target = Game.getObjectById(creep.memory.destination);
                
                if (!target) {
                    creep.memory.destination = undefined;
                    console.log('**** ' + creep.name + ' building at invalid Object ID ' + creep.memory.destination);
                    return;
                }
                
                result = creep.build(target);
                switch(result) {
                    
                    case ERR_NOT_IN_RANGE:
                        creep.moveTo(target, {
                            visualizePathStyle: { 
                                stroke: '#f0f', 
                                lineStyle: 'solid',
                                opacity: 0.75
                            }
                        });
                        break;
                        
                    case ERR_INVALID_TARGET:
                        console.log('**** ' + creep.name + ' building at ' + Game.getObjectById(creep.memory.destination) + ' invalid target');
                        break;
                        
                    case OK:
                        break;
                        
                    default:
                        console.log('**** Cannot build: ' + result);
                        break;
                    
                }
                
                   
            }
        
            //
            // Not building, upgrade
            //
            else {
                roleUpgrader.run(creep);
            }
                
        }
        
        //
        // Not building, upgrade
        //
        else {
            roleUpgrader.run(creep);
        }
    }
};

module.exports = roleBuilder;