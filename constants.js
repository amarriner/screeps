
module.exports = {
    
    maxCreeps: [
        {creepType: 'builder', max: 5},
        {creepType: 'harvester', max: 2},
        {creepType: 'repairer', max: 2},
        {creepType: 'upgrader', max: 5}
    ],
    
    buildSort: [
        STRUCTURE_EXTENSION
    ],
    
    defaultCreepParts: [WORK, CARRY, MOVE, MOVE]
    
};