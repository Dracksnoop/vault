// Test script to create a replacement request and test the workflow
const testReplacement = {
  id: 'test-replacement-' + Date.now(),
  unitId: '1752575932110_unit_2', // Using the unit ID from the logs
  unitSerialNumber: 'I543089001',
  itemId: '1752575932110',
  itemName: 'CPU Intel Core i7',
  itemModel: 'Intel Core i7-12700K',
  reason: 'defective',
  status: 'pending',
  requestDate: new Date().toISOString().split('T')[0],
  notes: 'Unit showing performance issues and overheating',
  vendorName: 'Intel Corporation',
  warrantyExpiryDate: '2025-12-31',
  cost: 0,
  customerId: null,
  customerName: null
};

// Store the replacement request
const existingReplacements = localStorage.getItem('replacementRequests');
let replacements = [];
if (existingReplacements) {
  try {
    replacements = JSON.parse(existingReplacements);
  } catch (error) {
    console.error('Error parsing existing replacements:', error);
  }
}

replacements.push(testReplacement);
localStorage.setItem('replacementRequests', JSON.stringify(replacements));

console.log('Test replacement request created:', testReplacement);