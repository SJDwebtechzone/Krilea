import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import { env } from '../config/env.js';

export interface InvoiceData {
  invoiceNumber: string;
  orderNumber: string;
  orderDate?: Date | string;
  date?: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: any;
    city?: string;
    state?: string;
    pincode?: string;
  };
  items: Array<{
    name: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  paymentStatus?: string;
  paymentMethod?: string;
}

export async function generateInvoicePDF(data: InvoiceData): Promise<string> {
  const invoicesDir = env.INVOICE_DIR;
  if (!fs.existsSync(invoicesDir)) {
    fs.mkdirSync(invoicesDir, { recursive: true });
  }

  const fileName = `invoice-${data.invoiceNumber}.pdf`;
  const filePath = path.join(invoicesDir, fileName);

  const formattedDate = data.date || (data.orderDate ? new Date(data.orderDate).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN'));
  const customerAddressStr = typeof data.customer.address === 'string'
    ? data.customer.address
    : `${data.customer.address?.addressLine1 || ''}, ${data.customer.address?.city || ''}, ${data.customer.address?.state || ''} - ${data.customer.address?.pincode || ''}`;

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    // Header & Brand
    doc
      .fillColor('#0c3328')
      .fontSize(24)
      .font('Helvetica-Bold')
      .text('KRILÉA', 40, 40)
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#8a7147')
      .text('TIMELESS YOURS • 925 STERLING JEWELLERY', 40, 68)
      .fillColor('#444444')
      .fontSize(9)
      .text('support@krilea.in | +91 93647 33735 | Chennai, Tamil Nadu, India', 40, 82);

    // Invoice Title & Info
    doc
      .fontSize(18)
      .font('Helvetica-Bold')
      .fillColor('#0c3328')
      .text('TAX INVOICE', 400, 40, { align: 'right' })
      .fontSize(9)
      .font('Helvetica')
      .fillColor('#555555')
      .text(`Invoice No: ${data.invoiceNumber}`, 400, 65, { align: 'right' })
      .text(`Order No: ${data.orderNumber}`, 400, 78, { align: 'right' })
      .text(`Date: ${formattedDate}`, 400, 91, { align: 'right' });

    if (data.paymentStatus) {
      doc.text(`Payment: ${data.paymentStatus.toUpperCase()} (${data.paymentMethod || 'Online'})`, 400, 104, { align: 'right' });
    }

    doc.moveTo(40, 125).lineTo(555, 125).strokeColor('#e4c590').lineWidth(1).stroke();

    // Bill To
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .fillColor('#0c3328')
      .text('BILLED & SHIPPED TO:', 40, 140)
      .font('Helvetica')
      .fontSize(9)
      .fillColor('#333333')
      .text(data.customer.name, 40, 155)
      .text(customerAddressStr, 40, 168)
      .text(`Phone: ${data.customer.phone}`, 40, 181)
      .text(`Email: ${data.customer.email}`, 40, 194);

    // Items Table Header
    const tableTop = 230;
    doc
      .rect(40, tableTop, 515, 22)
      .fill('#0c3328');

    doc
      .fillColor('#ffffff')
      .font('Helvetica-Bold')
      .fontSize(9)
      .text('SL', 48, tableTop + 6)
      .text('ITEM DESCRIPTION', 75, tableTop + 6)
      .text('SKU', 290, tableTop + 6)
      .text('QTY', 370, tableTop + 6, { align: 'center', width: 40 })
      .text('UNIT PRICE', 420, tableTop + 6, { align: 'right', width: 60 })
      .text('TOTAL (INR)', 490, tableTop + 6, { align: 'right', width: 60 });

    let currentY = tableTop + 25;
    doc.font('Helvetica').fontSize(9).fillColor('#333333');

    data.items.forEach((item, index) => {
      const isEven = index % 2 === 0;
      if (isEven) {
        doc.rect(40, currentY, 515, 20).fill('#f9f8f4');
      }

      doc
        .fillColor('#333333')
        .text((index + 1).toString(), 48, currentY + 5)
        .text(item.name, 75, currentY + 5, { width: 200, ellipsis: true })
        .text(item.sku, 290, currentY + 5)
        .text(item.quantity.toString(), 370, currentY + 5, { align: 'center', width: 40 })
        .text(`₹${item.unitPrice.toFixed(2)}`, 420, currentY + 5, { align: 'right', width: 60 })
        .text(`₹${item.totalPrice.toFixed(2)}`, 490, currentY + 5, { align: 'right', width: 60 });

      currentY += 20;
    });

    doc.moveTo(40, currentY + 5).lineTo(555, currentY + 5).strokeColor('#e4c590').lineWidth(0.5).stroke();
    currentY += 15;

    // Totals Box
    const totalsLeft = 360;
    doc
      .fontSize(9)
      .text('Subtotal:', totalsLeft, currentY)
      .text(`₹${data.subtotal.toFixed(2)}`, 480, currentY, { align: 'right', width: 75 });
    
    currentY += 15;
    doc
      .text('GST (3%):', totalsLeft, currentY)
      .text(`₹${data.tax.toFixed(2)}`, 480, currentY, { align: 'right', width: 75 });

    currentY += 15;
    doc
      .text('Shipping:', totalsLeft, currentY)
      .text(data.shipping === 0 ? 'FREE' : `₹${data.shipping.toFixed(2)}`, 480, currentY, { align: 'right', width: 75 });

    if (data.discount > 0) {
      currentY += 15;
      doc
        .text('Discount:', totalsLeft, currentY)
        .text(`-₹${data.discount.toFixed(2)}`, 480, currentY, { align: 'right', width: 75 });
    }

    currentY += 18;
    doc.rect(totalsLeft - 5, currentY - 3, 200, 24).fill('#0c3328');
    doc
      .fillColor('#e4c590')
      .font('Helvetica-Bold')
      .fontSize(11)
      .text('GRAND TOTAL:', totalsLeft, currentY + 4)
      .text(`₹${data.total.toFixed(2)}`, 470, currentY + 4, { align: 'right', width: 80 });

    // Footer
    doc
      .fontSize(8)
      .font('Helvetica')
      .fillColor('#777777')
      .text('Thank you for choosing Kriléa. For support or warranty queries, contact support@krilea.in', 40, 750, {
        align: 'center',
        width: 515,
      })
      .text('This is a computer-generated invoice and requires no signature.', 40, 765, {
        align: 'center',
        width: 515,
      });

    doc.end();

    stream.on('finish', () => resolve(filePath));
    stream.on('error', reject);
  });
}

export const generateInvoicePdf = generateInvoicePDF;
