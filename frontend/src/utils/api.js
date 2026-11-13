import axios from "axios";

const TOKEN_KEY = "token";
const USERNAME_KEY = "username";

export const auth = {
    getToken: () => localStorage.getItem(TOKEN_KEY),
    isLoggedIn: () => !!localStorage.getItem(TOKEN_KEY),
    getUsername: () => localStorage.getItem(USERNAME_KEY),
    // The user id lives only inside the signed token, so there is no editable copy in storage.
    save: ({ access_token, username }) => {
        localStorage.setItem(TOKEN_KEY, access_token);
        localStorage.setItem(USERNAME_KEY, username);
    },
    clear: () => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USERNAME_KEY);
        localStorage.removeItem("userId"); // legacy key from earlier versions
    },
};

const api = axios.create({ baseURL: "/api" });

api.interceptors.request.use((config) => {
    const token = auth.getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// An expired/invalid token on a protected call ends the session. Login/register 401s are plain form errors.
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const url = error.config?.url || "";
        const isCredentialCall = url.startsWith("/login") || url.startsWith("/register");
        if (error.response?.status === 401 && !isCredentialCall && auth.isLoggedIn()) {
            auth.clear();
            window.dispatchEvent(new Event("auth-changed"));
        }
        return Promise.reject(error);
    }
);

export function errorMessage(error, fallback = "Something went wrong.") {
    if (error.response) return error.response.data?.error || fallback;
    return "Could not connect to the server.";
}

export const accountApi = {
    register: (username, password) => api.post("/register", { username, password }).then((r) => r.data),
    login: (username, password) => api.post("/login", { username, password }).then((r) => r.data),
    logout: () => api.post("/logout"),
    me: () => api.get("/account/me").then((r) => r.data),
};

export const gardenApi = {
    list: () => api.get("/gardens").then((r) => r.data),
    get: (id) => api.get(`/gardens/${id}`).then((r) => r.data),
    create: (garden) => api.post("/gardens", garden).then((r) => r.data),
    update: (id, garden) => api.put(`/gardens/${id}`, garden).then((r) => r.data),
    remove: (id) => api.delete(`/gardens/${id}`),
};

export const plantApi = {
    list: (gardenId) => api.get(`/gardens/${gardenId}/plants`).then((r) => r.data),
    create: (gardenId, plant) => api.post(`/gardens/${gardenId}/plants`, plant).then((r) => r.data),
    update: (gardenId, id, plant) => api.put(`/gardens/${gardenId}/plants/${id}`, plant).then((r) => r.data),
    remove: (gardenId, id) => api.delete(`/gardens/${gardenId}/plants/${id}`),
};

export default api;
