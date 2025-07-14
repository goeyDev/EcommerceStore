export type Record = {
  date: Date;
  id: string;
  text: string; // No longer nullable
  amount: number; // No longer nullable
  userId: string;
};

// admin/products
export type inputFormStateType = {
  error?: boolean;
  success?: boolean;
  message?: string;
};

// admin/products
export type inputFormState = {
  status: inputFormStateType;
  fieldErrors?: {
    name?: string[];
    description?: string[];
    priceInCents?: string[];
    quantity?: string[];
    file?: string[];
    image?: string[];
  };
};
