import { getAccessToken } from '../utils/util-auth.js';
import { BASE_URL } from '../config';

const ENDPOINTS = {
  // Auth
  REGISTER: `${BASE_URL}/register`,
  LOGIN: `${BASE_URL}/login`,

  // Story
  STORY_LIST: `${BASE_URL}/stories`,
  STORY_DETAIL: (id) => `${BASE_URL}/stories/${id}`,
  STORE_NEW_STORY: `${BASE_URL}/stories`,
  STORE_NEW_STORY_GUEST: `${BASE_URL}/stories/guest`,

  // Notifications
  SUBSCRIBE_NOTIFICATION: `${BASE_URL}/notifications/subscribe`,
};

// Register a new user
export async function getRegistered({ name, email, password }) {
    const data = JSON.stringify({ name, email, password });

    const fetchResponse = await fetch(ENDPOINTS.REGISTER, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: data,
    });
    const json = await fetchResponse.json();
    return {
        ...json,
        ok: fetchResponse.ok,
    };
}

// Login user
export async function getLogin({ email, password }) {
  const data = JSON.stringify({ email, password });

  const fetchResponse = await fetch(ENDPOINTS.LOGIN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: data,
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  };
}


// Add a new story
export async function addNewStory(description, photo, lat, lon) {
    const formData = new FormData();
    formData.append('description', description);
    formData.append('photo', photo); // Pastikan ini adalah objek File langsung
    if (lat) formData.append('lat', lat);
    if (lon) formData.append('lon', lon);

    const response = await fetch(ENDPOINTS.STORE_NEW_STORY, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${getAccessToken()}`,
        },
        body: formData,
    });
    return await response.json();
}
// Add a new story as a guest
export async function addNewStoryGuest(description, photo, lat, lon) {
  const formData = new FormData();
  formData.append('description', description);
  formData.append('photo', photo);
  if (lat) formData.append('lat', lat);
  if (lon) formData.append('lon', lon);

  const response = await fetch(ENDPOINTS.STORE_NEW_STORY_GUEST, {
    method: 'POST',
    body: formData,
  });
  return await response.json();
}

// Get all stories
export async function getAllStories(page, size, location = 0) {
  const params = new URLSearchParams({ page, size, location });
  const response = await fetch(`${ENDPOINTS.STORY_LIST}?${params.toString()}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
    },
  });
  return await response.json();
}

// Get story details
export async function getStoryDetail(id) {
  const response = await fetch(ENDPOINTS.STORY_DETAIL(id), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
    },
  });
  return await response.json();
}

// Subscribe to notifications
export async function subscribeNotification(endpoint, keys) {
  const response = await fetch(ENDPOINTS.SUBSCRIBE_NOTIFICATION, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ endpoint, keys }),
  });
  return await response.json();
}

// Unsubscribe from notifications
export async function unsubscribeNotification(endpoint) {
  const response = await fetch(ENDPOINTS.SUBSCRIBE_NOTIFICATION, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ endpoint }),
  });
  return await response.json();
}