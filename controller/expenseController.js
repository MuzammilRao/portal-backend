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

// NEW FUNCTION: Delete Opening Balance
exports.deleteOpeningBalance = CatchAsync(async (req, res, next) => {
  const { id } = req.params;
  // const { adjustFutureMonths = true } = req.query;

  let adjustFutureMonths = true;
  if (!id) {
    return next(new AppError('Opening Balance ID is required', 400));
  }

  const openingBalance = await OpeningBalance.findById(id);
  if (!openingBalance) {
    return next(new AppError('Opening Balance not found', 404));
  }

  // Get the month and year of the opening balance
  const { month, year, totalOpeningBalance } = openingBalance;
  
  // Check if there are future months that might be affected
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  
  const futureBalanceExists = await OpeningBalance.findOne({ 
    month: nextMonth, 
    year: nextYear 
  });

  if (futureBalanceExists && !adjustFutureMonths) {
    return next(new AppError(
      'This opening balance may affect future months. Set adjustFutureMonths=true to delete and adjust future records.', 
      400
    ));
  }

  // If we're adjusting future months, calculate the current month's remaining balance
  if (adjustFutureMonths && futureBalanceExists) {
    // Calculate remaining balance for current month
    const currentMonthExpenses = await Expense.find({ month, year });
    const totalExpenses = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const remainingBalance = totalOpeningBalance - totalExpenses;
    
    // Adjust the next month's opening balance
    const adjustmentAmount = -remainingBalance; // Subtract what would have carried over
    
    // Update the next month's opening balance
    futureBalanceExists.totalOpeningBalance += adjustmentAmount;
    futureBalanceExists.history.push({
      amount: adjustmentAmount,
      date: new Date(),
      note: `Automatic adjustment due to deletion of previous month's opening balance`
    });
    
    await futureBalanceExists.save();
  }

  // Now safe to delete the opening balance
  await OpeningBalance.findByIdAndDelete(id);

  res.status(200).json({
    status: 'success',
    message: 'Opening Balance deleted successfully',
    adjustedFutureMonths: adjustFutureMonths && futureBalanceExists ? true : false
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

// NEW FUNCTION: Delete Expense
exports.deleteExpense = CatchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new AppError('Expense ID is required', 400));
  }

  const expense = await Expense.findById(id);
  if (!expense) {
    return next(new AppError('Expense not found', 404));
  }
  
  // If the expense has a file, delete it from Cloudinary
  if (expense.file) {
    try {
      // Extract the public_id from the file URL
      const urlParts = expense.file.split('/');
      const filename = urlParts[urlParts.length - 1].split('.')[0];
      
      await cloudinary.uploader.destroy(filename);
    } catch (error) {
      // Continue with expense deletion even if file deletion fails
      console.error('Error deleting file from Cloudinary:', error);
    }
  }

  await Expense.findByIdAndDelete(id);

  res.status(200).json({
    status: 'success',
    message: 'Expense deleted successfully',
  });
});

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

// Update to include expenses by category
exports.getOverviewReportWithCategories = CatchAsync(async (req, res, next) => {
  const currentDate = new Date();
  const month = req.query.month ? parseInt(req.query.month) : currentDate.getMonth() + 1;
  const year = req.query.year ? parseInt(req.query.year) : currentDate.getFullYear();

  const openingBalance = await OpeningBalance.find({ month, year });
  let monthlyOpeningBalance = openingBalance.reduce((sum, op) => sum + op.totalOpeningBalance, 0);

  // Get expenses and populate categories
  const expenses = await Expense.find({ month, year }).populate('category');
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Group expenses by category
  const expensesByCategory = {};
  expenses.forEach(expense => {
    const categoryName = expense.category ? expense.category.name : 'Uncategorized';
    if (!expensesByCategory[categoryName]) {
      expensesByCategory[categoryName] = 0;
    }
    expensesByCategory[categoryName] += expense.amount;
  });

  const remainingBalance = monthlyOpeningBalance - totalExpenses;

  res.status(200).json({
    status: 'success',
    data: {
      month,
      year,
      openingBalance: monthlyOpeningBalance,
      totalExpenses,
      remainingBalance,
      expensesByCategory,
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

// NEW FUNCTION: Delete a category
exports.deleteCategory = CatchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new AppError('Category ID is required', 400));
  }

  // Check if category exists
  const category = await ExpenseCategory.findById(id);
  if (!category) {
    return next(new AppError('Category not found', 404));
  }

  // Check if category is being used by any expenses
  const categoryInUse = await Expense.findOne({ category: id });
  if (categoryInUse) {
    return next(new AppError('Cannot delete category that is being used by expenses', 400));
  }

  await ExpenseCategory.findByIdAndDelete(id);

  res.status(200).json({
    status: 'success',
    message: 'Category deleted successfully',
  });
});