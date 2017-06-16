
module.exports = {
    
    //
    // Used by utils.spawnCreeps() so that won't 
    // spawn creeps infinitely
    //
    maxCreeps: [
        {creepType: 'harvester', max: 5},
        {creepType: 'builder', max: 5},
        {creepType: 'upgrader', max: 5},
        {creepType: 'repairer', max: 5},
    ],
    
    //
    // Used by utils.spawnCreeps() to give creeps a default body
    //
    defaultCreepParts: [WORK, CARRY, MOVE],
    
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
            STRUCTURE_RAMPART,
            STRUCTURE_CONTAINER,
            STRUCTURE_ROAD,
        ],
        fill: [
            STRUCTURE_SPAWN,
            STRUCTURE_EXTENSION,
            STRUCTURE_CONTAINER,
        ],
    },
    
};