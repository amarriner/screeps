var constants = require('constants');
var utils = require('utils');

var roleScout = {
    
    /** @param {Creep} creep **/
    run: function(creep) {
        
        var spawnResult;

        //
        // TODO: Fix hard-coded maxCreeps
        // TODO: This is all bad...somewhere else?
        //
        if (_.filter(Game.creeps, (creep) => creep.memory.role === 'scout').length === 1 && creep.room.name != Memory.expansions[0]) {
            
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

            if (Game.rooms[roomName] && Game.rooms[roomName].controller.my && creep.memory.role === 'scout' && !utils.creepHasBodyPart(creep, CLAIM)) {
                creep.memory.role = 'builder';    
            }
        }
        
        else {
            var room = Game.rooms[roomName];
            
            //
            // If we have a valid room in memory
            //
            if (room) {

                //
                // Remove this room from the expansion list if 
                // the spawn was built
                // 
                if (utils.findStructures(roomName, [STRUCTURE_SPAWN]).length > 0) {
                    Memory.expansions.shift();
                }
            
                //
                // If the room doesn't have a controller, remove it
                //
                if (!room.controller) {
                    Memory.expansions.shift();
                    return;
                }
            
                //
                // Try to claim the controller in the first room in Memory.expansions
                // If too far away, move there...
                //
                if (utils.creepHasBodyPart(creep, CLAIM)) {
                    
                    if (!room.controller.my) {

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
                        
                            break;
                    
                            default:
                                console.log('---- Trying to claim controller in room ' + room.name + ': ' + result);
                        }
                    }

                    else {
                        //
                        // Create construction site
                        //
                        spawnResult = room.createConstructionSite(24, 24, STRUCTURE_SPAWN);

                        //
                        // Job's done!
                        //
                        creep.suicide();
                    }
                    
                }
                
                else {
                    
                    
                    if (room.controller.my && (creep.memory.role === 'scout')) {
                        
                        creep.memory.role = 'builder';    
                        creep.memory.building = false;
                        creep.memory.destination = undefined;

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