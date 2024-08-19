import schedule from 'node-schedule'
import User from '../../database/models/user.model.js';
import { status } from './constant/enums.js';
import cloudinary from './fileUpload/cloudinary.js';
import Coupon from '../../database/models/coupon.model.js';

export const scheduleUserClenup = ()=>{
    schedule.scheduleJob('1 1 1 * * *', async function(){
        const users = await User.find({status: status.PENDING, createdAt:{$lte: Date.now() - 30 * 24 * 60 * 60 * 1000}}).lean()
        const userIds = users.map((user)=>{return user._id})
        await User.deleteMany({_id: {$in: userIds}})
        for (const user of users) {
            if (user.image && user.image.public_id) {
                await cloudinary.uploader.destroy(user.image.public_id);
            }
        }
    });
    schedule.scheduleJob('1 1 1 * * *', async function(){
        const users = await User.find({status: status.DELETED, updatedAt: Date.now() - 3 * 30 * 24 * 60 * 60 * 1000}).lean()
        const userIds = users.map((user)=>{return user._id})
        await User.deleteMany({_id: {$in: userIds}})
        for (const user of users) {
            if (user.image && user.image.public_id) {
                await cloudinary.uploader.destroy(user.image.public_id);
            }
        }
    });
    //delete expired coupon after one monthe
    schedule.scheduleJob('1 1 1 * * *', async function(){
        const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const expiredCoupons = await Coupon.find({expire: { $lte: oneMonthAgo },}).lean();        
        const couponIds = expiredCoupons.map((coupon)=>{return coupon._id})
        await Coupon.deleteMany({_id: {$in: couponIds}})
    });
}