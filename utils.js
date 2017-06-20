var constants = require('constants');

// -----------------------------------------------------------------------------
// Wrapper to room.find to filter on structure types
// -----------------------------------------------------------------------------
/** param {String} roomName */
/** param {Array[STRUCTURE_*]} structureTypes */
/** param {int} findConst */
var findStructures = function(roomName, structureTypes, findConst) {
    if (!roomName || !Game.rooms[roomName] || !structureTypes || structureTypes.length === 0) {
        return [];
    }

    return Game.rooms[roomName].find((findConst !== undefined ? findConst : FIND_MY_STRUCTURES), {
        filter: (s) => {
            return structureTypes.indexOf(s.structureType) !== -1;
        }
    });
};

// -----------------------------------------------------------------------------
// Find all energy sources in a room for a given creep
// -----------------------------------------------------------------------------
/** param {Creep} creep */
var findEnergySources = function(creep) {

    if (!creep || !creep.room) {
        return [];
    }

    return creep.room.find(FIND_SOURCES).concat(creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return (
                creep.memory.role !== 'harvester' && 
                (
                    structure.structureType === STRUCTURE_CONTAINER ||
                    structure.structureType === STRUCTURE_STORAGE
                ) &&
                structure.store.energy > creep.carry.energy
            );
        }
    }));
};

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
/** param {Creep} creep */
/** param {String} bodyPart */
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
/** param {String} roomName */
/** param {int} carryType */
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
/** param {String} roomName */
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
/** param {Array[String]} body */
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
// Get creep body parts array
// -----------------------------------------------------------------------------
/** param {String} roomName */
/** param {int} constCreepIndex */
/** return {Array[String]} */
var getCreepBodyParts = function(roomName, constCreepIndex) {

    if (!roomName || !Game.rooms[roomName]) {
        return [];
    }

    var parts = [];
    var availableEnergy = getAvailableSpawnEnergy(roomName);

    //
    // Default creep body to constants.defaultCreepParts unless there is a default body
    // for the given role in constants.defaultCreepRoleParts in which case, use that
    //
    for (var i = 0; i < constants.defaultCreepParts.length; i++) {
        if (getCreepCost(constants.defaultCreepParts[i]) <= availableEnergy) {
            parts = constants.defaultCreepParts[i];    
            i = constants.defaultCreepParts.length;
        }
    }
                
    if (constants.defaultCreepRoleParts[constants.maxCreeps[constCreepIndex].creepType]) {
        parts = constants.defaultCreepRoleParts[constants.maxCreeps[constCreepIndex].creepType];
    }

    return parts;
    
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
/** param {Creep} creep */
/** param {Room} targetRoom */
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
/** param {String} roomName */
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
/** param {String} siteType */
/** param {Array[ConstructionSite]} sites */
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
    // Find closest energy sources in this room
    //
    var source = creep.pos.findClosestByPath(findEnergySources(creep));
    
    //
    // Attempt harvesting this source
    //
    var harvestingResult;
    if (source && source.structureType && (
        source.structureType === STRUCTURE_CONTAINER ||
        source.structureType === STRUCTURE_STORAGE)) {
        harvestingResult = creep.withdraw(source, RESOURCE_ENERGY);
    }
    else {
        harvestingResult = creep.harvest(source);
    }
                
    //
    // Handle the result of the harvest
    //
    switch (harvestingResult) {

        case ERR_NOT_IN_RANGE:
            creep.moveTo(source);
            creep.memory.harvesting = undefined;
            break;

        case OK:
            creep.memory.harvesting = source.id;
            break;

    }
            
};

// -----------------------------------------------------------------------------
// Function to spawn creeps up to their max (defined in constants) in a room
// -----------------------------------------------------------------------------
/** param {String} roomName */
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
            // Get creep body parts
            //
            var parts = getCreepBodyParts(roomName, i);

            //
            // TODO: Need to fix name generation issues
            //
            var date = new Date();
            var name = constants.maxCreeps[i].creepType + '_' + parseInt(date.getSeconds()) + parseInt(date.getMilliseconds());
                
            //
            // Certain creeps will only be spawned under certain conditions
            // even if we're under the max number allowed
            //
            // The build boolean will keep track of whether or not a spawn
            // order should be executed
            //
            var build = false;
            var result;
            switch (constants.maxCreeps[i].creepType) {
                    
                //
                // Only build defender creeps if there are hostile ones in the room
                //
                case 'defender':
                    if (Game.rooms[roomName].find(FIND_HOSTILE_CREEPS).length > 0) {
                        build = true;
                    }
                    break;
                    
                //
                // Only build miners if there's an extractor
                //
                case 'miner':
                    if (Game.rooms[roomName].find(FIND_MY_STRUCTURES, {
                        filter: (s) => {
                            return s.structureType === STRUCTURE_EXTRACTOR;
                        }
                    }).length) {
                        build = true;
                    }
                    break;
                    
                //
                // Only build scouts if we're able to expand (our controller count
                // is less than our GCL), and if there are expansion targets 
                // in Memory.expansions
                //
                case 'scout':
                    var gcl = Game.gcl.level;
                    var controllers = _.filter(Game.structures, 
                        function(s) { 
                            return s.structureType == STRUCTURE_CONTROLLER; 
                        }).length;
                        
                    if (Memory.expansions && Memory.expansions.length && controllers < gcl) {
                        build = true;
                    }
                    break;
                    
                default:
                    build = true;
                    
            }
                
            //
            // If we found body parts, and if our spawn logic succeeded, attempt a spawn
            //
            if (parts.length > 0 && build) {
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
// Look for suitable places to build extension nodes
// TODO: Improve the scoring
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
    
    findEnergySources: findEnergySources,

    getCreepBodyParts: getCreepBodyParts,

    findStructures: findStructures,

};

module.exports = utils;