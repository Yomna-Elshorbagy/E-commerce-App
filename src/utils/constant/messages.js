const generateMessage = (entity) => ({
  alreadyExisist: `${entity} already exist`,
  notFound: `${entity} not found`,
  notAllowed: `You are not allowed to ${entity}`,
  notAuthorized: `You are not authorized to ${entity}`,
  notValid: `${entity} is not valid`,
  notMatch: `${entity} do not match`,
  notCorrect: `${entity} is not correct`,
  notUnique: `${entity} must be unique`,
  failToCreate: `fail to create ${entity}`,
  failToUpdate: `fail to update ${entity}`,
  failToDelete: `fail to delete ${entity}`,
  createdSucessfully: `${entity} created Sucessfully`,
  updatedSucessfully: `${entity} updated Sucessfully`,
  deletedSucessfully: `${entity} deleted Sucessfully`,
  fetchedSuccessfully: `${entity} fetched Sucessfully`
});
export const messages = {
  category: generateMessage("category"),
  subcategory: generateMessage("subcategory"),
  brand: generateMessage("brand"),
  product: {...generateMessage("product"),
    outStock:'Out Of Stock', 
  },
  user:{...generateMessage("user"),
    verifiedSucessfully:'account verified Sucessfully', 
    invalidCredential:'invalid credential',
    logedInSucessfully: 'logIn Sucessfully',
    notVerified: 'email Not Verified',
    hasOTP: 'you already has OTP',
    expireOTP: 'OTP expired',
    invalidOTP: 'Invalid OTP',
    loggedOutSuccessfully: 'logged Out Successfully'
  },
  pasword: generateMessage("password") ,
  file :{ required: 'file is required'},
  wishlist: {...generateMessage("wishlist")},
  coupon: generateMessage("coupon"),
  cart:{ ...generateMessage("cart"),
    empty: "cart empty"
  },
  review: generateMessage("review"),
  order: {...generateMessage("order"),
    canceledSuccessfully: "order canceled Sucessfully"
  }};
