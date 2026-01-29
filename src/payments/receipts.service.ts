import { Injectable } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import type { Response } from 'express';

@Injectable()
export class ReceiptsService {
  async generateReceipt(paymentData: any, userData: any, res: Response) {
    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=receipt-${paymentData._id}.pdf`);

    doc.pipe(res);

    // Header
    doc
      .fillColor('#000080')
      .fontSize(20)
      .text('ROYAL AMBASSADORS OF NIGERIA', { align: 'center' })
      .fontSize(12)
      .text('Official Payment Receipt', { align: 'center' })
      .moveDown();

    // Divider
    doc.moveTo(50, 110).lineTo(550, 110).stroke();

    // Content
    doc
      .fillColor('#000')
      .fontSize(12)
      .moveDown()
      .text(`Receipt ID: ${paymentData._id}`, { align: 'right' })
      .text(`Date: ${new Date().toLocaleDateString()}`, { align: 'right' })
      .moveDown()
      .text(`Received From: ${userData.firstName} ${userData.lastName}`)
      .text(`RA ID: ${userData.userCode}`)
      .text(`Church: ${userData.church || 'N/A'}`)
      .moveDown();

    doc
      .fontSize(14)
      .text('Payment Details', { underline: true })
      .fontSize(12)
      .moveDown()
      .text(`Payment Type: ${paymentData.type.toUpperCase()}`)
      .text(`Amount: NGN ${paymentData.amount.toLocaleString()}`)
      .text(`Status: ${paymentData.status.toUpperCase()}`)
      .moveDown();

    // Footer
    doc.moveTo(50, doc.page.height - 100).lineTo(550, doc.page.height - 100).stroke();
    doc
      .fontSize(10)
      .text('Thank you for your commitment to the Royal Ambassadors.', { align: 'center', baseline: 'bottom' });

    doc.end();
  }
}
