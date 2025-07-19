import { storage } from './storage';
import type { InsertInvoice, InsertInvoiceItem, RecurringInvoiceSchedule } from '@shared/schema';

// Utility function to calculate next invoice date
function calculateNextInvoiceDate(frequency: string, interval: number, lastDate: string): string {
  const date = new Date(lastDate);
  
  switch (frequency) {
    case 'monthly':
      date.setMonth(date.getMonth() + interval);
      break;
    case 'quarterly':
      date.setMonth(date.getMonth() + (interval * 3));
      break;
    case 'yearly':
      date.setFullYear(date.getFullYear() + interval);
      break;
    default:
      throw new Error(`Unsupported frequency: ${frequency}`);
  }
  
  return date.toISOString().split('T')[0];
}

// Utility function to calculate due date
function calculateDueDate(invoiceDate: string, paymentTerms: string): string {
  const date = new Date(invoiceDate);
  
  // Parse payment terms like "Net 30", "Net 15", etc.
  const daysMatch = paymentTerms.match(/Net (\d+)/i);
  if (daysMatch) {
    const days = parseInt(daysMatch[1]);
    date.setDate(date.getDate() + days);
  } else {
    // Default to 30 days if can't parse
    date.setDate(date.getDate() + 30);
  }
  
  return date.toISOString().split('T')[0];
}

// Generate invoice number
function generateInvoiceNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  return `INV-${year}${month}${day}-${random}`;
}

// Main function to process recurring invoices
export async function processRecurringInvoices(): Promise<void> {
  try {
    console.log('Processing recurring invoices...');
    await storage.initialize();
    
    const activeSchedules = await storage.getActiveRecurringInvoiceSchedules();
    const today = new Date();
    
    // Calculate 6 days from today for early invoice generation
    const sixDaysFromNow = new Date(today);
    sixDaysFromNow.setDate(today.getDate() + 6);
    const sixDaysFromNowString = sixDaysFromNow.toISOString().split('T')[0];
    
    for (const schedule of activeSchedules) {
      // Check if invoice should be generated (6 days before the actual invoice date)
      // Generate invoice if nextInvoiceDate is within the next 6 days
      if (schedule.nextInvoiceDate <= sixDaysFromNowString) {
        try {
          // Check if invoice already exists for this schedule and date to prevent duplicates
          const existingInvoices = await storage.getInvoicesByCustomer(schedule.customerId);
          const invoiceForDate = existingInvoices.find(inv => 
            inv.invoiceDate === schedule.nextInvoiceDate && 
            inv.recurringScheduleId === schedule.id
          );
          
          if (!invoiceForDate) {
            await generateInvoiceFromSchedule(schedule);
            console.log(`Generated advance invoice for schedule ${schedule.id} (6 days early) for date ${schedule.nextInvoiceDate}`);
          } else {
            console.log(`Invoice already exists for schedule ${schedule.id} and date ${schedule.nextInvoiceDate}, skipping...`);
          }
        } catch (error) {
          console.error(`Failed to generate invoice for schedule ${schedule.id}:`, error);
        }
      }
    }
    
    console.log('Recurring invoice processing completed');
  } catch (error) {
    console.error('Error processing recurring invoices:', error);
  }
}

// Generate invoice from recurring schedule
async function generateInvoiceFromSchedule(schedule: RecurringInvoiceSchedule): Promise<void> {
  // Parse template data
  const templateData = JSON.parse(schedule.templateData);
  
  // Use the scheduled invoice date instead of today's date
  const invoiceDate = schedule.nextInvoiceDate;
  const dueDate = calculateDueDate(invoiceDate, schedule.paymentTerms || 'Net 30');
  
  // Create invoice
  const invoiceData: InsertInvoice = {
    invoiceNumber: generateInvoiceNumber(),
    customerId: schedule.customerId,
    customerName: schedule.customerName,
    customerEmail: templateData.customerEmail,
    customerPhone: templateData.customerPhone,
    customerAddress: templateData.customerAddress,
    rentalId: schedule.rentalId,
    serviceId: schedule.serviceId,
    invoiceDate,
    dueDate,
    status: 'pending',
    subtotal: templateData.subtotal,
    taxAmount: templateData.taxAmount || '0',
    discountAmount: templateData.discountAmount || '0',
    totalAmount: templateData.totalAmount,
    currency: templateData.currency || 'INR',
    notes: templateData.notes || `Auto-generated ${schedule.frequency} invoice`,
    paymentTerms: schedule.paymentTerms || 'Net 30',
    isRecurring: true,
    recurringScheduleId: schedule.id
  };
  
  const invoice = await storage.createInvoice(invoiceData);
  
  // Create invoice items
  if (templateData.items && Array.isArray(templateData.items)) {
    for (const item of templateData.items) {
      const invoiceItemData: InsertInvoiceItem = {
        invoiceId: invoice.id,
        itemId: item.itemId,
        itemName: item.itemName,
        itemDescription: item.itemDescription,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        taxRate: item.taxRate || '0',
        discountRate: item.discountRate || '0',
        serialNumbers: item.serialNumbers,
        rentalPeriod: item.rentalPeriod
      };
      
      await storage.createInvoiceItem(invoiceItemData);
    }
  }
  
  // Update the recurring schedule
  const nextInvoiceDate = calculateNextInvoiceDate(
    schedule.frequency,
    schedule.interval,
    schedule.nextInvoiceDate
  );
  
  await storage.updateRecurringInvoiceSchedule(schedule.id, {
    lastInvoiceDate: invoiceDate,
    nextInvoiceDate: nextInvoiceDate
  });
  
  console.log(`Generated invoice ${invoice.invoiceNumber} for customer ${schedule.customerName}`);
}

// Check for overdue invoices and update status
export async function checkOverdueInvoices(): Promise<void> {
  try {
    console.log('Checking for overdue invoices...');
    await storage.initialize();
    
    const pendingInvoices = await storage.getInvoicesByStatus('pending');
    const today = new Date().toISOString().split('T')[0];
    
    for (const invoice of pendingInvoices) {
      if (invoice.dueDate < today) {
        await storage.updateInvoice(invoice.id, { status: 'overdue' });
        console.log(`Marked invoice ${invoice.invoiceNumber} as overdue`);
      }
    }
    
    console.log('Overdue invoice check completed');
  } catch (error) {
    console.error('Error checking overdue invoices:', error);
  }
}

// Main cron job function
export async function runBillingCronJobs(): Promise<void> {
  console.log('Starting billing cron jobs...');
  
  // Process recurring invoices
  await processRecurringInvoices();
  
  // Check for overdue invoices
  await checkOverdueInvoices();
  
  console.log('Billing cron jobs completed');
}

// Set up cron job to run daily at 9 AM
export function setupBillingCronJob(): void {
  // Run immediately on startup
  setTimeout(runBillingCronJobs, 5000); // 5 seconds delay
  
  // Then run every 24 hours
  setInterval(runBillingCronJobs, 24 * 60 * 60 * 1000); // 24 hours
  
  console.log('Billing cron job scheduled to run daily');
}