var constants = require('constants');
var utils = require('utils');

var roleBuilder = require('role.builder');
var roleHarvester = require('role.harvester');
var roleRepairer = require('role.repairer');
var roleUpgrader = require('role.upgrader');

module.exports.loop = function() {
    
    //
    // Loop through creeps, looking for deleted ones
    //
    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }
    
    //
    // If there are less creeps than the max, spawn them
    //
    utils.spawnCreeps();
    
    //
    // Loop through each creep and perform their role function
    //
    for (var name in Game.creeps) {
        var creep = Game.creeps[name];
        
        if (creep.memory.role == 'builder') {
            roleBuilder.run(creep);
        }
        
        if (creep.memory.role == 'harvester') {
            roleHarvester.run(creep);
        }
        
        if (creep.memory.role == 'repairer') {
            roleRepairer.run(creep);
        }
        
        if (creep.memory.role == 'upgrader') {
            roleUpgrader.run(creep);
        }
    }
}