var constants = require('constants');

var utils = {
    
    //
    // Finds the distance between two points
    //
    /** param {RoomPosition} from **/
    /** param {RoomPosition} to **/
    distance: function(from, to) {
        
        return Math.sqrt(Math.pow(from.x - to.x, 2) + Math.pow(from.y - to.y, 2));
        
    },
    
    //
    // Harvest from the nearest energy source
    //
    /** param {Creep} creep **/
    /** param {Position} destination **/
    harvest: function(creep, destination) {
        
        //
        // Find all energy sources in this room
        //
        var source = creep.pos.findClosestByPath(FIND_SOURCES);

        //
        // Attempt harvesting this source
        //
        var harvestingResult = creep.harvest(source);
                
        //
        // The harvesting was successful so mark this creep
        // as harvesting this source so we can limit the number at a given 
        // source
        //
        if (harvestingResult == 0) {
            creep.memory.harvesting = source.id;
        }
                
        else if (harvestingResult == ERR_NOT_IN_RANGE) {
            
            //
            // Couldn't harvest, too far away. Move to the source
            //
            creep.moveTo(source);
            
            //
            // Reset this creep's harvesting memory 
            //
            creep.memory.harvesting = undefined;
                
        }
            
    },
    
    //
    // Function to spawn creeps up to their max (defined in constants)
    //
    spawnCreeps: function() {
        
        for (var creepType in constants.maxCreeps) {
            
            // 
            // If the creep type is a builder, but there are no construction sites, do not
            // spawn a new builder
            //
            //if (creepType == 'builder' && !creep.room.find(FIND_CONSTRUCTION_SITES).length) {
            //    return;
            //}
            
            var creeps = _.filter(Game.creeps, (creep) => creep.memory.role == creepType);
            if (creeps.length < constants.maxCreeps[creepType]) {

                console.log('Creating new ' + creepType + ' :: ' + (parseInt(creeps.length) + 1) + '/' + constants.maxCreeps[creepType]);                
                var result = Game.spawns.Spawn1.createCreep(constants.defaultCreepParts, undefined, { role: creepType });
                
                if (result == ERR_NOT_ENOUGH_ENERGY) {
                    console.log('Tried to spawn creep, not enough energy');
                }

            }
        }
        
    }
    
};

module.exports = utils;