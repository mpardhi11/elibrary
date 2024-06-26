export interface User {
  _id: string;
  name: string;
  email: string;
  password: string;
  salt: string;
}

export interface LoginUserBody {
  email: string;
  password: string;
}  
