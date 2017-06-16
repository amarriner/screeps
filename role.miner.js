var utils = require('utils');

var roleMiner = {
    
    /** @param {Creep} creep **/
    run: function(creep) {
        
        if (!creep.memory.mine && !creep.memory.deliver) {
            creep.memory.mine = true;
        }

        //
        // If this creep is mining, but is at capacity, deliver the minerals
        //
        if (creep.memory.mine && _.sum(creep.carry) === creep.carryCapacity) {
            creep.memory.mine = false;
            creep.memory.mineDestination = undefined;
            creep.memory.deliver = true;
            creep.memory.deliverDestination = undefined;
        }
        
        //
        // If this creep is delivering, but they're empty, go mine
        //
        if (creep.memory.deliver && _.sum(creep.carry) === 0) {
            creep.memory.mine = true;
            creep.memory.mineDestination = undefined;
            creep.memory.deliver = false;
            creep.memory.deliverDestination = undefined;
        }
            
        if (creep.memory.mine) {
            
            if (!creep.memory.mineDestination) {
            
                //
                // Find minerals
                //
                var target = creep.pos.findClosestByPath(FIND_MINERALS);
            
                //
                // No minerals in this room, no miner needed
                //
                if (!target) {
                    creep.suicide();
                }
                else {
                    creep.memory.mineDestination = target.id;
                }
                
            }
            
            if (creep.memory.mineDestination) {
                
                var mineDestination = Game.getObjectById(creep.memory.mineDestination);
                
                //
                // Try to harvest minerals
                //
                result = creep.harvest(mineDestination);
                switch(result) {
                    case ERR_NOT_IN_RANGE:
                        creep.moveTo(mineDestination, {
                            visualizePathStyle: {
                                stroke: '#ff0',
                                lineStyle: 'solid',
                                opacity: .70,
                            }
                        });
                        break;
                        
                    case ERR_NOT_FOUND:
                        console.log('**** ' + creep.name + ' mining at ' + mineDestination.id + ', but no extractor in room ' + creep.room.name);
                        break;
                    
                    case OK:
                        break;
                        
                    default:
                        console.log('**** ' + creep.name + ' mining at ' + mineDestination.id + ': ' + result);
                        break;
                }
            }
        }
        
        if (creep.memory.deliver) {
            
            if (!creep.memory.deliverDestination) {
                //
                // Find storage
                //
                var target = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                    filter: (structure) => {
                        return structure.structureType == STRUCTURE_CONTAINER &&
                                _.sum(structure.store) < structure.storeCapacity;
                    }
                });
                
                if (target) {
                    creep.memory.deliverDestination = target.id;
                }
                
            }
            
            if (creep.memory.deliverDestination) {
                
                //
                // Attempt to deliver
                //
                var destination = Game.getObjectById(creep.memory.deliverDestination);
                
                for (var resource in creep.carry) {
                    
                    var result = creep.transfer(destination, resource);
                    switch(result) {
                        
                        case ERR_NOT_IN_RANGE:
                             creep.moveTo(deliverDestination, {
                            visualizePathStyle: {
                                stroke: '#ff0',
                                lineStyle: 'dashed',
                                opacity: .70,
                            }
                        });
                            break;
                            
                        case OK:
                            break;
                            
                        default:
                            console.log('---- Creep ' + creep.name + ' is delivering ' + resource + ': ' + result);
                        
                    }
                    
                }
            }
            
        }
    }
    
}

module.exports = roleMiner;