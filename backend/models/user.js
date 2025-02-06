const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    OperatorID: { type: String, required: true, unique: true },
    Password: { type: String, required: true },
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('Password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.Password = await bcrypt.hash(this.Password, salt);
    next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.Password); // 比较密码
};

module.exports = mongoose.model('User', userSchema);
