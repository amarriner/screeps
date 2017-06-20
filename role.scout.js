var constants = require('constants');
var utils = require('utils');

var roleScout = {
    
    /** @param {Creep} creep **/
    run: function(creep) {
        
        //
        // TODO: Fix hard-coded maxCreeps
        //
        if (_.filter(Game.creeps, (creep) => creep.memory.role === 'scout').length === 1) {
            
            var creeps = utils.sortCreepsBy(creep.room.name, 'energy');
            
            for (var i = 0; i < 5; i++) {
                if (i < creeps.length) {
                    creeps[i].memory.role = 'scout';
                }
            }
        }
        
        //
        // Get the name of the highest priorty room from Memory.expansions
        //
        var roomName;
        if (Memory.expansions && Memory.expansions.length) {
            roomName = Memory.expansions[0];
        }
        
        //
        // If the creep is not in the target room, move there
        //
        if (creep.room.name !== roomName) {
            utils.navToRoom(creep, roomName);
        }
        
        else {
            var room = Game.rooms[roomName];
            
            //
            // If we have a valid room in memory
            //
            if (room) {
            
                //
                // If the room doesn't have a controller, remove it
                //
                if (!room.controller) {
                    Memory.expansions.shift();
                    return;
                }
            
                //
                // If we already own this room, or it's owned by someone else, remove it
                // 
                if (room.controller.my || (room.controller.owner && room.controller.owner.username)) {
                    Memory.expansions.shift();
                    return;
                }
            
                //
                // Try to claim the controller in the first room in Memory.expansions
                // If too far away, move there...
                //
                if (utils.creepHasBodyPart(creep, CLAIM)) {
                    
                    var result = creep.claimController(room.controller);
                    switch (result) {
                
                        case ERR_NOT_IN_RANGE:
                            creep.moveTo(room.controller, {
                                    visualizePathStyle: {
                                        stroke: '#ff0',
                                        lineStyle: 'solid',
                                        opacity: 0.70,
                                    }
                                });
                            break;
                        
                        case OK:
                        
                            //
                            // Remove this room from the expansions priority list
                            // 
                            Memory.expansions.shift();
                        
                            //
                            // Create construction site
                            //
                            room.createConstructionSite(24, 24, STRUCTURE_SPAWN);
                        
                            //
                            // Job's done!
                            //
                            creep.suicide();
                        
                            break;
                    
                        default:
                            console.log('---- Trying to claim controller in room ' + room.name + ': ' + result);
                    }
                    
                }
                
                else {
                    
                    if (room.controller.my && creep.memory.role === 'scout') {
                        creep.memory.role = 'builder';    
                    }
                    
                    else {
                        creep.moveTo(24, 24);
                    }
                    
                }
            }
        }
    }
    
};

module.exports = roleScout;