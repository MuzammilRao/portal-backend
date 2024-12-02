const AppError = require('../utils/appError');
const CatchAsync = require('../utils/CatchAsync');
const Item = require('../model/itemModel');

exports.createItem = CatchAsync(async (req, res, next) => {
  const createdItem = await Item.create({
    ...req.body,
    user: req.user._id,
  });

  return res.status(201).json({
    status: 'Success',
    message: 'Item created successfully!',
    data: createdItem,
  });
});

exports.getAllItems = CatchAsync(async (req, res, next) => {
  const query = { ...req.query, user: req.user._id };

  const getAllItems = await Item.find(query);
  const allItemsPricesArr = getAllItems.map((item) => item.price);
  const allItemsPrices = getAllItems
    .map((item) => item.price)
    .reduce((total, curr) => total + curr, 0);

  return res.status(200).json({
    status: 'Success',
    result: getAllItems.length,
    data: getAllItems,
    prices: allItemsPrices,
    pricesArr: allItemsPricesArr,
  });
});

exports.getItem = CatchAsync(async (req, res, next) => {
  const { id } = req.params;

  const data = await Item.findById({ _id: id });
  if (!data) {
    return next(new AppError(`Invalid Id! No data corresponding to this id ${id}`, 404));
  }

  return res.status(200).json({
    status: 'Success',
    data: data,
  });
});

exports.updateItem = CatchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { value, stock } = req.body;

  let updatedItem;

  if (value && stock) {
    let updateStock;
    if (stock >= value) {
      updateStock = stock - value;
    } else {
      updateStock = stock;
    }
    updatedItem = await Item.findByIdAndUpdate(
      { _id: id },
      { stock: updateStock },
      {
        new: true,
      },
    );
  } else {
    updatedItem = await Item.findByIdAndUpdate({ _id: id }, req.body, {
      new: true,
    });
  }

  if (!updatedItem) {
    return next(new AppError(`Invalid Id! No Data corresponding to this id ${id}`, 404));
  }

  return res.status(200).json({
    status: 'success',
    data: updatedItem,
  });
});

exports.updateItems = CatchAsync(async (req, res, next) => {
  const { items } = req.body;
  let _items = [];
  for (let i = 0; i < items.length; i++) {
    if (items[i].quantity !== null) {
      _items.push(items[i]);
    }
  }

  const getAllItems = await Item.find();

  let _updatedItems = [];
  for (let i = 0; i < _items.length; i++) {
    for (let j = 0; j < getAllItems.length; j++) {
      if (_items[i].item == getAllItems[j]._id) {
        let _stock = getAllItems[j].stock - _items[i].quantity;
        const updatedItem = await Item.findByIdAndUpdate(
          { _id: getAllItems[j].id },
          { stock: _stock },
          {
            new: true,
          },
        );
        _updatedItems.push(updatedItem);
      }
    }
  }
  return res.status(200).json({
    status: 'success',
    data: 'Updated Stocks',
  });
});

exports.deleteItem = CatchAsync(async (req, res, next) => {
  const { id } = req.params;

  const item = await Item.findById({ _id: id });

  if (!item) {
    return next(new AppError(`Invalid Id! No Data corresponding to this id ${id}`, 404));
  }

  await item.delete();

  return res.status(200).json({
    status: 'success',
    message: 'Item Deleted Successfully',
  });
});
