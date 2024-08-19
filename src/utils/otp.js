export const generateOTP = () => {
    const otpCode = Math.floor(Math.random() * 90000 + 100000);
    const otpExpire = new Date(Date.now() + 15 * 60 * 1000); 
    return { otpCode, otpExpire };
};