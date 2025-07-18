import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Plus, X, Download, FileText, Calculator } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  company?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

interface Item {
  id: string;
  name: string;
  description: string;
  category: string;
  unitPrice: number;
  currency: string;
}

interface InvoiceItem {
  itemId: string;
  itemName: string;
  itemDescription: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  taxRate: number;
  discountRate: number;
  serialNumbers?: string[];
  rentalPeriod?: string;
}

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateInvoiceModal({ isOpen, onClose }: CreateInvoiceModalProps) {
  const { toast } = useToast();
  
  // Form state
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('Net 30');
  const [notes, setNotes] = useState('');
  const [taxRate, setTaxRate] = useState(0);
  const [discountRate, setDiscountRate] = useState(0);
  const [currency, setCurrency] = useState('INR');
  
  // Invoice editing state
  const [editableInvoiceNumber, setEditableInvoiceNumber] = useState('');
  const [editableSubtotal, setEditableSubtotal] = useState(0);
  const [editableTotalAmount, setEditableTotalAmount] = useState(0);
  
  // Bank details state
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('50200042158914');
  const [ifscCode, setIfscCode] = useState('HDFC0000192');
  const [bankAddress, setBankAddress] = useState('');
  
  // Item selection state
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [itemQuantity, setItemQuantity] = useState(1);
  const [itemUnitPrice, setItemUnitPrice] = useState(0);
  const [itemRentalPeriod, setItemRentalPeriod] = useState('');

  // Data queries
  const { data: customers } = useQuery<Customer[]>({
    queryKey: ['/api/customers'],
  });

  const { data: items } = useQuery<Item[]>({
    queryKey: ['/api/items'],
  });

  const { data: companyProfile } = useQuery({
    queryKey: ['/api/company-profiles/default'],
    queryFn: async () => {
      const response = await fetch('/api/company-profiles/default');
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error('Failed to fetch company profile');
      }
      return response.json();
    },
  });

  // Fetch customer rental items when customer is selected
  const { data: customerRentals } = useQuery({
    queryKey: ['/api/customers', selectedCustomer?.id, 'rentals'],
    enabled: !!selectedCustomer?.id,
  });

  const { data: serviceItems } = useQuery({
    queryKey: ['/api/service-items'],
    enabled: !!selectedCustomer?.id,
  });

  const { data: services } = useQuery({
    queryKey: ['/api/services'],
    enabled: !!selectedCustomer?.id,
  });

  // Auto-calculate due date based on payment terms
  useEffect(() => {
    if (invoiceDate && paymentTerms) {
      const date = new Date(invoiceDate);
      const daysMatch = paymentTerms.match(/Net (\d+)/i);
      if (daysMatch) {
        const days = parseInt(daysMatch[1]);
        date.setDate(date.getDate() + days);
      } else {
        date.setDate(date.getDate() + 30);
      }
      setDueDate(date.toISOString().split('T')[0]);
    }
  }, [invoiceDate, paymentTerms]);

  // Calculate totals
  const subtotal = invoiceItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const discountAmount = subtotal * (discountRate / 100);
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = taxableAmount * (taxRate / 100);
  const totalAmount = taxableAmount + taxAmount;

  // Generate invoice number
  const generateInvoiceNumber = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `INV-${year}${month}${day}-${random}`;
  };

  // Initialize invoice number
  useEffect(() => {
    if (!editableInvoiceNumber) {
      setEditableInvoiceNumber(generateInvoiceNumber());
    }
  }, []);

  // Update calculated values when items change
  useEffect(() => {
    setEditableSubtotal(subtotal);
    setEditableTotalAmount(totalAmount);
  }, [subtotal, totalAmount]);

  // Initialize bank details with company profile data
  useEffect(() => {
    if (companyProfile && !bankName) {
      setBankName(companyProfile.companyName || '');
      setBankAddress(companyProfile.city && companyProfile.stateProvince ? 
        `${companyProfile.city}, ${companyProfile.stateProvince}` : '');
    }
  }, [companyProfile, bankName]);

  // Process rental items for display
  const getRentalItems = () => {
    if (!customerRentals || !serviceItems || !services || !items) return [];
    
    const rentalItems = [];
    
    for (const rental of customerRentals) {
      // Find the service for this rental
      const service = services.find(s => s.id === rental.serviceId);
      if (!service || service.serviceType !== 'rent') continue;
      
      // Find service items for this rental
      const rentalServiceItems = serviceItems.filter(si => si.serviceId === rental.serviceId);
      
      for (const serviceItem of rentalServiceItems) {
        // Find the inventory item
        const item = items.find(i => i.id === serviceItem.itemId);
        if (!item) continue;
        
        // Use service item unit price as monthly rate if rental monthly rate is empty
        const monthlyRate = parseFloat(rental.monthlyRate || serviceItem.unitPrice || '0');
        
        rentalItems.push({
          id: `rental-${rental.id}-${serviceItem.id}`,
          rentalId: rental.id,
          serviceId: rental.serviceId,
          serviceItemId: serviceItem.id,
          itemId: item.id,
          name: item.name,
          model: item.model,
          quantity: serviceItem.quantity,
          unitPrice: parseFloat(serviceItem.unitPrice || '0'),
          totalPrice: parseFloat(serviceItem.totalPrice || '0'),
          rentalPeriod: rental.isOngoing ? 
            `${rental.startDate} to Ongoing` : 
            `${rental.startDate} to ${rental.endDate || 'Ongoing'}`,
          monthlyRate: monthlyRate,
          paymentFrequency: rental.paymentFrequency || 'monthly',
          isActive: rental.isOngoing // Use isOngoing field since status field doesn't exist
        });
      }
    }
    
    return rentalItems.filter(item => item.isActive);
  };

  const rentalItems = getRentalItems();

  // Add item to invoice
  const addItemToInvoice = () => {
    if (!selectedItem || itemQuantity <= 0) {
      toast({
        title: "Error",
        description: "Please select an item and enter a valid quantity",
        variant: "destructive",
      });
      return;
    }

    const totalPrice = itemQuantity * itemUnitPrice;
    const newItem: InvoiceItem = {
      itemId: selectedItem.id,
      itemName: selectedItem.name,
      itemDescription: selectedItem.description,
      quantity: itemQuantity,
      unitPrice: itemUnitPrice,
      totalPrice: totalPrice,
      taxRate: 0,
      discountRate: 0,
      rentalPeriod: itemRentalPeriod || undefined,
    };

    setInvoiceItems([...invoiceItems, newItem]);
    setSelectedItem(null);
    setItemQuantity(1);
    setItemUnitPrice(0);
    setItemRentalPeriod('');
  };

  // Add rental item to invoice
  const addRentalItemToInvoice = (rentalItem: any) => {
    const newItem: InvoiceItem = {
      itemId: rentalItem.itemId,
      itemName: rentalItem.name,
      itemDescription: `${rentalItem.model} (Rental)`,
      quantity: rentalItem.quantity,
      unitPrice: rentalItem.monthlyRate,
      totalPrice: rentalItem.quantity * rentalItem.monthlyRate,
      taxRate: 0,
      discountRate: 0,
      rentalPeriod: rentalItem.rentalPeriod,
    };
    
    setInvoiceItems([...invoiceItems, newItem]);
  };

  // Remove item from invoice
  const removeItemFromInvoice = (index: number) => {
    setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
  };

  // Convert number to words (Indian currency format)
  const numberToWords = (num: number): string => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    if (num === 0) return 'Zero';

    const convertHundreds = (n: number): string => {
      let result = '';
      if (n >= 100) {
        result += ones[Math.floor(n / 100)] + ' Hundred ';
        n %= 100;
      }
      if (n >= 20) {
        result += tens[Math.floor(n / 10)] + ' ';
        n %= 10;
      } else if (n >= 10) {
        result += teens[n - 10] + ' ';
        n = 0;
      }
      if (n > 0) {
        result += ones[n] + ' ';
      }
      return result;
    };

    const crores = Math.floor(num / 10000000);
    const lakhs = Math.floor((num % 10000000) / 100000);
    const thousandsPart = Math.floor((num % 100000) / 1000);
    const hundreds = num % 1000;

    let result = '';
    if (crores > 0) result += convertHundreds(crores) + 'Crore ';
    if (lakhs > 0) result += convertHundreds(lakhs) + 'Lakh ';
    if (thousandsPart > 0) result += convertHundreds(thousandsPart) + 'Thousand ';
    if (hundreds > 0) result += convertHundreds(hundreds);

    return result.trim() + ' Only';
  };

  // Generate PDF invoice
  const generatePDFInvoice = (invoiceData: any) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    // Draw main page border with thinner lines
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.2);
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
    
    // Company logo area with light gray background
    doc.setFillColor(230, 235, 240);
    doc.rect(15, 15, 55, 40, 'F');
    
    // Company logo handling
    if (companyProfile?.logoData) {
      try {
        // Add the actual logo image
        doc.addImage(companyProfile.logoData, 'JPEG', 20, 20, 30, 30);
      } catch (error) {
        console.warn('Failed to add logo to PDF:', error);
        // Fallback to placeholder
        doc.setDrawColor(100, 100, 100);
        doc.setLineWidth(2);
        doc.circle(35, 35, 12);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        const initials = companyProfile.companyName ? companyProfile.companyName.substring(0, 3) : 'Logo';
        doc.text(initials, 30, 37);
      }
    } else {
      // Logo placeholder - circular design
      doc.setDrawColor(100, 100, 100);
      doc.setLineWidth(2);
      doc.circle(35, 35, 12);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      const initials = companyProfile?.companyName ? companyProfile.companyName.substring(0, 3) : 'Logo';
      doc.text(initials, 30, 37);
    }
    
    // Company name and details
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(companyProfile?.companyName || 'Company Name', 75, 25);
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    let yPosition = 32;
    doc.text(companyProfile?.addressLine1 || 'Address Line 1', 75, yPosition);
    yPosition += 4;
    
    if (companyProfile?.addressLine2) {
      doc.text(companyProfile.addressLine2, 75, yPosition);
      yPosition += 4;
    }
    
    const cityStateZip = `${companyProfile?.city || 'City'}, ${companyProfile?.stateProvince || 'State'} ${companyProfile?.zipPostalCode || 'ZIP'}`;
    doc.text(cityStateZip, 75, yPosition);
    yPosition += 4;
    
    doc.text(companyProfile?.country || 'Country', 75, yPosition);
    yPosition += 4;
    
    doc.text(companyProfile?.phoneNumber || 'Phone Number', 75, yPosition);
    yPosition += 4;
    
    doc.text(companyProfile?.emailAddress || 'Email Address', 75, yPosition);
    yPosition += 4;
    
    if (companyProfile?.websiteUrl) {
      doc.text(companyProfile.websiteUrl, 75, yPosition);
      yPosition += 4;
    }
    
    if (companyProfile?.gstNumber) {
      doc.text(`GST: ${companyProfile.gstNumber}`, 75, yPosition);
    }
    
    // Invoice title
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('Invoice', 160, 40);
    
    // Invoice details section with thinner border
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.2);
    doc.rect(15, 65, 180, 25);
    
    // Invoice details content - better aligned
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('#', 20, 75);
    doc.text('Invoice Date', 20, 80);
    doc.text('Terms', 20, 85);
    doc.text('Due Date', 20, 90);
    
    // Invoice details values - properly aligned
    doc.text(`: ${invoiceData.invoiceNumber}`, 80, 75);
    doc.text(`: ${new Date(invoiceData.invoiceDate).toLocaleDateString('en-GB')}`, 80, 80);
    doc.text(': Due on Receipt', 80, 85);
    doc.text(`: ${new Date(invoiceData.dueDate).toLocaleDateString('en-GB')}`, 80, 90);
    
    // Customer name
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(selectedCustomer?.name || 'Dr. Krishna', 20, 105);
    
    // Items table
    let yPos = 120;
    
    // Table header with thinner borders
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.2);
    doc.rect(15, yPos, 180, 12);
    doc.line(25, yPos, 25, yPos + 12); // # column separator
    doc.line(130, yPos, 130, yPos + 12); // Qty column separator
    doc.line(155, yPos, 155, yPos + 12); // Rate column separator
    doc.line(170, yPos, 170, yPos + 12); // Rate-Amount separator line
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('#', 18, yPos + 8);
    doc.text('Description', 30, yPos + 8);
    doc.text('Qty', 135, yPos + 8);
    doc.text('Rate', 160, yPos + 8);
    doc.text('Amount', 175, yPos + 8);
    
    yPos += 12;
    
    // Table rows
    doc.setFont('helvetica', 'normal');
    let calculatedSubtotal = 0;
    invoiceItems.forEach((item, index) => {
      const itemTotal = item.quantity * item.unitPrice;
      calculatedSubtotal += itemTotal;
      
      // Draw row borders with thinner lines
      doc.setLineWidth(0.2);
      doc.rect(15, yPos, 180, 10);
      doc.line(25, yPos, 25, yPos + 10);
      doc.line(130, yPos, 130, yPos + 10);
      doc.line(155, yPos, 155, yPos + 10);
      doc.line(170, yPos, 170, yPos + 10); // Rate-Amount separator line
      
      // Row content with proper formatting
      doc.text((index + 1).toString(), 18, yPos + 6);
      doc.text(item.itemName, 30, yPos + 6);
      doc.text(`${item.quantity.toFixed(2)}`, 132, yPos + 6);
      doc.text('pcs', 142, yPos + 6);
      doc.text(`${item.unitPrice.toFixed(2)}`, 158, yPos + 6);
      doc.text(`${itemTotal.toFixed(2)}`, 175, yPos + 6);
      
      yPos += 10;
    });
    
    // Totals section
    yPos += 5;
    const calculatedTotal = calculatedSubtotal + taxAmount - discountAmount;
    
    // Total in words (left side)
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Total In Words', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(`Indian Rupee ${numberToWords(Math.floor(calculatedTotal))}`, 20, yPos + 6);
    
    // Right side totals with proper formatting
    doc.text('Sub Total', 145, yPos);
    doc.text(`${calculatedSubtotal.toFixed(2)}`, 175, yPos);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Total', 145, yPos + 6);
    doc.text(`₹${calculatedTotal.toFixed(2)}`, 175, yPos + 6);
    
    doc.text('Payment Made', 145, yPos + 12);
    doc.text('₹180.00', 175, yPos + 12);
    
    doc.text('Balance Due', 145, yPos + 18);
    doc.text('₹0.00', 175, yPos + 18);
    
    // Thank you message
    yPos += 30;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Thanks for your business.', 20, yPos);
    
    // Bank details (using editable bank details)
    yPos += 10;
    doc.text(`Name - ${bankName || companyProfile?.companyName || 'Company Name'}`, 20, yPos);
    doc.text(`Account - ${accountNumber}`, 20, yPos + 5);
    doc.text(`Ifsc code - ${ifscCode}`, 20, yPos + 10);
    const addressLine = bankAddress || (companyProfile ? `${companyProfile.city}, ${companyProfile.stateProvince}` : 'City, State');
    doc.text(`Address - ${addressLine}`, 20, yPos + 15);
    
    // Terms and conditions
    yPos += 25;
    doc.setFontSize(8);
    doc.text('- An invoice will be provided for all transactions, specifying itemized', 20, yPos);
    doc.text('charges, rental period, and total amount.', 20, yPos + 4);
    doc.text('- Disputes regarding invoices must be raised within 2 days of receipt.', 20, yPos + 8);
    doc.text('- The customer is liable for any damage or loss to rented equipment', 20, yPos + 12);
    doc.text('during the rental period.', 20, yPos + 16);
    doc.text('- Charges for repair or replacement will be billed separately.', 20, yPos + 20);
    
    // Save the PDF
    doc.save(`${invoiceData.invoiceNumber}.pdf`);
  };

  // Create invoice mutation
  const createInvoiceMutation = useMutation({
    mutationFn: async (invoiceData: any) => {
      const response = await apiRequest('/api/invoices', {
        method: 'POST',
        body: JSON.stringify(invoiceData),
      });
      return response;
    },
    onSuccess: (data) => {
      // Create invoice items
      const itemPromises = invoiceItems.map((item, index) => 
        apiRequest('/api/invoice-items', {
          method: 'POST',
          body: JSON.stringify({
            id: `${data.id}-item-${index + 1}`,
            invoiceId: data.id,
            itemId: item.itemId || null,
            itemName: item.itemName,
            itemDescription: item.itemDescription || '',
            quantity: item.quantity,
            unitPrice: item.unitPrice.toString(),
            totalPrice: item.totalPrice.toString(),
            taxRate: item.taxRate ? item.taxRate.toString() : '0',
            discountRate: item.discountRate ? item.discountRate.toString() : '0',
            serialNumbers: item.serialNumbers ? JSON.stringify(item.serialNumbers) : null,
            rentalPeriod: item.rentalPeriod || null,
          }),
        })
      );

      Promise.all(itemPromises).then(() => {
        queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
        queryClient.invalidateQueries({ queryKey: ['/api/invoice-items'] });
        queryClient.invalidateQueries({ queryKey: ['/api/billing/stats'] });
        
        toast({
          title: "Success",
          description: "Invoice created successfully",
        });

        // Generate PDF
        generatePDFInvoice(data);
        
        // Reset form
        resetForm();
        onClose();
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create invoice",
        variant: "destructive",
      });
    },
  });

  // Reset form
  const resetForm = () => {
    setSelectedCustomer(null);
    setInvoiceItems([]);
    setInvoiceDate(new Date().toISOString().split('T')[0]);
    setDueDate('');
    setPaymentTerms('Net 30');
    setNotes('');
    setTaxRate(0);
    setDiscountRate(0);
    setSelectedItem(null);
    setItemQuantity(1);
    setItemUnitPrice(0);
    setItemRentalPeriod('');
    setEditableInvoiceNumber('');
    setEditableSubtotal(0);
    setEditableTotalAmount(0);
    // Reset bank details to default values
    setBankName(companyProfile?.companyName || '');
    setAccountNumber('50200042158914');
    setIfscCode('HDFC0000192');
    setBankAddress(companyProfile && companyProfile.city && companyProfile.stateProvince ? 
      `${companyProfile.city}, ${companyProfile.stateProvince}` : '');
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!selectedCustomer) {
      toast({
        title: "Error",
        description: "Please select a customer",
        variant: "destructive",
      });
      return;
    }

    if (invoiceItems.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one item to the invoice",
        variant: "destructive",
      });
      return;
    }

    const invoiceData = {
      invoiceNumber: editableInvoiceNumber,
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      customerEmail: selectedCustomer.email,
      customerPhone: selectedCustomer.phone,
      customerAddress: selectedCustomer.address || '',
      invoiceDate,
      dueDate,
      status: 'pending',
      subtotal: editableSubtotal.toFixed(2),
      taxAmount: taxAmount.toFixed(2),
      discountAmount: discountAmount.toFixed(2),
      totalAmount: editableTotalAmount.toFixed(2),
      currency,
      notes,
      paymentTerms,
      isRecurring: false,
    };

    createInvoiceMutation.mutate(invoiceData);
  };

  // Live preview component
  const InvoicePreview = () => {
    const previewSubtotal = invoiceItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const previewTax = previewSubtotal * (taxRate / 100);
    const previewDiscount = previewSubtotal * (discountRate / 100);
    const previewTotal = previewSubtotal + previewTax - previewDiscount;

    return (
      <div className="bg-white border border-black p-4 rounded-lg h-[800px] overflow-y-auto">
        <div className="border border-black p-4 bg-white">
          {/* Company Logo Area */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-start space-x-4">
              <div className="bg-gray-100 border border-gray-300 w-16 h-16 flex items-center justify-center">
                {companyProfile?.logoData ? (
                  <img 
                    src={companyProfile.logoData} 
                    alt="Company Logo" 
                    className="w-full h-full object-cover rounded"
                  />
                ) : (
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-gray-400 rounded-full mx-auto mb-1 flex items-center justify-center">
                      <span className="text-xs font-bold">{companyProfile?.companyName ? companyProfile.companyName.substring(0, 3) : 'Logo'}</span>
                    </div>
                    <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded">Company</div>
                  </div>
                )}
              </div>
              <div className="text-sm">
                <div className="font-bold text-lg mb-1">{companyProfile?.companyName || 'Company Name'}</div>
                <div>{companyProfile?.addressLine1 || 'Address Line 1'}</div>
                {companyProfile?.addressLine2 && <div>{companyProfile.addressLine2}</div>}
                <div>{companyProfile?.city || 'City'}, {companyProfile?.stateProvince || 'State'} {companyProfile?.zipPostalCode || 'ZIP'}</div>
                <div>{companyProfile?.country || 'Country'}</div>
                <div>{companyProfile?.phoneNumber || 'Phone Number'}</div>
                <div>{companyProfile?.emailAddress || 'Email Address'}</div>
                {companyProfile?.websiteUrl && <div>{companyProfile.websiteUrl}</div>}
                {companyProfile?.gstNumber && <div>GST: {companyProfile.gstNumber}</div>}
              </div>
            </div>
            <div className="text-right">
              <h1 className="text-3xl font-bold">Invoice</h1>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="border border-black p-3 mb-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>#</div>
              <div>: {generateInvoiceNumber()}</div>
              <div>Invoice Date</div>
              <div>: {invoiceDate ? new Date(invoiceDate).toLocaleDateString('en-GB') : 'Select Date'}</div>
              <div>Terms</div>
              <div>: {paymentTerms}</div>
              <div>Due Date</div>
              <div>: {dueDate ? new Date(dueDate).toLocaleDateString('en-GB') : 'Select Date'}</div>
            </div>
          </div>

          {/* Customer Details */}
          <div className="mb-4">
            <div className="font-bold text-lg">
              {selectedCustomer?.name || 'Select Customer'}
            </div>
            {selectedCustomer && (
              <div className="text-sm text-gray-600">
                {selectedCustomer.email && <div>{selectedCustomer.email}</div>}
                {selectedCustomer.phone && <div>{selectedCustomer.phone}</div>}
                {selectedCustomer.address && <div>{selectedCustomer.address}</div>}
              </div>
            )}
          </div>

          {/* Items Table */}
          <div className="border border-black mb-4">
            <div className="grid grid-cols-5 gap-2 p-2 bg-gray-50 border-b border-black font-bold text-sm">
              <div>#</div>
              <div>Description</div>
              <div>Qty</div>
              <div>Rate</div>
              <div>Amount</div>
            </div>
            {invoiceItems.length > 0 ? (
              invoiceItems.map((item, index) => (
                <div key={index} className="grid grid-cols-5 gap-2 p-2 border-b border-gray-200 text-sm">
                  <div>{index + 1}</div>
                  <div>{item.itemName}</div>
                  <div>{item.quantity.toFixed(2)} pcs</div>
                  <div>{item.unitPrice.toFixed(2)}</div>
                  <div>{(item.quantity * item.unitPrice).toFixed(2)}</div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">No items added</div>
            )}
          </div>

          {/* Totals */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="font-bold text-sm mb-1">Total In Words</div>
              <div className="text-sm">
                Indian Rupee {previewTotal > 0 ? numberToWords(Math.floor(previewTotal)) : 'Zero Only'}
              </div>
            </div>
            <div className="text-right space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Sub Total</span>
                <span>{previewSubtotal.toFixed(2)}</span>
              </div>
              {previewTax > 0 && (
                <div className="flex justify-between">
                  <span>Tax ({taxRate}%)</span>
                  <span>{previewTax.toFixed(2)}</span>
                </div>
              )}
              {previewDiscount > 0 && (
                <div className="flex justify-between">
                  <span>Discount ({discountRate}%)</span>
                  <span>(-) {previewDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>₹{previewTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Made</span>
                <span>(-) 0.00</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Balance Due</span>
                <span>₹{previewTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-sm space-y-2">
            <div>Thanks for your business.</div>
            <div className="space-y-1">
              <div>Name - Gac Infotech</div>
              <div>Account - 50200042158914</div>
              <div>Ifsc code - HDFC0000192</div>
              <div>Address - City Center Gwalior</div>
            </div>
            <div className="mt-4 space-y-1 text-xs">
              <div>- An invoice will be provided for all transactions, specifying itemized charges, rental period, and total amount.</div>
              <div>- Disputes regarding invoices must be raised within 2 days of receipt.</div>
              <div>- The customer is liable for any damage or loss to rented equipment during the rental period.</div>
              <div>- Charges for repair or replacement will be billed separately.</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-full max-h-full w-screen h-screen overflow-hidden bg-white border-black">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Create Invoice - Full Screen Mode</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6 h-full overflow-hidden">
          {/* Left Side - Editable Fields */}
          <div className="space-y-6 overflow-y-auto pr-4">
          {/* Customer Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customer">Select Customer *</Label>
              <Select onValueChange={(value) => {
                const customer = customers?.find(c => c.id.toString() === value);
                setSelectedCustomer(customer || null);
              }}>
                <SelectTrigger className="border-black">
                  <SelectValue placeholder="Choose a customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers?.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id.toString()}>
                      {customer.name} ({customer.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="border-black">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INR">INR (₹)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="invoiceDate">Invoice Date *</Label>
              <Input
                id="invoiceDate"
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="border-black"
              />
            </div>

            <div>
              <Label htmlFor="paymentTerms">Payment Terms</Label>
              <Select value={paymentTerms} onValueChange={setPaymentTerms}>
                <SelectTrigger className="border-black">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Due on Receipt">Due on Receipt</SelectItem>
                  <SelectItem value="Net 15">Net 15</SelectItem>
                  <SelectItem value="Net 30">Net 30</SelectItem>
                  <SelectItem value="Net 45">Net 45</SelectItem>
                  <SelectItem value="Net 60">Net 60</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="border-black"
              />
            </div>
          </div>

          {/* Add Items Section */}
          <Card className="border-black">
            <CardHeader>
              <CardTitle className="text-lg">Add Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="item">Select Item</Label>
                  <Select onValueChange={(value) => {
                    const item = items?.find(i => i.id === value);
                    setSelectedItem(item || null);
                    setItemUnitPrice(item?.unitPrice || 0);
                  }}>
                    <SelectTrigger className="border-black">
                      <SelectValue placeholder="Choose an item" />
                    </SelectTrigger>
                    <SelectContent>
                      {items?.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={itemQuantity}
                    onChange={(e) => setItemQuantity(parseInt(e.target.value) || 1)}
                    className="border-black"
                  />
                </div>

                <div>
                  <Label htmlFor="unitPrice">Unit Price</Label>
                  <Input
                    id="unitPrice"
                    type="number"
                    step="0.01"
                    value={itemUnitPrice}
                    onChange={(e) => setItemUnitPrice(parseFloat(e.target.value) || 0)}
                    className="border-black"
                  />
                </div>

                <div>
                  <Label htmlFor="rentalPeriod">Rental Period (Optional)</Label>
                  <Input
                    id="rentalPeriod"
                    placeholder="e.g., 1 month"
                    value={itemRentalPeriod}
                    onChange={(e) => setItemRentalPeriod(e.target.value)}
                    className="border-black"
                  />
                </div>
              </div>

              <Button 
                onClick={addItemToInvoice}
                disabled={!selectedItem || itemQuantity <= 0}
                className="bg-black text-white hover:bg-gray-800"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </CardContent>
          </Card>

          {/* Customer Rental Items */}
          {selectedCustomer && rentalItems.length > 0 && (
            <Card className="border-black">
              <CardHeader>
                <CardTitle className="text-lg">Customer's Active Rental Items</CardTitle>
                <p className="text-sm text-gray-600">
                  Click on any item to add it to the invoice
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {rentalItems.map((rentalItem) => (
                    <div 
                      key={rentalItem.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => addRentalItemToInvoice(rentalItem)}
                    >
                      <div className="flex-1">
                        <div className="font-medium">{rentalItem.name}</div>
                        <div className="text-sm text-gray-600">
                          {rentalItem.model} • Qty: {rentalItem.quantity} • Monthly Rate: ₹{rentalItem.monthlyRate.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {rentalItem.rentalPeriod} • {rentalItem.paymentFrequency}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="text-xs">
                          Active Rental
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-black text-black hover:bg-black hover:text-white"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Invoice Items List */}
          {invoiceItems.length > 0 && (
            <Card className="border-black">
              <CardHeader>
                <CardTitle className="text-lg">Invoice Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {invoiceItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{item.itemName}</div>
                        <div className="text-sm text-gray-600">
                          {item.quantity} × ₹{item.unitPrice.toFixed(2)} = ₹{item.totalPrice.toFixed(2)}
                          {item.rentalPeriod && ` • ${item.rentalPeriod}`}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeItemFromInvoice(index)}
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tax and Discount */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="taxRate">Tax Rate (%)</Label>
              <Input
                id="taxRate"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={taxRate}
                onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                className="border-black"
              />
            </div>

            <div>
              <Label htmlFor="discountRate">Discount Rate (%)</Label>
              <Input
                id="discountRate"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={discountRate}
                onChange={(e) => setDiscountRate(parseFloat(e.target.value) || 0)}
                className="border-black"
              />
            </div>
          </div>

          {/* Totals Summary */}
          {invoiceItems.length > 0 && (
            <Card className="border-black">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Calculator className="w-5 h-5 mr-2" />
                  Invoice Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({discountRate}%):</span>
                      <span>-₹{discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  {taxAmount > 0 && (
                    <div className="flex justify-between">
                      <span>Tax ({taxRate}%):</span>
                      <span>₹{taxAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>₹{totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="text-sm text-gray-600 mt-2">
                    <strong>Amount in words:</strong> {numberToWords(Math.floor(totalAmount))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes or terms..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="border-black"
            />
          </div>

          {/* Bank Details Section */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold mb-4">Bank Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bankName">Bank Account Name</Label>
                <Input
                  id="bankName"
                  placeholder="Account holder name"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="border-black"
                />
              </div>
              <div>
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input
                  id="accountNumber"
                  placeholder="Account number"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="border-black"
                />
              </div>
              <div>
                <Label htmlFor="ifscCode">IFSC Code</Label>
                <Input
                  id="ifscCode"
                  placeholder="IFSC code"
                  value={ifscCode}
                  onChange={(e) => setIfscCode(e.target.value)}
                  className="border-black"
                />
              </div>
              <div>
                <Label htmlFor="bankAddress">Bank Address</Label>
                <Input
                  id="bankAddress"
                  placeholder="Bank address"
                  value={bankAddress}
                  onChange={(e) => setBankAddress(e.target.value)}
                  className="border-black"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-black"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createInvoiceMutation.isPending || !selectedCustomer || invoiceItems.length === 0}
              className="bg-black text-white hover:bg-gray-800"
            >
              {createInvoiceMutation.isPending ? (
                "Creating..."
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Create Invoice & Download PDF
                </>
              )}
            </Button>
          </div>
          </div>

          {/* Right Side - Editable Invoice Preview */}
          <div className="border-l border-black pl-6 overflow-y-auto">
            <div className="sticky top-0 bg-white pb-4 mb-4 border-b border-black">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Live Invoice Preview</h3>
                <Button 
                  onClick={handleSubmit}
                  disabled={createInvoiceMutation.isPending || !selectedCustomer || invoiceItems.length === 0}
                  className="bg-black text-white hover:bg-gray-800"
                >
                  {createInvoiceMutation.isPending ? 'Creating...' : 'Create Invoice & Download PDF'}
                </Button>
              </div>
            </div>
            
            {/* Editable Invoice Preview */}
            <div className="bg-white border border-black p-6 rounded-lg">
              <div className="space-y-6">
                {/* Company Logo Area */}
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-gray-100 border border-gray-300 w-16 h-16 flex items-center justify-center">
                      {companyProfile?.logoData ? (
                        <img 
                          src={companyProfile.logoData} 
                          alt="Company Logo" 
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <div className="text-center">
                          <div className="w-8 h-8 border-2 border-gray-400 rounded-full mx-auto mb-1 flex items-center justify-center">
                            <span className="text-xs font-bold">{companyProfile?.companyName ? companyProfile.companyName.substring(0, 3) : 'Logo'}</span>
                          </div>
                          <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded">Company</div>
                        </div>
                      )}
                    </div>
                    <div className="text-sm">
                      <div className="font-bold text-lg mb-1">{companyProfile?.companyName || 'Company Name'}</div>
                      <div>{companyProfile?.addressLine1 || 'Address Line 1'}</div>
                      {companyProfile?.addressLine2 && <div>{companyProfile.addressLine2}</div>}
                      <div>{companyProfile?.city || 'City'}, {companyProfile?.stateProvince || 'State'} {companyProfile?.zipPostalCode || 'ZIP'}</div>
                      <div>{companyProfile?.country || 'Country'}</div>
                      <div>{companyProfile?.phoneNumber || 'Phone Number'}</div>
                      <div>{companyProfile?.emailAddress || 'Email Address'}</div>
                      {companyProfile?.websiteUrl && <div>{companyProfile.websiteUrl}</div>}
                      {companyProfile?.gstNumber && <div>GST: {companyProfile.gstNumber}</div>}
                    </div>
                  </div>
                  <div className="text-right">
                    <h1 className="text-3xl font-bold mb-4">Invoice</h1>
                    <div className="space-y-2">
                      <div>
                        <Label className="text-sm font-medium">Invoice Number</Label>
                        <Input 
                          value={editableInvoiceNumber} 
                          onChange={(e) => setEditableInvoiceNumber(e.target.value)}
                          className="text-right border-black mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Invoice Date</Label>
                        <Input 
                          type="date" 
                          value={invoiceDate} 
                          onChange={(e) => setInvoiceDate(e.target.value)}
                          className="border-black mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Due Date</Label>
                        <Input 
                          type="date" 
                          value={dueDate} 
                          onChange={(e) => setDueDate(e.target.value)}
                          className="border-black mt-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bill To Section */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">Bill To:</h3>
                  {selectedCustomer ? (
                    <div className="text-sm bg-gray-50 p-4 rounded border border-gray-200">
                      <div className="font-medium text-lg">{selectedCustomer.name}</div>
                      <div>{selectedCustomer.email}</div>
                      <div>{selectedCustomer.phone}</div>
                      {selectedCustomer.company && <div>{selectedCustomer.company}</div>}
                      {selectedCustomer.address && <div>{selectedCustomer.address}</div>}
                      {selectedCustomer.city && <div>{selectedCustomer.city}, {selectedCustomer.state} {selectedCustomer.pincode}</div>}
                    </div>
                  ) : (
                    <div className="text-gray-500 italic">Select a customer to see details</div>
                  )}
                </div>

                {/* Items Table */}
                <div className="mb-6">
                  <table className="w-full border-collapse border border-black">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-black p-3 text-left">Item</th>
                        <th className="border border-black p-3 text-center">Qty</th>
                        <th className="border border-black p-3 text-right">Rate</th>
                        <th className="border border-black p-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoiceItems.length > 0 ? (
                        invoiceItems.map((item, index) => (
                          <tr key={index}>
                            <td className="border border-black p-3">
                              <div className="font-medium">{item.itemName}</div>
                              {item.itemDescription && <div className="text-sm text-gray-600">{item.itemDescription}</div>}
                            </td>
                            <td className="border border-black p-3 text-center">{item.quantity}</td>
                            <td className="border border-black p-3 text-right">₹{item.unitPrice.toFixed(2)}</td>
                            <td className="border border-black p-3 text-right">₹{item.totalPrice.toFixed(2)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="border border-black p-3 text-center text-gray-500 italic">
                            No items added yet
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Editable Totals Section */}
                <div className="flex justify-end mb-6">
                  <div className="w-80 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Subtotal:</span>
                      <div className="flex items-center space-x-2">
                        <span>₹</span>
                        <Input 
                          type="number"
                          value={editableSubtotal} 
                          onChange={(e) => setEditableSubtotal(parseFloat(e.target.value) || 0)}
                          className="w-24 text-right border-black"
                        />
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <span>Discount:</span>
                        <Input 
                          type="number"
                          value={discountRate} 
                          onChange={(e) => setDiscountRate(parseFloat(e.target.value) || 0)}
                          className="w-16 text-right border-black"
                        />
                        <span>%</span>
                      </div>
                      <span>-₹{discountAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <span>Tax:</span>
                        <Input 
                          type="number"
                          value={taxRate} 
                          onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                          className="w-16 text-right border-black"
                        />
                        <span>%</span>
                      </div>
                      <span>₹{taxAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center font-bold text-lg border-t border-black pt-3">
                      <span>Total:</span>
                      <div className="flex items-center space-x-2">
                        <span>₹</span>
                        <Input 
                          type="number"
                          value={editableTotalAmount} 
                          onChange={(e) => setEditableTotalAmount(parseFloat(e.target.value) || 0)}
                          className="w-32 text-right border-black font-bold text-lg"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Terms */}
                <div className="mb-6">
                  <Label className="text-sm font-medium">Payment Terms</Label>
                  <Select value={paymentTerms} onValueChange={setPaymentTerms}>
                    <SelectTrigger className="border-black mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Net 15">Net 15</SelectItem>
                      <SelectItem value="Net 30">Net 30</SelectItem>
                      <SelectItem value="Net 45">Net 45</SelectItem>
                      <SelectItem value="Net 60">Net 60</SelectItem>
                      <SelectItem value="Due on Receipt">Due on Receipt</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Editable Notes Section */}
                <div className="mb-6">
                  <Label className="text-sm font-medium">Notes</Label>
                  <Textarea 
                    value={notes} 
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Additional notes or terms..."
                    className="border-black mt-1"
                    rows={3}
                  />
                </div>

                {/* Footer */}
                <div className="text-sm space-y-2 border-t border-gray-200 pt-4">
                  <div className="font-medium">Thanks for your business!</div>
                  <div className="space-y-1">
                    <div><strong>Name:</strong> {bankName || companyProfile?.companyName || 'Company Name'}</div>
                    <div><strong>Account:</strong> {accountNumber}</div>
                    <div><strong>IFSC Code:</strong> {ifscCode}</div>
                    <div><strong>Address:</strong> {bankAddress || (companyProfile ? `${companyProfile.city}, ${companyProfile.stateProvince}` : 'City, State')}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}