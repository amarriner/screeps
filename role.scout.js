var utils = require('utils');

var roleScout = {
    
    /** @param {Creep} creep **/
    run: function(creep) {
        
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
                var result = creep.claimController(room.controller);
                switch (result) {
                
                    case ERR_NOT_IN_RANGE:
                        creep.moveTo(room.controller, {
                                visualizePathStyle: {
                                    stroke: '#ff0',
                                    lineStyle: 'solid',
                                    opacity: .70,
                                }
                            });
                        break;
                    
                    case OK:
                        
                        //
                        // Remove this room from the expansions priority list
                        //
                        Memory.expansions.shift();
                        
                        //
                        // Create a construction site for a spawn a little away from the controller
                        //
                        creep.moveTo(24, 24);
                        
                        //
                        // Create construction site
                        //
                        room.createConstructionSite(creep.pos.x, creep.pos.y, STRUCTURE_SPAWN);
                        
                        //
                        // Change this creep's role to builder so it starts to build the room out
                        //
                        creep.memory.role = 'builder'
                        
                        break;
                    
                    default:
                        console.log('---- Trying to claim controller in room ' + room.name + ': ' + result);
                    
                }
            }
        }
    }
    
}

module.exports = roleScout;