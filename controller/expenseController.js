const { Expense, ExpenseCategory, OpeningBalance } = require('../model/expenseModel');
const AppError = require('../utils/appError');
const CatchAsync = require('../utils/CatchAsync');
const cloudinary = require('../utils/cloudinary');

exports.addCategory = CatchAsync(async (req, res, next) => {
  // req.body.createdBy = req.user._id;
  const { name } = req.body;

  const categoryExists = await ExpenseCategory.findOne({ name });
  if (categoryExists) {
    return next(new AppError('Category already exists', 400));
  }

  const category = await ExpenseCategory.create({ ...req.body });

  res.status(201).json({
    status: 'success',
    data: { category },
  });
});

exports.getCategories = CatchAsync(async (req, res, next) => {
  const categories = await ExpenseCategory.find();

  res.status(200).json({
    status: 'success',
    data: { categories },
  });
});

exports.addOpeningAmount = CatchAsync(async (req, res, next) => {
  let { amount, note = 'Default', month, year } = req.body;

  if (!amount) {
    return next(new AppError('Amount is required', 400));
  }

  const currentDate = new Date();
  month = month || currentDate.getMonth() + 1;
  year = year || currentDate.getFullYear();

  const openingBalance = await OpeningBalance.create({
    totalOpeningBalance: parseFloat(amount),
    month,
    year,
    note,
    history: [{ amount: parseFloat(amount), date: new Date() }],
  });

  res.status(201).json({
    status: 'success',
    data: { openingBalance },
  });
});

exports.getOpeningBalances = CatchAsync(async (req, res, next) => {
  // Use current date if month and year are not provided
  const currentDate = new Date();
  const month = req.query.month ? parseInt(req.query.month) : currentDate.getMonth() + 1; // 0-based index
  const year = req.query.year ? parseInt(req.query.year) : currentDate.getFullYear();

  const openingBalances = await OpeningBalance.find({ month, year });

  // if (!openingBalances || openingBalances.length === 0) {
  //   return next(new AppError('No opening balances found for the specified month and year', 404));
  // }

  res.status(200).json({
    status: 'success',
    data: openingBalances,
  });
});

exports.addExpense = CatchAsync(async (req, res, next) => {
  const { title, amount, category, file } = req.body;

  // Validate required fields
  if (!title || !amount || !category) {
    return next(new AppError('Title, amount, and category are required', 400));
  }

  // Default upload options
  const options = {
    use_filename: true,
    unique_filename: false,
    overwrite: true,
    upload_preset: 'inviz_brand_logos',
  };

  let fileUrl;

  // Handle file upload dynamically based on type
  if (file) {
    try {
      const base64HeaderRegex = /^data:(.*?);base64,/;
      const mimeTypeMatch = file.match(base64HeaderRegex);
      const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : null;

      const uploadOptions = { ...options };
      console.log(mimeType);
      // Set resource type based on file type
      if (mimeType) {
        if (mimeType.startsWith('image/')) {
          uploadOptions.resource_type = 'image';
        } else {
          uploadOptions.resource_type = 'raw';
        }
      }

      // Upload file to Cloudinary
      const uploadRes = await cloudinary.uploader.upload(file, uploadOptions);
      fileUrl = uploadRes.url ?? null;
      req.body.file = fileUrl;
    } catch (error) {
      return next(new AppError('File upload failed. Please try again.', 500));
    }
  }

  // Add date details to request body
  const currentDate = new Date();
  req.body.date = currentDate;
  req.body.month = currentDate.getMonth() + 1;
  req.body.year = currentDate.getFullYear();

  // Check if category exists
  const categoryExists = await ExpenseCategory.findById(category);
  if (!categoryExists) {
    return next(new AppError('Category not found', 404));
  }

  // Create expense
  const expense = await Expense.create(req.body);

  // Populate category in the created expense
  const populatedExpense = await Expense.findById(expense._id).populate('category');

  res.status(201).json({
    status: 'success',
    data: { expense: populatedExpense },
  });
});

exports.getAllExpenses = CatchAsync(async (req, res, next) => {
  const { month, year } = req.query;

  let filter = {};
  if (month && year) {
    filter.month = month;
    filter.year = year;
  }

  const expenses = await Expense.find(filter)
    .populate('category', 'name') // Populate category details
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: 'success',
    data: { expenses },
  });
});

// exports.updateExpense = CatchAsync(async (req, res, next) => {
//   const { id } = req.params; // Expense ID
//   const { title, amount, category } = req.body;

//   if (!id) {
//     return next(new AppError('Expense ID is required', 400));
//   }

//   // Find the expense to be updated
//   const expense = await Expense.findById(id);
//   if (!expense) {
//     return next(new AppError('Expense not found', 404));
//   }

//   const previousAmount = expense.amount;
//   const previousMonth = expense.month;
//   const previousYear = expense.year;

//   // Update expense fields
//   expense.title = title || expense.title;
//   expense.amount = amount || expense.amount;
//   expense.category = category || expense.category;
//   await expense.save();

//   // Check if the amount has changed
//   // if (previousAmount !== expense.amount) {
//   //   const amountDifference = expense.amount - previousAmount;

//   //   // Adjust balances for the affected month and subsequent months
//   //   let currentMonth = previousMonth;
//   //   let currentYear = previousYear;

//   //   while (true) {
//   //     const openingBalance = await OpeningBalance.findOne({
//   //       month: currentMonth,
//   //       year: currentYear,
//   //     });

//   //     if (!openingBalance) break;

//   //     openingBalance.totalOpeningBalance -= amountDifference;
//   //     openingBalance.history.push({
//   //       amount: -amountDifference,
//   //       date: new Date(),
//   //     });

//   //     await openingBalance.save();

//   //     // Move to the next month
//   //     currentMonth = currentMonth === 12 ? 1 : currentMonth + 1;
//   //     currentYear = currentMonth === 1 ? currentYear + 1 : currentYear;
//   //   }
//   // }

//   res.status(200).json({
//     status: 'success',
//     data: { expense },
//   });
// });

exports.updateExpense = CatchAsync(async (req, res, next) => {
  const { id } = req.params; // Expense ID
  const { title, amount, category, file } = req.body;

  if (!id) {
    return next(new AppError('Expense ID is required', 400));
  }

  // Find the expense to be updated
  const expense = await Expense.findById(id);
  if (!expense) {
    return next(new AppError('Expense not found', 404));
  }

  // Handle file upload if a new file is provided
  let fileUrl = expense.file; // Retain the existing file if no new file is provided
  if (file) {
    const options = {
      use_filename: true,
      unique_filename: false,
      overwrite: true,
      upload_preset: 'inviz_brand_logos',
    };

    const uploadRes = await cloudinary.uploader.upload(file, options);
    fileUrl = uploadRes.url ?? fileUrl; // Use the new file URL if upload is successful
  }

  // Update expense fields
  expense.title = title || expense.title;
  expense.amount = amount || expense.amount;
  expense.category = category || expense.category;
  expense.file = fileUrl;
  await expense.save();

  // Populate category in the updated expense
  const updatedExpense = await Expense.findById(expense._id).populate('category');

  res.status(200).json({
    status: 'success',
    data: { expense: updatedExpense },
  });
});

exports.getOverviewReport = CatchAsync(async (req, res, next) => {
  const currentDate = new Date();
  const month = req.query.month ? parseInt(req.query.month) : currentDate.getMonth() + 1; // 0-based index
  const year = req.query.year ? parseInt(req.query.year) : currentDate.getFullYear();

  const openingBalance = await OpeningBalance.find({ month, year });
  if (!openingBalance) {
    return next(new AppError('No opening balance found for the specified month and year', 404));
  }
  let monthlyOpeningBalance = openingBalance.reduce((sum, op) => sum + op.totalOpeningBalance, 0);

  const expenses = await Expense.find({ month, year });
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  const remainingBalance = monthlyOpeningBalance - totalExpenses;

  res.status(200).json({
    status: 'success',
    data: {
      month,
      year,
      openingBalance: monthlyOpeningBalance,
      totalExpenses,
      remainingBalance,
      // expensesByCategory,
    },
  });
});

exports.getMonthlySummary = async (req, res, next) => {
  try {
    const { year } = req.query;

    if (!year) {
      return res.status(400).json({
        status: 'fail',
        message: 'Year is required',
      });
    }

    // Define month names
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    // Aggregate expenses by month and year
    const expensesData = await Expense.aggregate([
      {
        $match: { year: parseInt(year) }, // Filter by the provided year
      },
      {
        $group: {
          _id: { month: '$month', year: '$year' },
          totalExpenses: { $sum: '$amount' },
        },
      },
      {
        $project: {
          month: '$_id.month',
          year: '$_id.year',
          totalExpenses: 1,
          _id: 0,
        },
      },
    ]);

    // Aggregate opening balances by month and year
    const openingBalancesData = await OpeningBalance.aggregate([
      {
        $match: { year: parseInt(year) }, // Filter by the provided year
      },
      {
        $group: {
          _id: { month: '$month', year: '$year' },
          totalOpeningBalance: { $sum: '$totalOpeningBalance' },
        },
      },
      {
        $project: {
          month: '$_id.month',
          year: '$_id.year',
          totalOpeningBalance: 1,
          _id: 0,
        },
      },
    ]);

    // Create a summary array with all months
    const summaryData = monthNames.map((monthName, index) => {
      const month = index + 1;

      const expenses = expensesData.find((e) => e.month === month) || { totalExpenses: 0 };
      const openingBalance = openingBalancesData.find((o) => o.month === month) || {
        totalOpeningBalance: 0,
      };

      const remainingAmount = openingBalance.totalOpeningBalance - expenses.totalExpenses;

      return {
        monthName,
        totalOpeningBalance: openingBalance.totalOpeningBalance,
        totalExpenses: expenses.totalExpenses,
        remainingAmount,
      };
    });

    res.status(200).json({
      status: 'success',
      data: summaryData,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while fetching the summary',
      error: error.message,
    });
  }
};
//   // // Prepare a detailed report of expenses grouped by category
// const expensesByCategory = await Expense.aggregate([
//   { $match: { month, year } },
//   {
//     $group: {
//       _id: '$category',
//       totalAmount: { $sum: '$amount' },
//       expenses: { $push: '$$ROOT' }, // Include all expense details in the group
//     },
//   },
//   {
//     $lookup: {
//       from: 'expensecategories', // Match the name of your category collection
//       localField: '_id',
//       foreignField: '_id',
//       as: 'categoryDetails',
//     },
//   },
//   {
//     $project: {
//       category: { $arrayElemAt: ['$categoryDetails.name', 0] },
//       totalAmount: 1,
//       expenses: 1,
//     },
//   },
// ]);
