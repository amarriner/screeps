var constants = require('constants');

var utils = {
    
    // -------------------------------------------------------------------------
    // Sorts sites per the priorty array in constants.js
    // -------------------------------------------------------------------------
    sortSites: function(siteType, sites) {
        
        //
        // Return if no sites were passed in
        //
        if (!sites) {
            return [];
        }
        
        //
        // Return if invalid siteType was passed
        //
        if (!constants.sortArrays[siteType]) {
            return [];
        }
        
        //
        // Instantiate and initiate sorted arrays
        //
        var sortedSites = [];
        for (var i = 0; i <= constants.sortArrays[siteType].length; i++) {
            sortedSites[i] = [];
        }

        //
        // Loop through sites passed in
        //
        for (var i = 0; i < sites.length; i++) {
            
            var site = sites[i];
            
            //
            // Find the priority of the current site
            //
            var index = constants.sortArrays[siteType].indexOf(site.structureType);
            
            //
            // If it doesn't exist in the priorty list, it goes
            // at the end
            //
            if (index === -1) {
                index = constants.sortArrays[siteType].length;
            }
            
            //
            // Add the site to the array at the priority index
            //
            sortedSites[index].push(site);
            
        }
        
        //
        // Concatenate all the arrays together into a single sorted array
        //
        var returnArray = [];
        while (sortedSites.length) {
            var siteTypeArr = sortedSites.shift();
            
            if (siteTypeArr.length) {
                returnArray = returnArray.concat(siteTypeArr);
            }
        }
        
        return returnArray;
        
    },
    
    // -------------------------------------------------------------------------
    // Finds the distance between two points
    // -------------------------------------------------------------------------
    /** param {RoomPosition} from **/
    /** param {RoomPosition} to **/
    distance: function(from, to) {
        
        return Math.sqrt(Math.pow(from.x - to.x, 2) + Math.pow(from.y - to.y, 2));
        
    },
    
    // -------------------------------------------------------------------------
    // Harvest from the nearest energy source
    // -------------------------------------------------------------------------
    /** param {Creep} creep **/
    harvest: function(creep) {
        
        if (!creep) {
            return;
        }
        
        //
        // Find all energy sources in this room
        //
        var source = creep.pos.findClosestByPath(
            creep.room.find(FIND_SOURCES).concat(creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (
                        creep.memory.role !== 'harvester' && 
                        structure.structureType === (STRUCTURE_CONTAINER) &&
                        structure.store.energy > creep.carry.energy
                    );
                }
            })
        ));
        
        //
        // Attempt harvesting this source
        //
        var harvestingResult;
        if (source && source.structureType && source.structureType === STRUCTURE_CONTAINER) {
            harvestingResult = creep.withdraw(source, RESOURCE_ENERGY);
        }
        else {
            harvestingResult = creep.harvest(source);
        }
                
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
            creep.moveTo(source, {
                //visualizePathStyle: {
                //    stroke: '#ff0', 
                //    lineStyle: 'dashed',
                //    opacity: .75,
                //}
            });
            
            //
            // Reset this creep's harvesting memory 
            //
            creep.memory.harvesting = undefined;
                
        }
            
    },
    
    // -------------------------------------------------------------------------
    // Function to spawn creeps up to their max (defined in constants)
    // -------------------------------------------------------------------------
    spawnCreeps: function() {
        
        //
        // Loop through array from constants.js which should be in priority order
        // to find the next type of creep to spawn
        //
        for (var i = 0; i < constants.maxCreeps.length; i++) {
            
            //
            // Get all creeps of the current type to see if we're at the limit or not
            //
            var creeps = _.filter(Game.creeps, (creep) => creep.memory.role == constants.maxCreeps[i].creepType);
            if (creeps.length < constants.maxCreeps[i].max) {

                //
                // TODO: Need to fix name generation issues
                //
                var date = new Date();
                var name = constants.maxCreeps[i].creepType + '_' + parseInt(date.getSeconds()) + parseInt(date.getMilliseconds());
                var result = Game.spawns.Spawn1.createCreep(constants.defaultCreepParts, 
                     name, { role: constants.maxCreeps[i].creepType });
                
                //
                // Handle spawn results if necessary
                //
                switch (result) {
                    //
                    // 0
                    //
                    case OK:
                        console.log('Spawned creep ' + name);
                        break;
                    //
                    // -3
                    //
                    case ERR_NOT_ENOUGH_ENERGY:
                        // console.log('Tried to spawn creep, not enough energy');
                        break;
                    //
                    // -4
                    //
                    case ERR_BUSY:
                        break;
                    default:
                        console.log('Trying to spawn: ' + name + ': ' + result);       
                }
                
                //
                // Return after first attempt at spawning
                //
                return;

            }
        }
    }
    
};

module.exports = utils;