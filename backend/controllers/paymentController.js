const Payment = require('../models/Payment');
const PDFDocument = require('pdfkit');

const feeTypeLabels = {
    monthly_hostel: 'Monthly Hostel Fee',
    mess: 'Mess Fee',
    fine: 'Fine',
    other: 'Other'
};

const formatDate = (date) => {
    if (!date) {
        return '-';
    }

    return new Date(date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
};

// Make Payment (Admin or Student)
const makePayment = async (req, res) => {
    try {
        const {
            amount,
            dueDate = new Date(),
            feeType = 'monthly_hostel',
            lateFee = 0,
            status = 'pending',
            student
        } = req.body;

        let studentId;

        // ✅ If admin → use selected student
        if (req.user.role === 'admin') {
            if (!student) {
                return res.status(400).json({ message: 'Student ID required' });
            }
            studentId = student;
        }

        // ✅ If student → use own ID
        if (req.user.role === 'student') {
            studentId = req.user.id;
        }

        if (!amount || Number(amount) <= 0) {
            return res.status(400).json({ message: 'Valid amount is required' });
        }

        if (Number(lateFee) < 0) {
            return res.status(400).json({ message: 'Late fee cannot be negative' });
        }

        if (feeType && !['monthly_hostel', 'mess', 'fine', 'other'].includes(feeType)) {
            return res.status(400).json({ message: 'Invalid fee type' });
        }

        if (!['pending', 'paid', 'failed', 'refunded'].includes(status)) {
            return res.status(400).json({ message: 'Invalid payment status' });
        }

        const payment = await Payment.create({
            student: studentId,
            feeType,
            amount,
            lateFee,
            dueDate,
            status,
            paymentDate: status === 'paid' ? new Date() : undefined
        });

        res.status(201).json({
            message: 'Payment record created successfully',
            payment
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get My Payments (Student)
const getMyPayments = async (req, res) => {
    try {
        const payments = await Payment.find({
            student: req.user.id
        })
            .sort({ dueDate: -1 })
            .populate('student', 'name email');

        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get All Payments (Admin)
const getAllPayments = async (req, res) => {
    try {
        const payments = await Payment.find()
            .sort({ dueDate: -1 })
            .populate('student', 'name email');

        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update Payment Status (Admin)
const updatePaymentStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!['pending', 'paid', 'failed', 'refunded'].includes(status)) {
            return res.status(400).json({ message: 'Invalid payment status' });
        }

        const payment = await Payment.findById(req.params.id);

        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        payment.status = status;
        payment.paymentDate = status === 'paid' ? new Date() : undefined;

        await payment.save();

        const updatedPayment = await Payment.findById(payment._id)
            .populate('student', 'name email');

        res.json({
            message: 'Payment status updated successfully',
            payment: updatedPayment
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Download Receipt (Admin or payment owner)
const downloadReceipt = async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id)
            .populate('student', 'name email');

        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        const isOwner = payment.student._id.toString() === req.user.id;
        const isAdmin = req.user.role === 'admin';

        if (!isAdmin && !isOwner) {
            return res.status(403).json({ message: 'Not allowed to download this receipt' });
        }

        if (payment.status !== 'paid') {
            return res.status(400).json({ message: 'Receipt is available only for paid payments' });
        }

        const totalAmount = payment.amount + (payment.lateFee || 0);
        const receiptNumber = `DROWSY-${payment._id.toString().slice(-8).toUpperCase()}`;

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename=receipt-${receiptNumber}.pdf`
        );

        const doc = new PDFDocument({ margin: 50 });
        doc.pipe(res);

        doc
            .fontSize(22)
            .text('Drowsy Hostel Management', { align: 'center' })
            .moveDown(0.5);

        doc
            .fontSize(16)
            .text('Payment Receipt', { align: 'center' })
            .moveDown(1.5);

        doc.fontSize(11);
        doc.text(`Receipt No: ${receiptNumber}`);
        doc.text(`Generated On: ${formatDate(new Date())}`);
        doc.moveDown();

        doc.text(`Student Name: ${payment.student.name}`);
        doc.text(`Student Email: ${payment.student.email}`);
        doc.moveDown();

        doc.text(`Fee Type: ${feeTypeLabels[payment.feeType] || payment.feeType}`);
        doc.text(`Due Date: ${formatDate(payment.dueDate)}`);
        doc.text(`Payment Date: ${formatDate(payment.paymentDate)}`);
        doc.text(`Status: ${payment.status.toUpperCase()}`);
        doc.moveDown();

        doc.text(`Amount: Rs. ${payment.amount}`);
        doc.text(`Late Fee: Rs. ${payment.lateFee || 0}`);
        doc
            .fontSize(14)
            .text(`Total Paid: Rs. ${totalAmount}`, { underline: true });

        doc.moveDown(2);
        doc
            .fontSize(10)
            .text('This is a system-generated receipt.', { align: 'center' });

        doc.end();

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    makePayment,
    getMyPayments,
    getAllPayments,
    updatePaymentStatus,
    downloadReceipt
};
