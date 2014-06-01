var fitIds = require('./fitbit_activity_ids.js');

exports.util = {

  calcEndurance: function(array) {
    var totalEndurance = 0;
    for (var i=0; i<array.length; i++) {
      //conversion from given km to miles
      totalEndurance += Math.floor((parseInt(array[i].value)*0.6214)/3);
    }
    return totalEndurance;
  },

  calcVitality: function(array) {
    var totalVitality = 0;
    var min = 60;
    var optHrs = 7;
    for (var i=0; i<array.length; i++) {
      totalVitality += Math.floor(parseInt(array[i].value)/(optHrs*min));
    }
    return totalVitality;
  },

  calcStrDex: function(array) {
    // ids is the strength/dexterity activity id array
    var total = 0;
    var minPerPoint = 30;
    var secs = 60;
    var msecs = 1000;
    if (array.length === 0) {return 0};
    // assumes the array is for only 1 days activities
    for (var i=0; i<array.length; i++) {
      for (var j=0; j<fitIds.ids.length; j++) {
        if (array[i].activityId === fitIds.ids[j]) {
          total += Math.floor(parseInt(array[i].duration)/(minPerPoint*secs*msecs));
        }
      }
    }
    return total;
  },

  calcHpRecov: function(array) {
    var hpRecover = 0;
    // should be an array from last login to current day
    for (var i=0; i<array.length; i++) {
      hpRecover += 3*parseInt(array[i].value);
    }
    return hpRecover;
  },

  calcAttackBonus: function(array) {
    var bonus = 1;
    var activeMin = parseInt(array[array.length-1].value);
    if (activeMin > 60) {
      bonus = 1+(activeMin/60-1)*0.1;
    }
    return bonus;
  },

  // we use steps as experience, and turn those into level points
  calcLevel: function(array, currLvl) {
    var level = currLvl || 1;
    var total = 0;
    var expToLevel = function(lvl) {
      return 100*Math.pow(lvl,3) + 360*Math.pow(lvl,2) + 3500*lvl;
    };
    for (var i=0; i<array.length; i++) {
      total += parseInt(array[i].value);
    }
    while (expToLevel(level) < total) {
      level++;
    }
    return level;
  },

  calcExperience: function(array) {
    console.log('experience f');
    console.log(array);
    var experience = 0;
    for (var i=0; i<array.length; i++) {
      total += parseInt(array[i].value);
    }
    console.log('xp', experience);
    return experience;
  },

  calcSkillPoints: function(currSkillPts, lvl, currLvl) {
    return currSkillPts + (lvl-currLvl)*5;
  }

}
