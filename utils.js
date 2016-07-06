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
        
        var source;
        var sources = [];
        
        //
        // If a destination was passed, find the source closest to it
        //
        if (destination) {
            source = destination.pos.findClosestByPath(FIND_SOURCES);
            
            if (source) {
                sources.push(source);
            }
        }
        
        //
        // Find all energy sources in this room
        //
        if (! source) {
            var d = this.distance;
            sources = creep.room.find(FIND_SOURCES).sort(
                function(a, b) {
                    return d(creep.pos, a.pos) -
                           d(creep.pos, b.pos);
                }    
            );
        }
        
        //
        // Attempt to harvest the closest source that is not already being 
        // harvested by 3 other creeps
        //
        for (var i = 0; i < sources.length; i++) {
            
            //
            // Count the number of creeps already harvesting this source
            //
            var cs = _.filter(Game.creeps, (creep) => 
                    creep.memory.harvesting == sources[i].id);
            var harvestingCount = cs.length;
            
            //
            // If there are less than three or we're already harvesting this
            // one, pick it
            //
            if (harvestingCount < 3 || creep.memory.harvesting == sources[i].id) {
            
                //
                // Attempt harvesting this source
                //
                var harvestingResult = creep.harvest(sources[i]);
                
                //
                // The harvesting was successful so mark this creep
                // as harvesting this source so we can limit the number at a given 
                // source
                //
                if (harvestingResult == 0) {
                    creep.memory.harvesting = sources[i].id;
                }
                
                else if (harvestingResult == ERR_NOT_IN_RANGE) {
                
                    //
                    // Couldn't harvest, too far away. Move to the source
                    //
                    creep.moveTo(sources[i]);
            
                    //
                    // Reset this creep's harvesting memory 
                    //
                    creep.memory.harvesting = undefined;
                
                }
            
                i = sources.length;
            }
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