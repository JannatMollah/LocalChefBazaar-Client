import axios from "axios";

const API = import.meta.env.VITE_API_URL;

export const createPaymentIntent = async (price) => {
  const token = localStorage.getItem("access-token");

  const res = await axios.post(
    `${API}/payments/create-intent`,
    { price },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
};

export const savePayment = async (paymentData) => {
  const token = localStorage.getItem("access-token");

  const res = await axios.post(`${API}/payments`, paymentData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};
