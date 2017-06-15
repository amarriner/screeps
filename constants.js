
module.exports = {
    
    maxCreeps: [
        {creepType: 'harvester', max: 5},
        {creepType: 'builder', max: 5},
        {creepType: 'upgrader', max: 5},
        {creepType: 'repairer', max: 5},
    ],
    
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
    },
    
    defaultCreepParts: [WORK, CARRY, MOVE]
    
};