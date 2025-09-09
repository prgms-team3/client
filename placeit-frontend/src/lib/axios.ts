import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const ACCESS_TOKEN = process.env.NEXT_PUBLIC_DEV_ACCESS_TOKEN;

export const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(config => {
  config.headers.Authorization = `Bearer ${ACCESS_TOKEN}`;
  return config;
});
