import { http, httpImageData } from './http.js';

export function getCurrentUser() {
  return http('GET', '/accounts/api/users/me')
    .then(data => {
      return {
        username: data.username,
        isAuthenticated: data.is_authenticated,
        isStaff: data.is_staff,
        maxCompositions: data.max_compositions,
        urlLogout: data.url_logout,
        urlProfile: data.url_profile,
        urlAdmin: data.url_admin
      };
    })
    .catch(() => {
      return {};
    });
}

export function getPublishedComposition(compositionId) {
  return http('GET', `/api/compositions/${compositionId}`);
}

export function getPublishedCompositions() {
  return http('GET', '/api/compositions/');
}

export function getSampleCompositions() {
  return http('GET', '/api/samples/');
}

export function deletePublishedComposition(compositionId) {
  return http('DELETE', `/api/compositions/${compositionId}`);
}

export function requestFeaturedComposition(compositionId) {
  return http('PATCH', `/api/compositions/${compositionId}`, {
    request_featured: true
  });
}

export function publishComposition(data) {
  const promises = data.images.map(image => {
    return httpImageData(image.url).then(data => {
      image.data = data;
    });
  });
  data.public = true;
  return Promise.all(promises).then(() =>
    http('POST', '/api/compositions/', data)
  );
}
