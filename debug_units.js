// Debug script to check unit data
const fetch = require('node-fetch');

async function checkUnits() {
  try {
    const response = await fetch('http://localhost:5000/api/units');
    const units = await response.json();
    
    console.log('Total units:', units.length);
    
    // Find the specific unit that was marked as under replacement
    const targetUnit = units.find(unit => unit.id === '1752505982607_unit_8');
    if (targetUnit) {
      console.log('Target unit found:', JSON.stringify(targetUnit, null, 2));
    } else {
      console.log('Target unit not found');
    }
    
    // Check for any units with isUnderReplacement
    const underReplacementUnits = units.filter(unit => unit.isUnderReplacement === true);
    console.log('Units under replacement:', underReplacementUnits.length);
    
    if (underReplacementUnits.length > 0) {
      console.log('Units under replacement:');
      underReplacementUnits.forEach(unit => {
        console.log(`- ${unit.id} (${unit.serialNumber}): ${unit.isUnderReplacement}`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkUnits();