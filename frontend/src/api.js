import { API_URL } from "./utils";

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? token : ''
    };
};

const handleResponse = async (result) => {
    const data = await result.json();
    return data;
};

export const SignupAPI = async (userObj) => {
    const url = `${API_URL}/auth/signup`;
    const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userObj)
    };
    try {
        const result = await fetch(url, options);
        return await handleResponse(result);
    } catch (err) {
        return { success: false, message: err.message || "Failed to register" };
    }
};

export const LoginAPI = async (userObj) => {
    const url = `${API_URL}/auth/login`;
    const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userObj)
    };
    try {
        const result = await fetch(url, options);
        return await handleResponse(result);
    } catch (err) {
        return { success: false, message: err.message || "Failed to log in" };
    }
};

export const CreateTask = async (taskObj) => {
    const url = `${API_URL}/tasks`;
    const options = {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(taskObj)
    };
    try {
        const result = await fetch(url, options);
        return await handleResponse(result);
    } catch (err) {
        return { success: false, message: err.message || "Failed to create task" };
    }
};

export const GetAllTasks = async () => {
    const url = `${API_URL}/tasks`;
    const options = {
        method: 'GET',
        headers: getAuthHeaders()
    };
    try {
        const result = await fetch(url, options);
        return await handleResponse(result);
    } catch (err) {
        return { success: false, message: err.message || "Failed to fetch tasks" };
    }
};

export const DeleteTaskById = async (id) => {
    const url = `${API_URL}/tasks/${id}`;
    const options = {
        method: 'DELETE',
        headers: getAuthHeaders()
    };
    try {
        const result = await fetch(url, options);
        return await handleResponse(result);
    } catch (err) {
        return { success: false, message: err.message || "Failed to delete task" };
    }
};

export const UpdateTaskById = async (id, reqBody) => {
    const url = `${API_URL}/tasks/${id}`;
    const options = {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(reqBody)
    };
    try {
        const result = await fetch(url, options);
        return await handleResponse(result);
    } catch (err) {
        return { success: false, message: err.message || "Failed to update task" };
    }
};

export const GetTaskStats = async () => {
    const url = `${API_URL}/tasks/stats`;
    const options = {
        method: 'GET',
        headers: getAuthHeaders()
    };
    try {
        const result = await fetch(url, options);
        return await handleResponse(result);
    } catch (err) {
        return { success: false, message: err.message || "Failed to fetch stats" };
    }
};

export const AddDependency = async (taskId, dependsOnId) => {
    const url = `${API_URL}/tasks/${taskId}/dependencies`;
    const options = {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ dependsOnId })
    };
    try {
        const result = await fetch(url, options);
        return await handleResponse(result);
    } catch (err) {
        return { success: false, message: err.message || "Failed to add dependency" };
    }
};

export const RemoveDependency = async (taskId, depId) => {
    const url = `${API_URL}/tasks/${taskId}/dependencies/${depId}`;
    const options = {
        method: 'DELETE',
        headers: getAuthHeaders()
    };
    try {
        const result = await fetch(url, options);
        return await handleResponse(result);
    } catch (err) {
        return { success: false, message: err.message || "Failed to remove dependency" };
    }
};

export const CreateSubtask = async (taskId, subtaskObj) => {
    const url = `${API_URL}/subtasks/${taskId}`;
    const options = {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(subtaskObj)
    };
    try {
        const result = await fetch(url, options);
        return await handleResponse(result);
    } catch (err) {
        return { success: false, message: err.message || "Failed to create subtask" };
    }
};

export const GetSubtasks = async (taskId) => {
    const url = `${API_URL}/subtasks/${taskId}`;
    const options = {
        method: 'GET',
        headers: getAuthHeaders()
    };
    try {
        const result = await fetch(url, options);
        return await handleResponse(result);
    } catch (err) {
        return { success: false, message: err.message || "Failed to fetch subtasks" };
    }
};

export const ToggleSubtask = async (id) => {
    const url = `${API_URL}/subtasks/${id}/toggle`;
    const options = {
        method: 'PATCH',
        headers: getAuthHeaders()
    };
    try {
        const result = await fetch(url, options);
        return await handleResponse(result);
    } catch (err) {
        return { success: false, message: err.message || "Failed to toggle subtask" };
    }
};

export const DeleteSubtask = async (id) => {
    const url = `${API_URL}/subtasks/${id}`;
    const options = {
        method: 'DELETE',
        headers: getAuthHeaders()
    };
    try {
        const result = await fetch(url, options);
        return await handleResponse(result);
    } catch (err) {
        return { success: false, message: err.message || "Failed to delete subtask" };
    }
};

// ========== CRM API ==========

export const CreateContact = async (contactObj) => {
    const url = `${API_URL}/contacts`;
    const options = {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(contactObj)
    };
    try {
        const result = await fetch(url, options);
        return await handleResponse(result);
    } catch (err) {
        return { success: false, message: err.message || "Failed to create contact" };
    }
};

export const GetAllContacts = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const url = `${API_URL}/contacts${query ? '?' + query : ''}`;
    const options = { method: 'GET', headers: getAuthHeaders() };
    try {
        const result = await fetch(url, options);
        return await handleResponse(result);
    } catch (err) {
        return { success: false, message: err.message || "Failed to fetch contacts" };
    }
};

export const GetContactById = async (id) => {
    const url = `${API_URL}/contacts/${id}`;
    const options = { method: 'GET', headers: getAuthHeaders() };
    try {
        const result = await fetch(url, options);
        return await handleResponse(result);
    } catch (err) {
        return { success: false, message: err.message || "Failed to fetch contact" };
    }
};

export const UpdateContact = async (id, reqBody) => {
    const url = `${API_URL}/contacts/${id}`;
    const options = {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(reqBody)
    };
    try {
        const result = await fetch(url, options);
        return await handleResponse(result);
    } catch (err) {
        return { success: false, message: err.message || "Failed to update contact" };
    }
};

export const DeleteContact = async (id) => {
    const url = `${API_URL}/contacts/${id}`;
    const options = { method: 'DELETE', headers: getAuthHeaders() };
    try {
        const result = await fetch(url, options);
        return await handleResponse(result);
    } catch (err) {
        return { success: false, message: err.message || "Failed to delete contact" };
    }
};

export const GetContactStats = async () => {
    const url = `${API_URL}/contacts/stats`;
    const options = { method: 'GET', headers: getAuthHeaders() };
    try {
        const result = await fetch(url, options);
        return await handleResponse(result);
    } catch (err) {
        return { success: false, message: err.message || "Failed to fetch contact stats" };
    }
};

export const CreateCompany = async (companyObj) => {
    const url = `${API_URL}/companies`;
    const options = {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(companyObj)
    };
    try {
        const result = await fetch(url, options);
        return await handleResponse(result);
    } catch (err) {
        return { success: false, message: err.message || "Failed to create company" };
    }
};

export const GetAllCompanies = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const url = `${API_URL}/companies${query ? '?' + query : ''}`;
    const options = { method: 'GET', headers: getAuthHeaders() };
    try {
        const result = await fetch(url, options);
        return await handleResponse(result);
    } catch (err) {
        return { success: false, message: err.message || "Failed to fetch companies" };
    }
};

export const GetCompanyById = async (id) => {
    const url = `${API_URL}/companies/${id}`;
    const options = { method: 'GET', headers: getAuthHeaders() };
    try {
        const result = await fetch(url, options);
        return await handleResponse(result);
    } catch (err) {
        return { success: false, message: err.message || "Failed to fetch company" };
    }
};

export const UpdateCompany = async (id, reqBody) => {
    const url = `${API_URL}/companies/${id}`;
    const options = {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(reqBody)
    };
    try {
        const result = await fetch(url, options);
        return await handleResponse(result);
    } catch (err) {
        return { success: false, message: err.message || "Failed to update company" };
    }
};

export const DeleteCompany = async (id) => {
    const url = `${API_URL}/companies/${id}`;
    const options = { method: 'DELETE', headers: getAuthHeaders() };
    try {
        const result = await fetch(url, options);
        return await handleResponse(result);
    } catch (err) {
        return { success: false, message: err.message || "Failed to delete company" };
    }
};

export const CreateDeal = async (dealObj) => {
    const url = `${API_URL}/deals`;
    const options = {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(dealObj)
    };
    try {
        const result = await fetch(url, options);
        return await handleResponse(result);
    } catch (err) {
        return { success: false, message: err.message || "Failed to create deal" };
    }
};

export const GetAllDeals = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const url = `${API_URL}/deals${query ? '?' + query : ''}`;
    const options = { method: 'GET', headers: getAuthHeaders() };
    try {
        const result = await fetch(url, options);
        return await handleResponse(result);
    } catch (err) {
        return { success: false, message: err.message || "Failed to fetch deals" };
    }
};

export const GetDealById = async (id) => {
    const url = `${API_URL}/deals/${id}`;
    const options = { method: 'GET', headers: getAuthHeaders() };
    try {
        const result = await fetch(url, options);
        return await handleResponse(result);
    } catch (err) {
        return { success: false, message: err.message || "Failed to fetch deal" };
    }
};

export const UpdateDeal = async (id, reqBody) => {
    const url = `${API_URL}/deals/${id}`;
    const options = {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(reqBody)
    };
    try {
        const result = await fetch(url, options);
        return await handleResponse(result);
    } catch (err) {
        return { success: false, message: err.message || "Failed to update deal" };
    }
};

export const DeleteDeal = async (id) => {
    const url = `${API_URL}/deals/${id}`;
    const options = { method: 'DELETE', headers: getAuthHeaders() };
    try {
        const result = await fetch(url, options);
        return await handleResponse(result);
    } catch (err) {
        return { success: false, message: err.message || "Failed to delete deal" };
    }
};

export const GetDealStats = async () => {
    const url = `${API_URL}/deals/stats`;
    const options = { method: 'GET', headers: getAuthHeaders() };
    try {
        const result = await fetch(url, options);
        return await handleResponse(result);
    } catch (err) {
        return { success: false, message: err.message || "Failed to fetch deal stats" };
    }
};
