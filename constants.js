
module.exports = {
    
    //
    // Used by utils.spawnCreeps() so that won't 
    // spawn creeps infinitely
    //
    maxCreeps: [
        {creepType: 'defender', max: 5},
        {creepType: 'harvester', max: 5},
        {creepType: 'builder', max: 5},
        {creepType: 'upgrader', max: 5},
        {creepType: 'repairer', max: 5},
        {creepType: 'scout', max:1},
        {creepType: 'miner', max: 0},
    ],
    
    //
    // Used by utils.spawnCreeps() to give creeps a default body
    //
    defaultCreepParts: [
        // [WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE],
        [WORK, WORK, CARRY, CARRY, MOVE, MOVE],
        [WORK, CARRY, MOVE],
    ],
    
    defaultCreepRoleParts: {
        defender: [MOVE, MOVE, ATTACK, ATTACK, TOUGH, TOUGH],
        scout: [MOVE, CARRY, WORK, CLAIM],
    },
    
    //
    // These arrays are used when searching for structures
    // to build, repair, fill with energy, etc. so we can
    // have a priority order to do those things. Used by
    // utils.sortSites()
    //
    sortArrays: {
        build: [
            STRUCTURE_EXTENSION,
            STRUCTURE_CONTAINER,
        ],
        repair: [
            STRUCTURE_SPAWN,
            STRUCTURE_ROAD,
            STRUCTURE_CONTAINER,
            STRUCTURE_TOWER,
            STRUCTURE_RAMPART,
        ],
        fill: [
            STRUCTURE_SPAWN,
            STRUCTURE_TOWER,
            STRUCTURE_EXTENSION,
            STRUCTURE_CONTAINER,
        ],
    },
    
};