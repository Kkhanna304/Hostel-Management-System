const Visitor = require('../models/Visitor');
const PDFDocument = require('pdfkit');
const crypto = require('crypto');

const HOSTEL_NAME = 'Drowsy Hostel Management';

const createVisitorId = () => `VIS-${Date.now()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

const getEndOfVisitDay = (visitDate) => {
    const expiryDate = new Date(visitDate);
    expiryDate.setHours(23, 59, 59, 999);
    return expiryDate;
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

// Create Visitor Request (Student)
const createVisitor = async (req, res) => {
    try {
        const { visitorName, relation, visitDate } = req.body;

        const visitor = await Visitor.create({
            student: req.user.id,
            visitorName,
            relation,
            visitDate
        });

        res.status(201).json({
            message: 'Visitor request submitted',
            visitor
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get My Visitors (Student)
const getMyVisitors = async (req, res) => {
    try {
        const visitors = await Visitor.find({ student: req.user.id })
            .sort({ createdAt: -1 })
            .populate('student', 'name email')
            .populate('reviewedBy', 'name email');

        res.json(visitors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get All Visitors (Admin)
const getAllVisitors = async (req, res) => {
    try {
        const visitors = await Visitor.find()
            .sort({ createdAt: -1 })
            .populate('student', 'name email')
            .populate('reviewedBy', 'name email');

        res.json(visitors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update Visitor Status (Admin)
const updateVisitorStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminNote = '' } = req.body;

        const visitor = await Visitor.findById(id);

        if (!visitor) {
            return res.status(404).json({ message: 'Visitor request not found' });
        }

        // Validate status
        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({
                message: 'Invalid status. Use approved or rejected'
            });
        }

        visitor.status = status;
        visitor.adminNote = adminNote;
        visitor.reviewedBy = req.user.id;
        visitor.reviewedAt = new Date();

        if (status === 'approved') {
            visitor.visitorId = visitor.visitorId || createVisitorId();
            visitor.idCardExpiresAt = getEndOfVisitDay(visitor.visitDate);
        }

        if (status === 'rejected') {
            visitor.visitorId = undefined;
            visitor.idCardExpiresAt = undefined;
        }

        await visitor.save();

        const updatedVisitor = await Visitor.findById(visitor._id)
            .populate('student', 'name email')
            .populate('reviewedBy', 'name email');

        res.json({
            message: `Visitor ${status}`,
            visitor: updatedVisitor
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Download Visitor ID Card (Student owner or Admin)
const downloadVisitorIdCard = async (req, res) => {
    try {
        const visitor = await Visitor.findById(req.params.id)
            .populate('student', 'name email');

        if (!visitor) {
            return res.status(404).json({ message: 'Visitor request not found' });
        }

        const isOwner = visitor.student._id.toString() === req.user.id;
        const isAdmin = req.user.role === 'admin';

        if (!isAdmin && !isOwner) {
            return res.status(403).json({ message: 'Not allowed to download this ID card' });
        }

        if (visitor.status !== 'approved' || !visitor.visitorId) {
            return res.status(400).json({ message: 'ID card is available only for approved visitors' });
        }

        if (visitor.idCardExpiresAt && new Date(visitor.idCardExpiresAt) < new Date()) {
            return res.status(410).json({ message: 'Visitor ID card has expired' });
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=visitor-id-${visitor.visitorId}.pdf`);

        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        doc.pipe(res);

        doc.fontSize(22).text(HOSTEL_NAME, { align: 'center' }).moveDown(0.5);
        doc.fontSize(16).text('Visitor ID Card', { align: 'center' }).moveDown(1.5);
        doc.roundedRect(90, 150, 415, 250, 12).lineWidth(1.5).stroke('#1d4ed8');

        doc
            .fontSize(14)
            .text(`Visitor ID: ${visitor.visitorId}`, 120, 185)
            .moveDown(0.8)
            .text(`Visitor Name: ${visitor.visitorName}`)
            .text(`Student Name: ${visitor.student.name}`)
            .text(`Visit Date: ${formatDate(visitor.visitDate)}`)
            .text(`Valid Until: ${formatDate(visitor.idCardExpiresAt)}`)
            .text(`Hostel Name: ${HOSTEL_NAME}`);

        doc.rect(395, 220, 70, 70).stroke('#94a3b8');
        doc.fontSize(9).text('QR CODE', 410, 250);
        doc.fontSize(10).text('This visitor pass is valid only for the approved visit date.', 120, 360);

        doc.end();

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createVisitor,
    getMyVisitors,
    getAllVisitors,
    updateVisitorStatus,
    downloadVisitorIdCard
};
