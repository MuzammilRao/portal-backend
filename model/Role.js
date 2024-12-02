const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  modulePermissions: [
    {
      module: { type: mongoose.Schema.Types.ObjectId, ref: 'Module' },
      actions: {
        create: { type: Boolean, default: false },
        read: { type: Boolean, default: false },
        update: { type: Boolean, default: false },
        delete: { type: Boolean, default: false },
      },
    },
  ],
  isDeleted: { type: Boolean, default: false },
});

const Role = mongoose.model('Role', roleSchema);

module.exports = Role;
