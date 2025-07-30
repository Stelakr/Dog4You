const Question = require('../models/Question');
const { validationResult } = require('express-validator');

/**
 * @desc Get all questions (paginated)
 * @route GET /api/questions
 */

const getAllQuestions = async (req, res, next )=> {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const sort = req.query.sort || 'order';

        const questions = await Question.find()
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await Question.countDocuments();

        res.json({
            success: true,
            count: questions.length,
            total,
            page,
            pages: Math.ceil(total / limit),
            data: questions
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc Create a new question
 * @route POST /api/questions
 */
const createQuestion = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()){
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        const { text, type, options, required, trait, category, order} = req.body;
        const question = new Question({text, type, options, required, trait, category, order });
        const saved = await question.save();

        res.status(201).json({
            success: true,
            data: saved
        });
    } catch (err) {
        if (err.code ===11000) {
            return res.status(400).json({
                success: false,
                error: 'Question with similar properties already exists'
            });
        }
        next(err);
    }
};

/**
 * @desc Group questions by category
 * @route GET /api/questions/categories
 */
const getQuestionsByCategory = async (req, res, next) => {
    try {
        const questions = await Question.aggregate([
            {
                $group: {
                    _id: '$category',
                    questions: { $push: '$$ROOT' }
                }
            },
            { $sort: { '_id':1 } }
        ]);

        res.json({
            success: true,
            data: questions
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getAllQuestions,
    createQuestion,
    getQuestionsByCategory
};