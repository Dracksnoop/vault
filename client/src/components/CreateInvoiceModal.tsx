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

    // Company logo and address placeholder (top left)
    // TODO: When Profile section is implemented, populate these fields dynamically
    const companyLogoX = 20;
    const companyLogoY = 20;
    
    // Placeholder for company logo
    doc.setDrawColor(200, 200, 200);
    doc.rect(companyLogoX, companyLogoY, 40, 40); // Logo placeholder box
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Logo', companyLogoX + 18, companyLogoY + 22);
    
    // Placeholder for company address
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('[Company Name]', companyLogoX + 50, companyLogoY + 5);
    doc.text('[Address Line 1]', companyLogoX + 50, companyLogoY + 15);
    doc.text('[Address Line 2]', companyLogoX + 50, companyLogoY + 25);
    doc.text('[City, State, PIN]', companyLogoX + 50, companyLogoY + 35);
    doc.text('[Phone]', companyLogoX + 50, companyLogoY + 45);
    doc.text('[Email]', companyLogoX + 50, companyLogoY + 55);

    // Invoice title (top right)
    doc.setFontSize(24);
    doc.setTextColor(0, 0, 0);
    doc.text('Invoice', pageWidth - 60, 30);

    // Invoice details box
    const invoiceDetailsY = 70;
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    
    // Invoice details
    doc.text('Invoice #:', 20, invoiceDetailsY);
    doc.text(invoiceData.invoiceNumber, 60, invoiceDetailsY);
    
    doc.text('Invoice Date:', 20, invoiceDetailsY + 10);
    doc.text(new Date(invoiceData.invoiceDate).toLocaleDateString('en-GB'), 60, invoiceDetailsY + 10);
    
    doc.text('Terms:', 20, invoiceDetailsY + 20);
    doc.text(invoiceData.paymentTerms, 60, invoiceDetailsY + 20);
    
    doc.text('Due Date:', 20, invoiceDetailsY + 30);
    doc.text(new Date(invoiceData.dueDate).toLocaleDateString('en-GB'), 60, invoiceDetailsY + 30);

    // Customer details
    const customerY = invoiceDetailsY + 50;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(selectedCustomer?.name || 'Customer Name', 20, customerY);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    if (selectedCustomer?.company) {
      doc.text(selectedCustomer.company, 20, customerY + 10);
    }
    if (selectedCustomer?.address) {
      doc.text(selectedCustomer.address, 20, customerY + 20);
    }
    if (selectedCustomer?.city) {
      doc.text(`${selectedCustomer.city}, ${selectedCustomer.state} ${selectedCustomer.pincode}`, 20, customerY + 30);
    }

    // Items table
    const tableStartY = customerY + 50;
    const tableData = invoiceItems.map((item, index) => [
      (index + 1).toString(),
      item.itemName,
      item.quantity.toString() + ' pcs',
      '₹' + item.unitPrice.toFixed(2),
      '₹' + item.totalPrice.toFixed(2)
    ]);

    autoTable(doc, {
      startY: tableStartY,
      head: [['#', 'Description', 'Qty', 'Rate', 'Amount']],
      body: tableData,
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 5,
      },
      headStyles: {
        fillColor: [240, 240, 240],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 15 },
        1: { halign: 'left', cellWidth: 80 },
        2: { halign: 'center', cellWidth: 25 },
        3: { halign: 'right', cellWidth: 30 },
        4: { halign: 'right', cellWidth: 30 },
      },
    });

    // Get table end position
    const tableEndY = (doc as any).lastAutoTable.finalY + 10;

    // Totals section
    const totalsX = pageWidth - 80;
    doc.setFontSize(10);
    
    doc.text('Sub Total:', totalsX - 30, tableEndY);
    doc.text('₹' + subtotal.toFixed(2), totalsX + 10, tableEndY);

    if (discountAmount > 0) {
      doc.text('Discount:', totalsX - 30, tableEndY + 10);
      doc.text('(-) ₹' + discountAmount.toFixed(2), totalsX + 10, tableEndY + 10);
    }

    if (taxAmount > 0) {
      doc.text('Tax:', totalsX - 30, tableEndY + 20);
      doc.text('₹' + taxAmount.toFixed(2), totalsX + 10, tableEndY + 20);
    }

    doc.setFont('helvetica', 'bold');
    doc.text('Total:', totalsX - 30, tableEndY + 30);
    doc.text('₹' + totalAmount.toFixed(2), totalsX + 10, tableEndY + 30);

    // Amount in words
    const amountInWords = numberToWords(Math.floor(totalAmount));
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Total In Words:', 20, tableEndY + 20);
    doc.text(`Indian Rupee ${amountInWords}`, 20, tableEndY + 30);

    // Payment info placeholder (will be populated when Profile is implemented)
    const paymentInfoY = tableEndY + 50;
    doc.setFontSize(10);
    doc.text('Thanks for your business.', 20, paymentInfoY);
    
    doc.setFontSize(9);
    doc.text('Name - [Company Name]', 20, paymentInfoY + 15);
    doc.text('Account - [Account Number]', 20, paymentInfoY + 25);
    doc.text('IFSC code - [IFSC Code]', 20, paymentInfoY + 35);
    doc.text('Address - [Bank Address]', 20, paymentInfoY + 45);

    // Terms and conditions
    const termsY = paymentInfoY + 65;
    doc.setFontSize(8);
    doc.text('- An invoice will be provided for all transactions, specifying itemized', 20, termsY);
    doc.text('  charges, rental period, and total amount.', 20, termsY + 8);
    doc.text('- Disputes regarding invoices must be raised within 2 days of receipt.', 20, termsY + 16);
    doc.text('- The customer is liable for any damage or loss to rented equipment', 20, termsY + 24);
    doc.text('  during the rental period.', 20, termsY + 32);
    doc.text('- Charges for repair or replacement will be billed separately.', 20, termsY + 40);

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
      const itemPromises = invoiceItems.map(item => 
        apiRequest('/api/invoice-items', {
          method: 'POST',
          body: JSON.stringify({
            ...item,
            invoiceId: data.id,
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
      invoiceNumber: generateInvoiceNumber(),
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      customerEmail: selectedCustomer.email,
      customerPhone: selectedCustomer.phone,
      customerAddress: selectedCustomer.address || '',
      invoiceDate,
      dueDate,
      status: 'pending',
      subtotal: subtotal.toFixed(2),
      taxAmount: taxAmount.toFixed(2),
      discountAmount: discountAmount.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
      currency,
      notes,
      paymentTerms,
      isRecurring: false,
    };

    createInvoiceMutation.mutate(invoiceData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white border-black">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Create Invoice</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
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
      </DialogContent>
    </Dialog>
  );
}