var constants = require('constants');

// -----------------------------------------------------------------------------
// Determine whether we can build any extensions
// -----------------------------------------------------------------------------
/** param {Room} room */
var canBuildExtensions = function(room) {
   
    if (!room) {
        return false;
    }

    var extensionLimit = constants.extensionLimits[room.controller.level - 1];
    
    var extensions = room.find(FIND_MY_STRUCTURES, {
        filter: (s) => { return s.structureType == STRUCTURE_EXTENSION; }
    }).length;

    var constructionSites = room.find(FIND_MY_CONSTRUCTION_SITES, {
        filter: (s) => {
            return s.structureType === STRUCTURE_EXTENSION;
        }
    }).length;

    if ((extensions + constructionSites) >= extensionLimit) {
        return false;
    }

    return true;
};

// -----------------------------------------------------------------------------
// Determine whether a pos contains certain terrain
// -----------------------------------------------------------------------------
/** param {RoomPosition} pos */
/** param {Array} terrain */
var posHasTerrain = function(pos, terrain) {

    if (!pos || !pos.x || !pos.y || terrain.length === 0) { 
        return;
    }

    var look = pos.look();
                
    for (var i = 0; i < look.length; i++) {
        if (look[i].terrain && terrain.indexOf(look[i].terrain) > -1) {
            return true;
        }
    }

    return false;
};

// -----------------------------------------------------------------------------
// Determine whether a pos contains a certain (or any if undefined) structure
// -----------------------------------------------------------------------------
/** param {RoomPosition} pos */
/** param {Array} structure */
var posHasStructure = function(pos, structure) {

    if (!pos || !pos.x || !pos.y) { 
        return;
    }

    var look = pos.look();
                
    for (var i = 0; i < look.length; i++) {
        if (look[i].type && look[i].type === 'structure') {

            if (!structure) {
                return true;
            }

            if (look[i].structure && structure.indexOf(look[i].structure.structureType) > -1) {
                return true;
            }

        }
    }

    return false;
};

// -----------------------------------------------------------------------------
// Determine whether a construction site can be placed (at the moment meaning
// there isn't a structure on there already and terrain is valid)
// -----------------------------------------------------------------------------
/** param {RoomPosition} pos */
var posCanHaveConstructionSite = function(pos) {

    if (!pos || !pos.x || !pos.y) { 
        return;
    }    

    if (posHasStructure(pos)) {
        return false;
    }

    if (posHasTerrain(pos, ['wall', 'lava'])) {
        return false;
    }

    return true;
};

// -----------------------------------------------------------------------------
// Determine whether a creep has a specific body part
// -----------------------------------------------------------------------------
var creepHasBodyPart = function(creep, bodyPart) {
    
    if (!creep || !creep.body || !bodyPart || !BODYPART_COST[bodyPart]) {
        return false;
    }
    
    for (var i = 0; i < creep.body.length; i++) {
        if (creep.body[i].type === bodyPart) {
            return true;
        }
    }
    
    return false;
};

// -----------------------------------------------------------------------------
// Sort the creeps in a room by the type of resource they're carrying
// -----------------------------------------------------------------------------
var sortCreepsBy = function(roomName, carryType) {
    
    if (!roomName || !Game.rooms[roomName] || RESOURCES_ALL.indexOf(carryType) === -1) {
        return [];
    }
    
    return Game.rooms[roomName].find(FIND_MY_CREEPS).sort(function(a, b) {
        return a.carry[carryType] > b.carry[carryType] ? -1 : (a.carry[carryType] < b.carry[carryType] ? 1 : 0);
    });
 
};

// -----------------------------------------------------------------------------
// Get current available energy to build creeps in a room
// -----------------------------------------------------------------------------
var getAvailableSpawnEnergy = function(roomName) {
        
    if (!roomName || !Game.rooms[roomName]) {
        return 0;
    }
        
    var energy = 0;
    var structures = Game.rooms[roomName].find(FIND_MY_STRUCTURES, {
        filter: (s) => {
            return s.structureType == STRUCTURE_SPAWN ||
                    s.structureType == STRUCTURE_EXTENSION;
        }
    });
        
    for (var i = 0; i < structures.length; i++) {
        energy += structures[i].energy;
    }
        
    return energy;
        
};
    
// -----------------------------------------------------------------------------
// Get creep cost for an array of body parts
// -----------------------------------------------------------------------------
var getCreepCost = function(body) {
    var cost = 0;
        
    for (var i = 0; i < body.length; i++) {
            
        if (!BODYPART_COST[body[i]]) {
            console.log('**** Invalid body part ' + body[i] + ' passed to utils.getCreepCost()');
            return -1;
        }
            
        cost += BODYPART_COST[body[i]];
            
    }
        
    return cost;
};

// -----------------------------------------------------------------------------
// Print debug information to the console
// -----------------------------------------------------------------------------
var printDebugInfo = function() {
    console.log('==== CREEP TOTALS');
    for (var i = 0; i < constants.maxCreeps.length; i++) {
    
        var creeps = _.filter(Game.creeps, (creep) => creep.memory.role == constants.maxCreeps[i].creepType);
        console.log('==== ' + constants.maxCreeps[i].creepType + " \t: " + creeps.length + '/' + constants.maxCreeps[i].max);
            
    }
};

// -----------------------------------------------------------------------------
// Inter-room pathing, from Glenstorm...
// -----------------------------------------------------------------------------
var navToRoom = function(creep, targetRoom) {
    const route = Game.map.findRoute(creep.room, targetRoom, {
    routeCallback(roomName, fromRoomName) {
        // if(Game.map.isHostile(roomName)) { return Infinity; }
        
            return 1;
        }});

    if(route.length > 0) 
    {
        const exit = creep.pos.findClosestByRange(route[0].exit, {maxRooms: 1});
        const path = creep.pos.findPathTo(exit, {maxRooms: 1});
        creep.moveByPath(path);
    }
};

// -----------------------------------------------------------------------------
// Defend a room
// -----------------------------------------------------------------------------
var defendRoom = function(roomName) {
        
    if (!Game.rooms[roomName]) {
        console.log('**** Cannot defend unknown room: ' + roomName);
        return;
    }
        
    var hostiles = Game.rooms[roomName].find(FIND_HOSTILE_CREEPS);
        
    if(hostiles.length > 0) {
    
        var username = hostiles[0].owner.username;
        Game.notify(`User ${username} spotted in room ${roomName}`);
        var towers = Game.rooms[roomName].find(
            FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}});
        towers.forEach(tower => tower.attack(hostiles[0]));
    }
        
};

// -----------------------------------------------------------------------------
// Sorts sites per the priorty array in constants.js
// -----------------------------------------------------------------------------
var sortSites = function(siteType, sites) {

    var i;
        
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
    for (i = 0; i <= constants.sortArrays[siteType].length; i++) {
        sortedSites[i] = [];
    }

    //
    // Loop through sites passed in
    //
    for (i = 0; i < sites.length; i++) {
            
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
    
};
    
// -----------------------------------------------------------------------------
// Finds the distance between two points
// -----------------------------------------------------------------------------
/** param {RoomPosition} from **/
/** param {RoomPosition} to **/
var distance = function(from, to) {
        
    return Math.sqrt(Math.pow(from.x - to.x, 2) + Math.pow(from.y - to.y, 2));
        
};

// -----------------------------------------------------------------------------
// Harvest from the nearest energy source
// -----------------------------------------------------------------------------
/** param {Creep} creep **/
var harvest = function(creep) {
        
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
    if (harvestingResult === 0) {
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
            
};

// -----------------------------------------------------------------------------
// Function to spawn creeps up to their max (defined in constants) in a room
// -----------------------------------------------------------------------------
var spawnCreeps = function(roomName) {
        
    if (!roomName || !Game.rooms[roomName]) {
        return;
    }
        
    //
    // Find a suitable spawn in this room
    //
    var spawns = Game.rooms[roomName].find(FIND_MY_STRUCTURES, {
        filter: (structure) => {
            return structure.structureType === STRUCTURE_SPAWN;
        }
    }).sort(function(a, b) {
        return a.energy > b.energy ? -1 : (a.energy < b.energy ? 1 : 0);
    });
        
    //
    // Couldn't find a spawn, return
    //
    if (spawns.length === 0) {
        return;
    }
        
    //
    // Loop through array from constants.js which should be in priority order
    // to find the next type of creep to spawn
    //
    for (var i = 0; i < constants.maxCreeps.length; i++) {
            
        //
        // Get all creeps of the current type in the given room to see if we're at the limit or not
        //
        var creeps = Game.rooms[roomName].find(FIND_MY_CREEPS, {
            filter: (creep) => {
                return creep.memory.role === constants.maxCreeps[i].creepType;
            }
        });
            
        // console.log('**** ' + constants.maxCreeps[i].creepType + ' :: ' + creeps.length + ' < ' + constants.maxCreeps[i].max);    
            
        if (creeps.length < constants.maxCreeps[i].max) {
            
            //
            // Get current available energy to spawn a creep
            //
            var availableEnergy = getAvailableSpawnEnergy(roomName);

            //
            // Default creep body to constants.defaultCreepParts unless there is a default body
            // for the given role in constants.defaultCreepRoleParts in which case, use that
            //
            var parts;
            for (var j = 0; j < constants.defaultCreepParts.length; j++) {
                if (getCreepCost(constants.defaultCreepParts[j]) <= availableEnergy) {
                    parts = constants.defaultCreepParts[j];    
                    j = constants.defaultCreepParts.length;
                }
            }
                
            if (constants.defaultCreepRoleParts[constants.maxCreeps[i].creepType]) {
                parts = constants.defaultCreepRoleParts[constants.maxCreeps[i].creepType];
            }

            //
            // TODO: Need to fix name generation issues
            //
            var date = new Date();
            var name = constants.maxCreeps[i].creepType + '_' + parseInt(date.getSeconds()) + parseInt(date.getMilliseconds());
                
            //
            // Only build defenders if there are hostile creeps in the room. Other types always build up to max
            //
            var build = false;
            var result;
            
            switch (constants.maxCreeps[i].creepType) {
                    
                case 'defender':
                    if (Game.rooms[roomName].find(FIND_HOSTILE_CREEPS).length > 0) {
                        build = true;
                    }
                    break;
                    
                case 'miner':
                    
                    // console.log('**** Miner ');
                    
                    if (Game.rooms[roomName].find(FIND_MY_STRUCTURES, {
                        filter: (s) => {
                            return s.structureType === STRUCTURE_EXTRACTOR;
                        }
                    }).length) {
                        build = true;
                    }
                    break;
                        
                case 'scout':
                    
                    var gcl = Game.gcl.level;
                    var controllers = _.filter(Game.structures, 
                        function(s) { 
                            return s.structureType == STRUCTURE_CONTROLLER; 
                        }).length;
                        
                    // console.log('**** ' + constants.maxCreeps[i].creepType + ' :: ' + creeps.length + ' < ' + constants.maxCreeps[i].max + ' :: ' + gcl + ' :: ' + controllers);                         
                            
                    //console.log(Memory.expansions.length + ' :: ' + controllers + ' :: ' + gcl + ' :: ' + parts + ' :: ' + getCreepCost(parts));    
                    if (Memory.expansions && Memory.expansions.length && controllers < gcl) {
                        build = true;
                    }
                    break;
                    
                default:
                    build = true;
                    
            }
                
            if (parts && build) {
                result = spawns[0].createCreep(parts, name, { role: constants.maxCreeps[i].creepType });
            }
                
            //
            // Handle spawn results if necessary
            //
            switch (result) {
                //
                // undefined is when the spawn wasn't attempted
                //
                case undefined:
                    break;
                        
                case OK:
                    console.log('---- Spawned creep ' + name);
                    break;
                        
                case ERR_NOT_ENOUGH_ENERGY:
                    // console.log('**** Tried to spawn creep, not enough energy');
                    break;
                        
                case ERR_BUSY:
                    break;
                        
                default:
                    console.log('---- Trying to spawn: ' + name + ': ' + result);       
            }
                
            //
            // Return after first attempt at spawning this tick
            //
            if (result !== undefined) {
                return;
            }
        }
    }
};

// -----------------------------------------------------------------------------
// TODO: Look for suitable places to build extension nodes
// -----------------------------------------------------------------------------
/** param {String} roomName */
var buildExtensions = function(roomName) {
        
    if (!roomName || !Game.rooms[roomName]) {
        return;
    }
    
    //
    // Figure out what the current extension limit is
    // and how many we currently have in this room
    //
    var room = Game.rooms[roomName];      

    //
    // If we're already at the limit, return
    //
    if (!canBuildExtensions(room)) {
        return;
    }

    //
    // Loop through all the RoomPositions in the room and score them based 
    // on whether they're a "good" site for a group of 5 extensions
    //
    var sites = [];
    for (var y = 0; y < 50; y++) {
        for (var x = 0; x < 50; x++) {
            
            var available = false;
            var pos = room.getPositionAt(x, y);

            //
            // Can we build a construction site at this RoomPosition?
            //
            if (posCanHaveConstructionSite(pos)) {
                available = true;
            }

            //
            // If we can build, push the RoomPosition to the array
            //
            if (available) {

                var score = 0;

                //
                // Check the RoomPositions in each of the four cardinal directions
                //
                if (posCanHaveConstructionSite(room.getPositionAt(pos.x, pos.y - 1))) {
                    score += 10;
                }

                if (posCanHaveConstructionSite(room.getPositionAt(pos.x, pos.y + 1))) {
                    score += 10;
                }

                if (posCanHaveConstructionSite(room.getPositionAt(pos.x - 1, pos.y))) {
                    score += 10;
                }

                if (posCanHaveConstructionSite(room.getPositionAt(pos.x + 1, pos.y))) {
                    score += 10;
                }

                //
                // If each of the four directions were empty, weight the score
                // based on the distance to the closest spawn
                //
                // TODO: Make this better, ha
                //
                if (score === 40) {

                    var closest = pos.findClosestByPath(FIND_MY_STRUCTURES, {
                        filter: (s) => {
                            return s.structureType === STRUCTURE_SPAWN;
                        }
                    });

                    var d = distance(pos, closest.pos);
                    
                    //
                    // Don't put the center of the 5 extension cluster too
                    // close to the spawn
                    //
                    if (d < 4) {
                        d = 100;
                    }

                    score -= d;
                    
                    sites.push({x: x, y: y, score: score});

                }
            }
            
        }
    }
        
    //
    // Sort the sites found by their score
    //
    sites.sort(function(a, b) {
        return a.score > b.score ? -1 : (a.score < b.score ? 1 : 0);
    });

    //
    // Build the sites
    //
    room.createConstructionSite(sites[0].x, sites[0].y, STRUCTURE_EXTENSION);
    room.createConstructionSite(sites[0].x, sites[0].y - 1, STRUCTURE_EXTENSION);
    room.createConstructionSite(sites[0].x, sites[0].y + 1, STRUCTURE_EXTENSION);
    room.createConstructionSite(sites[0].x - 1, sites[0].y, STRUCTURE_EXTENSION);
    room.createConstructionSite(sites[0].x + 1, sites[0].y, STRUCTURE_EXTENSION);

};
    
// =============================================================================    

var utils = {
    
    sortCreepsBy: sortCreepsBy,
    
    getAvailableSpawnEnergy: getAvailableSpawnEnergy,
    
    getCreepCost: getCreepCost,
    
    printDebugInfo: printDebugInfo,
    
    buildExtensions: buildExtensions,
    
    navToRoom: navToRoom,
    
    defendRoom: defendRoom,
    
    sortSites: sortSites,
    
    distance: distance,
    
    harvest: harvest,
    
    spawnCreeps: spawnCreeps,
    
    creepHasBodyPart: creepHasBodyPart,

    posHasTerrain: posHasTerrain,

    posHasStructure: posHasStructure,

    posCanHaveConstructionSite: posCanHaveConstructionSite,

    canBuildExtensions: canBuildExtensions,
    
};

module.exports = utils;